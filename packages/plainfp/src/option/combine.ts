import { none, some } from "./constructors.ts";
import type { Option } from "./types.ts";

/**
 * Collect an array of {@link Option}s into a single {@link Option} of an
 * array. Resolves to `some([...])` if every input is `some`; short-circuits
 * to {@link none} on the first `none` encountered.
 *
 * @example
 *   const parts = all([fromNullable(user.first), fromNullable(user.last)])
 *   // some(["Alice", "Smith"]) or none if either field is null/undefined
 */
export const all = <T>(options: ReadonlyArray<Option<T>>): Option<T[]> => {
  const values: T[] = [];
  for (const o of options) {
    if (!o.some) return none;
    values.push(o.value);
  }
  return some(values);
};

/**
 * Return the first {@link some} in input order, or {@link none} if every
 * input is `none`. Useful for fallback chains where any source of the value
 * will do.
 *
 * @example
 *   const contact = any([fromNullable(user.email), fromNullable(user.phone)])
 */
export const any = <T>(options: ReadonlyArray<Option<T>>): Option<T> => {
  for (const o of options) {
    if (o.some) return o;
  }
  return none;
};

/**
 * Combine two {@link Option}s into a single {@link Option} of a tuple. If
 * either is {@link none}, the result is `none`.
 *
 * @example
 *   const pair = zip(fromNullable(user.first), fromNullable(user.last))
 *   // some(["Alice", "Smith"]) or none
 */
export const zip = <T1, T2>(a: Option<T1>, b: Option<T2>): Option<[T1, T2]> => {
  if (!a.some) return none;
  if (!b.some) return none;
  return some([a.value, b.value]);
};
