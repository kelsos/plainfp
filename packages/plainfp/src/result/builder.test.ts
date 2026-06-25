import { expect, expectTypeOf, test } from "vite-plus/test";
import { build, field, value } from "./builder.ts";
import { err, ok } from "./constructors.ts";
import { pipe } from "../pipe.ts";
import { map } from "./transform.ts";
import type { Result } from "./types.ts";

test("build returns an empty ok scope", () => {
  expect(build()).toEqual({ ok: true, value: {} });
});

test("build returns a fresh object each call", () => {
  const a = build();
  const b = build();
  expect(a).not.toBe(b);
  expect(a.ok && b.ok && a.value).not.toBe(b.ok && b.value);
});

test("field accumulates fields in order (data-first)", () => {
  const result = field(
    field(build(), "a", () => ok(1)),
    "b",
    ({ a }) => ok(a + 1),
  );
  expect(result).toEqual({ ok: true, value: { a: 1, b: 2 } });
});

test("field happy path accumulates all fields (curried/pipe)", () => {
  const result = pipe(
    build(),
    field("token", () => ok("T")),
    field("tier", () => ok("gold")),
    field("price", ({ token, tier }) => ok(`${token}-${tier}-9`)),
    map(({ token, tier, price }) => ({ price, tier, token })),
  );
  expect(result).toEqual({
    ok: true,
    value: { price: "T-gold-9", tier: "gold", token: "T" },
  });
});

test("field short-circuits on the first step", () => {
  const result = pipe(
    build(),
    field("a", () => err("boom")),
    field("b", () => ok(2)),
  );
  expect(result).toEqual({ ok: false, error: "boom" });
});

test("field short-circuits on the second step", () => {
  const result = pipe(
    build(),
    field("a", () => ok(1)),
    field("b", () => err("boom")),
    field("c", () => ok(3)),
  );
  expect(result).toEqual({ ok: false, error: "boom" });
});

test("field short-circuits on the third step", () => {
  const result = pipe(
    build(),
    field("a", () => ok(1)),
    field("b", () => ok(2)),
    field("c", () => err("boom")),
  );
  expect(result).toEqual({ ok: false, error: "boom" });
});

test("field after a short-circuit is not invoked", () => {
  let called = false;
  pipe(
    build(),
    field("a", () => err("boom")),
    field("b", () => {
      called = true;
      return ok(2);
    }),
  );
  expect(called).toBe(false);
});

test("value adds a pure field and never short-circuits", () => {
  const result = pipe(
    build(),
    field("a", () => ok(2)),
    value("doubled", ({ a }) => a * 2),
  );
  expect(result).toEqual({ ok: true, value: { a: 2, doubled: 4 } });
});

test("value (data-first) adds a pure field", () => {
  const result = value(ok({ a: 2 }), "doubled", ({ a }) => a * 2);
  expect(result).toEqual({ ok: true, value: { a: 2, doubled: 4 } });
});

test("value is skipped after an upstream short-circuit", () => {
  let called = false;
  const result = pipe(
    build(),
    field("a", () => err("boom")),
    value("b", () => {
      called = true;
      return 2;
    }),
  );
  expect(result).toEqual({ ok: false, error: "boom" });
  expect(called).toBe(false);
});

test("each step returns a new scope object; earlier scope not mutated", () => {
  const seen: object[] = [];
  pipe(
    build(),
    field("a", () => ok(1)),
    field("b", (scope) => {
      seen.push(scope);
      return ok(2);
    }),
    value("c", (scope) => {
      seen.push(scope);
      return 3;
    }),
  );
  // scope passed to `b` ({a}) is a different object than the one passed to `c` ({a,b})
  expect(seen[0]).not.toBe(seen[1]);
  expect(seen[0]).toEqual({ a: 1 });
  expect(seen[1]).toEqual({ a: 1, b: 2 });
});

test("re-binding a key replaces its value", () => {
  const result = pipe(
    build(),
    field("x", () => ok(1)),
    value("x", () => "two"),
  );
  expect(result).toEqual({ ok: true, value: { x: "two" } });
});

test("type-level: field widens the error union, value leaves it put", () => {
  const result = pipe(
    build(),
    field("a", () => ok(1) as Result<number, "E1">),
    field("b", () => ok(2) as Result<number, "E2">),
    value("c", ({ a, b }) => a + b),
  );
  expectTypeOf(result).toEqualTypeOf<
    Result<{ readonly a: number; readonly b: number; readonly c: number }, "E1" | "E2">
  >();
});

test("type-level: build seeds an empty never-error scope", () => {
  expectTypeOf(build()).toEqualTypeOf<Result<Record<never, never>, never>>();
});
