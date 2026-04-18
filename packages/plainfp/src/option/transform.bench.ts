import { bench, describe } from "vite-plus/test";
import { none, some } from "./constructors.ts";
import type { Option } from "./types.ts";
import { filter, flatMap, map } from "./transform.ts";

const someVal: Option<number> = some(42);
const noneVal: Option<number> = none;

describe("Option.map — some vs none paths", () => {
  bench("map over some", () => {
    map(someVal, (n) => n + 1);
  });
  bench("map over none (short-circuit)", () => {
    map(noneVal, (n: number) => n + 1);
  });
});

describe("Option.flatMap pipeline", () => {
  const step = (n: number) => (n % 2 === 0 ? some(n * 2) : none);
  bench("flatMap 5 deep, some path", () => {
    const a = flatMap(someVal, step);
    const b = flatMap(a, step);
    const c = flatMap(b, step);
    const d = flatMap(c, step);
    flatMap(d, step);
  });
  bench("flatMap 5 deep, early none", () => {
    const a = flatMap(some(3), step); // → none at step 1
    const b = flatMap(a, step);
    const c = flatMap(b, step);
    const d = flatMap(c, step);
    flatMap(d, step);
  });
});

describe("Option.filter", () => {
  bench("filter predicate passes", () => {
    filter(someVal, (n) => n > 0);
  });
  bench("filter predicate fails", () => {
    filter(someVal, (n) => n < 0);
  });
});
