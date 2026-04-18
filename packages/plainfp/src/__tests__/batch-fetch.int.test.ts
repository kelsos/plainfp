import { expect, test } from "vite-plus/test";
import { map as mapArray } from "../arrays/transform.ts";
import { pipe } from "../pipe.ts";
import { all, allWithConcurrency } from "../result-async/combine.ts";
import { fromPromise } from "../result-async/constructors.ts";

// Integration: batch fetch over Arrays + ResultAsync. Each id maps to a
// fake fetch that may succeed or fail; ResultAsync.all aggregates them.

const mockFetch = (id: string): Promise<{ id: string; name: string }> => {
  if (id.startsWith("fail")) {
    return Promise.reject(new Error(`boom: ${id}`));
  }
  return Promise.resolve({ id, name: `user-${id}` });
};

const fetchUser = (id: string) =>
  fromPromise(mockFetch(id), (cause) => ({
    kind: "fetch-failed" as const,
    id,
    cause,
  }));

test("batch fetch all-ok path collects every user via Arrays.map + ResultAsync.all", async () => {
  const ids = ["u1", "u2", "u3"];
  const batch = pipe(ids, mapArray(fetchUser), all);
  const result = await batch;
  expect(result.ok).toBe(true);
  if (result.ok) {
    expect(result.value.map((u) => u.id)).toEqual(ids);
  }
});

test("batch fetch returns the first err when a fetch rejects", async () => {
  const ids = ["u1", "fail-mid", "u3"];
  const result = await pipe(ids, mapArray(fetchUser), all);
  expect(result.ok).toBe(false);
  if (!result.ok) {
    expect(result.error.kind).toBe("fetch-failed");
    expect(result.error.id).toBe("fail-mid");
  }
});

test("allWithConcurrency caps parallelism across Arrays.map-produced factories", async () => {
  let active = 0;
  let peak = 0;
  const slowFetch = (id: string) =>
    fromPromise(
      new Promise<{ id: string }>((resolve) => {
        active++;
        peak = Math.max(peak, active);
        setTimeout(() => {
          active--;
          resolve({ id });
        }, 5);
      }),
      () => ({ kind: "slow" as const }),
    );

  const ids = Array.from({ length: 30 }, (_, i) => `u${i}`);
  const factories = pipe(
    ids,
    mapArray((id: string) => () => slowFetch(id)),
  );
  const result = await allWithConcurrency(factories, 4);
  expect(result.ok).toBe(true);
  expect(peak).toBeLessThanOrEqual(4);
});
