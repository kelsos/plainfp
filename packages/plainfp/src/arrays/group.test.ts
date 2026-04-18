import { expect, test } from "vite-plus/test";
import { pipe } from "../pipe.ts";
import { chunk, groupBy, partition } from "./group.ts";

test("groupBy groups elements under computed keys", () => {
  const result = groupBy([1, 2, 3, 4, 5], (n) => (n % 2 === 0 ? "even" : "odd"));
  expect(result).toEqual({ odd: [1, 3, 5], even: [2, 4] });
});

test("groupBy is pipe-able", () => {
  const result = pipe(
    ["apple", "ant", "bee", "banana"],
    groupBy((s: string) => s[0] as string),
  );
  expect(result).toEqual({ a: ["apple", "ant"], b: ["bee", "banana"] });
});

test("partition splits by predicate", () => {
  expect(partition([1, 2, 3, 4], (n) => n > 2)).toEqual([
    [3, 4],
    [1, 2],
  ]);
});

test("partition is pipe-able", () => {
  const [evens, odds] = pipe(
    [1, 2, 3, 4],
    partition((n: number) => n % 2 === 0),
  );
  expect(evens).toEqual([2, 4]);
  expect(odds).toEqual([1, 3]);
});

test("chunk splits into fixed-size pieces", () => {
  expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
});

test("chunk throws for size < 1", () => {
  expect(() => chunk([1, 2, 3], 0)).toThrow(RangeError);
});

test("chunk is pipe-able", () => {
  const result = pipe([1, 2, 3, 4], chunk(2));
  expect(result).toEqual([
    [1, 2],
    [3, 4],
  ]);
});
