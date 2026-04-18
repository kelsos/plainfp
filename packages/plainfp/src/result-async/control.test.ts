import { expect, test } from "vite-plus/test";
import { pipe } from "../pipe.ts";
import { err, ok } from "./constructors.ts";
import { retry, timeout } from "./control.ts";

test("retry returns the first ok", async () => {
  let calls = 0;
  const factory = async () => {
    calls++;
    return ok(42);
  };
  const result = await retry(factory, { times: 3 });
  expect(result).toEqual({ ok: true, value: 42 });
  expect(calls).toBe(1);
});

test("retry retries until ok within the limit", async () => {
  let calls = 0;
  const factory = async () => {
    calls++;
    return calls < 3 ? err("nope") : ok("yes");
  };
  const result = await retry(factory, { times: 5 });
  expect(result).toEqual({ ok: true, value: "yes" });
  expect(calls).toBe(3);
});

test("retry returns last err when attempts exhausted", async () => {
  let calls = 0;
  const factory = async () => {
    calls++;
    return err(`fail-${calls}`);
  };
  const result = await retry(factory, { times: 3 });
  expect(result).toEqual({ ok: false, error: "fail-3" });
  expect(calls).toBe(3);
});

test("retry rejects invalid times", async () => {
  await expect(retry(async () => ok(1), { times: 0 })).rejects.toThrow(RangeError);
});

test("timeout returns err when operation exceeds ms", async () => {
  const slow: Promise<{ ok: true; value: number }> = new Promise((resolve) => {
    setTimeout(() => resolve({ ok: true, value: 1 }), 100);
  });
  const result = await pipe(
    slow,
    timeout(20, () => "timed-out"),
  );
  expect(result).toEqual({ ok: false, error: "timed-out" });
});

test("timeout passes through when operation completes in time", async () => {
  const fast = (async () => {
    await new Promise((res) => setTimeout(res, 5));
    return await ok(99);
  })();
  const result = await pipe(
    fast,
    timeout(100, () => "timed-out"),
  );
  expect(result).toEqual({ ok: true, value: 99 });
});
