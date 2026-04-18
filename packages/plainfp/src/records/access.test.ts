import { expect, test } from "vite-plus/test";
import { none, some } from "../option/constructors.ts";
import { pipe } from "../pipe.ts";
import { entries, get, getOr, keys, values } from "./access.ts";

test("get returns some for present key", () => {
  const obj: Record<string, number> = { a: 1, b: 2 };
  expect(get(obj, "a")).toEqual(some(1));
});

test("get returns none for missing key", () => {
  const obj: Record<string, number> = { a: 1 };
  expect(get(obj, "z")).toBe(none);
});

test("get is pipe-able", () => {
  const obj: Record<string, number> = { a: 1, b: 2 };
  const result = pipe(obj, get<number>("b"));
  expect(result).toEqual(some(2));
});

test("getOr returns value for present key", () => {
  const obj: Record<string, number> = { a: 1 };
  expect(getOr(obj, "a", 99)).toBe(1);
});

test("getOr returns fallback for missing key", () => {
  const obj: Record<string, number> = { a: 1 };
  expect(getOr(obj, "z", 99)).toBe(99);
});

test("getOr is pipe-able", () => {
  const obj: Record<string, number> = { a: 1 };
  const result = pipe(obj, getOr<number>("z", 99));
  expect(result).toBe(99);
});

test("keys returns typed keys", () => {
  expect(keys({ a: 1, b: 2 }).sort()).toEqual(["a", "b"]);
});

test("values returns value array", () => {
  expect(values({ a: 1, b: 2 }).sort()).toEqual([1, 2]);
});

test("entries returns key/value pairs", () => {
  const result = entries({ a: 1, b: 2 }).sort((x, y) => x[0].localeCompare(y[0]));
  expect(result).toEqual([
    ["a", 1],
    ["b", 2],
  ]);
});
