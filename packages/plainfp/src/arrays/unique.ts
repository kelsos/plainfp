/**
 * Drop duplicates using SameValueZero equality (so `NaN` equals `NaN` and
 * `+0` equals `-0`). First occurrence wins; order preserved.
 *
 * @example
 *   unique([1, 2, 2, 3, 1])
 *   // [1, 2, 3]
 */
export const unique = <T>(xs: ReadonlyArray<T>): T[] => [...new Set(xs)];

/**
 * Drop duplicates compared by projected key. Keys use `Set`/SameValueZero
 * semantics. First occurrence per key wins; order preserved.
 *
 * Dual API — works data-first or curried for use in `pipe`.
 *
 * @example
 *   pipe(
 *     users,
 *     Arrays.uniqueBy((u) => u.email),
 *   )
 */
export function uniqueBy<T, K>(xs: ReadonlyArray<T>, keyFn: (x: T) => K): T[];
export function uniqueBy<T, K>(keyFn: (x: T) => K): (xs: ReadonlyArray<T>) => T[];
export function uniqueBy<T, K>(
  xsOrFn: ReadonlyArray<T> | ((x: T) => K),
  keyFn?: (x: T) => K,
): T[] | ((xs: ReadonlyArray<T>) => T[]) {
  const run = (xs: ReadonlyArray<T>, f: (x: T) => K): T[] => {
    const seen = new Set<K>();
    const out: T[] = [];
    for (const x of xs) {
      const k = f(x);
      if (!seen.has(k)) {
        seen.add(k);
        out.push(x);
      }
    }
    return out;
  };
  if (typeof xsOrFn === "function") return (xs) => run(xs, xsOrFn);
  return run(xsOrFn, keyFn as (x: T) => K);
}
