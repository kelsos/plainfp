import { expect, test } from "vite-plus/test";
import type { Brand } from "./index.ts";
import { make } from "./index.ts";

type UserId = Brand<string, "UserId">;
type Years = Brand<number, "Years">;

test("make produces a branded value that is structurally the underlying type", () => {
  const id: UserId = make<string, "UserId">("u-123");
  expect(id).toBe("u-123");
});

test("brands are nominal: different brands coexist without collision", () => {
  const id: UserId = make<string, "UserId">("u-1");
  const years: Years = make<number, "Years">(30);
  const ids: UserId[] = [id];
  expect(ids.length).toBe(1);
  expect(years).toBe(30);
});
