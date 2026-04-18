import type { Err, Ok, Result } from "./types.ts";

/**
 * Type guard narrowing a {@link Result} to {@link Ok}.
 *
 * @example
 *   if (isOk(result)) console.log(result.value)
 */
export const isOk = <T, E>(result: Result<T, E>): result is Ok<T> => result.ok;

/**
 * Type guard narrowing a {@link Result} to {@link Err}.
 *
 * @example
 *   if (isErr(result)) logger.error(result.error)
 */
export const isErr = <T, E>(result: Result<T, E>): result is Err<E> => !result.ok;

/**
 * Extract the success value, falling back to `fallback` on `err`.
 *
 * Dual API — works data-first or curried for use in `pipe`.
 *
 * @example
 *   pipe(
 *     loadUserPrefs(userId),
 *     Result.getOr(defaultPrefs),
 *   )
 */
export function getOr<T, E>(result: Result<T, E>, fallback: T): T;
export function getOr<T>(fallback: T): <E>(result: Result<T, E>) => T;
export function getOr<T, E>(
  resultOrFallback: Result<T, E> | T,
  fallback?: T,
): T | ((result: Result<T, E>) => T) {
  if (arguments.length === 1) {
    const fb = resultOrFallback as T;
    return (result: Result<T, E>) => (result.ok ? result.value : fb);
  }
  const result = resultOrFallback as Result<T, E>;
  return result.ok ? result.value : (fallback as T);
}

/**
 * Handlers passed to {@link match} — one branch per {@link Result} case.
 */
export type MatchHandlers<T, E, U> = {
  readonly ok: (value: T) => U;
  readonly err: (error: E) => U;
};

/**
 * Fold a {@link Result} into a single value by running the matching branch.
 *
 * Dual API — works data-first or curried for use in `pipe`.
 *
 * @example
 *   pipe(
 *     chargeOrder(order),
 *     Result.match({
 *       ok: receipt => `Charged ${receipt.amount}`,
 *       err: e => `Failed: ${e.code}`,
 *     }),
 *   )
 */
export function match<T, E, U>(result: Result<T, E>, handlers: MatchHandlers<T, E, U>): U;
export function match<T, E, U>(handlers: MatchHandlers<T, E, U>): (result: Result<T, E>) => U;
export function match<T, E, U>(
  resultOrHandlers: Result<T, E> | MatchHandlers<T, E, U>,
  handlers?: MatchHandlers<T, E, U>,
): U | ((result: Result<T, E>) => U) {
  if (handlers === undefined) {
    const h = resultOrHandlers as MatchHandlers<T, E, U>;
    return (result: Result<T, E>) => (result.ok ? h.ok(result.value) : h.err(result.error));
  }
  const result = resultOrHandlers as Result<T, E>;
  return result.ok ? handlers.ok(result.value) : handlers.err(result.error);
}
