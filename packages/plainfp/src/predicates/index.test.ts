import { expect, test } from "vite-plus/test";
import {
  and,
  isArray,
  isBoolean,
  isDefined,
  isFunction,
  isNullish,
  isNumber,
  isObject,
  isString,
  not,
  or,
} from "./index.ts";

test("and requires every predicate to pass", () => {
  const p = and<number>(
    (n) => n > 0,
    (n) => n < 10,
  );
  expect(p(5)).toBe(true);
  expect(p(-1)).toBe(false);
  expect(p(99)).toBe(false);
});

test("or requires at least one predicate to pass", () => {
  const p = or<number>(
    (n) => n < 0,
    (n) => n > 100,
  );
  expect(p(-1)).toBe(true);
  expect(p(101)).toBe(true);
  expect(p(50)).toBe(false);
});

test("not inverts a predicate", () => {
  const isPositive = (n: number) => n > 0;
  expect(not(isPositive)(-1)).toBe(true);
  expect(not(isPositive)(1)).toBe(false);
});

test("type guards recognize their types", () => {
  expect(isString("x")).toBe(true);
  expect(isString(1)).toBe(false);
  expect(isNumber(1)).toBe(true);
  expect(isNumber(Number.NaN)).toBe(false);
  expect(isBoolean(true)).toBe(true);
  expect(isDefined(0)).toBe(true);
  expect(isDefined(null)).toBe(false);
  expect(isDefined(undefined)).toBe(false);
  expect(isNullish(null)).toBe(true);
  expect(isArray([])).toBe(true);
  expect(isArray({})).toBe(false);
  expect(isObject({})).toBe(true);
  expect(isObject([])).toBe(false);
  expect(isObject(null)).toBe(false);
  expect(isFunction(() => 0)).toBe(true);
});
