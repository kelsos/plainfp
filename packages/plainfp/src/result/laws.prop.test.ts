import fc from "fast-check";
import { expect, test } from "vite-plus/test";
import { err, ok } from "./constructors.ts";
import { flatMap, map } from "./transform.ts";
import type { Result } from "./types.ts";

// Arbitrary Result<number, string>: 50/50 ok vs err
const arbResult: fc.Arbitrary<Result<number, string>> = fc.oneof(
  fc.integer().map(ok),
  fc.string().map(err),
);

// ────────────────────────────────────────────────────────────────
// Functor laws — Result.map
// ────────────────────────────────────────────────────────────────

test("functor identity: map(r, x => x) === r", () => {
  fc.assert(
    fc.property(arbResult, (r) => {
      expect(map(r, (x) => x)).toEqual(r);
    }),
  );
});

test("functor composition: map(map(r, f), g) === map(r, x => g(f(x)))", () => {
  fc.assert(
    fc.property(arbResult, fc.integer(), fc.integer(), (r, a, b) => {
      const f = (x: number) => x + a;
      const g = (x: number) => x * b;
      expect(map(map(r, f), g)).toEqual(map(r, (x) => g(f(x))));
    }),
  );
});

// ────────────────────────────────────────────────────────────────
// Monad laws — Result.flatMap + ok
// ────────────────────────────────────────────────────────────────

test("monad left identity: flatMap(ok(x), f) === f(x)", () => {
  fc.assert(
    fc.property(fc.integer(), fc.integer(), (x, a) => {
      const f = (n: number): Result<number, string> => (n + a >= 0 ? ok(n + a) : err("neg"));
      expect(flatMap(ok(x), f)).toEqual(f(x));
    }),
  );
});

test("monad right identity: flatMap(r, ok) === r", () => {
  fc.assert(
    fc.property(arbResult, (r) => {
      expect(flatMap(r, ok)).toEqual(r);
    }),
  );
});

test("monad associativity: flatMap(flatMap(r, f), g) === flatMap(r, x => flatMap(f(x), g))", () => {
  fc.assert(
    fc.property(
      arbResult,
      fc.integer({ min: -50, max: 50 }),
      fc.integer({ min: -50, max: 50 }),
      (r, a, b) => {
        const f = (n: number): Result<number, string> =>
          n + a >= 0 ? ok(n + a) : err(`f<0: ${n + a}`);
        const g = (n: number): Result<number, string> =>
          n * b < 1_000 ? ok(n * b) : err(`g overflow`);
        expect(flatMap(flatMap(r, f), g)).toEqual(flatMap(r, (x) => flatMap(f(x), g)));
      },
    ),
  );
});
