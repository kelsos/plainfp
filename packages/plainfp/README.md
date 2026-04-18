# plainfp

[![npm](https://img.shields.io/npm/v/plainfp.svg)](https://www.npmjs.com/package/plainfp)
[![codecov](https://codecov.io/gh/kelsos/plainfp/graph/badge.svg)](https://codecov.io/gh/kelsos/plainfp)
[![CodSpeed](https://img.shields.io/endpoint?url=https://codspeed.io/badge.json)](https://codspeed.io/kelsos/plainfp?utm_source=badge)
[![docs](https://img.shields.io/badge/docs-kelsos.net%2Fplainfp-blue.svg)](https://kelsos.net/plainfp/)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

A plain, readable functional programming library for TypeScript.

Borrows the best ideas from neverthrow, fp-ts, Effect, and Remeda — but drops the
category-theory jargon. If you know `map`, `filter`, and `async/await`, you already
know how to read this library.

- **Plain objects, plain names.** `Result` is `{ ok: true, value } | { ok: false, error }`.
  No classes, no `_tag`, no `instanceof`. JSON-safe by default.
- **`pipe` + `flow` as the only composition primitives.** No HKTs, no typeclasses.
- **Dual API.** Every transform works data-first (`map(xs, fn)`) or curried
  for `pipe` (`map(fn)`).
- **Tree-shakable.** ESM-only, `sideEffects: false`, per-namespace subpath exports.
- **Async-first.** `ResultAsync` ships with `retry`, `timeout`, and
  `allWithConcurrency` built in.

## Install

```sh
pnpm add plainfp
# or
npm install plainfp
```

Node 24+ required. Zod is an optional peer dep (v3 or v4) for the schema
interop.

## At a glance

### Result — explicit error handling

```ts
import { pipe } from "plainfp";
import { ok, err, map, flatMap, match } from "plainfp/result";

const parseAge = (s: string) => {
  const n = Number(s);
  return Number.isInteger(n) && n >= 0 ? ok(n) : err(`bad age: ${s}`);
};

const result = pipe(
  parseAge("42"),
  map((n) => n + 1),
  flatMap((n) => (n < 150 ? ok(n) : err("too old"))),
  match({
    ok: (n) => `you are ${n}`,
    err: (e) => `error: ${e}`,
  }),
);
// "you are 43"
```

### Option — nullable values, handled

```ts
import { pipe } from "plainfp";
import { some, none, fromNullable, map, getOr } from "plainfp/option";

const name = pipe(
  fromNullable(users[id]),
  map((u) => u.name),
  getOr("anonymous"),
);
```

### ResultAsync — errors + async, with retry and timeout

```ts
import { pipe } from "plainfp";
import {
  fromPromise,
  map,
  flatMap,
  retry,
  timeout,
  allWithConcurrency,
} from "plainfp/result-async";

// Fetch with timeout
const user = await pipe(
  fromPromise(
    fetch(`/users/${id}`).then((r) => r.json()),
    (e) => ({ kind: "network", cause: e }),
  ),
  timeout(5_000, () => ({ kind: "timeout" as const })),
  map((raw) => raw as User),
);

// Retry with exponential backoff
const payment = await retry(
  () => fromPromise(charge(cardId), (e) => ({ kind: "charge-failed", cause: e })),
  { times: 3, delayMs: 100, backoff: "exponential" },
);

// Capped concurrency — max 3 uploads at a time
const uploads = await allWithConcurrency(
  files.map((f) => () => uploadFile(f)),
  3,
);
```

### Arrays — data-first, pipe-friendly

```ts
import { pipe } from "plainfp";
import { filter, groupBy, sumBy } from "plainfp/arrays";
import { mapValues } from "plainfp/records";

const totalsByCustomer = pipe(
  orders,
  filter((o) => o.status === "paid"),
  groupBy((o) => o.customerId),
  mapValues((os) => sumBy(os, (o) => o.amount)),
);
```

### Zod interop — parse into `Result`

```ts
import { z } from "zod";
import { fromZod } from "plainfp/interop/zod";

const User = z.object({ id: z.string(), age: z.number().int().nonnegative() });
const parseUser = fromZod(User);
// (input: unknown) => Result<{ id: string; age: number }, z.ZodError>

const result = parseUser(JSON.parse(body));
if (result.ok) send(result.value);
else console.error(result.error.issues);
```

### Branded types — nominal typing without runtime cost

```ts
import type { Brand } from "plainfp/brand";
import { make } from "plainfp/brand";

type UserId = Brand<string, "UserId">;
type Email = Brand<string, "Email">;

const id: UserId = make<UserId>("u-123");
const addr: Email = make<Email>("a@b.com");

// @ts-expect-error — can't pass an Email where a UserId is expected
lookupUser(addr);
```

### Tagged errors — discriminated error unions

```ts
import { tag, hasTag } from "plainfp/tagged";

const NetworkError = tag("NetworkError");
const ValidationError = tag("ValidationError");

type AppError = ReturnType<typeof NetworkError> | ReturnType<typeof ValidationError>;

const e: AppError = NetworkError({ url: "/users", status: 503 });

if (hasTag(e, "NetworkError")) {
  console.error("network:", e.status);
}
```

### NonEmptyArray — compile-time non-emptiness

```ts
import { of, head, map } from "plainfp/non-empty-array";

const names = of("alice", "bob", "charlie");
const first: string = head(names); // no Option, no undefined
```

## API map

| Subpath                   | Contents                                                                                                                                                           |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `plainfp`                 | `pipe`, `flow`, `ok`, `err`, `some`, `none` + every namespace                                                                                                      |
| `plainfp/pipe`            | `pipe`, `flow`                                                                                                                                                     |
| `plainfp/result`          | `ok`, `err`, `fromNullable`, `fromThrowable`, `map`, `mapError`, `flatMap`, `tap`, `tapError`, `all`, `any`, `zip`, `getOr`, `match`, `isOk`, `isErr`, `toOption`  |
| `plainfp/result-async`    | `fromPromise`, `fromAsync`, `ok`, `err`, `map`, `mapError`, `flatMap`, `tap`, `tapError`, `all`, `allWithConcurrency`, `retry`, `timeout`, `getOr`, `match`        |
| `plainfp/option`          | `some`, `none`, `fromNullable`, `map`, `flatMap`, `filter`, `tap`, `tapNone`, `all`, `any`, `zip`, `getOr`, `match`, `isSome`, `isNone`, `toResult`                |
| `plainfp/arrays`          | `map`, `filter`, `flatMap`, `reduce`, `groupBy`, `partition`, `chunk`, `find`, `findIndex`, `includes`, `sumBy`, `countBy`, `minBy`, `maxBy`, `unique`, `uniqueBy` |
| `plainfp/records`         | `get`, `getOr`, `keys`, `values`, `entries`, `mapValues`, `mapKeys`, `filter`                                                                                      |
| `plainfp/strings`         | `split`, `trim`, `capitalize`, `lowercase`, `uppercase`, `isEmpty`, `startsWith`, `endsWith`, `lines`                                                              |
| `plainfp/predicates`      | `and`, `or`, `not`, `isString`, `isNumber`, `isBoolean`, `isDefined`, `isNullish`, `isArray`, `isObject`, `isFunction`                                             |
| `plainfp/functions`       | `identity`, `constant`, `tap`, `memoize`, `noop`                                                                                                                   |
| `plainfp/brand`           | `Brand<T, K>`, `make`, `UnBrand`                                                                                                                                   |
| `plainfp/non-empty-array` | `NonEmptyArray<T>`, `of`, `fromArray`, `head`, `tail`, `last`, `map`                                                                                               |
| `plainfp/tagged`          | `Tagged<Tag, Data>`, `tag`, `hasTag`                                                                                                                               |
| `plainfp/interop/zod`     | `fromZod`, `fromZodAsync` (optional peer: `zod` v3 or v4)                                                                                                          |

## Design choices

**Why `ok`/`err` instead of `Right`/`Left`?** Because `right-handed success` means
nothing to someone who hasn't read a Haskell textbook. `ok` means ok.

**Why `flatMap` instead of `chain` or `bind`?** Because `Array.prototype.flatMap`
already taught JS developers what it means.

**Why plain objects instead of classes?** So you can `JSON.stringify` a `Result`,
pattern-match with `switch (r.ok)`, and send it over the wire. No hidden state.

**Why dual API?** So `map(xs, fn)` reads naturally at a call site, and
`pipe(xs, map(fn))` reads naturally in a pipeline. You don't pay for one style
in the other.

**Why no HKTs / typeclasses?** Because 99% of the time you want `Result.map`, not
`Functor.map`. The extra abstraction makes error messages worse and the learning
curve steeper without paying for itself in day-to-day code.

## Tree-shaking

The library is aggressively tree-shakable:

```ts
// Import only what you use from the barrel — bundlers will drop the rest.
import { pipe } from "plainfp"; // ~84 B minified
import { ok } from "plainfp"; // ~46 B minified

// For maximum tree-shaking, import from the subpath directly.
import { map, ok } from "plainfp/result"; // ~172 B minified
```

Namespace imports (`import { Result } from "plainfp"` → `Result.map(…)`) work
too and stay under ~1.3 KB on esbuild. Rollup-based bundlers (Vite, Rolldown)
do even better.

## License

MIT © Konstantinos Paparas
