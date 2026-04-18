import { expect, test } from "vite-plus/test";
import { z } from "zod";
import { fromZod, fromZodAsync } from "./index.ts";

const User = z.object({
  id: z.string(),
  age: z.number().int().nonnegative(),
});

test("fromZod returns ok on valid input", () => {
  const parse = fromZod(User);
  const result = parse({ id: "u-1", age: 30 });
  expect(result).toEqual({ ok: true, value: { id: "u-1", age: 30 } });
});

test("fromZod returns err on invalid input, carrying the ZodError", () => {
  const parse = fromZod(User);
  const result = parse({ id: "u-1", age: -1 });
  expect(result.ok).toBe(false);
  if (!result.ok) {
    expect(result.error.issues.length).toBeGreaterThan(0);
  }
});

test("fromZod works on primitive schemas too", () => {
  const parse = fromZod(z.string().min(3));
  expect(parse("ok").ok).toBe(false);
  expect(parse("hello")).toEqual({ ok: true, value: "hello" });
});

test("fromZodAsync handles async refinements", async () => {
  const schema = z.string().refine(async (s) => s.startsWith("ok"), "must start with ok");
  const parse = fromZodAsync(schema);
  expect(await parse("ok-1")).toEqual({ ok: true, value: "ok-1" });
  const fail = await parse("bad");
  expect(fail.ok).toBe(false);
});
