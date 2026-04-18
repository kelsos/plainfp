import { expect, test } from "vite-plus/test";
import { none, some } from "../option/constructors.ts";
import { pipe } from "../pipe.ts";
import { fromArray, head, last, map, of, tail } from "./index.ts";

test("of constructs a NonEmptyArray from head plus tail", () => {
  expect(of(1)).toEqual([1]);
  expect(of(1, 2, 3)).toEqual([1, 2, 3]);
});

test("fromArray returns some for non-empty inputs", () => {
  expect(fromArray([1, 2, 3])).toEqual(some([1, 2, 3]));
});

test("fromArray returns none for empty inputs", () => {
  expect(fromArray([])).toBe(none);
});

test("head returns the first element", () => {
  expect(head(of(1, 2, 3))).toBe(1);
});

test("tail returns everything after head", () => {
  expect(tail(of(1, 2, 3))).toEqual([2, 3]);
});

test("last returns the last element", () => {
  expect(last(of(1, 2, 3))).toBe(3);
});

test("map preserves non-emptiness", () => {
  const result = pipe(
    of(1, 2, 3),
    map((n: number) => n * 10),
  );
  expect(result).toEqual([10, 20, 30]);
});
