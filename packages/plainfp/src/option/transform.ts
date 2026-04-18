import { none, some } from "./constructors.ts";
import type { Option } from "./types.ts";

/**
 * Apply `fn` to the value inside a {@link Some}; leave {@link None} unchanged.
 * Supports data-first and curried (pipe-friendly) forms.
 *
 * @example
 *   const upper = pipe(
 *     fromNullable(user.name),
 *     map((n) => n.toUpperCase()),
 *   )
 */
export function map<T, U>(option: Option<T>, fn: (value: T) => U): Option<U>;
export function map<T, U>(fn: (value: T) => U): (option: Option<T>) => Option<U>;
export function map<T, U>(
  optionOrFn: Option<T> | ((value: T) => U),
  fn?: (value: T) => U,
): Option<U> | ((option: Option<T>) => Option<U>) {
  if (typeof optionOrFn === "function") {
    const f = optionOrFn;
    return (option: Option<T>) => (option.some ? some(f(option.value)) : option);
  }
  const f = fn as (value: T) => U;
  return optionOrFn.some ? some(f(optionOrFn.value)) : optionOrFn;
}

/**
 * Chain an {@link Option}-returning computation. `None` short-circuits.
 * Supports data-first and curried (pipe-friendly) forms.
 *
 * @example
 *   const street = pipe(
 *     findUser(id),
 *     flatMap((u) => fromNullable(u.address)),
 *     flatMap((a) => fromNullable(a.street)),
 *   )
 */
export function flatMap<T, U>(option: Option<T>, fn: (value: T) => Option<U>): Option<U>;
export function flatMap<T, U>(fn: (value: T) => Option<U>): (option: Option<T>) => Option<U>;
export function flatMap<T, U>(
  optionOrFn: Option<T> | ((value: T) => Option<U>),
  fn?: (value: T) => Option<U>,
): Option<U> | ((option: Option<T>) => Option<U>) {
  if (typeof optionOrFn === "function") {
    const f = optionOrFn;
    return (option: Option<T>) => (option.some ? f(option.value) : option);
  }
  const f = fn as (value: T) => Option<U>;
  return optionOrFn.some ? f(optionOrFn.value) : optionOrFn;
}

/**
 * Keep the value if `predicate` holds; otherwise collapse to {@link none}.
 * Supports data-first and curried (pipe-friendly) forms.
 *
 * @example
 *   const adult = pipe(
 *     fromNullable(user.age),
 *     filter((age) => age >= 18),
 *   )
 */
export function filter<T>(option: Option<T>, predicate: (value: T) => boolean): Option<T>;
export function filter<T>(predicate: (value: T) => boolean): (option: Option<T>) => Option<T>;
export function filter<T>(
  optionOrPred: Option<T> | ((value: T) => boolean),
  predicate?: (value: T) => boolean,
): Option<T> | ((option: Option<T>) => Option<T>) {
  if (typeof optionOrPred === "function") {
    const p = optionOrPred;
    return (option: Option<T>) => (option.some && p(option.value) ? option : none);
  }
  const p = predicate as (value: T) => boolean;
  return optionOrPred.some && p(optionOrPred.value) ? optionOrPred : none;
}
