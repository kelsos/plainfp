---
name: plainfp
description: Write idiomatic plainfp code — the plain TypeScript FP library (Result, Option, ResultAsync, pipe/flow, and namespaced helpers). Use when reading or writing code that imports from "plainfp" or any "plainfp/*" subpath, when modeling errors with Result/Option instead of throwing, or when composing data transforms with pipe/flow. Covers the exact export names, the dual data-first/curried API, subpath imports, and the naming conventions that differ from neverthrow/fp-ts/Effect (e.g. getOr, not unwrapOr/getOrElse).
---

# Working with plainfp

plainfp is a plain, readable FP library for TypeScript. Plain objects, plain
names, no category theory. If you know `map`, `filter`, and `async/await`, you
can read it. When writing plainfp code, match these conventions exactly — most
mistakes come from importing fp-ts / neverthrow / Effect habits.

## The two rules that prevent most errors

1. **The fallback extractor is `getOr`, NOT `unwrapOr` / `getOrElse` / `withDefault`.**
   plainfp deliberately uses the fp-ts/Effect `getOr` name across `Result`,
   `Option`, `ResultAsync`, and `Records`. There is no `unwrapOr`. Replace any
   hand-written `result.ok ? result.value : fallback` with `Result.getOr(result, fallback)`.

2. **Every transform is dual: data-first OR curried.** Call it directly
   (`map(xs, fn)`) or one-arg to get a `pipe` step (`map(fn)`). The curried form
   is what goes inside `pipe`/`flow`.

```ts
import { pipe } from "plainfp";
import { getOr, map } from "plainfp/result";

Result.getOr(result, "0");            // data-first
pipe(readBalance(addr), map(fmt), getOr("0"));  // curried steps
```

## Core data types are plain objects (JSON-safe, no classes)

```ts
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };
type Option<T>    = { some: true; value: T } | { some: false };
type ResultAsync<T, E> = Promise<Result<T, E>>; // literally just a Promise
```

So you can `JSON.stringify` them, narrow with `if (r.ok)` / `if (o.some)`, and
send them over the wire. There is no `_tag`, no `instanceof`, no `.isOk()` method
— `isOk(r)` / `isErr(r)` / `isSome(o)` / `isNone(o)` are standalone type guards.

`ResultAsync<T, E>` is **just `Promise<Result<T, E>>`** — not a chainable
thenable class like neverthrow's. You `await` it to get a plain `Result`, and you
compose it with `pipe` + the curried `result-async` helpers; there is no
`.map().mapErr()` method chaining. Rejection is never used to signal failure —
errors live in the resolved `err` branch.

## Imports — prefer subpaths

Each namespace has a tree-shakable subpath. Import the bare helpers from the
subpath, and `pipe`/`flow`/constructors from the barrel.

```ts
import { pipe, flow } from "plainfp";
import { ok, err, map, flatMap, match } from "plainfp/result";
import { some, none, fromNullable } from "plainfp/option";
import { fromPromise, retry, timeout } from "plainfp/result-async";
```

Namespace imports also work and read well at call sites:
`import { Result, Option } from "plainfp"` → `Result.map(...)`. Both `map`s exist
in several namespaces, so when importing bare names from multiple subpaths, alias
or use namespace imports to avoid collisions.

## Subpath → exports (authoritative)

| Subpath | Exports |
| --- | --- |
| `plainfp` | `pipe`, `flow`, `ok`, `err`, `some`, `none` + every namespace |
| `plainfp/pipe` | `pipe`, `flow` |
| `plainfp/result` | `ok`, `err`, `fromNullable`, `fromThrowable`, `map`, `mapError`, `flatMap`, `tap`, `tapError`, `all`, `any`, `zip`, `getOr`, `match`, `isOk`, `isErr`, `toOption` |
| `plainfp/result-async` | `fromPromise`, `fromAsync`, `ok`, `err`, `map`, `mapError`, `flatMap`, `tap`, `tapError`, `all`, `allWithConcurrency`, `retry`, `timeout`, `getOr`, `match` |
| `plainfp/option` | `some`, `none`, `fromNullable`, `map`, `flatMap`, `filter`, `tap`, `tapNone`, `all`, `any`, `zip`, `getOr`, `match`, `isSome`, `isNone`, `toResult` |
| `plainfp/arrays` | `map`, `filter`, `flatMap`, `reduce`, `groupBy`, `partition`, `chunk`, `find`, `findIndex`, `includes`, `sumBy`, `countBy`, `minBy`, `maxBy`, `unique`, `uniqueBy` |
| `plainfp/records` | `get`, `getOr`, `keys`, `values`, `entries`, `mapValues`, `mapKeys`, `filter` |
| `plainfp/strings` | `split`, `trim`, `capitalize`, `lowercase`, `uppercase`, `isEmpty`, `startsWith`, `endsWith`, `lines` |
| `plainfp/predicates` | `and`, `or`, `not`, `isString`, `isNumber`, `isBoolean`, `isDefined`, `isNullish`, `isArray`, `isObject`, `isFunction` |
| `plainfp/functions` | `identity`, `constant`, `tap`, `memoize`, `noop` |
| `plainfp/brand` | `Brand<T, K>`, `make`, `UnBrand` |
| `plainfp/non-empty-array` | `NonEmptyArray<T>`, `of`, `fromArray`, `head`, `tail`, `last`, `map` |
| `plainfp/tagged` | `Tagged<Tag, Data>`, `tag`, `hasTag` |
| `plainfp/interop/zod` | `fromZod`, `fromZodAsync` (optional `zod` v3/v4 peer dep) |

## Common recipes

**Replace try/catch and nullable returns:**
```ts
import { fromThrowable, fromNullable } from "plainfp/result";
const parsed = fromThrowable(() => JSON.parse(raw), (e) => ({ kind: "bad-json", cause: e }));
const found  = fromNullable(map.get(id), () => ({ kind: "not-found" }));
```

**Compose a Result pipeline and fold at the end:**
```ts
pipe(
  parseAge(input),
  map((n) => n + 1),
  flatMap((n) => (n < 150 ? ok(n) : err("too old"))),
  match({ ok: (n) => `age ${n}`, err: (e) => `error: ${e}` }),
);
```

**`flow` — build a reusable function from curried steps (point-free):**
`pipe` runs a value through steps now; `flow` composes the same steps into a
named function you can reuse. `flow(f, g)` is `(x) => g(f(x))`.
```ts
import { flow } from "plainfp";
import { map, flatMap, getOr } from "plainfp/result";

const formatBalance = flow(
  map((n: number) => n / 1e18),
  map((n) => n.toFixed(4)),
  getOr("0"),
);
formatBalance(readBalance(addr)); // reuse on many inputs
```

**Validate with Zod → `Result` (`plainfp/interop/zod`):**
```ts
import { z } from "zod";
import { fromZod, fromZodAsync } from "plainfp/interop/zod";

const User = z.object({ id: z.string(), age: z.number() });
const parseUser = fromZod(User);     // (input: unknown) => Result<User, z.ZodError>
const r = parseUser(JSON.parse(body));
if (r.ok) save(r.value);
else console.error(r.error.issues);

// Schemas with async refinements/transforms: fromZod THROWS — use fromZodAsync,
// which returns a ResultAsync (Promise<Result<…>>).
const parseSignup = fromZodAsync(Signup);
const res = await parseSignup(formData);
```

**Async with timeout / retry / capped concurrency:**
```ts
import { fromPromise, timeout, retry, allWithConcurrency } from "plainfp/result-async";

await pipe(
  fromPromise(fetch(url).then((r) => r.json()), (e) => ({ kind: "network", cause: e })),
  timeout(5_000, () => ({ kind: "timeout" as const })),
);

await retry(() => fromPromise(charge(id), (e) => ({ kind: "charge-failed", cause: e })),
  { times: 3, delayMs: 100, backoff: "exponential" }); // backoff: "linear" | "exponential"

await allWithConcurrency(files.map((f) => () => uploadFile(f)), 3); // (factories, concurrency)
```

**Branded types — `make` takes TWO type args (base, tag):**
```ts
import type { Brand } from "plainfp/brand";
import { make } from "plainfp/brand";
type UserId = Brand<string, "UserId">;
const id: UserId = make<string, "UserId">("u-123"); // NOT make<UserId>(...)
```

**Tagged error unions:**
```ts
import { tag, hasTag } from "plainfp/tagged";
const NetworkError = tag("NetworkError");
const e = NetworkError({ url: "/users", status: 503 });
if (hasTag(e, "NetworkError")) console.error(e.status);
```

**Combining `Result`/`Option` (`all` / `any` / `zip`):**
```ts
all([ok(1), ok(2)]);        // ok([1, 2])  — all succeed, else first err
any([err("a"), ok(2)]);     // ok(2)       — first success, else collects errors
zip(ok(1), ok("x"));        // ok([1, "x"]) — pair two into a tuple
```
For `result-async`, `all` resolves the same way over a list of `ResultAsync`,
and `allWithConcurrency(factories, n)` caps how many run at once.

**Cross-type interop:** `Result.toOption(r)`, `Option.toResult(o, onNone)`.

## Gotchas

- No `unwrapOr`, no `.unwrap()` that throws, no method chaining — it's all free
  functions + `pipe`.
- `getOr` exists on `Result`, `Option`, `ResultAsync`, and `Records` (keyed
  default). Pick the one matching the value you hold.
- `retry` throws `RangeError` if `times < 1`; `allWithConcurrency` throws if
  `concurrency < 1`. These are programmer errors, not `err` results.
- `timeout` does not cancel the underlying promise — it just resolves `err`
  first; the original work keeps running.
- ESM-only, Node 24+. `zod` is an optional peer dep — only `plainfp/interop/zod`
  needs it.
