declare const BrandSymbol: unique symbol;

/**
 * Nominal type marker. Intersects a base type `T` with a phantom tag `K` so
 * two structurally identical values (e.g. `UserId` vs `OrderId`) are not
 * interchangeable at the type level.
 */
export type Brand<T, K extends string> = T & { readonly [BrandSymbol]: K };

/**
 * Cast a value to its branded type. Pure type-level sugar — no runtime
 * validation. For validated construction, wrap it in a parser that returns
 * `Result<Brand<T, K>, E>`.
 *
 * @example
 *   type UserId = Brand<string, "UserId">
 *   const toUserId = (s: string): UserId => make<string, "UserId">(s)
 *   const id = toUserId("u_42")
 */
export const make = <T, K extends string>(value: T): Brand<T, K> => value as Brand<T, K>;

/** Extract the underlying base type from a branded type. */
export type UnBrand<B> = B extends Brand<infer T, string> ? T : never;
