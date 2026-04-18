export const unique = <T>(xs: ReadonlyArray<T>): T[] => [...new Set(xs)];

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
