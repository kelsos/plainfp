import { none, some } from "../option/constructors.ts";
import type { Option } from "../option/types.ts";

/**
 * A readonly array statically guaranteed to hold at least one element.
 */
export type NonEmptyArray<T> = readonly [T, ...T[]];

/**
 * Construct a {@link NonEmptyArray} from a required head and optional rest.
 *
 * @example
 *   const tags = of("urgent", "billing", "vip")
 *   const single = of(currentUser)
 */
export const of = <T>(head: T, ...tail: T[]): NonEmptyArray<T> => [head, ...tail];

/**
 * Lift a plain array into a {@link NonEmptyArray}, returning {@link none}
 * when it is empty.
 *
 * @example
 *   const maybeItems = fromArray(cart.items)
 *   if (maybeItems.some) checkout(maybeItems.value)
 */
export const fromArray = <T>(xs: ReadonlyArray<T>): Option<NonEmptyArray<T>> =>
  xs.length === 0 ? none : some(xs as unknown as NonEmptyArray<T>);

/**
 * The first element — total because the array is non-empty.
 *
 * @example
 *   const primary = head(of("home@x.com", "work@x.com"))
 */
export const head = <T>(xs: NonEmptyArray<T>): T => xs[0];

/**
 * All elements after the first, as a (possibly empty) plain array.
 *
 * @example
 *   const rest = tail(of("admin", "editor", "viewer")) // ["editor", "viewer"]
 */
export const tail = <T>(xs: NonEmptyArray<T>): T[] => xs.slice(1);

/**
 * The last element — total because the array is non-empty.
 *
 * @example
 *   const mostRecent = last(of(order1, order2, order3))
 */
export const last = <T>(xs: NonEmptyArray<T>): T => xs[xs.length - 1] as T;

/**
 * Map over a {@link NonEmptyArray}, preserving non-emptiness in the type.
 * Supports data-first and curried (pipe-friendly) forms.
 *
 * @example
 *   const names = pipe(
 *     of(user1, user2, user3),
 *     map((u) => u.name),
 *   )
 */
export function map<T, U>(xs: NonEmptyArray<T>, fn: (x: T, i: number) => U): NonEmptyArray<U>;
export function map<T, U>(fn: (x: T, i: number) => U): (xs: NonEmptyArray<T>) => NonEmptyArray<U>;
export function map<T, U>(
  xsOrFn: NonEmptyArray<T> | ((x: T, i: number) => U),
  fn?: (x: T, i: number) => U,
): NonEmptyArray<U> | ((xs: NonEmptyArray<T>) => NonEmptyArray<U>) {
  if (typeof xsOrFn === "function") {
    const f = xsOrFn;
    return (xs: NonEmptyArray<T>) => xs.map(f) as unknown as NonEmptyArray<U>;
  }
  return xsOrFn.map(fn as (x: T, i: number) => U) as unknown as NonEmptyArray<U>;
}
