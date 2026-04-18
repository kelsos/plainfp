import { err, ok } from "./constructors.ts";
import type { Result } from "./types.ts";

/**
 * Transform the success value of a {@link Result}. Errors short-circuit:
 * if the input is `err`, `fn` is not called and the error is propagated
 * unchanged.
 *
 * Dual API — works data-first or curried for use in `pipe`.
 *
 * @example
 *   pipe(
 *     ok({ id: "u-1", name: "Alice" }),
 *     Result.map(user => user.name.toUpperCase()),
 *   )
 *   // { ok: true, value: "ALICE" }
 */
export function map<T, E, U>(result: Result<T, E>, fn: (value: T) => U): Result<U, E>;
export function map<T, U>(fn: (value: T) => U): <E>(result: Result<T, E>) => Result<U, E>;
export function map<T, E, U>(
  resultOrFn: Result<T, E> | ((value: T) => U),
  fn?: (value: T) => U,
): Result<U, E> | ((result: Result<T, E>) => Result<U, E>) {
  if (typeof resultOrFn === "function") {
    const f = resultOrFn;
    return (result: Result<T, E>) => (result.ok ? ok(f(result.value)) : result);
  }
  const f = fn as (value: T) => U;
  return resultOrFn.ok ? ok(f(resultOrFn.value)) : resultOrFn;
}

/**
 * Transform the error channel of a {@link Result}. Success values pass through
 * untouched. Useful for translating low-level errors into domain errors.
 *
 * Dual API — works data-first or curried for use in `pipe`.
 *
 * @example
 *   pipe(
 *     parseOrder(raw),
 *     Result.mapError(e => ({ code: "BAD_ORDER", cause: e })),
 *   )
 */
export function mapError<T, E, F>(result: Result<T, E>, fn: (error: E) => F): Result<T, F>;
export function mapError<E, F>(fn: (error: E) => F): <T>(result: Result<T, E>) => Result<T, F>;
export function mapError<T, E, F>(
  resultOrFn: Result<T, E> | ((error: E) => F),
  fn?: (error: E) => F,
): Result<T, F> | ((result: Result<T, E>) => Result<T, F>) {
  if (typeof resultOrFn === "function") {
    const f = resultOrFn;
    return (result: Result<T, E>) => (result.ok ? result : err(f(result.error)));
  }
  const f = fn as (error: E) => F;
  return resultOrFn.ok ? resultOrFn : err(f(resultOrFn.error));
}

/**
 * Chain a {@link Result}-producing step. If the input is `err`, `fn` is
 * skipped; otherwise `fn` runs and its result (possibly another `err`)
 * becomes the output. Error channels are unioned.
 *
 * Dual API — works data-first or curried for use in `pipe`.
 *
 * @example
 *   pipe(
 *     parseOrderId(raw),
 *     Result.flatMap(id => loadOrder(id)),
 *     Result.flatMap(order => chargePayment(order)),
 *   )
 */
export function flatMap<T, E, U, F>(
  result: Result<T, E>,
  fn: (value: T) => Result<U, F>,
): Result<U, E | F>;
export function flatMap<T, U, F>(
  fn: (value: T) => Result<U, F>,
): <E>(result: Result<T, E>) => Result<U, E | F>;
export function flatMap<T, E, U, F>(
  resultOrFn: Result<T, E> | ((value: T) => Result<U, F>),
  fn?: (value: T) => Result<U, F>,
): Result<U, E | F> | ((result: Result<T, E>) => Result<U, E | F>) {
  if (typeof resultOrFn === "function") {
    const f = resultOrFn;
    return (result: Result<T, E>) => (result.ok ? f(result.value) : result);
  }
  const f = fn as (value: T) => Result<U, F>;
  return resultOrFn.ok ? f(resultOrFn.value) : resultOrFn;
}
