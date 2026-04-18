import { err, ok } from "../result/constructors.ts";
import type { ResultAsync } from "./types.ts";

// Narrow the union of `ResultAsync<T, E> | ((...) => ...)` to its function
// branch. We can't use a generic predicate like `x is (...args: unknown[]) =>
// unknown` because the caller's callback type isn't assignable to that.
// Instead, check the concrete shape and let TS narrow based on
// `Function`/`object` split.
const isFn = (x: object | Function): x is Function => typeof x === "function";

export function map<T, E, U>(
  ra: ResultAsync<T, E>,
  fn: (value: T) => U | Promise<U>,
): ResultAsync<U, E>;
export function map<T, U>(
  fn: (value: T) => U | Promise<U>,
): <E>(ra: ResultAsync<T, E>) => ResultAsync<U, E>;
export function map<T, E, U>(
  raOrFn: ResultAsync<T, E> | ((value: T) => U | Promise<U>),
  fn?: (value: T) => U | Promise<U>,
): ResultAsync<U, E> | ((ra: ResultAsync<T, E>) => ResultAsync<U, E>) {
  const run = async (
    ra: ResultAsync<T, E>,
    f: (value: T) => U | Promise<U>,
  ): Promise<ReturnType<typeof ok<U>> | ReturnType<typeof err<E>>> => {
    const r = await ra;
    return r.ok ? ok(await f(r.value)) : r;
  };
  if (isFn(raOrFn)) return (ra) => run(ra, raOrFn);
  return run(raOrFn, fn as (value: T) => U | Promise<U>);
}

export function mapError<T, E, F>(
  ra: ResultAsync<T, E>,
  fn: (error: E) => F | Promise<F>,
): ResultAsync<T, F>;
export function mapError<E, F>(
  fn: (error: E) => F | Promise<F>,
): <T>(ra: ResultAsync<T, E>) => ResultAsync<T, F>;
export function mapError<T, E, F>(
  raOrFn: ResultAsync<T, E> | ((error: E) => F | Promise<F>),
  fn?: (error: E) => F | Promise<F>,
): ResultAsync<T, F> | ((ra: ResultAsync<T, E>) => ResultAsync<T, F>) {
  const run = async (ra: ResultAsync<T, E>, f: (error: E) => F | Promise<F>) => {
    const r = await ra;
    return r.ok ? r : err(await f(r.error));
  };
  if (isFn(raOrFn)) return (ra) => run(ra, raOrFn);
  return run(raOrFn, fn as (error: E) => F | Promise<F>);
}

export function flatMap<T, E, U, F>(
  ra: ResultAsync<T, E>,
  fn: (value: T) => ResultAsync<U, F>,
): ResultAsync<U, E | F>;
export function flatMap<T, U, F>(
  fn: (value: T) => ResultAsync<U, F>,
): <E>(ra: ResultAsync<T, E>) => ResultAsync<U, E | F>;
export function flatMap<T, E, U, F>(
  raOrFn: ResultAsync<T, E> | ((value: T) => ResultAsync<U, F>),
  fn?: (value: T) => ResultAsync<U, F>,
): ResultAsync<U, E | F> | ((ra: ResultAsync<T, E>) => ResultAsync<U, E | F>) {
  const run = async (ra: ResultAsync<T, E>, f: (value: T) => ResultAsync<U, F>) => {
    const r = await ra;
    return r.ok ? await f(r.value) : r;
  };
  if (isFn(raOrFn)) return (ra) => run(ra, raOrFn);
  return run(raOrFn, fn as (value: T) => ResultAsync<U, F>);
}

export function tap<T, E>(
  ra: ResultAsync<T, E>,
  fn: (value: T) => void | Promise<void>,
): ResultAsync<T, E>;
export function tap<T>(
  fn: (value: T) => void | Promise<void>,
): <E>(ra: ResultAsync<T, E>) => ResultAsync<T, E>;
export function tap<T, E>(
  raOrFn: ResultAsync<T, E> | ((value: T) => void | Promise<void>),
  fn?: (value: T) => void | Promise<void>,
): ResultAsync<T, E> | ((ra: ResultAsync<T, E>) => ResultAsync<T, E>) {
  const run = async (ra: ResultAsync<T, E>, f: (value: T) => void | Promise<void>) => {
    const r = await ra;
    if (r.ok) await f(r.value);
    return r;
  };
  if (isFn(raOrFn)) return (ra) => run(ra, raOrFn);
  return run(raOrFn, fn as (value: T) => void | Promise<void>);
}

export function tapError<T, E>(
  ra: ResultAsync<T, E>,
  fn: (error: E) => void | Promise<void>,
): ResultAsync<T, E>;
export function tapError<E>(
  fn: (error: E) => void | Promise<void>,
): <T>(ra: ResultAsync<T, E>) => ResultAsync<T, E>;
export function tapError<T, E>(
  raOrFn: ResultAsync<T, E> | ((error: E) => void | Promise<void>),
  fn?: (error: E) => void | Promise<void>,
): ResultAsync<T, E> | ((ra: ResultAsync<T, E>) => ResultAsync<T, E>) {
  const run = async (ra: ResultAsync<T, E>, f: (error: E) => void | Promise<void>) => {
    const r = await ra;
    if (!r.ok) await f(r.error);
    return r;
  };
  if (isFn(raOrFn)) return (ra) => run(ra, raOrFn);
  return run(raOrFn, fn as (error: E) => void | Promise<void>);
}
