import { expect, test } from "vite-plus/test";
import { err, fromAsync, fromPromise, ok } from "./constructors.ts";

test("ok wraps a value in a resolved ResultAsync", async () => {
  expect(await ok(42)).toEqual({ ok: true, value: 42 });
});

test("err wraps an error in a resolved ResultAsync", async () => {
  expect(await err("boom")).toEqual({ ok: false, error: "boom" });
});

test("fromPromise captures resolution as ok", async () => {
  const r = await fromPromise(Promise.resolve(7), (c) => `wrap:${String(c)}`);
  expect(r).toEqual({ ok: true, value: 7 });
});

test("fromPromise captures rejection as err via onError", async () => {
  const r = await fromPromise(Promise.reject(new Error("nope")), (c) => ({
    kind: "caught",
    cause: c,
  }));
  expect(r.ok).toBe(false);
  if (!r.ok) expect(r.error.kind).toBe("caught");
});

test("fromAsync catches synchronous throws inside the factory", async () => {
  const r = await fromAsync(
    () => {
      throw new Error("sync-throw");
    },
    (c) => (c as Error).message,
  );
  expect(r).toEqual({ ok: false, error: "sync-throw" });
});

test("fromAsync resolves a successful factory", async () => {
  const r = await fromAsync(
    async () => 99,
    () => "nope",
  );
  expect(r).toEqual({ ok: true, value: 99 });
});
