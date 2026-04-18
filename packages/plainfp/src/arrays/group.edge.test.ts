import { expect, test } from "vite-plus/test";
import { chunk } from "./group.ts";

test("chunk rejects non-integer sizes", () => {
  expect(() => chunk([1, 2, 3], 1.5)).toThrow(RangeError);
  expect(() => chunk([1, 2, 3], Number.NaN)).toThrow(RangeError);
  expect(() => chunk([1, 2, 3], Number.POSITIVE_INFINITY)).toThrow(RangeError);
});

test("chunk rejects zero and negative sizes", () => {
  expect(() => chunk([1, 2, 3], 0)).toThrow(RangeError);
  expect(() => chunk([1, 2, 3], -1)).toThrow(RangeError);
});
