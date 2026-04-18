import { bench, describe } from "vite-plus/test";
import { err, ok } from "./constructors.ts";
import { flatMap, map } from "./transform.ts";

// ResultAsync is Promise<Result<T, E>> — microbenchmarks on async chains
// capture the overhead of our wrappers vs a bare `.then` pipeline.

describe("ResultAsync.map — ok vs err paths", () => {
  bench("map over ok", async () => {
    await map(ok(42), (n) => n + 1);
  });
  bench("map over err (short-circuit)", async () => {
    await map(err("bad"), (n: number) => n + 1);
  });
});

describe("ResultAsync.map vs bare Promise.then", () => {
  bench("ResultAsync.map chain (5 deep, all ok)", async () => {
    const a = map(ok(0), (n) => n + 1);
    const b = map(a, (n) => n + 1);
    const c = map(b, (n) => n + 1);
    const d = map(c, (n) => n + 1);
    await map(d, (n) => n + 1);
  });
  bench("Promise.then chain (5 deep)", async () => {
    await Promise.resolve(0)
      .then((n) => n + 1)
      .then((n) => n + 1)
      .then((n) => n + 1)
      .then((n) => n + 1)
      .then((n) => n + 1);
  });
});

describe("ResultAsync.flatMap pipeline", () => {
  const step = (n: number) => (n > 0 ? ok(n * 2) : err("neg"));
  bench("flatMap 5 deep, ok path", async () => {
    const a = flatMap(ok(1), step);
    const b = flatMap(a, step);
    const c = flatMap(b, step);
    const d = flatMap(c, step);
    await flatMap(d, step);
  });
});
