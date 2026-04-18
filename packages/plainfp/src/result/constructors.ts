import type { Err, Ok, Result } from "./types.ts";

/**
 * Wrap a successful value in a {@link Result}.
 *
 * @example
 *   const user = ok({ id: "u-1", name: "Alice" })
 *   if (user.ok) console.log(user.value.name)
 */
export const ok = <T>(value: T): Ok<T> => ({ ok: true, value });

/**
 * Wrap an error value in a {@link Result}.
 *
 * @example
 *   const result = err({ code: "NOT_FOUND", message: "user missing" })
 *   if (!result.ok) console.error(result.error.code)
 */
export const err = <E>(error: E): Err<E> => ({ ok: false, error });

/**
 * Lift a nullable value into a {@link Result}. `null` and `undefined` become
 * `err(onNullish)`; any other value becomes `ok`.
 *
 * @example
 *   const findUser = (id: string) =>
 *     fromNullable(users.get(id), { code: "NOT_FOUND", id })
 */
export const fromNullable = <T, E>(
  value: T | null | undefined,
  onNullish: E,
): Result<NonNullable<T>, E> => (value == null ? err(onNullish) : ok(value as NonNullable<T>));

/**
 * Execute a synchronous function and capture thrown exceptions as `err`.
 * Without `onError`, the raw thrown value is surfaced with type `unknown`;
 * pass `onError` to map it into a domain error — the error type is entirely
 * user-controlled.
 *
 * @example
 *   const parsed = fromThrowable(
 *     () => JSON.parse(rawBody) as Order,
 *     (cause) => ({ code: "INVALID_JSON", cause }),
 *   )
 */
export function fromThrowable<T>(fn: () => T): Result<T, unknown>;
export function fromThrowable<T, E>(fn: () => T, onError: (cause: unknown) => E): Result<T, E>;
export function fromThrowable<T, E>(
  fn: () => T,
  onError?: (cause: unknown) => E,
): Result<T, E | unknown> {
  try {
    return ok(fn());
  } catch (cause) {
    return err(onError ? onError(cause) : cause);
  }
}
