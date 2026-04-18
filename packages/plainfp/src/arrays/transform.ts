/**
 * Apply a transform to each element. Index is passed as the second arg.
 *
 * Dual API — works data-first or curried for use in `pipe`.
 *
 * @example
 *   pipe(
 *     orders,
 *     Arrays.map((o) => ({ ...o, total: o.price * o.qty })),
 *   )
 */
export function map<T, U>(xs: ReadonlyArray<T>, fn: (x: T, i: number) => U): U[];
export function map<T, U>(fn: (x: T, i: number) => U): (xs: ReadonlyArray<T>) => U[];
export function map<T, U>(
  xsOrFn: ReadonlyArray<T> | ((x: T, i: number) => U),
  fn?: (x: T, i: number) => U,
): U[] | ((xs: ReadonlyArray<T>) => U[]) {
  if (typeof xsOrFn === "function") {
    const f = xsOrFn;
    return (xs: ReadonlyArray<T>) => xs.map(f);
  }
  return xsOrFn.map(fn as (x: T, i: number) => U);
}

/**
 * Keep only elements for which `predicate` returns `true`. Index is passed
 * as the second arg.
 *
 * Dual API — works data-first or curried for use in `pipe`.
 *
 * @example
 *   pipe(
 *     users,
 *     Arrays.filter((u) => u.active),
 *   )
 */
export function filter<T>(xs: ReadonlyArray<T>, predicate: (x: T, i: number) => boolean): T[];
export function filter<T>(predicate: (x: T, i: number) => boolean): (xs: ReadonlyArray<T>) => T[];
export function filter<T>(
  xsOrPred: ReadonlyArray<T> | ((x: T, i: number) => boolean),
  predicate?: (x: T, i: number) => boolean,
): T[] | ((xs: ReadonlyArray<T>) => T[]) {
  if (typeof xsOrPred === "function") {
    const p = xsOrPred;
    return (xs: ReadonlyArray<T>) => xs.filter(p);
  }
  return xsOrPred.filter(predicate as (x: T, i: number) => boolean);
}

/**
 * Map each element to an array and flatten one level.
 *
 * Dual API — works data-first or curried for use in `pipe`.
 *
 * @example
 *   pipe(
 *     orders,
 *     Arrays.flatMap((o) => o.items),
 *   )
 */
export function flatMap<T, U>(xs: ReadonlyArray<T>, fn: (x: T, i: number) => ReadonlyArray<U>): U[];
export function flatMap<T, U>(
  fn: (x: T, i: number) => ReadonlyArray<U>,
): (xs: ReadonlyArray<T>) => U[];
export function flatMap<T, U>(
  xsOrFn: ReadonlyArray<T> | ((x: T, i: number) => ReadonlyArray<U>),
  fn?: (x: T, i: number) => ReadonlyArray<U>,
): U[] | ((xs: ReadonlyArray<T>) => U[]) {
  if (typeof xsOrFn === "function") {
    const f = xsOrFn;
    return (xs: ReadonlyArray<T>) => xs.flatMap(f as (x: T, i: number) => U | U[]);
  }
  const f = fn as (x: T, i: number) => U | U[];
  return xsOrFn.flatMap(f);
}

/**
 * Fold elements left-to-right into a single accumulated value starting
 * from `initial`.
 *
 * Dual API — works data-first or curried for use in `pipe`.
 *
 * @example
 *   pipe(
 *     orders,
 *     Arrays.reduce(0, (total, o) => total + o.price),
 *   )
 */
export function reduce<T, U>(
  xs: ReadonlyArray<T>,
  initial: U,
  fn: (acc: U, x: T, i: number) => U,
): U;
export function reduce<T, U>(
  initial: U,
  fn: (acc: U, x: T, i: number) => U,
): (xs: ReadonlyArray<T>) => U;
export function reduce<T, U>(
  xsOrInitial: ReadonlyArray<T> | U,
  initialOrFn: U | ((acc: U, x: T, i: number) => U),
  fn?: (acc: U, x: T, i: number) => U,
): U | ((xs: ReadonlyArray<T>) => U) {
  if (fn === undefined) {
    const initial = xsOrInitial as U;
    const f = initialOrFn as (acc: U, x: T, i: number) => U;
    return (xs: ReadonlyArray<T>) => xs.reduce(f, initial);
  }
  const xs = xsOrInitial as ReadonlyArray<T>;
  const initial = initialOrFn as U;
  return xs.reduce(fn, initial);
}
