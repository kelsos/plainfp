# Security Policy

## Reporting a vulnerability

**Please do not open public GitHub issues for security vulnerabilities.**

Use GitHub's private vulnerability reporting:

1. Go to [Security → Report a vulnerability](https://github.com/kelsos/plainfp/security/advisories/new).
2. Describe the issue, affected versions, and a reproduction if you have one.
3. You'll get a response within **7 days** with triage status and next steps.

If for some reason GitHub's flow isn't available, email
**kelsos86@gmail.com** with `[plainfp security]` in the subject.

## What qualifies

- Remote code execution, prototype pollution, ReDoS, or other exploitable
  behaviour in any published `plainfp` code path.
- Supply-chain issues affecting a published version (e.g., a dependency
  bump shipped compromised code).
- Type-level assertions that let unsafe values cross module boundaries in a
  way consumers would reasonably treat as guaranteed.

Bugs that are merely correctness issues — wrong results, missing edge
cases, API surprises — belong in regular public issues.

## Supported versions

Only the latest minor release on the current major receives security fixes.
Pre-1.0 versions move forward; users pinned to an older 0.x are expected to
upgrade. Post-1.0, the previous major gets fixes for 6 months after a new
major lands.

| Version | Supported |
|---|---|
| 0.1.x (current) | ✅ |
| < 0.1.0 | ❌ |

## Disclosure

Coordinated disclosure. Once a fix is merged and released, the advisory is
published with credit to the reporter unless they prefer anonymity.

## What we do proactively

- `pnpm install` blocks packages under 7 days old (flash-attack defense).
- `trustPolicy: no-downgrade` fails installs if a dep loses provenance.
- All lifecycle scripts are blocked by default; no dep can run code at
  install time unless explicitly allowlisted.
- All GitHub Actions are pinned to full commit SHAs and updated by Renovate.
- Releases are published via OIDC trusted publishing with npm provenance
  attestations.
- See [`docs/ci.md`](./docs/ci.md) for the full supply-chain posture.
