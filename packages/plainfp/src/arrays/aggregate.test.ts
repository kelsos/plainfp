import { expect, test } from "vite-plus/test";
import { none, some } from "../option/constructors.ts";
import { pipe } from "../pipe.ts";
import { countBy, maxBy, minBy, sumBy } from "./aggregate.ts";

test("sumBy totals projected numbers", () => {
  expect(sumBy([{ n: 1 }, { n: 2 }, { n: 3 }], (x) => x.n)).toBe(6);
});

test("sumBy on empty returns 0", () => {
  expect(sumBy([] as { n: number }[], (x) => x.n)).toBe(0);
});

test("sumBy is pipe-able", () => {
  const total = pipe(
    [1, 2, 3],
    sumBy((n: number) => n * 2),
  );
  expect(total).toBe(12);
});

test("countBy tallies occurrences by key", () => {
  expect(countBy(["a", "b", "a", "c", "b", "a"], (x) => x)).toEqual({ a: 3, b: 2, c: 1 });
});

test("minBy returns some of the minimum", () => {
  expect(minBy([{ n: 3 }, { n: 1 }, { n: 2 }], (x) => x.n)).toEqual(some({ n: 1 }));
});

test("minBy on empty returns none", () => {
  expect(minBy([] as { n: number }[], (x) => x.n)).toBe(none);
});

test("maxBy returns some of the maximum", () => {
  expect(maxBy([{ n: 3 }, { n: 1 }, { n: 2 }], (x) => x.n)).toEqual(some({ n: 3 }));
});

test("maxBy on empty returns none", () => {
  expect(maxBy([] as { n: number }[], (x) => x.n)).toBe(none);
});
