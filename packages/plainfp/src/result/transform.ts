import { err, ok } from "./constructors.ts";
import type { Result } from "./types.ts";

export function map<T, E, U>(result: Result<T, E>, fn: (value: T) => U): Result<U, E>;
export function map<T, U>(fn: (value: T) => U): <E>(result: Result<T, E>) => Result<U, E>;
export function map<T, E, U>(
  resultOrFn: Result<T, E> | ((value: T) => U),
  fn?: (value: T) => U,
): Result<U, E> | ((result: Result<T, E>) => Result<U, E>) {
  if (typeof resultOrFn === "function") {
    const f = resultOrFn;
    return (result: Result<T, E>) => (result.ok ? ok(f(result.value)) : result);
  }
  const f = fn as (value: T) => U;
  return resultOrFn.ok ? ok(f(resultOrFn.value)) : resultOrFn;
}

export function mapError<T, E, F>(result: Result<T, E>, fn: (error: E) => F): Result<T, F>;
export function mapError<E, F>(fn: (error: E) => F): <T>(result: Result<T, E>) => Result<T, F>;
export function mapError<T, E, F>(
  resultOrFn: Result<T, E> | ((error: E) => F),
  fn?: (error: E) => F,
): Result<T, F> | ((result: Result<T, E>) => Result<T, F>) {
  if (typeof resultOrFn === "function") {
    const f = resultOrFn;
    return (result: Result<T, E>) => (result.ok ? result : err(f(result.error)));
  }
  const f = fn as (error: E) => F;
  return resultOrFn.ok ? resultOrFn : err(f(resultOrFn.error));
}

export function flatMap<T, E, U, F>(
  result: Result<T, E>,
  fn: (value: T) => Result<U, F>,
): Result<U, E | F>;
export function flatMap<T, U, F>(
  fn: (value: T) => Result<U, F>,
): <E>(result: Result<T, E>) => Result<U, E | F>;
export function flatMap<T, E, U, F>(
  resultOrFn: Result<T, E> | ((value: T) => Result<U, F>),
  fn?: (value: T) => Result<U, F>,
): Result<U, E | F> | ((result: Result<T, E>) => Result<U, E | F>) {
  if (typeof resultOrFn === "function") {
    const f = resultOrFn;
    return (result: Result<T, E>) => (result.ok ? f(result.value) : result);
  }
  const f = fn as (value: T) => Result<U, F>;
  return resultOrFn.ok ? f(resultOrFn.value) : resultOrFn;
}
