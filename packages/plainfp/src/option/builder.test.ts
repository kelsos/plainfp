import { expect, expectTypeOf, test } from "vite-plus/test";
import { build, field, value } from "./builder.ts";
import { none, some } from "./constructors.ts";
import { pipe } from "../pipe.ts";
import { map } from "./transform.ts";
import type { Option } from "./types.ts";

test("build returns an empty some scope", () => {
  expect(build()).toEqual({ some: true, value: {} });
});

test("build returns a fresh object each call", () => {
  const a = build();
  const b = build();
  expect(a).not.toBe(b);
});

test("field accumulates fields in order (data-first)", () => {
  const result = field(
    field(build(), "a", () => some(1)),
    "b",
    ({ a }) => some(a + 1),
  );
  expect(result).toEqual({ some: true, value: { a: 1, b: 2 } });
});

test("field happy path accumulates all fields (curried/pipe)", () => {
  const result = pipe(
    build(),
    field("token", () => some("T")),
    field("tier", () => some("gold")),
    field("price", ({ token, tier }) => some(`${token}-${tier}-9`)),
    map(({ token, tier, price }) => ({ price, tier, token })),
  );
  expect(result).toEqual({
    some: true,
    value: { price: "T-gold-9", tier: "gold", token: "T" },
  });
});

test("field short-circuits on the first step", () => {
  const result = pipe(
    build(),
    field("a", () => none),
    field("b", () => some(2)),
  );
  expect(result).toEqual({ some: false });
});

test("field short-circuits on the second step", () => {
  const result = pipe(
    build(),
    field("a", () => some(1)),
    field("b", () => none),
    field("c", () => some(3)),
  );
  expect(result).toEqual({ some: false });
});

test("field short-circuits on the third step", () => {
  const result = pipe(
    build(),
    field("a", () => some(1)),
    field("b", () => some(2)),
    field("c", () => none),
  );
  expect(result).toEqual({ some: false });
});

test("field after a short-circuit is not invoked", () => {
  let called = false;
  pipe(
    build(),
    field("a", () => none),
    field("b", () => {
      called = true;
      return some(2);
    }),
  );
  expect(called).toBe(false);
});

test("value adds a pure field and never short-circuits", () => {
  const result = pipe(
    build(),
    field("a", () => some(2)),
    value("doubled", ({ a }) => a * 2),
  );
  expect(result).toEqual({ some: true, value: { a: 2, doubled: 4 } });
});

test("value (data-first) adds a pure field", () => {
  const result = value(some({ a: 2 }), "doubled", ({ a }) => a * 2);
  expect(result).toEqual({ some: true, value: { a: 2, doubled: 4 } });
});

test("value is skipped after an upstream short-circuit", () => {
  let called = false;
  const result = pipe(
    build(),
    field("a", () => none),
    value("b", () => {
      called = true;
      return 2;
    }),
  );
  expect(result).toEqual({ some: false });
  expect(called).toBe(false);
});

test("each step returns a new scope object; earlier scope not mutated", () => {
  const seen: object[] = [];
  pipe(
    build(),
    field("a", () => some(1)),
    field("b", (scope) => {
      seen.push(scope);
      return some(2);
    }),
    value("c", (scope) => {
      seen.push(scope);
      return 3;
    }),
  );
  expect(seen[0]).not.toBe(seen[1]);
  expect(seen[0]).toEqual({ a: 1 });
  expect(seen[1]).toEqual({ a: 1, b: 2 });
});

test("re-binding a key replaces its value", () => {
  const result = pipe(
    build(),
    field("x", () => some(1)),
    value("x", () => "two"),
  );
  expect(result).toEqual({ some: true, value: { x: "two" } });
});

test("type-level: scope accumulates; value leaves the option shape", () => {
  const result = pipe(
    build(),
    field("a", () => some(1)),
    field("b", () => some("s")),
    value("c", ({ a }) => a + 1),
  );
  expectTypeOf(result).toEqualTypeOf<
    Option<{ readonly a: number; readonly b: string; readonly c: number }>
  >();
});

test("type-level: build seeds an empty scope", () => {
  expectTypeOf(build()).toEqualTypeOf<Option<Record<never, never>>>();
});
