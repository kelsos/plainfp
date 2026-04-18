import { bench, describe } from "vite-plus/test";
import { entries, get, getOr, keys, values } from "./access.ts";

const medium: Record<string, number> = Object.fromEntries(
  Array.from({ length: 1_000 }, (_, i) => [`k${i}`, i]),
);

describe("Records.get vs native property access", () => {
  bench("Records.get present key", () => {
    get(medium, "k500");
  });
  bench("Records.get missing key", () => {
    get(medium, "nope");
  });
  bench("native property access", () => {
    // Native via string key; no `none` sentinel, returns undefined on miss.
    const v = medium["k500"];
    void v;
  });
});

describe("Records.getOr", () => {
  bench("getOr present key", () => {
    getOr(medium, "k500", -1);
  });
  bench("getOr missing key (fallback used)", () => {
    getOr(medium, "nope", -1);
  });
});

describe("Records.{keys, values, entries} vs native", () => {
  bench("Records.keys", () => {
    keys(medium);
  });
  bench("Records.values", () => {
    values(medium);
  });
  bench("Records.entries", () => {
    entries(medium);
  });
  bench("Object.keys native", () => {
    Object.keys(medium);
  });
});
