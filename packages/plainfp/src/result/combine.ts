import { err, ok } from "./constructors.ts";
import type { Result } from "./types.ts";

export const all = <T, E>(results: ReadonlyArray<Result<T, E>>): Result<T[], E> => {
  const values: T[] = [];
  for (const r of results) {
    if (!r.ok) return r;
    values.push(r.value);
  }
  return ok(values);
};

export const any = <T, E>(results: ReadonlyArray<Result<T, E>>): Result<T, E[]> => {
  const errors: E[] = [];
  for (const r of results) {
    if (r.ok) return r;
    errors.push(r.error);
  }
  return err(errors);
};

export const zip = <T1, T2, E>(a: Result<T1, E>, b: Result<T2, E>): Result<[T1, T2], E> => {
  if (!a.ok) return a;
  if (!b.ok) return b;
  return ok([a.value, b.value]);
};
