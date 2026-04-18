export const identity = <T>(value: T): T => value;

export const constant =
  <T>(value: T): (() => T) =>
  () =>
    value;

export const tap =
  <T>(fn: (value: T) => void): ((value: T) => T) =>
  (value) => {
    fn(value);
    return value;
  };

export const memoize = <T, U>(fn: (value: T) => U): ((value: T) => U) => {
  const cache = new Map<T, U>();
  return (value) => {
    if (cache.has(value)) return cache.get(value) as U;
    const result = fn(value);
    cache.set(value, result);
    return result;
  };
};

export const noop = (): void => {};
