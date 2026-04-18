import type { None, Option, Some } from "./types.ts";

/**
 * Type guard for the {@link Some} case.
 *
 * @example
 *   const maybeUser = fromNullable(lookup(id))
 *   if (isSome(maybeUser)) render(maybeUser.value)
 */
export const isSome = <T>(option: Option<T>): option is Some<T> => option.some;

/**
 * Type guard for the {@link None} case.
 *
 * @example
 *   if (isNone(fromNullable(form.email))) showError("Email required")
 */
export const isNone = <T>(option: Option<T>): option is None => !option.some;

/**
 * Extract the value from a {@link Some}, or return `fallback` for {@link None}.
 * Supports data-first and curried (pipe-friendly) forms.
 *
 * @example
 *   const displayName = pipe(
 *     fromNullable(user.nickname),
 *     getOr("Anonymous"),
 *   )
 */
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

/**
 * Handler pair for {@link match}: one branch per {@link Option} case,
 * both returning the same result type `U`.
 */
export type MatchHandlers<T, U> = {
  readonly some: (value: T) => U;
  readonly none: () => U;
};

/**
 * Fold an {@link Option} by supplying a handler for each case.
 * Supports data-first and curried (pipe-friendly) forms.
 *
 * @example
 *   const label = pipe(
 *     fromNullable(order.shippedAt),
 *     match({
 *       some: (date) => `Shipped ${date.toDateString()}`,
 *       none: () => "Pending",
 *     }),
 *   )
 */
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
