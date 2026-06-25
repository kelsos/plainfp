import { ok } from "./constructors.ts";
import { flatMap, map } from "./transform.ts";
import type { ResultAsync } from "./types.ts";

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
 * Seed a {@link ResultAsync} Do-style builder: an empty success scope. Chain
 * {@link field} (fallible async steps) and {@link value} (pure computed
 * fields, sync or async) onto it, then finish with `ResultAsync.map`. A fresh
 * `ok({})` is returned each call.
 *
 * Steps run **sequentially** — each awaits the previous and sees its bindings.
 * For independent concurrent work prefer `all`.
 *
 * @example
 *   pipe(
 *     build(),
 *     field("user", () => fetchUser(id)),
 *     field("orders", ({ user }) => fetchOrders(user.id)),
 *     value("count", ({ orders }) => orders.length),
 *     map(({ user, count }) => `${user.name}: ${count}`),
 *   )
 */
export const build = (): ResultAsync<Record<never, never>, never> => ok({});

/**
 * Bind a **fallible** async step onto the builder scope. `fn` receives the
 * accumulated scope and returns a {@link ResultAsync}; it is awaited and, on
 * `err`, the chain short-circuits and later steps are skipped. The error
 * channel widens to the union of all bound steps.
 *
 * Dual API — works data-first or curried for use in `pipe`.
 *
 * @example
 *   pipe(
 *     build(),
 *     field("user", () => fetchUser(id)),
 *     field("plan", ({ user }) => fetchPlan(user.planId)),
 *     map(({ plan }) => plan),
 *   )
 */
export function field<S, E1, N extends string, A, E2>(
  acc: ResultAsync<S, E1>,
  name: N,
  fn: (scope: S) => ResultAsync<A, E2>,
): ResultAsync<Bind<S, N, A>, E1 | E2>;
export function field<S, N extends string, A, E2>(
  name: N,
  fn: (scope: S) => ResultAsync<A, E2>,
): <E1>(acc: ResultAsync<S, E1>) => ResultAsync<Bind<S, N, A>, E1 | E2>;
export function field<S, E1, N extends string, A, E2>(
  accOrName: ResultAsync<S, E1> | N,
  nameOrFn: N | ((scope: S) => ResultAsync<A, E2>),
  fn?: (scope: S) => ResultAsync<A, E2>,
):
  | ResultAsync<Bind<S, N, A>, E1 | E2>
  | ((acc: ResultAsync<S, E1>) => ResultAsync<Bind<S, N, A>, E1 | E2>) {
  const run = (
    acc: ResultAsync<S, E1>,
    name: N,
    step: (scope: S) => ResultAsync<A, E2>,
  ): ResultAsync<Bind<S, N, A>, E1 | E2> =>
    flatMap(acc, (scope) => map(step(scope), (v) => ({ ...scope, [name]: v }) as Bind<S, N, A>));
  if (typeof accOrName === "string") {
    const name = accOrName;
    const step = nameOrFn as (scope: S) => ResultAsync<A, E2>;
    return (acc: ResultAsync<S, E1>) => run(acc, name, step);
  }
  return run(accOrName, nameOrFn as N, fn as (scope: S) => ResultAsync<A, E2>);
}

/**
 * Bind a **pure** computed field onto the builder scope. `fn` receives the
 * accumulated scope and returns a value or a `Promise` — it never fails and
 * never widens the error type.
 *
 * Dual API — works data-first or curried for use in `pipe`.
 *
 * @example
 *   pipe(
 *     build(),
 *     field("order", () => fetchOrder(id)),
 *     value("total", ({ order }) => order.items.reduce(sum, 0)),
 *     map(({ total }) => total),
 *   )
 */
export function value<S, E1, N extends string, A>(
  acc: ResultAsync<S, E1>,
  name: N,
  fn: (scope: S) => A | Promise<A>,
): ResultAsync<Bind<S, N, A>, E1>;
export function value<S, N extends string, A>(
  name: N,
  fn: (scope: S) => A | Promise<A>,
): <E1>(acc: ResultAsync<S, E1>) => ResultAsync<Bind<S, N, A>, E1>;
export function value<S, E1, N extends string, A>(
  accOrName: ResultAsync<S, E1> | N,
  nameOrFn: N | ((scope: S) => A | Promise<A>),
  fn?: (scope: S) => A | Promise<A>,
): ResultAsync<Bind<S, N, A>, E1> | ((acc: ResultAsync<S, E1>) => ResultAsync<Bind<S, N, A>, E1>) {
  const run = (
    acc: ResultAsync<S, E1>,
    name: N,
    step: (scope: S) => A | Promise<A>,
  ): ResultAsync<Bind<S, N, A>, E1> =>
    map(acc, async (scope) => ({ ...scope, [name]: await step(scope) }) as Bind<S, N, A>);
  if (typeof accOrName === "string") {
    const name = accOrName;
    const step = nameOrFn as (scope: S) => A | Promise<A>;
    return (acc: ResultAsync<S, E1>) => run(acc, name, step);
  }
  return run(accOrName, nameOrFn as N, fn as (scope: S) => A | Promise<A>);
}
