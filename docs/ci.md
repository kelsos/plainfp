# CI Guide

Operational notes for working with plainfp's CI and release pipeline. Written
to flag the non-obvious traps — the things that only burn you after they've
happened once.

## 1. Quick rules

- **Never disable `minimumReleaseAge` globally.** If a legitimate fresh dep
  must install, add it to the `minimumReleaseAgeExclude` allowlist in
  `pnpm-workspace.yaml` and explain why in a comment. The 7-day wall is the
  single most effective defense against chalk/debug-style flash attacks.
- **Never use `--no-verify`, `--force`, or `dangerouslyAllowAllBuilds`.** If a
  hook, signature, or build check fails, fix the root cause. These flags are
  escape hatches that defeat every security setting we've layered on.
- **Never `pnpm install` without `--frozen-lockfile` in CI.** Drift is silent
  and often not caught until a release goes wrong.
- **Never pin a GitHub Action to a floating tag (`@v4`).** Renovate manages the
  SHA pins; only write the SHA form.
- **Always benchmark locally on a quiescent machine**, never on shared CI
  runners. See "Benchmarking" below.

## 2. `pnpm` caveats specific to this repo

### `minimumReleaseAge` + transitive deps

When a Renovate PR bumps a direct dep, pnpm re-resolves the whole graph. If
any _transitive_ resolves to a version under 7 days old, the install fails
with `ERR_PNPM_NO_MATURE_MATCHING_VERSION` — even if that transitive wasn't
what Renovate was bumping.

**Mitigation:** Renovate retries on schedule. If a PR stays stuck, either
wait for the transitive to age, or add a scoped allowlist entry (prefer globs
like `@oxc-project/*` over individual binaries).

### Glob matching is pattern-based, not comma-list

`minimumReleaseAgeExclude: "a,b,c"` is parsed as _one_ literal package name
`a,b,c`. Use the YAML array form in `pnpm-workspace.yaml` or the
`minimum-release-age-exclude[]=` repeat-key form in `.npmrc`. Glob patterns
(`@voidzero-dev/*`) are supported since pnpm 10.17.

### `trustPolicy: no-downgrade`

If a dep loses its npm trusted-publisher status between releases (rare but
intentional attack signal), install fails. **Do not** bypass — investigate
the specific package in the error and decide whether to pin the previous
version or drop the dep. Don't paper over it.

### `ignoreScripts: true` + `strictDepBuilds: true`

No dep can run install-time scripts. plainfp has no native deps so this is
free. If you later add one (e.g., a dep with `postinstall`), you'll get a
hard error — evaluate whether you really need it, and if yes, allowlist via
`onlyBuiltDependencies` (pnpm 10) or `allowBuilds` (pnpm 11+).

### `packageManager` field + corepack

The `packageManager: "pnpm@10.33.0"` field pins the pnpm version used
everywhere — local dev, CI, release. Don't let it drift from the `engines.pnpm`
range. If you bump pnpm, bump both in the same commit.

## 3. Workflow-level caveats

### CI workflow

- **`pnpm -r` runs each package's script.** A script that only exists in the
  root (e.g., `commitlint`) will fail `-r` with "no matching script" — run
  those via `pnpm exec` or `pnpm run` (no `-r`).
- **Codecov upload is best-effort.** `fail_ci_if_error: false` is deliberate —
  Codecov outages shouldn't block merges. Check the coverage trend, not a
  single missing upload.
- **`test-zod-v3` mutates `package.json`** with `pnpm add -D zod@3`. This job
  must run in isolation — don't share its workspace with other jobs.
- **`commitlint` job needs `fetch-depth: 0`.** Without full history, the
  `--from base --to head` range can't resolve, and the job either passes
  trivially or fails mysteriously.

### Release workflow

- **OIDC requires a public repo + trusted publisher set up on npmjs.com.**
  Until that's configured, `pnpm publish --provenance` fails with an auth
  error. One-time setup: npm Package settings → Publishing access → Add
  trusted publisher → GitHub Actions → `kelsos/plainfp` → workflow file
  `release.yml`.
- **Tag must match `package.json` version exactly.** The "Verify tag"
  step enforces this. `v0.1.0` matches `"version": "0.1.0"`, nothing else.
- **`--no-git-checks` is required.** Tag-triggered builds are in detached
  HEAD state; without this flag pnpm refuses to publish.
- **A failed publish is not automatically retried.** npm won't accept the
  same version twice. If publish fails post-verify, bump the patch, re-tag.
- **`changelogen gh release` needs `contents: write` permission.** It
  creates the GitHub Release using the `GITHUB_TOKEN`. Don't narrow the
  permission block.

## 4. Supply-chain edge cases

- **A Renovate PR that changes an allowlisted package** still respects
  `minimumReleaseAge` — the allowlist only skips the age check, not the
  trust/signature checks. If trusted-publisher status dropped, the PR fails
  CI correctly.
- **Adding a new dep under a new scope** means updating both
  `minimumReleaseAgeExclude` (if we trust the scope globally) and usually
  nothing else. Think carefully before adding a scope to the allowlist —
  you're saying "I'll install <7-day-old versions from this scope without
  waiting". Reserve for ecosystems you've already committed to (vite-plus,
  Microsoft, etc.).
- **Never commit a lockfile from an environment with different pnpm settings.**
  The lockfile records resolved versions assuming your workspace settings;
  resolving with different settings can produce a different graph.
- **Don't edit `pnpm-lock.yaml` by hand.** Use `pnpm install` or `pnpm up`.
  Hand-edits bypass the integrity checks.

## 5. Benchmarking

We use **CodSpeed** (via `@codspeed/vitest-plugin` + `CodSpeedHQ/action`) to
get noise-free benchmark measurements in CI.

**Why it works despite CI being a noisy environment:** CodSpeed runs benches
under Valgrind and counts executed CPU instructions rather than measuring
wall-clock time. Instruction counts are deterministic — same code on the same
runner type produces identical counts across runs. Runner neighbours, thermal
throttling, and JIT warm-up don't affect the signal.

**What this means for PR review:**

- Every PR gets a CodSpeed comment with per-benchmark deltas. Regressions
  beyond the threshold (default 5%) fail the `bench` job and block the merge.
- Absolute instruction counts don't map to wall-clock time 1:1 — don't read
  them as ns/op. Read the *deltas* between baseline and PR.
- If a benchmark slowed down legitimately (e.g., a new safety check), update
  the baseline by merging the PR with the regression acknowledged; CodSpeed
  will use the post-merge counts as the new baseline for the next PR.

**Writing new benches:**

- Files named `*.bench.ts` under `packages/plainfp/src/` are picked up
  automatically.
- Keep each `bench()` block focused on one hot path. Include operation-count
  comparisons against a native baseline (`[].map` vs `plainfp Arrays.map`)
  where possible — deltas against a native baseline are more meaningful than
  absolute numbers.
- Don't put async work or I/O in a bench — CodSpeed measures CPU work, and
  awaiting a timer just adds unmeasured latency.

**Running locally:**

```sh
pnpm bench   # uses tinybench/vitest — wall-clock, approximate
```

Local wall-clock runs are for your own gut-check during development. **Do not
treat local numbers as a regression signal** — they vary run-to-run. The
CodSpeed CI job is the authority.

**One-time setup** (required before the `bench` job stops erroring on PRs):

1. Install the CodSpeed GitHub app on `kelsos/plainfp` (free for OSS).
2. Copy the repo token from CodSpeed's dashboard.
3. Add it as the `CODSPEED_TOKEN` repository secret on GitHub.

Until step 3 is done, the `bench` job will fail gracefully — it won't block
other jobs since it's not in any `needs:` chain.

## 6. Common failures and what they mean

| Error | What it means | Fix |
|---|---|---|
| `ERR_PNPM_NO_MATURE_MATCHING_VERSION` | A resolved dep is < 7 days old | Wait, or allowlist if trusted |
| `ERR_PNPM_FROZEN_LOCKFILE_WITH_OUTDATED_LOCKFILE` | `package.json` changed without updating lockfile | Run `pnpm install` locally, commit lockfile |
| `ERR_PNPM_TRUST_POLICY_DOWNGRADE` | Dep lost provenance/trusted-publisher | Investigate — don't bypass |
| `ERR_PNPM_STRICT_DEP_BUILDS` | A dep wants to run a build script | Verify legitimacy, then allowlist |
| `401 Unauthorized` on `pnpm publish` | OIDC trusted publisher not configured on npmjs.com | Configure in npm Package settings |
| `Tag v… does not match package.json version` | Manual tag without version bump | Use `pnpm release` — never tag by hand |
| Codecov upload skipped | Codecov has outage or token expired | Ignore once; investigate if recurring |
| Commitlint fails with "no commits" | PR job ran without `fetch-depth: 0` | Already set; if it recurs, check `actions/checkout` version |

## 7. Things we explicitly don't do (and why)

- **No `npm publish --force` or `--tag latest` overrides.** Publish flow is
  linear: bump, tag, CI verifies, publishes. Don't reach for escape hatches.
- **No hand-written `CHANGELOG.md` edits.** changelogen owns that file.
- **No CI-side `pnpm audit` gate.** Advisory data is noisy and often wrong for
  transitive-only issues. Run locally when triaging an actual incident.
- **No `lint-staged` standalone config.** `vp staged` (via `vp config` git
  hooks) replaces it in this stack.
- **No husky.** vite-plus ships its own hook manager; double-installing
  creates conflicts.

## 8. When in doubt

- Read the error message. pnpm 10 errors are unusually specific — the exact
  package + version + violation is in the output.
- Don't add workarounds to `.npmrc` / `pnpm-workspace.yaml` without a comment
  explaining _why_ and _when it can be removed_. Security settings tend to
  collect exceptions that outlive their original justification.
- If a CI change would weaken any hardening setting, open it as a separate,
  reviewed PR. Don't bury it alongside a feature.
