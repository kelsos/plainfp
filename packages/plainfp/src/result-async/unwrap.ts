import type { ResultAsync } from "./types.ts";

export function getOr<T, E>(ra: ResultAsync<T, E>, fallback: T): Promise<T>;
export function getOr<T>(fallback: T): <E>(ra: ResultAsync<T, E>) => Promise<T>;
export function getOr<T, E>(
  raOrFallback: ResultAsync<T, E> | T,
  fallback?: T,
): Promise<T> | ((ra: ResultAsync<T, E>) => Promise<T>) {
  const run = async (ra: ResultAsync<T, E>, fb: T): Promise<T> => {
    const r = await ra;
    return r.ok ? r.value : fb;
  };
  if (arguments.length === 1) {
    const fb = raOrFallback as T;
    return (ra: ResultAsync<T, E>) => run(ra, fb);
  }
  return run(raOrFallback as ResultAsync<T, E>, fallback as T);
}

export type MatchHandlers<T, E, U> = {
  readonly ok: (value: T) => U | Promise<U>;
  readonly err: (error: E) => U | Promise<U>;
};

export function match<T, E, U>(ra: ResultAsync<T, E>, handlers: MatchHandlers<T, E, U>): Promise<U>;
export function match<T, E, U>(
  handlers: MatchHandlers<T, E, U>,
): (ra: ResultAsync<T, E>) => Promise<U>;
export function match<T, E, U>(
  raOrHandlers: ResultAsync<T, E> | MatchHandlers<T, E, U>,
  handlers?: MatchHandlers<T, E, U>,
): Promise<U> | ((ra: ResultAsync<T, E>) => Promise<U>) {
  const run = async (ra: ResultAsync<T, E>, h: MatchHandlers<T, E, U>): Promise<U> => {
    const r = await ra;
    return r.ok ? await h.ok(r.value) : await h.err(r.error);
  };
  if (handlers === undefined) {
    const h = raOrHandlers as MatchHandlers<T, E, U>;
    return (ra: ResultAsync<T, E>) => run(ra, h);
  }
  return run(raOrHandlers as ResultAsync<T, E>, handlers);
}
