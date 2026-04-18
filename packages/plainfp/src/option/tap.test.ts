import { expect, test, vi } from "vite-plus/test";
import { pipe } from "../pipe.ts";
import { none, some } from "./constructors.ts";
import { tap, tapNone } from "./transform.ts";

test("tap runs side effect on some and passes the option through", () => {
  const spy = vi.fn();
  const o = tap(some(42), spy);
  expect(o).toEqual({ some: true, value: 42 });
  expect(spy).toHaveBeenCalledWith(42);
});

test("tap does not run on none", () => {
  const spy = vi.fn();
  const o = tap(none, spy);
  expect(o).toBe(none);
  expect(spy).not.toHaveBeenCalled();
});

test("tap is pipe-able and preserves value identity", () => {
  const spy = vi.fn();
  const result = pipe(
    some(5),
    tap((n: number) => spy(n * 2)),
    tap((n: number) => spy(n + 1)),
  );
  expect(result).toEqual({ some: true, value: 5 });
  expect(spy).toHaveBeenNthCalledWith(1, 10);
  expect(spy).toHaveBeenNthCalledWith(2, 6);
});

test("tapNone runs only on none and takes no arg", () => {
  const spy = vi.fn();
  const o = tapNone(none, spy);
  expect(o).toBe(none);
  expect(spy).toHaveBeenCalledWith();
});

test("tapNone does not run on some", () => {
  const spy = vi.fn();
  const o = tapNone(some(1), spy);
  expect(o).toEqual({ some: true, value: 1 });
  expect(spy).not.toHaveBeenCalled();
});

test("tapNone is pipe-able", () => {
  const spy = vi.fn();
  const result = pipe(
    none,
    tapNone(() => spy("logged missing")),
  );
  expect(result).toBe(none);
  expect(spy).toHaveBeenCalledWith("logged missing");
});
