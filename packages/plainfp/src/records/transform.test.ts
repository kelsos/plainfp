import { expect, test } from "vite-plus/test";
import { pipe } from "../pipe.ts";
import { filter, mapKeys, mapValues } from "./transform.ts";

test("mapValues transforms each value", () => {
  expect(mapValues({ a: 1, b: 2 }, (v) => v * 10)).toEqual({ a: 10, b: 20 });
});

test("mapValues passes key to fn", () => {
  expect(mapValues({ a: 1, b: 2 }, (v, k) => `${k}:${v}`)).toEqual({
    a: "a:1",
    b: "b:2",
  });
});

test("mapValues is pipe-able", () => {
  const result = pipe(
    { a: 1, b: 2 },
    mapValues((v: number) => v + 1),
  );
  expect(result).toEqual({ a: 2, b: 3 });
});

test("mapKeys transforms each key", () => {
  expect(mapKeys({ a: 1, b: 2 }, (k) => k.toUpperCase())).toEqual({ A: 1, B: 2 });
});

test("mapKeys is pipe-able", () => {
  const result = pipe(
    { a: 1, b: 2 },
    mapKeys((k: string) => `k_${k}`),
  );
  expect(result).toEqual({ k_a: 1, k_b: 2 });
});

test("filter keeps entries where predicate passes", () => {
  expect(filter({ a: 1, b: 2, c: 3 }, (v) => v > 1)).toEqual({ b: 2, c: 3 });
});

test("filter is pipe-able", () => {
  const result = pipe(
    { a: "apple", b: "banana", c: "cherry" },
    filter((v: string) => v.startsWith("b")),
  );
  expect(result).toEqual({ b: "banana" });
});
