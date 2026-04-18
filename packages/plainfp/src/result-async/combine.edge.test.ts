import { expect, test, vi } from "vite-plus/test";
import { allWithConcurrency } from "./combine.ts";
import { err, ok } from "./constructors.ts";

// Documented behavior: allWithConcurrency propagates factory rejections
// rather than swallowing them. Callers must convert throws to typed errors
// at the boundary via fromPromise/fromAsync.

test("allWithConcurrency propagates a rejecting factory's error", async () => {
  const factories = [
    async () => ok(1),
    async () => {
      throw new Error("boundary bug");
    },
    async () => ok(3),
  ];
  await expect(allWithConcurrency(factories as never, 3)).rejects.toThrow("boundary bug");
});

test("allWithConcurrency still short-circuits when an earlier factory returns err", async () => {
  let thirdStarted = false;
  const factories = [
    async () => ok(1),
    async () => err("failed"),
    async () => {
      thirdStarted = true;
      return ok(3);
    },
  ];
  const result = await allWithConcurrency(factories, 1);
  expect(result).toEqual({ ok: false, error: "failed" });
  // With concurrency=1 and early err, the third factory never starts.
  expect(thirdStarted).toBe(false);
});

test("allWithConcurrency respects the concurrency cap under load", async () => {
  let active = 0;
  let peak = 0;
  const factories = Array.from({ length: 20 }, (_, i) => async () => {
    active++;
    peak = Math.max(peak, active);
    await new Promise((r) => setTimeout(r, 5));
    active--;
    return ok(i);
  });
  const result = await allWithConcurrency(factories, 4);
  expect(result.ok).toBe(true);
  if (result.ok) expect(result.value).toHaveLength(20);
  expect(peak).toBeLessThanOrEqual(4);
});

test("allWithConcurrency rejects synchronously when concurrency < 1", async () => {
  await expect(allWithConcurrency([async () => ok(1)], 0)).rejects.toThrow(RangeError);
  await expect(allWithConcurrency([async () => ok(1)], -3)).rejects.toThrow(RangeError);
});

test("allWithConcurrency with empty factories resolves to ok([])", async () => {
  const result = await allWithConcurrency([], 3);
  expect(result).toEqual({ ok: true, value: [] });
});

test("allWithConcurrency clamps concurrency to factories.length (no wasted workers)", async () => {
  const spy = vi.fn(async (i: number) => ok(i));
  const factories = [async () => spy(0), async () => spy(1)];
  const result = await allWithConcurrency(factories, 100);
  expect(result).toEqual({ ok: true, value: [0, 1] });
  expect(spy).toHaveBeenCalledTimes(2);
});
