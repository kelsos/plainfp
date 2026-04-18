import { none, some } from "../option/constructors.ts";
import type { Option } from "../option/types.ts";

/**
 * Sum the numeric projection of each element. Empty input returns `0`.
 *
 * Dual API — works data-first or curried for use in `pipe`.
 *
 * @example
 *   pipe(
 *     orders,
 *     Arrays.sumBy((o) => o.total),
 *   )
 */
export function sumBy<T>(xs: ReadonlyArray<T>, fn: (x: T) => number): number;
export function sumBy<T>(fn: (x: T) => number): (xs: ReadonlyArray<T>) => number;
export function sumBy<T>(
  xsOrFn: ReadonlyArray<T> | ((x: T) => number),
  fn?: (x: T) => number,
): number | ((xs: ReadonlyArray<T>) => number) {
  const run = (xs: ReadonlyArray<T>, f: (x: T) => number): number => {
    let total = 0;
    for (const x of xs) total += f(x);
    return total;
  };
  if (typeof xsOrFn === "function") return (xs) => run(xs, xsOrFn);
  return run(xsOrFn, fn as (x: T) => number);
}

/**
 * Tally elements by key. Key collisions increment the same bucket.
 *
 * Dual API — works data-first or curried for use in `pipe`.
 *
 * @example
 *   pipe(
 *     events,
 *     Arrays.countBy((e) => e.type),
 *   )
 *   // { click: 12, view: 48 }
 */
export function countBy<T, K extends PropertyKey>(
  xs: ReadonlyArray<T>,
  keyFn: (x: T) => K,
): Record<K, number>;
export function countBy<T, K extends PropertyKey>(
  keyFn: (x: T) => K,
): (xs: ReadonlyArray<T>) => Record<K, number>;
export function countBy<T, K extends PropertyKey>(
  xsOrFn: ReadonlyArray<T> | ((x: T) => K),
  keyFn?: (x: T) => K,
): Record<K, number> | ((xs: ReadonlyArray<T>) => Record<K, number>) {
  const run = (xs: ReadonlyArray<T>, f: (x: T) => K): Record<K, number> => {
    const result = {} as Record<K, number>;
    for (const x of xs) {
      const k = f(x);
      result[k] = (result[k] ?? 0) + 1;
    }
    return result;
  };
  if (typeof xsOrFn === "function") return (xs) => run(xs, xsOrFn);
  return run(xsOrFn, keyFn as (x: T) => K);
}

/**
 * Find the element whose numeric projection is smallest. Returns `none`
 * on empty input. Ties resolve to the earlier element.
 *
 * Dual API — works data-first or curried for use in `pipe`.
 *
 * @example
 *   pipe(
 *     products,
 *     Arrays.minBy((p) => p.price),
 *   )
 */
export function minBy<T>(xs: ReadonlyArray<T>, fn: (x: T) => number): Option<T>;
export function minBy<T>(fn: (x: T) => number): (xs: ReadonlyArray<T>) => Option<T>;
export function minBy<T>(
  xsOrFn: ReadonlyArray<T> | ((x: T) => number),
  fn?: (x: T) => number,
): Option<T> | ((xs: ReadonlyArray<T>) => Option<T>) {
  const run = (xs: ReadonlyArray<T>, f: (x: T) => number): Option<T> => {
    if (xs.length === 0) return none;
    let best = xs[0] as T;
    let bestKey = f(best);
    for (let i = 1; i < xs.length; i++) {
      const x = xs[i] as T;
      const k = f(x);
      if (k < bestKey) {
        best = x;
        bestKey = k;
      }
    }
    return some(best);
  };
  if (typeof xsOrFn === "function") return (xs) => run(xs, xsOrFn);
  return run(xsOrFn, fn as (x: T) => number);
}

/**
 * Find the element whose numeric projection is largest. Returns `none`
 * on empty input. Ties resolve to the earlier element.
 *
 * Dual API — works data-first or curried for use in `pipe`.
 *
 * @example
 *   pipe(
 *     products,
 *     Arrays.maxBy((p) => p.price),
 *   )
 */
export function maxBy<T>(xs: ReadonlyArray<T>, fn: (x: T) => number): Option<T>;
export function maxBy<T>(fn: (x: T) => number): (xs: ReadonlyArray<T>) => Option<T>;
export function maxBy<T>(
  xsOrFn: ReadonlyArray<T> | ((x: T) => number),
  fn?: (x: T) => number,
): Option<T> | ((xs: ReadonlyArray<T>) => Option<T>) {
  const run = (xs: ReadonlyArray<T>, f: (x: T) => number): Option<T> => {
    if (xs.length === 0) return none;
    let best = xs[0] as T;
    let bestKey = f(best);
    for (let i = 1; i < xs.length; i++) {
      const x = xs[i] as T;
      const k = f(x);
      if (k > bestKey) {
        best = x;
        bestKey = k;
      }
    }
    return some(best);
  };
  if (typeof xsOrFn === "function") return (xs) => run(xs, xsOrFn);
  return run(xsOrFn, fn as (x: T) => number);
}
