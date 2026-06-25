import { expect, expectTypeOf, test } from "vite-plus/test";
import { build, field, value } from "./builder.ts";
import { err, ok } from "./constructors.ts";
import { pipe } from "../pipe.ts";
import { map } from "./transform.ts";
import type { ResultAsync } from "./types.ts";

test("build resolves to an empty ok scope", async () => {
  expect(await build()).toEqual({ ok: true, value: {} });
});

test("field accumulates async fields in order (data-first)", async () => {
  const result = field(
    field(build(), "a", () => ok(1)),
    "b",
    ({ a }) => ok(a + 1),
  );
  expect(await result).toEqual({ ok: true, value: { a: 1, b: 2 } });
});

test("field happy path accumulates all fields (curried/pipe)", async () => {
  const result = pipe(
    build(),
    field("token", () => ok("T")),
    field("tier", () => ok("gold")),
    field("price", ({ token, tier }) => ok(`${token}-${tier}-9`)),
    map(({ token, tier, price }) => ({ price, tier, token })),
  );
  expect(await result).toEqual({
    ok: true,
    value: { price: "T-gold-9", tier: "gold", token: "T" },
  });
});

test("async field awaits a Promise-backed step", async () => {
  const slow = (n: number): ResultAsync<number, never> =>
    new Promise((resolve) => setTimeout(() => resolve({ ok: true, value: n }), 1));
  const result = pipe(
    build(),
    field("a", () => slow(1)),
    field("b", ({ a }) => slow(a + 1)),
  );
  expect(await result).toEqual({ ok: true, value: { a: 1, b: 2 } });
});

test("field short-circuits on the first step", async () => {
  const result = pipe(
    build(),
    field("a", () => err("boom")),
    field("b", () => ok(2)),
  );
  expect(await result).toEqual({ ok: false, error: "boom" });
});

test("field short-circuits on the second step", async () => {
  const result = pipe(
    build(),
    field("a", () => ok(1)),
    field("b", () => err("boom")),
    field("c", () => ok(3)),
  );
  expect(await result).toEqual({ ok: false, error: "boom" });
});

test("field short-circuits on the third step", async () => {
  const result = pipe(
    build(),
    field("a", () => ok(1)),
    field("b", () => ok(2)),
    field("c", () => err("boom")),
  );
  expect(await result).toEqual({ ok: false, error: "boom" });
});

test("field after a short-circuit is not invoked", async () => {
  let called = false;
  await pipe(
    build(),
    field("a", () => err("boom")),
    field("b", () => {
      called = true;
      return ok(2);
    }),
  );
  expect(called).toBe(false);
});

test("steps run sequentially in declared order", async () => {
  const order: string[] = [];
  const step = (name: string): ResultAsync<string, never> =>
    new Promise((resolve) =>
      setTimeout(() => {
        order.push(name);
        resolve({ ok: true, value: name });
      }, 1),
    );
  await pipe(
    build(),
    field("a", () => step("a")),
    field("b", () => step("b")),
    field("c", () => step("c")),
  );
  expect(order).toEqual(["a", "b", "c"]);
});

test("value adds a pure field (sync)", async () => {
  const result = pipe(
    build(),
    field("a", () => ok(2)),
    value("doubled", ({ a }) => a * 2),
  );
  expect(await result).toEqual({ ok: true, value: { a: 2, doubled: 4 } });
});

test("value awaits an async pure compute (Promise return)", async () => {
  const result = pipe(
    build(),
    field("a", () => ok(2)),
    value("doubled", ({ a }) => Promise.resolve(a * 2)),
  );
  expect(await result).toEqual({ ok: true, value: { a: 2, doubled: 4 } });
});

test("value (data-first) adds a pure field", async () => {
  const result = value(ok({ a: 2 }), "doubled", ({ a }) => a * 2);
  expect(await result).toEqual({ ok: true, value: { a: 2, doubled: 4 } });
});

test("value is skipped after an upstream short-circuit", async () => {
  let called = false;
  const result = pipe(
    build(),
    field("a", () => err("boom")),
    value("b", () => {
      called = true;
      return 2;
    }),
  );
  expect(await result).toEqual({ ok: false, error: "boom" });
  expect(called).toBe(false);
});

test("each step returns a new scope object; earlier scope not mutated", async () => {
  const seen: object[] = [];
  await pipe(
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
  expect(seen[0]).not.toBe(seen[1]);
  expect(seen[0]).toEqual({ a: 1 });
  expect(seen[1]).toEqual({ a: 1, b: 2 });
});

test("re-binding a key replaces its value", async () => {
  const result = pipe(
    build(),
    field("x", () => ok(1)),
    value("x", () => "two"),
  );
  expect(await result).toEqual({ ok: true, value: { x: "two" } });
});

test("type-level: field widens the error union, value leaves it put", async () => {
  const result = pipe(
    build(),
    field("a", () => ok(1) as ResultAsync<number, "E1">),
    field("b", () => ok(2) as ResultAsync<number, "E2">),
    value("c", ({ a, b }) => a + b),
  );
  expectTypeOf(result).toEqualTypeOf<
    ResultAsync<{ readonly a: number; readonly b: number; readonly c: number }, "E1" | "E2">
  >();
  await result;
});

test("type-level: build seeds an empty never-error scope", () => {
  expectTypeOf(build()).toEqualTypeOf<ResultAsync<Record<never, never>, never>>();
});
