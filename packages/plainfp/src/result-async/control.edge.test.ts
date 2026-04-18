import { expect, test, vi } from "vite-plus/test";
import { err, ok } from "./constructors.ts";
import { retry, timeout } from "./control.ts";

// ────────────────────────────────────────────────────────────────
// retry — documented behavior on throwing factories
// ────────────────────────────────────────────────────────────────

test("retry rejects when factory throws synchronously (no retry attempted)", async () => {
  let calls = 0;
  const factory = () => {
    calls++;
    throw new Error("sync-throw");
  };
  await expect(retry(factory as never, { times: 5 })).rejects.toThrow("sync-throw");
  expect(calls).toBe(1);
});

test("retry rejects when factory rejects asynchronously (no retry attempted)", async () => {
  let calls = 0;
  const factory = async () => {
    calls++;
    throw new Error("async-reject");
  };
  await expect(retry(factory as never, { times: 5 })).rejects.toThrow("async-reject");
  expect(calls).toBe(1);
});

test("retry still retries when factory consistently returns err", async () => {
  let calls = 0;
  const factory = async () => {
    calls++;
    return err(`fail-${calls}`);
  };
  const result = await retry(factory, { times: 4 });
  expect(result).toEqual({ ok: false, error: "fail-4" });
  expect(calls).toBe(4);
});

test("retry stops at first ok even with delay configured", async () => {
  let calls = 0;
  const factory = async () => {
    calls++;
    return calls < 3 ? err("nope") : ok(42);
  };
  const result = await retry(factory, { times: 10, delayMs: 1 });
  expect(result).toEqual({ ok: true, value: 42 });
  expect(calls).toBe(3);
});

// ────────────────────────────────────────────────────────────────
// timeout — timer lifecycle
// ────────────────────────────────────────────────────────────────

test("timeout clears the internal timer when the operation resolves first", async () => {
  // If the timer weren't cleared, Vitest's unhandled-timer detection would
  // keep the test open. Using fake timers lets us assert exactly one pending
  // timer during the race and zero after it completes.
  vi.useFakeTimers();
  try {
    const fastResult = Promise.resolve(ok("done"));
    const race = timeout(fastResult, 1000, () => "timed-out");

    // Await only the happy path; no timer should fire.
    await vi.advanceTimersByTimeAsync(0);
    const result = await race;
    expect(result).toEqual({ ok: true, value: "done" });

    // Verify no lingering timers remain.
    expect(vi.getTimerCount()).toBe(0);
  } finally {
    vi.useRealTimers();
  }
});

test("timeout fires when the operation exceeds ms and provides the onTimeout error", async () => {
  vi.useFakeTimers();
  try {
    // A Promise that never resolves inside the test window
    const pending = new Promise<{ ok: true; value: number }>(() => {
      // intentionally empty — never resolves
    });
    const race = timeout(pending, 500, () => ({ code: "SLOW" as const }));
    await vi.advanceTimersByTimeAsync(500);
    const result = await race;
    expect(result).toEqual({ ok: false, error: { code: "SLOW" } });
    expect(vi.getTimerCount()).toBe(0);
  } finally {
    vi.useRealTimers();
  }
});

test("timeout onTimeout factory is not called on the happy path", async () => {
  const spy = vi.fn(() => "timed-out");
  const fast = Promise.resolve(ok(1));
  const result = await timeout(fast, 100, spy);
  expect(result).toEqual({ ok: true, value: 1 });
  expect(spy).not.toHaveBeenCalled();
});
