# plainfp — Claude Code skill

[`SKILL.md`](./SKILL.md) teaches Claude Code to write idiomatic plainfp: the
exact export names, the dual data-first/curried API, subpath imports, and the
naming conventions that differ from neverthrow / fp-ts / Effect (notably `getOr`,
not `unwrapOr` / `getOrElse`).

This directory is the canonical source. It is already active when you work
**inside this repo**. To use it in **other** codebases that depend on plainfp,
install it into your global or project skills directory.

## Install

### Global (available in every project)

```sh
mkdir -p ~/.claude/skills/plainfp
curl -fsSL https://raw.githubusercontent.com/kelsos/plainfp/main/.claude/skills/plainfp/SKILL.md \
  -o ~/.claude/skills/plainfp/SKILL.md
```

Or, if you have the repo checked out locally:

```sh
mkdir -p ~/.claude/skills/plainfp
cp /path/to/plainfp/.claude/skills/plainfp/SKILL.md ~/.claude/skills/plainfp/SKILL.md
```

### Per-project (commit it to a consumer repo)

```sh
mkdir -p .claude/skills/plainfp
curl -fsSL https://raw.githubusercontent.com/kelsos/plainfp/main/.claude/skills/plainfp/SKILL.md \
  -o .claude/skills/plainfp/SKILL.md
```

## Verify

In a Claude Code session, the skill is available when listed under
`/skills` (or referenced automatically when you edit code that imports from
`plainfp` / `plainfp/*`). It activates on plainfp-related tasks — see the
`description` in `SKILL.md` for the trigger conditions.

## Keeping it current

The skill's API map mirrors the package's subpath exports. When plainfp's public
API changes, update `SKILL.md` in the same change so installed copies can be
re-pulled. The source of truth is this file in the repo.
