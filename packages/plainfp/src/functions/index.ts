/**
 * Return the given value unchanged. Useful as a default transform or
 * placeholder in higher-order composition.
 */
export const identity = <T>(value: T): T => value;

/**
 * Build a nullary function that always returns the captured value. Handy for
 * supplying defaults to APIs that expect a thunk.
 */
export const constant =
  <T>(value: T): (() => T) =>
  () =>
    value;

/**
 * Run a side effect on a value inside a pipeline and pass the value through
 * unchanged. Useful for logging, metrics, or assertions without breaking
 * composition.
 *
 * @example
 *   const result = pipe(
 *     loadUser(id),
 *     tap((user) => console.log("loaded", user.email)),
 *     (user) => user.name,
 *   )
 */
export const tap =
  <T>(fn: (value: T) => void): ((value: T) => T) =>
  (value) => {
    fn(value);
    return value;
  };

/**
 * Wrap a unary function with a per-argument cache. Results are keyed by
 * reference/value equality via `Map`, so non-primitive keys must be the same
 * reference to hit the cache.
 *
 * @example
 *   const fetchUser = memoize(async (id: string) => db.users.findById(id))
 *   await fetchUser("u_1") // miss
 *   await fetchUser("u_1") // hit
 */
export const memoize = <T, U>(fn: (value: T) => U): ((value: T) => U) => {
  const cache = new Map<T, U>();
  return (value) => {
    if (cache.has(value)) return cache.get(value) as U;
    const result = fn(value);
    cache.set(value, result);
    return result;
  };
};

/**
 * Do nothing. Useful as a default callback or to explicitly opt out of a hook.
 */
export const noop = (): void => {};
