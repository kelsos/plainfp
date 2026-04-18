import { expect, test } from "vite-plus/test";
import { none, some } from "../option/constructors.ts";
import { pipe } from "../pipe.ts";
import { find, findIndex, includes } from "./search.ts";

test("find returns some for first match", () => {
  expect(find([1, 2, 3], (n) => n > 1)).toEqual(some(2));
});

test("find returns none when no match", () => {
  expect(find([1, 2, 3], (n) => n > 99)).toBe(none);
});

test("find is pipe-able", () => {
  const result = pipe(
    [1, 2, 3, 4],
    find((n: number) => n > 2),
  );
  expect(result).toEqual(some(3));
});

test("findIndex returns some index", () => {
  expect(findIndex(["a", "b", "c"], (x) => x === "b")).toEqual(some(1));
});

test("findIndex returns none when not found", () => {
  expect(findIndex(["a", "b"], (x) => x === "z")).toBe(none);
});

test("includes returns true for present value", () => {
  expect(includes([1, 2, 3], 2)).toBe(true);
});

test("includes returns false for absent value", () => {
  expect(includes([1, 2, 3], 99)).toBe(false);
});

test("includes is pipe-able", () => {
  const result = pipe([1, 2, 3], includes(2));
  expect(result).toBe(true);
});
