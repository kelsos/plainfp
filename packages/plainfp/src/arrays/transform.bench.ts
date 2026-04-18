import { bench, describe } from "vite-plus/test";
import { filter, flatMap, map } from "./transform.ts";

const small = Array.from({ length: 100 }, (_, i) => i);
const medium = Array.from({ length: 10_000 }, (_, i) => i);

describe("Arrays.map vs native", () => {
  bench("plainfp Arrays.map (small)", () => {
    map(small, (n) => n + 1);
  });
  bench("native [].map (small)", () => {
    small.map((n) => n + 1);
  });
  bench("plainfp Arrays.map (medium)", () => {
    map(medium, (n) => n + 1);
  });
  bench("native [].map (medium)", () => {
    medium.map((n) => n + 1);
  });
});

describe("Arrays.filter vs native", () => {
  bench("plainfp Arrays.filter", () => {
    filter(medium, (n) => n % 2 === 0);
  });
  bench("native [].filter", () => {
    medium.filter((n) => n % 2 === 0);
  });
});

describe("Arrays.flatMap vs native", () => {
  bench("plainfp Arrays.flatMap", () => {
    flatMap(medium, (n) => [n, -n]);
  });
  bench("native [].flatMap", () => {
    medium.flatMap((n) => [n, -n]);
  });
});

describe("dual-API cost — data-first vs curried", () => {
  const curriedMap = map((n: number) => n + 1);
  bench("data-first map(xs, fn)", () => {
    map(medium, (n) => n + 1);
  });
  bench("curried map(fn)(xs) — closure reused", () => {
    curriedMap(medium);
  });
  bench("curried map(fn)(xs) — closure allocated per call", () => {
    map((n: number) => n + 1)(medium);
  });
});
