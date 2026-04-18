import { expect, test } from "vite-plus/test";
import { flow, pipe } from "./pipe.ts";

test("pipe returns the value when given no functions", () => {
  expect(pipe(42)).toBe(42);
});

test("pipe applies functions left-to-right", () => {
  const result = pipe(
    2,
    (n) => n + 3,
    (n) => n * 4,
    (n) => `${n}`,
  );
  expect(result).toBe("20");
});

test("flow returns a function that applies its steps left-to-right", () => {
  const f = flow(
    (n: number) => n + 1,
    (n) => n * 2,
  );
  expect(f(3)).toBe(8);
});

test("flow preserves input type through the chain", () => {
  const describe = flow(
    (s: string) => s.trim(),
    (s) => s.toUpperCase(),
    (s) => `[${s}]`,
  );
  expect(describe("  hi  ")).toBe("[HI]");
});
