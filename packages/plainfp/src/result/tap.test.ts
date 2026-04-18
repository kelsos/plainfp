import { expect, test, vi } from "vite-plus/test";
import { pipe } from "../pipe.ts";
import { err, ok } from "./constructors.ts";
import { tap, tapError } from "./transform.ts";

test("tap runs side effect on ok and passes the result through", () => {
  const spy = vi.fn();
  const r = tap(ok(42), spy);
  expect(r).toEqual({ ok: true, value: 42 });
  expect(spy).toHaveBeenCalledWith(42);
});

test("tap does not run on err", () => {
  const spy = vi.fn();
  const r = tap(err("bad"), spy);
  expect(r).toEqual({ ok: false, error: "bad" });
  expect(spy).not.toHaveBeenCalled();
});

test("tap is pipe-able and preserves value identity", () => {
  const spy = vi.fn();
  const result = pipe(
    ok(5),
    tap((n: number) => spy(n * 2)),
    tap((n: number) => spy(n + 1)),
  );
  expect(result).toEqual({ ok: true, value: 5 });
  expect(spy).toHaveBeenNthCalledWith(1, 10);
  expect(spy).toHaveBeenNthCalledWith(2, 6);
});

test("tapError runs only on err and passes the result through", () => {
  const spy = vi.fn();
  const r = tapError(err("bad"), spy);
  expect(r).toEqual({ ok: false, error: "bad" });
  expect(spy).toHaveBeenCalledWith("bad");
});

test("tapError does not run on ok", () => {
  const spy = vi.fn();
  const r = tapError(ok(1), spy);
  expect(r).toEqual({ ok: true, value: 1 });
  expect(spy).not.toHaveBeenCalled();
});

test("tapError is pipe-able", () => {
  const spy = vi.fn();
  const result = pipe(
    err("network"),
    tapError((e: string) => spy(`logged: ${e}`)),
  );
  expect(result).toEqual({ ok: false, error: "network" });
  expect(spy).toHaveBeenCalledWith("logged: network");
});
