import { expect, test } from "vite-plus/test";
import { all, any, zip } from "./combine.ts";
import { err, ok } from "./constructors.ts";

test("all collects values when every result is ok", () => {
  expect(all([ok(1), ok(2), ok(3)])).toEqual({ ok: true, value: [1, 2, 3] });
});

test("all returns the first err", () => {
  expect(all([ok(1), err("a"), ok(2), err("b")])).toEqual({
    ok: false,
    error: "a",
  });
});

test("all on empty input returns ok with empty array", () => {
  expect(all([])).toEqual({ ok: true, value: [] });
});

test("any returns the first ok", () => {
  expect(any([err("a"), ok(1), err("b"), ok(2)])).toEqual({
    ok: true,
    value: 1,
  });
});

test("any collects all errs when nothing is ok", () => {
  expect(any([err("a"), err("b"), err("c")])).toEqual({
    ok: false,
    error: ["a", "b", "c"],
  });
});

test("zip combines two ok results into a tuple", () => {
  expect(zip(ok(1), ok("x"))).toEqual({ ok: true, value: [1, "x"] });
});

test("zip returns the first err encountered", () => {
  expect(zip(err("a"), ok(1))).toEqual({ ok: false, error: "a" });
  expect(zip(ok(1), err("b"))).toEqual({ ok: false, error: "b" });
});
