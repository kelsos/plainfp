import type { Err, Ok, Result } from "./types.ts";

export const ok = <T>(value: T): Ok<T> => ({ ok: true, value });

export const err = <E>(error: E): Err<E> => ({ ok: false, error });

export const fromNullable = <T, E>(
  value: T | null | undefined,
  onNullish: E,
): Result<NonNullable<T>, E> => (value == null ? err(onNullish) : ok(value as NonNullable<T>));

export function fromThrowable<T>(fn: () => T): Result<T, unknown>;
export function fromThrowable<T, E>(fn: () => T, onError: (cause: unknown) => E): Result<T, E>;
export function fromThrowable<T, E>(
  fn: () => T,
  onError?: (cause: unknown) => E,
): Result<T, E | unknown> {
  try {
    return ok(fn());
  } catch (cause) {
    return err(onError ? onError(cause) : cause);
  }
}
