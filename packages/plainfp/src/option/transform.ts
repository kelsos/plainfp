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

/**
 * Run a side effect on the value inside a {@link Some}; the option flows
 * through unchanged. {@link none} is ignored. Useful for logging, metrics,
 * or debugging inside a `pipe`.
 *
 * Dual API — works data-first or curried for use in `pipe`.
 *
 * @example
 *   pipe(
 *     findUser(id),
 *     Option.tap(user => logger.debug("loaded", user.id)),
 *     Option.map(user => user.name),
 *   )
 */
export function tap<T>(option: Option<T>, fn: (value: T) => void): Option<T>;
export function tap<T>(fn: (value: T) => void): (option: Option<T>) => Option<T>;
export function tap<T>(
  optionOrFn: Option<T> | ((value: T) => void),
  fn?: (value: T) => void,
): Option<T> | ((option: Option<T>) => Option<T>) {
  if (typeof optionOrFn === "function") {
    const f = optionOrFn;
    return (option: Option<T>) => {
      if (option.some) f(option.value);
      return option;
    };
  }
  const f = fn as (value: T) => void;
  if (optionOrFn.some) f(optionOrFn.value);
  return optionOrFn;
}

/**
 * Run a side effect when the option is {@link none}; the option flows
 * through unchanged. The effect receives no arguments.
 *
 * Dual API — works data-first or curried for use in `pipe`.
 *
 * @example
 *   pipe(
 *     findUser(id),
 *     Option.tapNone(() => logger.warn("user not found", { id })),
 *   )
 */
export function tapNone<T>(option: Option<T>, fn: () => void): Option<T>;
export function tapNone<T>(fn: () => void): (option: Option<T>) => Option<T>;
export function tapNone<T>(
  optionOrFn: Option<T> | (() => void),
  fn?: () => void,
): Option<T> | ((option: Option<T>) => Option<T>) {
  if (typeof optionOrFn === "function") {
    const f = optionOrFn;
    return (option: Option<T>) => {
      if (!option.some) f();
      return option;
    };
  }
  const f = fn as () => void;
  if (!optionOrFn.some) f();
  return optionOrFn;
}
