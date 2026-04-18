import { expect, test } from "vite-plus/test";
import { pipe } from "../pipe.ts";
import { err, ok } from "./constructors.ts";
import { getOr, isErr, isOk, match } from "./unwrap.ts";

test("isOk narrows to Ok", () => {
  const r = ok(1) as { ok: true; value: number } | { ok: false; error: string };
  expect(isOk(r)).toBe(true);
  if (isOk(r)) expect(r.value).toBe(1);
});

test("isErr narrows to Err", () => {
  const r = err("bad") as { ok: true; value: number } | { ok: false; error: string };
  expect(isErr(r)).toBe(true);
  if (isErr(r)) expect(r.error).toBe("bad");
});

test("getOr returns value on ok (data-first)", () => {
  expect(getOr(ok(1), 99)).toBe(1);
});

test("getOr returns fallback on err (data-first)", () => {
  expect(getOr(err("bad") as never, 99)).toBe(99);
});

test("getOr is pipe-able (data-last)", () => {
  const value = pipe(err("bad") as never, getOr(99));
  expect(value).toBe(99);
});

test("match applies ok handler", () => {
  const out = match(ok(3), {
    ok: (n) => `got ${n}`,
    err: (e: string) => `fail ${e}`,
  });
  expect(out).toBe("got 3");
});

test("match applies err handler", () => {
  const out = match(err("nope"), {
    ok: (n: number) => `got ${n}`,
    err: (e) => `fail ${e}`,
  });
  expect(out).toBe("fail nope");
});

test("match is pipe-able", () => {
  const out = pipe(
    ok(5),
    match({
      ok: (n: number) => n * 2,
      err: () => -1,
    }),
  );
  expect(out).toBe(10);
});
