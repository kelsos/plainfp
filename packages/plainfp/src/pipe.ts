/**
 * Compose a series of unary functions left-to-right, applying them to a seed
 * value. Unlike {@link flow}, `pipe` runs immediately and returns the result.
 *
 * @example
 *   const slug = pipe(
 *     "  Hello World  ",
 *     (s) => s.trim(),
 *     (s) => s.toLowerCase(),
 *     (s) => s.replace(/\s+/g, "-"),
 *   )
 *   // "hello-world"
 */
export function pipe<A>(a: A): A;
export function pipe<A, B>(a: A, ab: (a: A) => B): B;
export function pipe<A, B, C>(a: A, ab: (a: A) => B, bc: (b: B) => C): C;
export function pipe<A, B, C, D>(a: A, ab: (a: A) => B, bc: (b: B) => C, cd: (c: C) => D): D;
export function pipe<A, B, C, D, E>(
  a: A,
  ab: (a: A) => B,
  bc: (b: B) => C,
  cd: (c: C) => D,
  de: (d: D) => E,
): E;
export function pipe<A, B, C, D, E, F>(
  a: A,
  ab: (a: A) => B,
  bc: (b: B) => C,
  cd: (c: C) => D,
  de: (d: D) => E,
  ef: (e: E) => F,
): F;
export function pipe<A, B, C, D, E, F, G>(
  a: A,
  ab: (a: A) => B,
  bc: (b: B) => C,
  cd: (c: C) => D,
  de: (d: D) => E,
  ef: (e: E) => F,
  fg: (f: F) => G,
): G;
export function pipe<A, B, C, D, E, F, G, H>(
  a: A,
  ab: (a: A) => B,
  bc: (b: B) => C,
  cd: (c: C) => D,
  de: (d: D) => E,
  ef: (e: E) => F,
  fg: (f: F) => G,
  gh: (g: G) => H,
): H;
export function pipe(value: unknown, ...fns: ReadonlyArray<(x: unknown) => unknown>): unknown {
  let result = value;
  for (const fn of fns) result = fn(result);
  return result;
}

/**
 * Compose unary functions left-to-right into a new reusable function. Unlike
 * {@link pipe}, `flow` defers execution — it returns a function awaiting input.
 *
 * @example
 *   const normalizeEmail = flow(
 *     (s: string) => s.trim(),
 *     (s) => s.toLowerCase(),
 *   )
 *   normalizeEmail("  User@Example.COM ") // "user@example.com"
 */
export function flow<A, B>(ab: (a: A) => B): (a: A) => B;
export function flow<A, B, C>(ab: (a: A) => B, bc: (b: B) => C): (a: A) => C;
export function flow<A, B, C, D>(ab: (a: A) => B, bc: (b: B) => C, cd: (c: C) => D): (a: A) => D;
export function flow<A, B, C, D, E>(
  ab: (a: A) => B,
  bc: (b: B) => C,
  cd: (c: C) => D,
  de: (d: D) => E,
): (a: A) => E;
export function flow<A, B, C, D, E, F>(
  ab: (a: A) => B,
  bc: (b: B) => C,
  cd: (c: C) => D,
  de: (d: D) => E,
  ef: (e: E) => F,
): (a: A) => F;
export function flow(...fns: ReadonlyArray<(x: unknown) => unknown>): (a: unknown) => unknown {
  return (a) => {
    let result = a;
    for (const fn of fns) result = fn(result);
    return result;
  };
}
