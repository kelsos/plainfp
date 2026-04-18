# Contributing to plainfp

Thanks for wanting to help. This is a small library with a deliberately small
scope — readable FP utilities for TypeScript, no category theory. Contributions
that stay inside that scope are welcome.

## Quick start

```sh
# Prereqs: Node 24+, pnpm 10+
corepack enable
pnpm install
pnpm check   # format + lint + types across the workspace
pnpm test    # run all test suites
```

First time working in the repo? Also run once:

```sh
pnpm --filter plainfp exec vp config    # installs pre-commit git hooks
```

That wires `vp staged` into a pre-commit hook so formatting and lint run on
the files you touch, automatically.

## Before you open a PR

- `pnpm check && pnpm test` must pass.
- Your changes should include tests. Colocate them as `foo.test.ts` alongside
  `foo.ts`.
- If your change has a measurable perf impact, add a bench in `foo.bench.ts`.
  CodSpeed will diff it against main.
- Commit messages must follow [Conventional Commits](https://www.conventionalcommits.org/):
  `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `perf:`, `test:`, with an
  optional scope like `feat(arrays): add zip`. Commitlint will enforce this in
  CI.

## Design guardrails

Proposals that go against these will likely be closed:

- **No HKTs, typeclasses, `Functor`/`Monad`/`Either`/`Maybe` vocabulary.** The
  whole point of plainfp is to avoid these. Use `Result`, `Option`, `ok`,
  `err`, `flatMap`.
- **No fluent method chains.** Data-first + pipe-friendly, or data-first
  only. Never `result.map(f).flatMap(g)` class-style.
- **Plain objects, not classes.** `Result` is `{ ok, value } | { ok, error }`.
  Nothing that requires `instanceof` to work.
- **ESM-only.** No CJS fallbacks.
- **Tree-shakeable by default.** `sideEffects: false` is sacred. No
  top-level side effects in any module.
- **Dual API only where pipe benefits from it.** Not every function needs
  curried overloads; only the ones that naturally flow into `pipe`.
- **Named exports, never default exports** (except where a third-party plugin
  convention forces it).

## Adding a new namespace

1. Create `packages/plainfp/src/<name>/` with `index.ts` + focused submodules.
2. Colocate tests.
3. Add an entry in `packages/plainfp/vite.config.ts` under `pack.entry`.
4. Add a subpath export in `packages/plainfp/package.json` under `exports`.
5. Re-export from `packages/plainfp/src/index.ts` as `export * as <Name>`.
6. Update the API map in `packages/plainfp/README.md`.

## Releasing

Maintainer-only. From the repo root:

```sh
pnpm release   # changelogen bumps version, writes CHANGELOG.md, tags, pushes
```

The pushed tag triggers the release workflow which publishes to npm with
provenance. See [`docs/ci.md`](./docs/ci.md) for the full release pipeline
and gotchas.

## Reporting bugs

Use GitHub issues for correctness bugs, missing cases, API papercuts, and
documentation problems. For **security** issues, see
[`SECURITY.md`](./SECURITY.md) — do not file a public issue.

## License

By contributing, you agree that your contributions will be licensed under the
[MIT license](./LICENSE) that covers the project.
