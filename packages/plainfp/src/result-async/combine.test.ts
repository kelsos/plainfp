import { expect, test } from "vite-plus/test";
import { all, allWithConcurrency } from "./combine.ts";
import { err, ok } from "./constructors.ts";

test("all collects values when every async result is ok", async () => {
  expect(await all([ok(1), ok(2), ok(3)])).toEqual({ ok: true, value: [1, 2, 3] });
});

test("all returns the first err", async () => {
  expect(await all([ok(1), err("bad"), ok(3)])).toEqual({ ok: false, error: "bad" });
});

test("allWithConcurrency respects the concurrency cap", async () => {
  let active = 0;
  let peak = 0;
  const factories = Array.from({ length: 10 }, (_, i) => async () => {
    active++;
    peak = Math.max(peak, active);
    await new Promise((r) => setTimeout(r, 10));
    active--;
    return ok(i);
  });
  const result = await allWithConcurrency(factories, 3);
  expect(result).toEqual({ ok: true, value: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] });
  expect(peak).toBeLessThanOrEqual(3);
});

test("allWithConcurrency short-circuits on first err", async () => {
  const factories = [async () => ok(1), async () => err("bad"), async () => ok(3)];
  const result = await allWithConcurrency(factories, 2);
  expect(result).toEqual({ ok: false, error: "bad" });
});

test("allWithConcurrency rejects concurrency < 1", async () => {
  await expect(allWithConcurrency([async () => ok(1)], 0)).rejects.toThrow(RangeError);
});
