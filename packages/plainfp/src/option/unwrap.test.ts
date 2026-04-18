import { expect, test } from "vite-plus/test";
import { pipe } from "../pipe.ts";
import { none, some } from "./constructors.ts";
import { getOr, isNone, isSome, match } from "./unwrap.ts";

test("isSome narrows to Some", () => {
  const o = some(1) as { some: true; value: number } | { some: false };
  expect(isSome(o)).toBe(true);
  if (isSome(o)) expect(o.value).toBe(1);
});

test("isNone narrows to None", () => {
  const o = none as { some: true; value: number } | { some: false };
  expect(isNone(o)).toBe(true);
});

test("getOr returns value on some", () => {
  expect(getOr(some(1), 99)).toBe(1);
});

test("getOr returns fallback on none", () => {
  expect(getOr(none as never, 99)).toBe(99);
});

test("getOr is pipe-able", () => {
  const value = pipe(none as never, getOr(99));
  expect(value).toBe(99);
});

test("match applies some handler", () => {
  const out = match(some(3), {
    some: (n) => `got ${n}`,
    none: () => "nothing",
  });
  expect(out).toBe("got 3");
});

test("match applies none handler", () => {
  const out = match(none, {
    some: (n: number) => `got ${n}`,
    none: () => "nothing",
  });
  expect(out).toBe("nothing");
});

test("match is pipe-able", () => {
  const out = pipe(
    some(5),
    match({
      some: (n: number) => n * 2,
      none: () => -1,
    }),
  );
  expect(out).toBe(10);
});
