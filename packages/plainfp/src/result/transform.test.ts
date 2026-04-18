import { expect, test } from "vite-plus/test";
import { pipe } from "../pipe.ts";
import { err, ok } from "./constructors.ts";
import { flatMap, map, mapError } from "./transform.ts";

test("map transforms ok values (data-first)", () => {
  expect(map(ok(2), (n) => n + 1)).toEqual({ ok: true, value: 3 });
});

test("map leaves err untouched", () => {
  expect(map(err<string>("bad"), (n: number) => n + 1)).toEqual({
    ok: false,
    error: "bad",
  });
});

test("map is pipe-able (data-last)", () => {
  const result = pipe(
    ok(2),
    map((n: number) => n + 1),
    map((n) => n * 10),
  );
  expect(result).toEqual({ ok: true, value: 30 });
});

test("mapError transforms err values", () => {
  expect(mapError(err("bad"), (e) => `!${e}!`)).toEqual({
    ok: false,
    error: "!bad!",
  });
});

test("mapError leaves ok untouched", () => {
  expect(mapError(ok(1), (e: string) => e.toUpperCase())).toEqual({
    ok: true,
    value: 1,
  });
});

test("flatMap chains Result-returning fns", () => {
  const result = pipe(
    ok(2),
    flatMap((n: number) => (n > 0 ? ok(n * 2) : err("negative"))),
    flatMap((n) => (n < 10 ? ok(n) : err("too big"))),
  );
  expect(result).toEqual({ ok: true, value: 4 });
});

test("flatMap short-circuits on err", () => {
  const result = pipe(
    ok(-1),
    flatMap((n: number) => (n > 0 ? ok(n * 2) : err("negative"))),
    flatMap((n) => ok(n + 100)),
  );
  expect(result).toEqual({ ok: false, error: "negative" });
});
