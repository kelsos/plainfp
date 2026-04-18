/**
 * Bucket elements into a record keyed by `keyFn`. Elements sharing a key
 * are appended to the same bucket in input order.
 *
 * Dual API — works data-first or curried for use in `pipe`.
 *
 * @example
 *   pipe(
 *     orders,
 *     Arrays.groupBy((o) => o.status),
 *   )
 *   // { pending: [...], shipped: [...] }
 */
export function groupBy<T, K extends PropertyKey>(
  xs: ReadonlyArray<T>,
  keyFn: (x: T) => K,
): Record<K, T[]>;
export function groupBy<T, K extends PropertyKey>(
  keyFn: (x: T) => K,
): (xs: ReadonlyArray<T>) => Record<K, T[]>;
export function groupBy<T, K extends PropertyKey>(
  xsOrFn: ReadonlyArray<T> | ((x: T) => K),
  keyFn?: (x: T) => K,
): Record<K, T[]> | ((xs: ReadonlyArray<T>) => Record<K, T[]>) {
  const run = (xs: ReadonlyArray<T>, f: (x: T) => K): Record<K, T[]> => {
    const result = {} as Record<K, T[]>;
    for (const x of xs) {
      const k = f(x);
      (result[k] ??= []).push(x);
    }
    return result;
  };
  if (typeof xsOrFn === "function") return (xs) => run(xs, xsOrFn);
  return run(xsOrFn, keyFn as (x: T) => K);
}

/**
 * Split into `[matches, rest]` based on `predicate`. Relative order is
 * preserved within each side.
 *
 * Dual API — works data-first or curried for use in `pipe`.
 *
 * @example
 *   const [active, inactive] = pipe(
 *     users,
 *     Arrays.partition((u) => u.active),
 *   )
 */
export function partition<T>(xs: ReadonlyArray<T>, predicate: (x: T) => boolean): [T[], T[]];
export function partition<T>(predicate: (x: T) => boolean): (xs: ReadonlyArray<T>) => [T[], T[]];
export function partition<T>(
  xsOrPred: ReadonlyArray<T> | ((x: T) => boolean),
  predicate?: (x: T) => boolean,
): [T[], T[]] | ((xs: ReadonlyArray<T>) => [T[], T[]]) {
  const run = (xs: ReadonlyArray<T>, p: (x: T) => boolean): [T[], T[]] => {
    const yes: T[] = [];
    const no: T[] = [];
    for (const x of xs) (p(x) ? yes : no).push(x);
    return [yes, no];
  };
  if (typeof xsOrPred === "function") return (xs) => run(xs, xsOrPred);
  return run(xsOrPred, predicate as (x: T) => boolean);
}

/**
 * Split `xs` into consecutive slices of length `size`. The last slice may
 * be shorter if the length isn't divisible.
 *
 * Dual API — works data-first or curried for use in `pipe`.
 *
 * @throws RangeError if `size` is not a positive integer (fractional, zero,
 *   or negative values all reject).
 *
 * @example
 *   chunk([1, 2, 3, 4, 5], 2)
 *   // [[1, 2], [3, 4], [5]]
 */
export function chunk<T>(xs: ReadonlyArray<T>, size: number): T[][];
export function chunk<T>(size: number): (xs: ReadonlyArray<T>) => T[][];
export function chunk<T>(
  xsOrSize: ReadonlyArray<T> | number,
  size?: number,
): T[][] | ((xs: ReadonlyArray<T>) => T[][]) {
  const run = (xs: ReadonlyArray<T>, n: number): T[][] => {
    if (!Number.isInteger(n) || n < 1) {
      throw new RangeError(`chunk size must be a positive integer, got ${n}`);
    }
    const out: T[][] = [];
    for (let i = 0; i < xs.length; i += n) out.push(xs.slice(i, i + n));
    return out;
  };
  if (typeof xsOrSize === "number") return (xs) => run(xs, xsOrSize);
  return run(xsOrSize, size as number);
}
