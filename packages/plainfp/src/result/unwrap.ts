import type { Err, Ok, Result } from "./types.ts";

export const isOk = <T, E>(result: Result<T, E>): result is Ok<T> => result.ok;

export const isErr = <T, E>(result: Result<T, E>): result is Err<E> => !result.ok;

export function getOr<T, E>(result: Result<T, E>, fallback: T): T;
export function getOr<T>(fallback: T): <E>(result: Result<T, E>) => T;
export function getOr<T, E>(
  resultOrFallback: Result<T, E> | T,
  fallback?: T,
): T | ((result: Result<T, E>) => T) {
  if (arguments.length === 1) {
    const fb = resultOrFallback as T;
    return (result: Result<T, E>) => (result.ok ? result.value : fb);
  }
  const result = resultOrFallback as Result<T, E>;
  return result.ok ? result.value : (fallback as T);
}

export type MatchHandlers<T, E, U> = {
  readonly ok: (value: T) => U;
  readonly err: (error: E) => U;
};

export function match<T, E, U>(result: Result<T, E>, handlers: MatchHandlers<T, E, U>): U;
export function match<T, E, U>(handlers: MatchHandlers<T, E, U>): (result: Result<T, E>) => U;
export function match<T, E, U>(
  resultOrHandlers: Result<T, E> | MatchHandlers<T, E, U>,
  handlers?: MatchHandlers<T, E, U>,
): U | ((result: Result<T, E>) => U) {
  if (handlers === undefined) {
    const h = resultOrHandlers as MatchHandlers<T, E, U>;
    return (result: Result<T, E>) => (result.ok ? h.ok(result.value) : h.err(result.error));
  }
  const result = resultOrHandlers as Result<T, E>;
  return result.ok ? handlers.ok(result.value) : handlers.err(result.error);
}
