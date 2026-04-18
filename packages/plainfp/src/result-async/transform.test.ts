import { expect, test, vi } from "vite-plus/test";
import { pipe } from "../pipe.ts";
import { err, ok } from "./constructors.ts";
import { flatMap, map, mapError, tap, tapError } from "./transform.ts";

test("map transforms ok values (async fn supported)", async () => {
  const result = await pipe(
    ok(2),
    map(async (n: number) => n + 1),
  );
  expect(result).toEqual({ ok: true, value: 3 });
});

test("map leaves err untouched", async () => {
  const result = await pipe(
    err("bad"),
    map((n: number) => n + 1),
  );
  expect(result).toEqual({ ok: false, error: "bad" });
});

test("mapError transforms error", async () => {
  const result = await pipe(
    err("bad"),
    mapError((e) => `!${e}!`),
  );
  expect(result).toEqual({ ok: false, error: "!bad!" });
});

test("flatMap chains ResultAsync-returning fns", async () => {
  const result = await pipe(
    ok(2),
    flatMap((n: number) => (n > 0 ? ok(n * 2) : err("neg"))),
    flatMap((n) => ok(n + 1)),
  );
  expect(result).toEqual({ ok: true, value: 5 });
});

test("flatMap short-circuits on err", async () => {
  const result = await pipe(
    ok(-1),
    flatMap((n: number) => (n > 0 ? ok(n) : err("neg"))),
    flatMap((n) => ok(n + 100)),
  );
  expect(result).toEqual({ ok: false, error: "neg" });
});

test("tap runs side effect on ok and passes through", async () => {
  const spy = vi.fn();
  const result = await pipe(ok(5), tap(spy));
  expect(result).toEqual({ ok: true, value: 5 });
  expect(spy).toHaveBeenCalledWith(5);
});

test("tap does not run on err", async () => {
  const spy = vi.fn();
  await pipe(err("bad"), tap(spy));
  expect(spy).not.toHaveBeenCalled();
});

test("tapError runs only on err", async () => {
  const spy = vi.fn();
  await pipe(err("bad"), tapError(spy));
  expect(spy).toHaveBeenCalledWith("bad");
});
