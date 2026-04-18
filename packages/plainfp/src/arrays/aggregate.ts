import { none, some } from "../option/constructors.ts";
import type { Option } from "../option/types.ts";

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
