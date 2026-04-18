import fc from "fast-check";
import { expect, test } from "vite-plus/test";
import { none, some } from "./constructors.ts";
import { flatMap, map } from "./transform.ts";
import type { Option } from "./types.ts";

// Arbitrary Option<number>: ~70% some, ~30% none
const arbOption: fc.Arbitrary<Option<number>> = fc.oneof(
  { weight: 7, arbitrary: fc.integer().map(some) },
  { weight: 3, arbitrary: fc.constant(none) },
);

// ────────────────────────────────────────────────────────────────
// Functor laws — Option.map
// ────────────────────────────────────────────────────────────────

test("functor identity: map(o, x => x) === o", () => {
  fc.assert(
    fc.property(arbOption, (o) => {
      expect(map(o, (x) => x)).toEqual(o);
    }),
  );
});

test("functor composition: map(map(o, f), g) === map(o, x => g(f(x)))", () => {
  fc.assert(
    fc.property(arbOption, fc.integer(), fc.integer(), (o, a, b) => {
      const f = (x: number) => x + a;
      const g = (x: number) => x * b;
      expect(map(map(o, f), g)).toEqual(map(o, (x) => g(f(x))));
    }),
  );
});

// ────────────────────────────────────────────────────────────────
// Monad laws — Option.flatMap + some
// ────────────────────────────────────────────────────────────────

test("monad left identity: flatMap(some(x), f) === f(x)", () => {
  fc.assert(
    fc.property(fc.integer(), (x) => {
      const f = (n: number): Option<number> => (n >= 0 ? some(n) : none);
      expect(flatMap(some(x), f)).toEqual(f(x));
    }),
  );
});

test("monad right identity: flatMap(o, some) === o", () => {
  fc.assert(
    fc.property(arbOption, (o) => {
      expect(flatMap(o, some)).toEqual(o);
    }),
  );
});

test("monad associativity: flatMap(flatMap(o, f), g) === flatMap(o, x => flatMap(f(x), g))", () => {
  fc.assert(
    fc.property(arbOption, fc.integer({ min: -10, max: 10 }), (o, a) => {
      const f = (n: number): Option<number> => (n + a >= 0 ? some(n + a) : none);
      const g = (n: number): Option<number> => (n < 100 ? some(n) : none);
      expect(flatMap(flatMap(o, f), g)).toEqual(flatMap(o, (x) => flatMap(f(x), g)));
    }),
  );
});
