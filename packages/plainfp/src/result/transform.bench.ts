import { bench, describe } from "vite-plus/test";
import { err, ok } from "./constructors.ts";
import type { Result } from "./types.ts";
import { flatMap, map } from "./transform.ts";

const okVal: Result<number, string> = ok(42);
const errVal: Result<number, string> = err("bad");

describe("Result.map — ok vs err paths", () => {
  bench("map over ok", () => {
    map(okVal, (n: number) => n + 1);
  });
  bench("map over err (short-circuit)", () => {
    map(errVal, (n: number) => n + 1);
  });
});

describe("Result.map vs throw/catch", () => {
  const doOk = (n: number) => n + 1;
  const doThrow = () => {
    throw new Error("bad");
  };

  bench("Result.map chain (5 deep, all ok)", () => {
    const a = map(okVal, doOk);
    const b = map(a, doOk);
    const c = map(b, doOk);
    const d = map(c, doOk);
    map(d, doOk);
  });

  bench("try/catch chain (5 deep, no throw)", () => {
    try {
      doOk(doOk(doOk(doOk(doOk(42)))));
    } catch {
      // noop
    }
  });

  bench("try/catch with throw (1 level)", () => {
    try {
      doThrow();
    } catch {
      // noop
    }
  });
});

describe("Result.flatMap pipeline", () => {
  const step = (n: number) => (n > 0 ? ok(n * 2) : err("neg"));
  bench("flatMap 5 deep, ok path", () => {
    const a = flatMap(okVal, step);
    const b = flatMap(a, step);
    const c = flatMap(b, step);
    const d = flatMap(c, step);
    flatMap(d, step);
  });
});
