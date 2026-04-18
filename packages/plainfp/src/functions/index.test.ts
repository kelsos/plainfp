import { expect, test, vi } from "vite-plus/test";
import { pipe } from "../pipe.ts";
import { constant, identity, memoize, noop, tap } from "./index.ts";

test("identity returns its input", () => {
  expect(identity(42)).toBe(42);
  const obj = { a: 1 };
  expect(identity(obj)).toBe(obj);
});

test("constant returns a thunk that always yields the same value", () => {
  const always7 = constant(7);
  expect(always7()).toBe(7);
  expect(always7()).toBe(7);
});

test("tap runs a side effect and passes the value through", () => {
  const spy = vi.fn();
  const result = pipe(5, tap(spy), (n) => n + 1);
  expect(result).toBe(6);
  expect(spy).toHaveBeenCalledWith(5);
});

test("memoize caches results by input", () => {
  const spy = vi.fn((n: number) => n * 2);
  const double = memoize(spy);
  expect(double(3)).toBe(6);
  expect(double(3)).toBe(6);
  expect(double(4)).toBe(8);
  expect(spy).toHaveBeenCalledTimes(2);
});

test("noop returns undefined", () => {
  expect(noop()).toBeUndefined();
});
