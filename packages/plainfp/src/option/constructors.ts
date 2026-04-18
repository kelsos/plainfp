import type { None, Option, Some } from "./types.ts";

export const some = <T>(value: T): Some<T> => ({ some: true, value });

export const none: None = Object.freeze({ some: false });

export const fromNullable = <T>(value: T | null | undefined): Option<NonNullable<T>> =>
  value == null ? none : some(value as NonNullable<T>);
