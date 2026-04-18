import { none, some } from "../option/constructors.ts";
import type { Option } from "../option/types.ts";

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

export const keys = <K extends PropertyKey, V>(record: Readonly<Record<K, V>>): K[] =>
  Object.keys(record) as K[];

export const values = <V>(record: Readonly<Record<PropertyKey, V>>): V[] => Object.values(record);

export const entries = <K extends PropertyKey, V>(record: Readonly<Record<K, V>>): [K, V][] =>
  Object.entries(record) as [K, V][];
