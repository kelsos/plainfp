export type Predicate<T> = (value: T) => boolean;

export const and =
  <T>(...predicates: ReadonlyArray<Predicate<T>>): Predicate<T> =>
  (value) =>
    predicates.every((p) => p(value));

export const or =
  <T>(...predicates: ReadonlyArray<Predicate<T>>): Predicate<T> =>
  (value) =>
    predicates.some((p) => p(value));

export const not =
  <T>(predicate: Predicate<T>): Predicate<T> =>
  (value) =>
    !predicate(value);

export const isString = (value: unknown): value is string => typeof value === "string";

export const isNumber = (value: unknown): value is number =>
  typeof value === "number" && !Number.isNaN(value);

export const isBoolean = (value: unknown): value is boolean => typeof value === "boolean";

export const isDefined = <T>(value: T | null | undefined): value is T => value != null;

export const isNullish = (value: unknown): value is null | undefined => value == null;

export const isArray = <T = unknown>(value: unknown): value is T[] => Array.isArray(value);

export const isObject = (value: unknown): value is Record<PropertyKey, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const isFunction = (value: unknown): value is (...args: unknown[]) => unknown =>
  typeof value === "function";
