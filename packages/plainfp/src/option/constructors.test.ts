import { expect, test } from "vite-plus/test";
import { fromNullable, none, some } from "./constructors.ts";

test("some wraps a value", () => {
  expect(some(42)).toEqual({ some: true, value: 42 });
});

test("none is the empty singleton", () => {
  expect(none).toEqual({ some: false });
});

test("fromNullable returns some for non-nullish values", () => {
  expect(fromNullable(0)).toEqual({ some: true, value: 0 });
  expect(fromNullable("")).toEqual({ some: true, value: "" });
  expect(fromNullable(false)).toEqual({ some: true, value: false });
});

test("fromNullable returns none for null and undefined", () => {
  expect(fromNullable(null)).toBe(none);
  expect(fromNullable(undefined)).toBe(none);
});
