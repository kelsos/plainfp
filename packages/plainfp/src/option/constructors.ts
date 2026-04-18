import type { None, Option, Some } from "./types.ts";

/**
 * Wrap a present value in an {@link Option}.
 *
 * @example
 *   const user = some({ id: "u_1", name: "Alice" })
 *   if (user.some) console.log(user.value.name)
 */
export const some = <T>(value: T): Some<T> => ({ some: true, value });

/**
 * The singleton "no value" case of {@link Option}. Frozen; compare by
 * identity (`option === none`) or via the `isNone` guard.
 */
export const none: None = Object.freeze({ some: false });

/**
 * Lift a nullable value into an {@link Option}: `null`/`undefined` becomes
 * {@link none}, anything else becomes {@link some}.
 *
 * @example
 *   const email = fromNullable(user.email) // Option<string>
 *   const first = fromNullable(items.find((i) => i.active))
 */
export const fromNullable = <T>(value: T | null | undefined): Option<NonNullable<T>> =>
  value == null ? none : some(value as NonNullable<T>);
