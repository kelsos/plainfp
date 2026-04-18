import { ok } from "../result/constructors.ts";
import type { Result } from "../result/types.ts";
import type { ResultAsync } from "./types.ts";

export const all = async <T, E>(results: ReadonlyArray<ResultAsync<T, E>>): ResultAsync<T[], E> => {
  const resolved = await Promise.all(results);
  const values: T[] = [];
  for (const r of resolved) {
    if (!r.ok) return r;
    values.push(r.value);
  }
  return ok(values);
};

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
