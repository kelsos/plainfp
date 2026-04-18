import { err } from "../result/constructors.ts";
import type { ResultAsync } from "./types.ts";

export type RetryOptions = {
  readonly times: number;
  readonly delayMs?: number;
  readonly backoff?: "linear" | "exponential";
};

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

export const retry = async <T, E>(
  factory: () => ResultAsync<T, E>,
  options: RetryOptions,
): ResultAsync<T, E> => {
  const { times, delayMs = 0, backoff = "linear" } = options;
  if (times < 1) throw new RangeError(`retry times must be >= 1, got ${times}`);

  let attempt = 0;
  let last = await factory();
  attempt++;
  while (!last.ok && attempt < times) {
    if (delayMs > 0) {
      const wait = backoff === "exponential" ? delayMs * 2 ** (attempt - 1) : delayMs * attempt;
      await sleep(wait);
    }
    last = await factory();
    attempt++;
  }
  return last;
};

export function timeout<T, E, F>(
  ra: ResultAsync<T, E>,
  ms: number,
  onTimeout: () => F,
): ResultAsync<T, E | F>;
export function timeout<F>(
  ms: number,
  onTimeout: () => F,
): <T, E>(ra: ResultAsync<T, E>) => ResultAsync<T, E | F>;
export function timeout<T, E, F>(
  raOrMs: ResultAsync<T, E> | number,
  msOrOnTimeout: number | (() => F),
  onTimeout?: () => F,
): ResultAsync<T, E | F> | ((ra: ResultAsync<T, E>) => ResultAsync<T, E | F>) {
  const run = async (ra: ResultAsync<T, E>, ms: number, onT: () => F): ResultAsync<T, E | F> => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const timeoutPromise = new Promise<{ ok: false; error: F }>((resolve) => {
      timer = setTimeout(() => resolve(err(onT())), ms);
    });
    try {
      return await Promise.race([ra, timeoutPromise]);
    } finally {
      if (timer !== undefined) clearTimeout(timer);
    }
  };
  if (typeof raOrMs === "number") {
    const ms = raOrMs;
    const onT = msOrOnTimeout as () => F;
    return (ra: ResultAsync<T, E>) => run(ra, ms, onT);
  }
  return run(raOrMs, msOrOnTimeout as number, onTimeout as () => F);
}
