import { expect, test } from "vite-plus/test";
import { all, any, zip } from "./combine.ts";
import { none, some } from "./constructors.ts";

test("all collects values when every option is some", () => {
  expect(all([some(1), some(2), some(3)])).toEqual({ some: true, value: [1, 2, 3] });
});

test("all returns none on first none", () => {
  expect(all([some(1), none, some(3)])).toBe(none);
});

test("all on empty input returns some([])", () => {
  expect(all([])).toEqual({ some: true, value: [] });
});

test("any returns the first some", () => {
  expect(any([none, some(1), none, some(2)])).toEqual({ some: true, value: 1 });
});

test("any returns none when every input is none", () => {
  expect(any([none, none, none])).toBe(none);
});

test("any on empty input returns none", () => {
  expect(any([])).toBe(none);
});

test("zip combines two somes into a tuple", () => {
  expect(zip(some(1), some("x"))).toEqual({ some: true, value: [1, "x"] });
});

test("zip returns none when either side is none", () => {
  expect(zip(none, some(1))).toBe(none);
  expect(zip(some(1), none)).toBe(none);
});
