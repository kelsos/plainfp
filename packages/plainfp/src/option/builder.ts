import { some } from "./constructors.ts";
import { flatMap, map } from "./transform.ts";
import type { Option } from "./types.ts";

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
 * Seed an {@link Option} Do-style builder: an empty present scope. Chain
 * {@link field} (steps that may be absent) and {@link value} (pure computed
 * fields) onto it, then finish with `Option.map`. A fresh `some({})` is
 * returned each call.
 *
 * Use this for **dependent** chains where each step needs earlier bindings and
 * nested `flatMap` callbacks drift rightward. For independent lookups prefer
 * `zip`/`all`.
 *
 * @example
 *   pipe(
 *     build(),
 *     field("user", () => findUser(id)),
 *     field("plan", ({ user }) => findPlan(user.planId)),
 *     value("label", ({ plan }) => plan.name.toUpperCase()),
 *     map(({ label }) => label),
 *   )
 */
export const build = (): Option<Record<never, never>> => some({});

/**
 * Bind a step that may be absent onto the builder scope. `fn` receives the
 * accumulated scope and returns an {@link Option}; on `none` the chain
 * short-circuits and later steps are skipped.
 *
 * Dual API — works data-first or curried for use in `pipe`.
 *
 * @example
 *   pipe(
 *     build(),
 *     field("token", () => fromNullable(getToken(sym))),
 *     field("price", ({ token }) => fromNullable(token.price)),
 *     map(({ price }) => price),
 *   )
 */
export function field<S, N extends string, A>(
  acc: Option<S>,
  name: N,
  fn: (scope: S) => Option<A>,
): Option<Bind<S, N, A>>;
export function field<S, N extends string, A>(
  name: N,
  fn: (scope: S) => Option<A>,
): (acc: Option<S>) => Option<Bind<S, N, A>>;
export function field<S, N extends string, A>(
  accOrName: Option<S> | N,
  nameOrFn: N | ((scope: S) => Option<A>),
  fn?: (scope: S) => Option<A>,
): Option<Bind<S, N, A>> | ((acc: Option<S>) => Option<Bind<S, N, A>>) {
  const run = (acc: Option<S>, name: N, step: (scope: S) => Option<A>): Option<Bind<S, N, A>> =>
    flatMap(acc, (scope) => map(step(scope), (v) => ({ ...scope, [name]: v }) as Bind<S, N, A>));
  if (typeof accOrName === "string") {
    const name = accOrName;
    const step = nameOrFn as (scope: S) => Option<A>;
    return (acc: Option<S>) => run(acc, name, step);
  }
  return run(accOrName, nameOrFn as N, fn as (scope: S) => Option<A>);
}

/**
 * Bind a **pure** computed field onto the builder scope. `fn` receives the
 * accumulated scope and returns a plain value — it never short-circuits.
 *
 * Dual API — works data-first or curried for use in `pipe`.
 *
 * @example
 *   pipe(
 *     build(),
 *     field("user", () => findUser(id)),
 *     value("greeting", ({ user }) => `Hi ${user.name}`),
 *     map(({ greeting }) => greeting),
 *   )
 */
export function value<S, N extends string, A>(
  acc: Option<S>,
  name: N,
  fn: (scope: S) => A,
): Option<Bind<S, N, A>>;
export function value<S, N extends string, A>(
  name: N,
  fn: (scope: S) => A,
): (acc: Option<S>) => Option<Bind<S, N, A>>;
export function value<S, N extends string, A>(
  accOrName: Option<S> | N,
  nameOrFn: N | ((scope: S) => A),
  fn?: (scope: S) => A,
): Option<Bind<S, N, A>> | ((acc: Option<S>) => Option<Bind<S, N, A>>) {
  const run = (acc: Option<S>, name: N, step: (scope: S) => A): Option<Bind<S, N, A>> =>
    map(acc, (scope) => ({ ...scope, [name]: step(scope) }) as Bind<S, N, A>);
  if (typeof accOrName === "string") {
    const name = accOrName;
    const step = nameOrFn as (scope: S) => A;
    return (acc: Option<S>) => run(acc, name, step);
  }
  return run(accOrName, nameOrFn as N, fn as (scope: S) => A);
}
