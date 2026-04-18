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

/**
 * Run a side effect on the success value without altering the result. The
 * original `ok` or `err` flows through unchanged — useful for logging,
 * metrics, or debugging inside a `pipe`.
 *
 * Dual API — works data-first or curried for use in `pipe`.
 *
 * @example
 *   pipe(
 *     parseOrder(raw),
 *     Result.tap(order => logger.info("parsed", order.id)),
 *     Result.flatMap(chargePayment),
 *   )
 */
export function tap<T, E>(result: Result<T, E>, fn: (value: T) => void): Result<T, E>;
export function tap<T>(fn: (value: T) => void): <E>(result: Result<T, E>) => Result<T, E>;
export function tap<T, E>(
  resultOrFn: Result<T, E> | ((value: T) => void),
  fn?: (value: T) => void,
): Result<T, E> | ((result: Result<T, E>) => Result<T, E>) {
  if (typeof resultOrFn === "function") {
    const f = resultOrFn;
    return (result: Result<T, E>) => {
      if (result.ok) f(result.value);
      return result;
    };
  }
  const f = fn as (value: T) => void;
  if (resultOrFn.ok) f(resultOrFn.value);
  return resultOrFn;
}

/**
 * Run a side effect on the error without altering the result. Useful for
 * logging failures inside a `pipe` without interrupting downstream steps.
 *
 * Dual API — works data-first or curried for use in `pipe`.
 *
 * @example
 *   pipe(
 *     validateEmail(input),
 *     Result.tapError(e => logger.warn("validation failed", e)),
 *   )
 */
export function tapError<T, E>(result: Result<T, E>, fn: (error: E) => void): Result<T, E>;
export function tapError<E>(fn: (error: E) => void): <T>(result: Result<T, E>) => Result<T, E>;
export function tapError<T, E>(
  resultOrFn: Result<T, E> | ((error: E) => void),
  fn?: (error: E) => void,
): Result<T, E> | ((result: Result<T, E>) => Result<T, E>) {
  if (typeof resultOrFn === "function") {
    const f = resultOrFn;
    return (result: Result<T, E>) => {
      if (!result.ok) f(result.error);
      return result;
    };
  }
  const f = fn as (error: E) => void;
  if (!resultOrFn.ok) f(resultOrFn.error);
  return resultOrFn;
}
