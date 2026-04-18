import { bench, describe } from "vite-plus/test";
import { filter, mapKeys, mapValues } from "./transform.ts";

// A realistic record shape: per-user aggregates keyed by user id.
const small: Record<string, number> = Object.fromEntries(
  Array.from({ length: 10 }, (_, i) => [`user_${i}`, i * 100]),
);
const medium: Record<string, number> = Object.fromEntries(
  Array.from({ length: 1_000 }, (_, i) => [`user_${i}`, i * 100]),
);

describe("Records.mapValues vs handwritten reduce", () => {
  bench("Records.mapValues (small)", () => {
    mapValues(small, (v) => v + 1);
  });
  bench("handwritten reduce (small)", () => {
    const out: Record<string, number> = {};
    for (const k in small) out[k] = small[k]! + 1;
  });
  bench("Records.mapValues (medium)", () => {
    mapValues(medium, (v) => v + 1);
  });
  bench("handwritten reduce (medium)", () => {
    const out: Record<string, number> = {};
    for (const k in medium) out[k] = medium[k]! + 1;
  });
});

describe("Records.filter (medium)", () => {
  bench("keep roughly half", () => {
    filter(medium, (v) => v % 200 === 0);
  });
  bench("keep none", () => {
    filter(medium, () => false);
  });
  bench("keep all", () => {
    filter(medium, () => true);
  });
});

describe("Records.mapKeys (medium)", () => {
  bench("rename prefix", () => {
    mapKeys(medium, (k) => `u:${k}`);
  });
});
