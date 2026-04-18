import { expect, test } from "vite-plus/test";
import { z } from "zod";
import { fromZod, fromZodAsync } from "./index.ts";

// fromZod rejects async schemas with a wrapped, actionable error that points
// at fromZodAsync. This catches the case where users accidentally use the
// sync variant on a schema that needs `safeParseAsync`.

test("fromZod throws a wrapped error when called with an async-refined schema", () => {
  const AsyncSchema = z.string().refine(async (s) => s.length > 0, "required");
  const parse = fromZod(AsyncSchema);
  expect(() => parse("hello")).toThrow(
    /fromZod cannot parse schemas with async refinements.*use fromZodAsync/,
  );
});

test("fromZod's wrapped error preserves the original Zod error as `cause`", () => {
  const AsyncSchema = z.string().refine(async () => true, "required");
  const parse = fromZod(AsyncSchema);
  try {
    parse("hello");
    throw new Error("expected throw");
  } catch (e) {
    expect(e).toBeInstanceOf(Error);
    expect((e as Error).message).toMatch(/fromZodAsync/);
    expect((e as Error).cause).toBeDefined();
  }
});

test("fromZodAsync handles the same async schema successfully", async () => {
  const AsyncSchema = z.string().refine(async (s) => s.startsWith("ok"), "must start with ok");
  const parse = fromZodAsync(AsyncSchema);

  const good = await parse("ok-hello");
  expect(good).toEqual({ ok: true, value: "ok-hello" });

  const bad = await parse("nope");
  expect(bad.ok).toBe(false);
  if (!bad.ok) expect(bad.error.issues.length).toBeGreaterThan(0);
});

test("fromZod still works for purely synchronous schemas", () => {
  const SyncSchema = z.object({ id: z.string(), age: z.number() });
  const parse = fromZod(SyncSchema);
  const ok = parse({ id: "u-1", age: 30 });
  expect(ok).toEqual({ ok: true, value: { id: "u-1", age: 30 } });
});
