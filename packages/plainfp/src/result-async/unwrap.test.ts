import { expect, test } from "vite-plus/test";
import { pipe } from "../pipe.ts";
import { err, ok } from "./constructors.ts";
import { getOr, match } from "./unwrap.ts";

test("getOr returns value on ok", async () => {
  expect(await getOr(ok(1), 99)).toBe(1);
});

test("getOr returns fallback on err", async () => {
  expect(await getOr(err("bad"), 99)).toBe(99);
});

test("getOr is pipe-able", async () => {
  const value = await pipe(err("bad"), getOr(99));
  expect(value).toBe(99);
});

test("match applies ok handler", async () => {
  const out = await match(ok(3), {
    ok: (n) => `got ${n}`,
    err: (e: string) => `fail ${e}`,
  });
  expect(out).toBe("got 3");
});

test("match applies err handler", async () => {
  const out = await match(err("nope"), {
    ok: (n: number) => `got ${n}`,
    err: (e) => `fail ${e}`,
  });
  expect(out).toBe("fail nope");
});

test("match handler can be async", async () => {
  const out = await match(ok(5), {
    ok: async (n) => n * 2,
    err: () => -1,
  });
  expect(out).toBe(10);
});
