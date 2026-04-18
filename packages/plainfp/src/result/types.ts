/**
 * A successful {@link Result} carrying a value.
 */
export type Ok<T> = { readonly ok: true; readonly value: T };

/**
 * A failed {@link Result} carrying an error.
 */
export type Err<E> = { readonly ok: false; readonly error: E };

/**
 * Discriminated union representing either success ({@link Ok}) or failure
 * ({@link Err}). Narrow on the `ok` tag to access `value` or `error`.
 */
export type Result<T, E> = Ok<T> | Err<E>;
