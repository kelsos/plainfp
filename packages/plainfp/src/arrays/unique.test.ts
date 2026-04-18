import { expect, test } from "vite-plus/test";
import { pipe } from "../pipe.ts";
import { unique, uniqueBy } from "./unique.ts";

test("unique removes duplicates by identity", () => {
  expect(unique([1, 2, 2, 3, 1])).toEqual([1, 2, 3]);
});

test("unique preserves first-seen order", () => {
  expect(unique(["b", "a", "b", "a", "c"])).toEqual(["b", "a", "c"]);
});

test("uniqueBy removes duplicates by projected key", () => {
  const result = uniqueBy(
    [
      { id: 1, name: "a" },
      { id: 2, name: "b" },
      { id: 1, name: "c" },
    ],
    (x) => x.id,
  );
  expect(result).toEqual([
    { id: 1, name: "a" },
    { id: 2, name: "b" },
  ]);
});

test("uniqueBy is pipe-able", () => {
  const result = pipe(
    ["apple", "ant", "bee"],
    uniqueBy((s: string) => s[0] as string),
  );
  expect(result).toEqual(["apple", "bee"]);
});
