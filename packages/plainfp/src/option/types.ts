export type Some<T> = { readonly some: true; readonly value: T };
export type None = { readonly some: false };
export type Option<T> = Some<T> | None;
