import { ok } from "./constructors.ts";
import { flatMap, map } from "./transform.ts";
import type { Result } from "./types.ts";

/**
 * Flatten a chain of intersections into a single object type so editor hovers
 * show `{ a: A; b: B }` instead of `{ a: A } & { b: B }`. Internal helper.
 */
type Simplify<T> = { [K in keyof T]: T[K] } & {};

/**
 * Add (or replace) the field `N` of type `A` on the scope `S`. Re-binding an
 * existing key cleanly replaces its type rather than intersecting it.
 */
type Bind<S, N extends string, A> = Simplify<Omit<S, N> & { readonly [K in N]: A }>;

/**
 * Seed a {@link Result} Do-style builder: an empty success scope. Chain
 * {@link field} (fallible steps) and {@link value} (pure computed fields) onto
 * it, then finish with `Result.map`. A fresh `ok({})` is returned each call.
 *
 * Use this for **dependent** chains where each step needs earlier bindings and
 * nested `flatMap` callbacks drift rightward. For independent lookups prefer
 * `zip`/`all`.
 *
 * @example
 *   pipe(
 *     build(),
 *     field("user", () => loadUser(id)),
 *     field("orders", ({ user }) => loadOrders(user.id)),
 *     value("count", ({ orders }) => orders.length),
 *     map(({ user, count }) => `${user.name}: ${count}`),
 *   )
 */
export const build = (): Result<Record<never, never>, never> => ok({});

/**
 * Bind a **fallible** step onto the builder scope. `fn` receives the
 * accumulated scope and returns a {@link Result}; on `err` the chain
 * short-circuits and later steps are skipped. The error channel widens to the
 * union of all bound steps.
 *
 * Dual API — works data-first or curried for use in `pipe`.
 *
 * @example
 *   pipe(
 *     build(),
 *     field("token", () => fromNullable(getToken(sym), notFound)),
 *     field("price", ({ token }) => fromNullable(token.price, noPrice)),
 *     map(({ price }) => price),
 *   )
 */
export function field<S, E1, N extends string, A, E2>(
  acc: Result<S, E1>,
  name: N,
  fn: (scope: S) => Result<A, E2>,
): Result<Bind<S, N, A>, E1 | E2>;
export function field<S, N extends string, A, E2>(
  name: N,
  fn: (scope: S) => Result<A, E2>,
): <E1>(acc: Result<S, E1>) => Result<Bind<S, N, A>, E1 | E2>;
export function field<S, E1, N extends string, A, E2>(
  accOrName: Result<S, E1> | N,
  nameOrFn: N | ((scope: S) => Result<A, E2>),
  fn?: (scope: S) => Result<A, E2>,
): Result<Bind<S, N, A>, E1 | E2> | ((acc: Result<S, E1>) => Result<Bind<S, N, A>, E1 | E2>) {
  const run = (
    acc: Result<S, E1>,
    name: N,
    step: (scope: S) => Result<A, E2>,
  ): Result<Bind<S, N, A>, E1 | E2> =>
    flatMap(acc, (scope) => map(step(scope), (v) => ({ ...scope, [name]: v }) as Bind<S, N, A>));
  if (typeof accOrName === "string") {
    const name = accOrName;
    const step = nameOrFn as (scope: S) => Result<A, E2>;
    return (acc: Result<S, E1>) => run(acc, name, step);
  }
  return run(accOrName, nameOrFn as N, fn as (scope: S) => Result<A, E2>);
}

/**
 * Bind a **pure** computed field onto the builder scope. `fn` receives the
 * accumulated scope and returns a plain value — it never fails and never
 * widens the error type.
 *
 * Dual API — works data-first or curried for use in `pipe`.
 *
 * @example
 *   pipe(
 *     build(),
 *     field("order", () => loadOrder(id)),
 *     value("total", ({ order }) => order.items.reduce(sum, 0)),
 *     map(({ total }) => total),
 *   )
 */
export function value<S, E1, N extends string, A>(
  acc: Result<S, E1>,
  name: N,
  fn: (scope: S) => A,
): Result<Bind<S, N, A>, E1>;
export function value<S, N extends string, A>(
  name: N,
  fn: (scope: S) => A,
): <E1>(acc: Result<S, E1>) => Result<Bind<S, N, A>, E1>;
export function value<S, E1, N extends string, A>(
  accOrName: Result<S, E1> | N,
  nameOrFn: N | ((scope: S) => A),
  fn?: (scope: S) => A,
): Result<Bind<S, N, A>, E1> | ((acc: Result<S, E1>) => Result<Bind<S, N, A>, E1>) {
  const run = (acc: Result<S, E1>, name: N, step: (scope: S) => A): Result<Bind<S, N, A>, E1> =>
    map(acc, (scope) => ({ ...scope, [name]: step(scope) }) as Bind<S, N, A>);
  if (typeof accOrName === "string") {
    const name = accOrName;
    const step = nameOrFn as (scope: S) => A;
    return (acc: Result<S, E1>) => run(acc, name, step);
  }
  return run(accOrName, nameOrFn as N, fn as (scope: S) => A);
}
