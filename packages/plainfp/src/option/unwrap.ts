import type { None, Option, Some } from "./types.ts";

export const isSome = <T>(option: Option<T>): option is Some<T> => option.some;

export const isNone = <T>(option: Option<T>): option is None => !option.some;

export function getOr<T>(option: Option<T>, fallback: T): T;
export function getOr<T>(fallback: T): (option: Option<T>) => T;
export function getOr<T>(
  optionOrFallback: Option<T> | T,
  fallback?: T,
): T | ((option: Option<T>) => T) {
  if (arguments.length === 1) {
    const fb = optionOrFallback as T;
    return (option: Option<T>) => (option.some ? option.value : fb);
  }
  const option = optionOrFallback as Option<T>;
  return option.some ? option.value : (fallback as T);
}

export type MatchHandlers<T, U> = {
  readonly some: (value: T) => U;
  readonly none: () => U;
};

export function match<T, U>(option: Option<T>, handlers: MatchHandlers<T, U>): U;
export function match<T, U>(handlers: MatchHandlers<T, U>): (option: Option<T>) => U;
export function match<T, U>(
  optionOrHandlers: Option<T> | MatchHandlers<T, U>,
  handlers?: MatchHandlers<T, U>,
): U | ((option: Option<T>) => U) {
  if (handlers === undefined) {
    const h = optionOrHandlers as MatchHandlers<T, U>;
    return (option: Option<T>) => (option.some ? h.some(option.value) : h.none());
  }
  const option = optionOrHandlers as Option<T>;
  return option.some ? handlers.some(option.value) : handlers.none();
}
