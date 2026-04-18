import { expect, test } from "vite-plus/test";
import { get, getOr } from "./access.ts";

test("getOr returns undefined fallback in data-first call (not a function)", () => {
  const obj: Record<string, string | undefined> = { a: "x" };
  const result = getOr<string | undefined>(obj, "missing", undefined);
  expect(result).toBeUndefined();
});

test("getOr works data-first when fallback is legitimately undefined", () => {
  const obj: Record<string, string | undefined> = { a: "x", b: undefined };
  expect(getOr<string | undefined>(obj, "a", undefined)).toBe("x");
  expect(getOr<string | undefined>(obj, "b", undefined)).toBeUndefined();
  expect(getOr<string | undefined>(obj, "missing", undefined)).toBeUndefined();
});

test("get does not treat prototype-chain props as present", () => {
  const obj: Record<string, number> = Object.create({ inherited: 99 });
  obj["own"] = 1;
  expect(get<number>(obj, "own")).toEqual({ some: true, value: 1 });
  expect(get<number>(obj, "inherited")).toEqual({ some: false });
});

test("getOr does not read prototype-chain inherited props", () => {
  const obj: Record<string, number> = Object.create({ inherited: 99 });
  obj["own"] = 1;
  expect(getOr<number>(obj, "inherited", 42)).toBe(42);
});
