/**
 * The "present" case of an {@link Option}, carrying a value of type `T`.
 */
export type Some<T> = { readonly some: true; readonly value: T };

/**
 * The "absent" case of an {@link Option}. Shared across all empty options.
 */
export type None = { readonly some: false };

/**
 * A value that is either present ({@link Some}) or absent ({@link None}).
 * Discriminated by the `some` boolean tag.
 */
export type Option<T> = Some<T> | None;
