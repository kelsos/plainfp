import { expect, test } from "vite-plus/test";
import { none, some } from "../option/constructors.ts";
import { toResult } from "../option/interop.ts";
import { filter, flatMap, map as mapOpt } from "../option/transform.ts";
import type { Option } from "../option/types.ts";
import { pipe } from "../pipe.ts";
import { ok } from "../result/constructors.ts";
import { toOption } from "../result/interop.ts";
import { flatMap as flatMapResult, map as mapResult } from "../result/transform.ts";
import type { Result } from "../result/types.ts";
import { getOr } from "../result/unwrap.ts";

// Integration: realistic Option ↔ Result round-trip through a lookup → validate
// → transform pipeline where missing-ness and validation-failure are distinct
// concerns.

type User = { id: string; name: string; age: number };
const USERS: Record<string, User> = {
  u1: { id: "u1", name: "Alice", age: 30 },
  u2: { id: "u2", name: "Bob", age: 12 },
};

type LookupError = { kind: "not-found"; id: string };
type ValidationError = { kind: "too-young"; age: number };
type AppError = LookupError | ValidationError;

const lookup = (id: string): Option<User> => (id in USERS ? some(USERS[id]!) : none);

const validateAdult = (u: User): Result<User, ValidationError> =>
  u.age >= 18 ? ok(u) : { ok: false, error: { kind: "too-young", age: u.age } };

const greet = (id: string): string =>
  pipe(
    lookup(id),
    toResult<AppError>({ kind: "not-found", id }),
    flatMapResult(validateAdult),
    mapResult((u) => `hello ${u.name}`),
    getOr("nobody"),
  );

test("interop: existing adult user → greeting", () => {
  expect(greet("u1")).toBe("hello Alice");
});

test("interop: missing user → fallback via Result.getOr", () => {
  expect(greet("does-not-exist")).toBe("nobody");
});

test("interop: existing but invalid user → fallback (validation distinguishes)", () => {
  expect(greet("u2")).toBe("nobody");
});

test("round-trip: toOption(toResult(some, _)) preserves value", () => {
  const original = some(42);
  const rt = toOption(toResult(original, "lost"));
  expect(rt).toEqual(some(42));
});

test("round-trip: toOption(toResult(none, _)) returns none (error discarded)", () => {
  const rt = toOption(toResult(none, "original-error"));
  expect(rt).toBe(none);
});

test("Option pipeline composing filter/map/flatMap with interop exit", () => {
  const pickAdult = (id: string): Result<string, "not-found" | "too-young"> =>
    pipe(
      lookup(id),
      filter((u): u is User => u.age >= 18),
      mapOpt((u: User) => u.name),
      flatMap((name: string) => (name.length > 0 ? some(name.toUpperCase()) : none)),
      toResult<"not-found" | "too-young">("not-found"),
    );
  expect(pickAdult("u1")).toEqual(ok("ALICE"));
  expect(pickAdult("u2").ok).toBe(false);
  expect(pickAdult("nope").ok).toBe(false);
});
