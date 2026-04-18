import { none, some } from "../option/constructors.ts";
import type { Option } from "../option/types.ts";

export type NonEmptyArray<T> = readonly [T, ...T[]];

export const of = <T>(head: T, ...tail: T[]): NonEmptyArray<T> => [head, ...tail];

export const fromArray = <T>(xs: ReadonlyArray<T>): Option<NonEmptyArray<T>> =>
  xs.length === 0 ? none : some(xs as unknown as NonEmptyArray<T>);

export const head = <T>(xs: NonEmptyArray<T>): T => xs[0];

export const tail = <T>(xs: NonEmptyArray<T>): T[] => xs.slice(1);

export const last = <T>(xs: NonEmptyArray<T>): T => xs[xs.length - 1] as T;

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
