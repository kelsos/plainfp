import { err as errSync, ok as okSync } from "../result/constructors.ts";
import type { ResultAsync } from "./types.ts";

export const ok = <T>(value: T): ResultAsync<T, never> => Promise.resolve(okSync(value));

export const err = <E>(error: E): ResultAsync<never, E> => Promise.resolve(errSync(error));

export const fromPromise = <T, E>(
  promise: Promise<T>,
  onError: (cause: unknown) => E,
): ResultAsync<T, E> =>
  promise.then(
    (value) => okSync(value),
    (cause: unknown) => errSync(onError(cause)),
  );

export const fromAsync = <T, E>(
  fn: () => Promise<T>,
  onError: (cause: unknown) => E,
): ResultAsync<T, E> => {
  try {
    return fromPromise(fn(), onError);
  } catch (cause) {
    return Promise.resolve(errSync(onError(cause)));
  }
};
