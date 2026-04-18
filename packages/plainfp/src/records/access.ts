import { none, some } from "../option/constructors.ts";
import type { Option } from "../option/types.ts";

/**
 * Look up a key's value. Only own properties are considered — inherited
 * prototype-chain entries return `none`.
 *
 * Dual API — works data-first or curried for use in `pipe`.
 *
 * @example
 *   const cache: Record<string, number> = { hits: 42 }
 *   get(cache, "hits")     // { some: true, value: 42 }
 *   get(cache, "toString") // { some: false } — prototype method ignored
 */
export function get<V>(record: Readonly<Record<PropertyKey, V>>, key: PropertyKey): Option<V>;
export function get<V>(key: PropertyKey): (record: Readonly<Record<PropertyKey, V>>) => Option<V>;
export function get<V>(
  recordOrKey: Readonly<Record<PropertyKey, V>> | PropertyKey,
  key?: PropertyKey,
): Option<V> | ((record: Readonly<Record<PropertyKey, V>>) => Option<V>) {
  const run = (r: Readonly<Record<PropertyKey, V>>, k: PropertyKey): Option<V> =>
    Object.prototype.hasOwnProperty.call(r, k) ? some(r[k as keyof typeof r] as V) : none;
  // arguments.length discriminates data-first vs curried so a runtime
  // `undefined` key in data-first calls isn't misread as curried form.
  if (arguments.length < 2) {
    const k = recordOrKey as PropertyKey;
    return (r) => run(r, k);
  }
  return run(recordOrKey as Readonly<Record<PropertyKey, V>>, key as PropertyKey);
}

/**
 * Look up a key's value, falling back to `fallback` when absent. Only own
 * properties are considered — inherited prototype-chain entries are
 * treated as missing.
 *
 * Dual API — works data-first or curried for use in `pipe`.
 *
 * @example
 *   const settings: Record<string, number> = { timeout: 30 }
 *   getOr(settings, "timeout", 10) // 30
 *   getOr(settings, "retries", 3)  // 3
 */
export function getOr<V>(
  record: Readonly<Record<PropertyKey, V>>,
  key: PropertyKey,
  fallback: NoInfer<V>,
): V;
export function getOr<V>(
  key: PropertyKey,
  fallback: V,
): (record: Readonly<Record<PropertyKey, V>>) => V;
export function getOr<V>(
  recordOrKey: Readonly<Record<PropertyKey, V>> | PropertyKey,
  keyOrFallback: PropertyKey | V,
  fallback?: V,
): V | ((record: Readonly<Record<PropertyKey, V>>) => V) {
  const run = (r: Readonly<Record<PropertyKey, V>>, k: PropertyKey, fb: V): V =>
    Object.prototype.hasOwnProperty.call(r, k) ? (r[k as keyof typeof r] as V) : fb;
  // arguments.length (not `fallback === undefined`) so a legitimate
  // `undefined` fallback in data-first calls works.
  if (arguments.length < 3) {
    const k = recordOrKey as PropertyKey;
    const fb = keyOrFallback as V;
    return (r) => run(r, k, fb);
  }
  return run(
    recordOrKey as Readonly<Record<PropertyKey, V>>,
    keyOrFallback as PropertyKey,
    fallback as V,
  );
}

/**
 * List the record's own enumerable string keys, typed as `K`.
 *
 * @example
 *   keys({ id: 1, name: "Ada" })
 *   // ["id", "name"]
 */
export const keys = <K extends PropertyKey, V>(record: Readonly<Record<K, V>>): K[] =>
  Object.keys(record) as K[];

/**
 * List the record's own enumerable values.
 *
 * @example
 *   values({ id: 1, name: "Ada" })
 *   // [1, "Ada"]
 */
export const values = <V>(record: Readonly<Record<PropertyKey, V>>): V[] => Object.values(record);

/**
 * List the record's own enumerable `[key, value]` pairs, typed as `[K, V]`.
 *
 * @example
 *   entries({ id: 1, name: "Ada" })
 *   // [["id", 1], ["name", "Ada"]]
 */
export const entries = <K extends PropertyKey, V>(record: Readonly<Record<K, V>>): [K, V][] =>
  Object.entries(record) as [K, V][];
