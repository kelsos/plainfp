declare const BrandSymbol: unique symbol;

export type Brand<T, K extends string> = T & { readonly [BrandSymbol]: K };

/**
 * Cast a value to its branded type. Pure type-level sugar — no runtime
 * validation. For validated construction, write a parse function that
 * returns `Result<Brand<T, K>, E>`.
 */
export const make = <T, K extends string>(value: T): Brand<T, K> => value as Brand<T, K>;

export type UnBrand<B> = B extends Brand<infer T, string> ? T : never;
