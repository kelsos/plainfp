/**
 * Transform each value; keys are preserved. Only own enumerable entries
 * are visited.
 *
 * Dual API — works data-first or curried for use in `pipe`.
 *
 * @example
 *   pipe(
 *     { a: 1, b: 2 },
 *     Records.mapValues((n) => n * 10),
 *   )
 *   // { a: 10, b: 20 }
 */
export function mapValues<K extends PropertyKey, V, U>(
  record: Readonly<Record<K, V>>,
  fn: (value: V, key: K) => U,
): Record<K, U>;
export function mapValues<V, U, K extends PropertyKey = PropertyKey>(
  fn: (value: V, key: K) => U,
): (record: Readonly<Record<K, V>>) => Record<K, U>;
export function mapValues<K extends PropertyKey, V, U>(
  recordOrFn: Readonly<Record<K, V>> | ((value: V, key: K) => U),
  fn?: (value: V, key: K) => U,
): Record<K, U> | ((record: Readonly<Record<K, V>>) => Record<K, U>) {
  const run = (r: Readonly<Record<K, V>>, f: (value: V, key: K) => U): Record<K, U> => {
    const out = {} as Record<K, U>;
    for (const k in r) {
      if (Object.prototype.hasOwnProperty.call(r, k)) {
        out[k] = f(r[k], k);
      }
    }
    return out;
  };
  if (typeof recordOrFn === "function") return (r) => run(r, recordOrFn);
  return run(recordOrFn, fn as (value: V, key: K) => U);
}

/**
 * Rewrite each key via `fn`; values are preserved. If `fn` produces the
 * same key for multiple entries the later one wins (iteration order).
 *
 * Dual API — works data-first or curried for use in `pipe`.
 *
 * @example
 *   pipe(
 *     { firstName: "Ada", lastName: "Lovelace" },
 *     Records.mapKeys((k) => k.toUpperCase()),
 *   )
 *   // { FIRSTNAME: "Ada", LASTNAME: "Lovelace" }
 */
export function mapKeys<K extends PropertyKey, V, K2 extends PropertyKey>(
  record: Readonly<Record<K, V>>,
  fn: (key: K, value: V) => K2,
): Record<K2, V>;
export function mapKeys<K extends PropertyKey, K2 extends PropertyKey, V = unknown>(
  fn: (key: K, value: V) => K2,
): (record: Readonly<Record<K, V>>) => Record<K2, V>;
export function mapKeys<K extends PropertyKey, V, K2 extends PropertyKey>(
  recordOrFn: Readonly<Record<K, V>> | ((key: K, value: V) => K2),
  fn?: (key: K, value: V) => K2,
): Record<K2, V> | ((record: Readonly<Record<K, V>>) => Record<K2, V>) {
  const run = (r: Readonly<Record<K, V>>, f: (key: K, value: V) => K2): Record<K2, V> => {
    const out = {} as Record<K2, V>;
    for (const k in r) {
      if (Object.prototype.hasOwnProperty.call(r, k)) {
        out[f(k, r[k])] = r[k];
      }
    }
    return out;
  };
  if (typeof recordOrFn === "function") return (r) => run(r, recordOrFn);
  return run(recordOrFn, fn as (key: K, value: V) => K2);
}

/**
 * Keep only entries for which `predicate` returns `true`. Result is typed
 * `Partial` since keys may be absent.
 *
 * Dual API — works data-first or curried for use in `pipe`.
 *
 * @example
 *   pipe(
 *     { a: 1, b: 2, c: 3 },
 *     Records.filter((v) => v % 2 === 1),
 *   )
 *   // { a: 1, c: 3 }
 */
export function filter<K extends PropertyKey, V>(
  record: Readonly<Record<K, V>>,
  predicate: (value: V, key: K) => boolean,
): Partial<Record<K, V>>;
export function filter<K extends PropertyKey, V>(
  predicate: (value: V, key: K) => boolean,
): (record: Readonly<Record<K, V>>) => Partial<Record<K, V>>;
export function filter<K extends PropertyKey, V>(
  recordOrPred: Readonly<Record<K, V>> | ((value: V, key: K) => boolean),
  predicate?: (value: V, key: K) => boolean,
): Partial<Record<K, V>> | ((record: Readonly<Record<K, V>>) => Partial<Record<K, V>>) {
  const run = (
    r: Readonly<Record<K, V>>,
    p: (value: V, key: K) => boolean,
  ): Partial<Record<K, V>> => {
    const out: Partial<Record<K, V>> = {};
    for (const k in r) {
      if (Object.prototype.hasOwnProperty.call(r, k) && p(r[k], k)) {
        out[k] = r[k];
      }
    }
    return out;
  };
  if (typeof recordOrPred === "function") return (r) => run(r, recordOrPred);
  return run(recordOrPred, predicate as (value: V, key: K) => boolean);
}
