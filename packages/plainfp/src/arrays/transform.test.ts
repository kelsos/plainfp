import { expect, test } from "vite-plus/test";
import { pipe } from "../pipe.ts";
import { filter, flatMap, map, reduce } from "./transform.ts";

test("map transforms each element", () => {
  expect(map([1, 2, 3], (n) => n * 2)).toEqual([2, 4, 6]);
});

test("map passes index to fn", () => {
  expect(map(["a", "b"], (x, i) => `${i}:${x}`)).toEqual(["0:a", "1:b"]);
});

test("map is pipe-able", () => {
  const result = pipe(
    [1, 2, 3],
    map((n: number) => n + 1),
    map((n) => n * 10),
  );
  expect(result).toEqual([20, 30, 40]);
});

test("filter keeps matching elements", () => {
  expect(filter([1, 2, 3, 4], (n) => n % 2 === 0)).toEqual([2, 4]);
});

test("filter is pipe-able", () => {
  const result = pipe(
    [1, 2, 3, 4, 5],
    filter((n: number) => n > 2),
  );
  expect(result).toEqual([3, 4, 5]);
});

test("flatMap flattens nested arrays", () => {
  expect(flatMap([1, 2, 3], (n) => [n, n * 10])).toEqual([1, 10, 2, 20, 3, 30]);
});

test("flatMap is pipe-able", () => {
  const result = pipe(
    [1, 2],
    flatMap((n: number) => [n, -n]),
  );
  expect(result).toEqual([1, -1, 2, -2]);
});

test("reduce folds from an initial value", () => {
  expect(reduce([1, 2, 3, 4], 0, (acc, n) => acc + n)).toBe(10);
});

test("reduce is pipe-able", () => {
  const total = pipe(
    [1, 2, 3],
    reduce(0, (acc: number, n: number) => acc + n),
  );
  expect(total).toBe(6);
});
