import { expect, test } from "vite-plus/test";
import { pipe } from "../pipe.ts";
import { none, some } from "./constructors.ts";
import { filter, flatMap, map } from "./transform.ts";

test("map transforms some values", () => {
  expect(map(some(2), (n) => n + 1)).toEqual({ some: true, value: 3 });
});

test("map leaves none untouched", () => {
  expect(map(none, (n: number) => n + 1)).toBe(none);
});

test("map is pipe-able", () => {
  const result = pipe(
    some(2),
    map((n: number) => n + 1),
    map((n) => n * 10),
  );
  expect(result).toEqual({ some: true, value: 30 });
});

test("flatMap chains Option-returning fns", () => {
  const parseEven = (n: number) => (n % 2 === 0 ? some(n) : none);
  expect(flatMap(some(4), parseEven)).toEqual({ some: true, value: 4 });
  expect(flatMap(some(3), parseEven)).toBe(none);
  expect(flatMap(none, parseEven)).toBe(none);
});

test("filter keeps some when predicate passes", () => {
  expect(filter(some(3), (n) => n > 0)).toEqual({ some: true, value: 3 });
});

test("filter drops some when predicate fails", () => {
  expect(filter(some(-1), (n) => n > 0)).toBe(none);
});

test("filter leaves none unchanged", () => {
  expect(filter(none, (n: number) => n > 0)).toBe(none);
});

test("filter is pipe-able", () => {
  const result = pipe(
    some(10),
    filter((n: number) => n > 5),
    map((n) => n * 2),
  );
  expect(result).toEqual({ some: true, value: 20 });
});
