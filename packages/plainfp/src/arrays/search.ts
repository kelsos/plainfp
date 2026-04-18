import { none, some } from "../option/constructors.ts";
import type { Option } from "../option/types.ts";

export function find<T>(xs: ReadonlyArray<T>, predicate: (x: T, i: number) => boolean): Option<T>;
export function find<T>(
  predicate: (x: T, i: number) => boolean,
): (xs: ReadonlyArray<T>) => Option<T>;
export function find<T>(
  xsOrPred: ReadonlyArray<T> | ((x: T, i: number) => boolean),
  predicate?: (x: T, i: number) => boolean,
): Option<T> | ((xs: ReadonlyArray<T>) => Option<T>) {
  const run = (xs: ReadonlyArray<T>, p: (x: T, i: number) => boolean): Option<T> => {
    for (let i = 0; i < xs.length; i++) {
      const x = xs[i] as T;
      if (p(x, i)) return some(x);
    }
    return none;
  };
  if (typeof xsOrPred === "function") return (xs) => run(xs, xsOrPred);
  return run(xsOrPred, predicate as (x: T, i: number) => boolean);
}

export function findIndex<T>(
  xs: ReadonlyArray<T>,
  predicate: (x: T, i: number) => boolean,
): Option<number>;
export function findIndex<T>(
  predicate: (x: T, i: number) => boolean,
): (xs: ReadonlyArray<T>) => Option<number>;
export function findIndex<T>(
  xsOrPred: ReadonlyArray<T> | ((x: T, i: number) => boolean),
  predicate?: (x: T, i: number) => boolean,
): Option<number> | ((xs: ReadonlyArray<T>) => Option<number>) {
  const run = (xs: ReadonlyArray<T>, p: (x: T, i: number) => boolean): Option<number> => {
    for (let i = 0; i < xs.length; i++) {
      if (p(xs[i] as T, i)) return some(i);
    }
    return none;
  };
  if (typeof xsOrPred === "function") return (xs) => run(xs, xsOrPred);
  return run(xsOrPred, predicate as (x: T, i: number) => boolean);
}

export function includes<T>(xs: ReadonlyArray<T>, value: T): boolean;
export function includes<T>(value: T): (xs: ReadonlyArray<T>) => boolean;
export function includes<T>(
  xsOrValue: ReadonlyArray<T> | T,
  value?: T,
): boolean | ((xs: ReadonlyArray<T>) => boolean) {
  if (arguments.length === 1) {
    const v = xsOrValue as T;
    return (xs: ReadonlyArray<T>) => xs.includes(v);
  }
  return (xsOrValue as ReadonlyArray<T>).includes(value as T);
}
