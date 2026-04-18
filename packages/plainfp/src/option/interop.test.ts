import { expect, test } from "vite-plus/test";
import { pipe } from "../pipe.ts";
import { none, some } from "./constructors.ts";
import { toResult } from "./interop.ts";

test("toResult converts some to ok", () => {
  expect(toResult(some(42), "missing")).toEqual({ ok: true, value: 42 });
});

test("toResult converts none to err using the provided error", () => {
  expect(toResult(none, "missing")).toEqual({ ok: false, error: "missing" });
});

test("toResult is pipe-able (curried form)", () => {
  const result = pipe(none, toResult<string>("missing"));
  expect(result).toEqual({ ok: false, error: "missing" });
});

test("toResult curried preserves ok", () => {
  const result = pipe(some("hi"), toResult<string>("missing"));
  expect(result).toEqual({ ok: true, value: "hi" });
});

test("toResult accepts arbitrary error types", () => {
  const err = toResult(none, { code: "NOT_FOUND", at: "users" });
  expect(err).toEqual({ ok: false, error: { code: "NOT_FOUND", at: "users" } });
});
