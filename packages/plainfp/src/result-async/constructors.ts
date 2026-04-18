import { err as errSync, ok as okSync } from "../result/constructors.ts";
import type { ResultAsync } from "./types.ts";

/**
 * Lift a successful value into a {@link ResultAsync}.
 *
 * @example
 *   const fetchCached = (id: string) =>
 *     cache.has(id) ? ok(cache.get(id)!) : loadUser(id)
 */
export const ok = <T>(value: T): ResultAsync<T, never> => Promise.resolve(okSync(value));

/**
 * Lift an error value into a {@link ResultAsync}.
 *
 * @example
 *   const guard = (userId: string) =>
 *     userId ? loadUser(userId) : err({ code: "MISSING_ID" })
 */
export const err = <E>(error: E): ResultAsync<never, E> => Promise.resolve(errSync(error));

/**
 * Convert a `Promise<T>` into a {@link ResultAsync}. Rejection is captured and
 * passed through `onError` — the error type is entirely user-controlled, so
 * pick a domain-specific shape rather than leaking `unknown`.
 *
 * @example
 *   const fetchUser = (id: string) =>
 *     fromPromise(
 *       fetch(`/users/${id}`).then(r => r.json() as Promise<User>),
 *       (cause) => ({ code: "FETCH_FAILED", cause }),
 *     )
 */
export const fromPromise = <T, E>(
  promise: Promise<T>,
  onError: (cause: unknown) => E,
): ResultAsync<T, E> =>
  promise.then(
    (value) => okSync(value),
    (cause: unknown) => errSync(onError(cause)),
  );

/**
 * Invoke an async thunk and convert its resolution or rejection into a
 * {@link ResultAsync}. Synchronous throws from `fn` itself are also captured.
 *
 * @example
 *   const chargeCard = (order: Order) =>
 *     fromAsync(
 *       () => paymentsApi.charge(order.total, order.card),
 *       (cause) => ({ code: "CHARGE_FAILED", cause }),
 *     )
 */
export const fromAsync = <T, E>(
  fn: () => Promise<T>,
  onError: (cause: unknown) => E,
): ResultAsync<T, E> => {
  try {
    return fromPromise(fn(), onError);
  } catch (cause) {
    return Promise.resolve(errSync(onError(cause)));
  }
};
