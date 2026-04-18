import type { ResultAsync } from "./types.ts";

/**
 * Await a {@link ResultAsync} and extract the success value, falling back to
 * `fallback` on `err`.
 *
 * Dual API — works data-first or curried for use in `pipe`.
 *
 * @example
 *   const prefs = await pipe(
 *     loadUserPrefs(userId),
 *     ResultAsync.getOr(defaultPrefs),
 *   )
 */
export function getOr<T, E>(ra: ResultAsync<T, E>, fallback: T): Promise<T>;
export function getOr<T>(fallback: T): <E>(ra: ResultAsync<T, E>) => Promise<T>;
export function getOr<T, E>(
  raOrFallback: ResultAsync<T, E> | T,
  fallback?: T,
): Promise<T> | ((ra: ResultAsync<T, E>) => Promise<T>) {
  const run = async (ra: ResultAsync<T, E>, fb: T): Promise<T> => {
    const r = await ra;
    return r.ok ? r.value : fb;
  };
  if (arguments.length === 1) {
    const fb = raOrFallback as T;
    return (ra: ResultAsync<T, E>) => run(ra, fb);
  }
  return run(raOrFallback as ResultAsync<T, E>, fallback as T);
}

/**
 * Handlers passed to {@link match} — one branch per {@link ResultAsync} case.
 * Either branch may be async.
 */
export type MatchHandlers<T, E, U> = {
  readonly ok: (value: T) => U | Promise<U>;
  readonly err: (error: E) => U | Promise<U>;
};

/**
 * Await a {@link ResultAsync} and fold it into a single value by running the
 * matching branch.
 *
 * Dual API — works data-first or curried for use in `pipe`.
 *
 * @example
 *   const message = await pipe(
 *     chargeOrder(order),
 *     ResultAsync.match({
 *       ok: receipt => `Charged ${receipt.amount}`,
 *       err: e => `Failed: ${e.code}`,
 *     }),
 *   )
 */
export function match<T, E, U>(ra: ResultAsync<T, E>, handlers: MatchHandlers<T, E, U>): Promise<U>;
export function match<T, E, U>(
  handlers: MatchHandlers<T, E, U>,
): (ra: ResultAsync<T, E>) => Promise<U>;
export function match<T, E, U>(
  raOrHandlers: ResultAsync<T, E> | MatchHandlers<T, E, U>,
  handlers?: MatchHandlers<T, E, U>,
): Promise<U> | ((ra: ResultAsync<T, E>) => Promise<U>) {
  const run = async (ra: ResultAsync<T, E>, h: MatchHandlers<T, E, U>): Promise<U> => {
    const r = await ra;
    return r.ok ? await h.ok(r.value) : await h.err(r.error);
  };
  if (handlers === undefined) {
    const h = raOrHandlers as MatchHandlers<T, E, U>;
    return (ra: ResultAsync<T, E>) => run(ra, h);
  }
  return run(raOrHandlers as ResultAsync<T, E>, handlers);
}
