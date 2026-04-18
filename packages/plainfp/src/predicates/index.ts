/**
 * A function that tests a value and returns a boolean. The building block for
 * the combinators in this module.
 */
export type Predicate<T> = (value: T) => boolean;

/**
 * Combine predicates with logical AND. Short-circuits on the first `false`.
 *
 * @example
 *   const isAdultUser = and<User>(
 *     (u) => u.age >= 18,
 *     (u) => u.verified,
 *   )
 *   isAdultUser({ age: 21, verified: true }) // true
 */
export const and =
  <T>(...predicates: ReadonlyArray<Predicate<T>>): Predicate<T> =>
  (value) =>
    predicates.every((p) => p(value));

/**
 * Combine predicates with logical OR. Short-circuits on the first `true`.
 *
 * @example
 *   const isPriorityOrder = or<Order>(
 *     (o) => o.total > 500,
 *     (o) => o.customerTier === "gold",
 *   )
 */
export const or =
  <T>(...predicates: ReadonlyArray<Predicate<T>>): Predicate<T> =>
  (value) =>
    predicates.some((p) => p(value));

/**
 * Negate a predicate.
 *
 * @example
 *   const isInactive = not<User>((u) => u.active)
 *   users.filter(isInactive)
 */
export const not =
  <T>(predicate: Predicate<T>): Predicate<T> =>
  (value) =>
    !predicate(value);

/** Type guard narrowing `unknown` to `string`. */
export const isString = (value: unknown): value is string => typeof value === "string";

/** Type guard narrowing `unknown` to a non-`NaN` `number`. */
export const isNumber = (value: unknown): value is number =>
  typeof value === "number" && !Number.isNaN(value);

/** Type guard narrowing `unknown` to `boolean`. */
export const isBoolean = (value: unknown): value is boolean => typeof value === "boolean";

/** Type guard that excludes `null` and `undefined`. */
export const isDefined = <T>(value: T | null | undefined): value is T => value != null;

/** Type guard matching `null` or `undefined`. */
export const isNullish = (value: unknown): value is null | undefined => value == null;

/** Type guard narrowing `unknown` to an array. */
export const isArray = <T = unknown>(value: unknown): value is T[] => Array.isArray(value);

/** Type guard matching plain/non-array objects. Rejects `null` and arrays. */
export const isObject = (value: unknown): value is Record<PropertyKey, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** Type guard narrowing `unknown` to a callable. */
export const isFunction = (value: unknown): value is (...args: unknown[]) => unknown =>
  typeof value === "function";
