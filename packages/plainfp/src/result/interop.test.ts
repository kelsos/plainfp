import { expect, test } from "vite-plus/test";
import { none, some } from "../option/constructors.ts";
import { pipe } from "../pipe.ts";
import { err, ok } from "./constructors.ts";
import { toOption } from "./interop.ts";

test("toOption converts ok to some", () => {
  expect(toOption(ok(42))).toEqual({ some: true, value: 42 });
});

test("toOption converts err to none (error discarded)", () => {
  expect(toOption(err("boom"))).toBe(none);
});

test("toOption is a plain (non-curried) unary fn, usable in pipe", () => {
  const value = pipe(ok("hi"), toOption);
  expect(value).toEqual(some("hi"));
});

test("round-trip: toOption ∘ toResult preserves some values", async () => {
  const { toResult } = await import("../option/interop.ts");
  const original = some(7);
  const roundTripped = toOption(toResult(original, "lost"));
  expect(roundTripped).toEqual(original);
});

test("round-trip: toOption discards the specific error from toResult", async () => {
  const { toResult } = await import("../option/interop.ts");
  const roundTripped = toOption(toResult(none, "original-error"));
  expect(roundTripped).toBe(none);
});
