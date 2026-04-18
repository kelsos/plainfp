import { err, ok } from "./constructors.ts";
import type { Result } from "./types.ts";

/**
 * Collect an array of results into a single result. Succeeds with all values
 * if every input is `ok`; otherwise short-circuits on the first `err`
 * encountered.
 *
 * @example
 *   const users = all([loadUser("u-1"), loadUser("u-2"), loadUser("u-3")])
 *   // ok([user1, user2, user3]) — or the first err
 */
export const all = <T, E>(results: ReadonlyArray<Result<T, E>>): Result<T[], E> => {
  const values: T[] = [];
  for (const r of results) {
    if (!r.ok) return r;
    values.push(r.value);
  }
  return ok(values);
};

/**
 * Return the first successful result. If every input fails, collect all
 * errors into an array.
 *
 * @example
 *   const charged = any([chargeCard(order), chargePaypal(order), chargeBank(order)])
 *   // ok(receipt) on first success, or err([e1, e2, e3])
 */
export const any = <T, E>(results: ReadonlyArray<Result<T, E>>): Result<T, E[]> => {
  const errors: E[] = [];
  for (const r of results) {
    if (r.ok) return r;
    errors.push(r.error);
  }
  return err(errors);
};

/**
 * Combine two results into a tuple. Succeeds only if both are `ok`; the first
 * `err` encountered is returned.
 *
 * @example
 *   const pair = zip(loadUser(id), loadOrder(orderId))
 *   // ok([user, order]) or the first err
 */
export const zip = <T1, T2, E>(a: Result<T1, E>, b: Result<T2, E>): Result<[T1, T2], E> => {
  if (!a.ok) return a;
  if (!b.ok) return b;
  return ok([a.value, b.value]);
};
