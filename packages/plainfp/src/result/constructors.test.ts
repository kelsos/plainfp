import { expect, test } from "vite-plus/test";
import { err, fromNullable, fromThrowable, ok } from "./constructors.ts";

test("ok wraps a value", () => {
  expect(ok(42)).toEqual({ ok: true, value: 42 });
});

test("err wraps an error", () => {
  expect(err("boom")).toEqual({ ok: false, error: "boom" });
});

test("fromNullable returns ok for non-nullish values", () => {
  expect(fromNullable(0, "missing")).toEqual({ ok: true, value: 0 });
  expect(fromNullable("", "missing")).toEqual({ ok: true, value: "" });
  expect(fromNullable(false, "missing")).toEqual({ ok: true, value: false });
});

test("fromNullable returns err for null and undefined", () => {
  expect(fromNullable(null, "missing")).toEqual({ ok: false, error: "missing" });
  expect(fromNullable(undefined, "missing")).toEqual({
    ok: false,
    error: "missing",
  });
});

test("fromThrowable captures throws as err", () => {
  const r = fromThrowable(() => {
    throw new Error("bad");
  });
  expect(r.ok).toBe(false);
  if (!r.ok) expect((r.error as Error).message).toBe("bad");
});

test("fromThrowable returns ok when fn succeeds", () => {
  expect(fromThrowable(() => 7)).toEqual({ ok: true, value: 7 });
});

test("fromThrowable maps error through onError", () => {
  const r = fromThrowable(
    () => {
      throw new Error("nope");
    },
    (cause) => ({ kind: "caught", cause }),
  );
  expect(r.ok).toBe(false);
  if (!r.ok) expect(r.error.kind).toBe("caught");
});
