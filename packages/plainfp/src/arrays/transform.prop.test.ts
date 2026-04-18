import fc from "fast-check";
import { expect, test } from "vite-plus/test";
import { filter, flatMap, map, reduce } from "./transform.ts";

// ────────────────────────────────────────────────────────────────
// Functor laws — Arrays.map
// ────────────────────────────────────────────────────────────────

test("functor identity: map(xs, x => x) === xs", () => {
  fc.assert(
    fc.property(fc.array(fc.integer()), (xs) => {
      expect(map(xs, (x) => x)).toEqual(xs);
    }),
  );
});

test("functor composition: map(map(xs, f), g) === map(xs, x => g(f(x)))", () => {
  fc.assert(
    fc.property(fc.array(fc.integer()), fc.integer(), fc.integer(), (xs, a, b) => {
      const f = (x: number) => x + a;
      const g = (x: number) => x * b;
      expect(map(map(xs, f), g)).toEqual(map(xs, (x) => g(f(x))));
    }),
  );
});

// ────────────────────────────────────────────────────────────────
// filter invariants
// ────────────────────────────────────────────────────────────────

test("filter length never exceeds input length", () => {
  fc.assert(
    fc.property(fc.array(fc.integer()), fc.integer(), (xs, threshold) => {
      expect(filter(xs, (x) => x < threshold).length).toBeLessThanOrEqual(xs.length);
    }),
  );
});

test("filter(p) then filter(p) === filter(p) (idempotence)", () => {
  fc.assert(
    fc.property(fc.array(fc.integer()), fc.integer(), (xs, threshold) => {
      const p = (x: number) => x < threshold;
      expect(filter(filter(xs, p), p)).toEqual(filter(xs, p));
    }),
  );
});

test("filter(true) === xs", () => {
  fc.assert(
    fc.property(fc.array(fc.anything()), (xs) => {
      expect(filter(xs, () => true)).toEqual([...xs]);
    }),
  );
});

test("filter(false) === []", () => {
  fc.assert(
    fc.property(fc.array(fc.anything()), (xs) => {
      expect(filter(xs, () => false)).toEqual([]);
    }),
  );
});

// ────────────────────────────────────────────────────────────────
// flatMap laws
// ────────────────────────────────────────────────────────────────

test("flatMap(xs, x => [x]) === xs (singleton lift)", () => {
  fc.assert(
    fc.property(fc.array(fc.integer()), (xs) => {
      expect(flatMap(xs, (x) => [x])).toEqual([...xs]);
    }),
  );
});

test("flatMap(xs, x => []) === []", () => {
  fc.assert(
    fc.property(fc.array(fc.integer()), (xs) => {
      expect(flatMap(xs, () => [])).toEqual([]);
    }),
  );
});

// ────────────────────────────────────────────────────────────────
// reduce sanity
// ────────────────────────────────────────────────────────────────

test("reduce(xs, 0, +) === sum(xs)", () => {
  fc.assert(
    fc.property(fc.array(fc.integer({ min: -1_000, max: 1_000 })), (xs) => {
      const viaReduce = reduce(xs, 0, (acc, n) => acc + n);
      const viaLoop = xs.reduce((acc, n) => acc + n, 0);
      expect(viaReduce).toBe(viaLoop);
    }),
  );
});
