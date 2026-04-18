import { expect, test } from "vite-plus/test";
import { pipe } from "../pipe.ts";
import { fromPromise } from "../result-async/constructors.ts";
import { retry, timeout } from "../result-async/control.ts";
import { map, mapError } from "../result-async/transform.ts";

// Integration: a realistic fetch client composed from retry + timeout +
// fromPromise + map + mapError. This is the canonical async-error-handling
// shape users will write.

type NetworkError = { kind: "network"; cause: unknown };
type Timeout = { kind: "timeout" };
type ClientError = NetworkError | Timeout;

type User = { id: string; name: string };

const makeFlakyFetch = (failures: number) => {
  let callCount = 0;
  return (id: string): Promise<User> => {
    callCount++;
    if (callCount <= failures) {
      return Promise.reject(new Error(`transient ${callCount}`));
    }
    return Promise.resolve({ id, name: `user-${id}` });
  };
};

const fetchWithTimeout = (fetchFn: (id: string) => Promise<User>, id: string, ms: number) =>
  pipe(
    fromPromise(fetchFn(id), (cause): NetworkError => ({ kind: "network", cause })),
    timeout(ms, (): Timeout => ({ kind: "timeout" })),
  );

test("retry recovers after transient failures", async () => {
  const flaky = makeFlakyFetch(2); // first 2 calls fail
  const result = await retry(
    () => pipe(fromPromise(flaky("u-1"), (cause): ClientError => ({ kind: "network", cause }))),
    { times: 5 },
  );
  // retry returns rejected on throw, so we'd never reach here if flaky
  // rejects and retry doesn't wrap. But fromPromise catches the rejection
  // into a typed err, so retry gets err values back and keeps retrying.
  expect(result.ok).toBe(true);
  if (result.ok) expect(result.value.id).toBe("u-1");
});

test("retry gives up after exhausting attempts on persistent failures", async () => {
  const flaky = makeFlakyFetch(100); // always fails
  const result = await retry(
    () => pipe(fromPromise(flaky("u-1"), (cause): ClientError => ({ kind: "network", cause }))),
    { times: 3 },
  );
  expect(result.ok).toBe(false);
  if (!result.ok) expect(result.error.kind).toBe("network");
});

test("timeout fires when fetch is slower than the budget", async () => {
  const slowFetch = (id: string): Promise<User> =>
    new Promise((resolve) => setTimeout(() => resolve({ id, name: `user-${id}` }), 200));
  const result = await fetchWithTimeout(slowFetch, "u-1", 20);
  expect(result.ok).toBe(false);
  if (!result.ok) expect(result.error.kind).toBe("timeout");
});

test("timeout passes through when fetch beats the budget", async () => {
  const fastFetch = (id: string): Promise<User> => Promise.resolve({ id, name: `user-${id}` });
  const result = await fetchWithTimeout(fastFetch, "u-1", 100);
  expect(result.ok).toBe(true);
});

test("retry + timeout + map + mapError compose into a real client shape", async () => {
  const flaky = makeFlakyFetch(1);
  const greeting = await pipe(
    retry(
      () =>
        pipe(
          fromPromise(flaky("u-1"), (cause): ClientError => ({ kind: "network", cause })),
          timeout(100, (): ClientError => ({ kind: "timeout" })),
        ),
      { times: 3, delayMs: 1 },
    ),
    map((u: User) => `hello ${u.name}`),
    mapError((e) => `error: ${e.kind}`),
  );
  expect(greeting.ok).toBe(true);
  if (greeting.ok) expect(greeting.value).toBe("hello user-u-1");
});
