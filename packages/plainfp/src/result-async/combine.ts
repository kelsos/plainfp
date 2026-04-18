import { ok } from "../result/constructors.ts";
import type { Result } from "../result/types.ts";
import type { ResultAsync } from "./types.ts";

/**
 * Await every {@link ResultAsync} in parallel and collect the values. Resolves
 * with `ok([...])` if all succeed, or the first `err` encountered in input
 * order. All input promises are started immediately.
 *
 * @example
 *   const users = await all([fetchUser("u-1"), fetchUser("u-2"), fetchUser("u-3")])
 */
export const all = async <T, E>(results: ReadonlyArray<ResultAsync<T, E>>): ResultAsync<T[], E> => {
  const resolved = await Promise.all(results);
  const values: T[] = [];
  for (const r of resolved) {
    if (!r.ok) return r;
    values.push(r.value);
  }
  return ok(values);
};

/**
 * Run an array of async factories with bounded concurrency. Factories are
 * invoked lazily so only up to `concurrency` run at once. Short-circuits on
 * the first `err` — in-flight factories finish but no new ones start.
 *
 * Throws `RangeError` if `concurrency < 1`. If a factory rejects (rather than
 * returning `err`), that slot is dropped and the worker exits; wrap throwing
 * code with `fromPromise`/`fromAsync` to preserve it as a typed error.
 *
 * @example
 *   const factories = userIds.map(id => () => fetchUser(id))
 *   const users = await allWithConcurrency(factories, 5)
 */
export const allWithConcurrency = async <T, E>(
  factories: ReadonlyArray<() => ResultAsync<T, E>>,
  concurrency: number,
): ResultAsync<T[], E> => {
  if (concurrency < 1) {
    throw new RangeError(`concurrency must be >= 1, got ${concurrency}`);
  }
  const results: Array<Result<T, E>> = Array.from({ length: factories.length });
  let nextIndex = 0;
  let firstErr: Result<T, E> | null = null;

  const worker = async (): Promise<void> => {
    while (true) {
      if (firstErr !== null) return;
      const i = nextIndex++;
      if (i >= factories.length) return;
      try {
        const r = await factories[i]!();
        results[i] = r;
        if (!r.ok && firstErr === null) firstErr = r;
      } catch {
        // A factory rejected instead of returning `err`. Swallow — ResultAsync
        // is a Result-typed API; consumers should use `fromPromise`/`fromAsync`
        // to convert throwing code to `err` values. We stop this worker to
        // avoid reading beyond the rejected slot but don't treat it as
        // `firstErr` since we have no typed error value.
        return;
      }
    }
  };

  const workers = Array.from({ length: Math.min(concurrency, factories.length) }, () => worker());
  await Promise.all(workers);

  if (firstErr !== null) return firstErr;
  return ok(results.map((r) => (r as { ok: true; value: T }).value));
};
