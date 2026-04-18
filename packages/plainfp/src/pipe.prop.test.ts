import fc from "fast-check";
import { expect, test } from "vite-plus/test";
import { flow, pipe } from "./pipe.ts";

// ────────────────────────────────────────────────────────────────
// pipe laws
// ────────────────────────────────────────────────────────────────

test("identity: pipe(x) === x for any value", () => {
  fc.assert(
    fc.property(fc.anything(), (x) => {
      expect(pipe(x)).toEqual(x);
    }),
  );
});

test("single-arg application: pipe(x, f) === f(x)", () => {
  fc.assert(
    fc.property(fc.integer(), fc.integer(), (x, a) => {
      const f = (n: number) => n + a;
      expect(pipe(x, f)).toBe(f(x));
    }),
  );
});

test("two-step composition: pipe(x, f, g) === g(f(x))", () => {
  fc.assert(
    fc.property(fc.integer(), fc.integer(), fc.integer(), (x, a, b) => {
      const f = (n: number) => n + a;
      const g = (n: number) => n * b;
      expect(pipe(x, f, g)).toBe(g(f(x)));
    }),
  );
});

test("associativity: pipe(pipe(x, f), g) === pipe(x, f, g)", () => {
  fc.assert(
    fc.property(fc.integer(), fc.integer(), fc.integer(), (x, a, b) => {
      const f = (n: number) => n + a;
      const g = (n: number) => n * b;
      expect(pipe(pipe(x, f), g)).toBe(pipe(x, f, g));
    }),
  );
});

// ────────────────────────────────────────────────────────────────
// flow laws (deferred pipe)
// ────────────────────────────────────────────────────────────────

test("flow matches pipe: flow(f, g)(x) === pipe(x, f, g)", () => {
  fc.assert(
    fc.property(fc.integer(), fc.integer(), fc.integer(), (x, a, b) => {
      const f = (n: number) => n + a;
      const g = (n: number) => n * b;
      expect(flow(f, g)(x)).toBe(pipe(x, f, g));
    }),
  );
});

test("flow(id) is the identity function", () => {
  fc.assert(
    fc.property(fc.anything(), (x) => {
      expect(flow(<T>(v: T) => v)(x)).toEqual(x);
    }),
  );
});
