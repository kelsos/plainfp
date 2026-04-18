import { expect, test } from "vite-plus/test";
import { z } from "zod";
import { fromZod } from "../interop/zod/index.ts";
import { pipe } from "../pipe.ts";
import { err, ok } from "../result/constructors.ts";
import { flatMap, map } from "../result/transform.ts";
import type { Result } from "../result/types.ts";
import { match } from "../result/unwrap.ts";

// Integration: the canonical "parse → validate → transform → handle" chain.
// Touches fromZod, Result.flatMap, Result.map, Result.match, pipe.

const UserInput = z.object({
  name: z.string(),
  age: z.number().int(),
  email: z.string().email(),
});
type UserInput = z.infer<typeof UserInput>;

type BusinessError =
  | { kind: "parse"; issues: z.ZodIssue[] }
  | { kind: "age-under-limit"; age: number }
  | { kind: "banned-email"; email: string };

const validateAge = (u: UserInput): Result<UserInput, BusinessError> =>
  u.age >= 18 ? ok(u) : err({ kind: "age-under-limit", age: u.age });

const validateEmailDomain = (u: UserInput): Result<UserInput, BusinessError> =>
  u.email.endsWith("@banned.example") ? err({ kind: "banned-email", email: u.email }) : ok(u);

type Greeting = { greeting: string };

const toGreeting = (u: UserInput): Greeting => ({
  greeting: `Welcome, ${u.name.trim()}!`,
});

const parseUser = fromZod(UserInput);

const process = (input: unknown): string =>
  pipe(
    parseUser(input),
    map((v) => v as UserInput),
    (r): Result<UserInput, BusinessError> =>
      r.ok ? ok(r.value) : err({ kind: "parse", issues: r.error.issues }),
    flatMap(validateAge),
    flatMap(validateEmailDomain),
    map(toGreeting),
    match({
      ok: (g) => g.greeting,
      err: (e) => {
        switch (e.kind) {
          case "parse":
            return `bad shape (${e.issues.length} issues)`;
          case "age-under-limit":
            return `too young: ${e.age}`;
          case "banned-email":
            return `rejected: ${e.email}`;
        }
      },
    }),
  );

test("full pipeline: valid input produces the greeting", () => {
  expect(process({ name: "  Alice  ", age: 30, email: "alice@ok.example" })).toBe(
    "Welcome, Alice!",
  );
});

test("full pipeline: parse failure short-circuits to the parse error branch", () => {
  expect(process({ name: "Alice" /* missing age, email */ })).toMatch(/bad shape/);
});

test("full pipeline: age-gate short-circuits without running subsequent steps", () => {
  const result = process({
    name: "Bob",
    age: 12,
    email: "bob@ok.example",
  });
  expect(result).toBe("too young: 12");
});

test("full pipeline: domain rule runs only after age gate passes", () => {
  expect(process({ name: "Carol", age: 40, email: "carol@banned.example" })).toBe(
    "rejected: carol@banned.example",
  );
});
