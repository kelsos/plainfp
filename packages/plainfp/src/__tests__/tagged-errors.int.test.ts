import { expect, test } from "vite-plus/test";
import { pipe } from "../pipe.ts";
import { err, ok } from "../result/constructors.ts";
import { match } from "../result/unwrap.ts";
import { flatMap, mapError } from "../result/transform.ts";
import type { Result } from "../result/types.ts";
import { hasTag, tag } from "../tagged/index.ts";

// Integration: the recommended tagged-error pattern composed with Result
// + pipe + match. Verifies that discriminants survive through mapError,
// flatMap, and exhaustive matching.

const NotFound = tag("NotFound");
const Forbidden = tag("Forbidden");
const Validation = tag("Validation");

type AppError =
  | ReturnType<typeof NotFound<{ resource: string; id: string }>>
  | ReturnType<typeof Forbidden<{ action: string }>>
  | ReturnType<typeof Validation<{ field: string; message: string }>>;

type User = { id: string; role: "admin" | "user" };
const DB: Record<string, User> = { u1: { id: "u1", role: "user" } };

const loadUser = (id: string): Result<User, AppError> =>
  id in DB ? ok(DB[id]!) : err(NotFound({ resource: "user", id }));

const requireAdmin = (u: User): Result<User, AppError> =>
  u.role === "admin" ? ok(u) : err(Forbidden({ action: "requires-admin" }));

const handle = (id: string): string =>
  pipe(
    loadUser(id),
    flatMap(requireAdmin),
    match({
      ok: (u) => `promoted ${u.id}`,
      err: (e) => {
        if (hasTag(e, "NotFound")) return `404: ${e.resource}/${e.id}`;
        if (hasTag(e, "Forbidden")) return `403: ${e.action}`;
        if (hasTag(e, "Validation")) return `422: ${e.field}`;
        return "unknown";
      },
    }),
  );

test("tagged error narrows correctly in the NotFound branch", () => {
  expect(handle("nope")).toBe("404: user/nope");
});

test("tagged error narrows correctly in the Forbidden branch", () => {
  expect(handle("u1")).toBe("403: requires-admin");
});

test("mapError preserves the tag discriminant", () => {
  const r: Result<User, AppError> = err(NotFound({ resource: "user", id: "x" }));
  const translated = mapError(r, (e) =>
    hasTag(e, "NotFound") ? Validation({ field: e.resource, message: `missing ${e.id}` }) : e,
  );
  expect(translated.ok).toBe(false);
  if (!translated.ok) {
    expect(hasTag(translated.error, "Validation")).toBe(true);
  }
});

test("hasTag rejects objects without matching _tag", () => {
  expect(hasTag({ resource: "user", id: "x" } as unknown, "NotFound")).toBe(false);
  expect(hasTag(null, "NotFound")).toBe(false);
  expect(hasTag("string", "NotFound")).toBe(false);
});
