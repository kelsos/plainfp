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
