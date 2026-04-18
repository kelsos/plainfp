# plainfp — monorepo

[![CI](https://github.com/kelsos/plainfp/actions/workflows/ci.yml/badge.svg)](https://github.com/kelsos/plainfp/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/plainfp.svg)](https://www.npmjs.com/package/plainfp)
[![codecov](https://codecov.io/gh/kelsos/plainfp/graph/badge.svg)](https://codecov.io/gh/kelsos/plainfp)
[![CodSpeed](https://img.shields.io/endpoint?url=https://codspeed.io/badge.json)](https://codspeed.io/kelsos/plainfp?utm_source=badge)
[![docs](https://img.shields.io/badge/docs-kelsos.net%2Fplainfp-blue.svg)](https://kelsos.net/plainfp/)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

This repo hosts the [`plainfp`](./packages/plainfp) package.

See [`packages/plainfp/README.md`](./packages/plainfp/README.md) for the library
documentation, install instructions, and API map.

## Development

```sh
pnpm install
pnpm check    # format + lint + types across the workspace
pnpm test     # run all test suites
pnpm build    # build every package
```

## Releasing

```sh
pnpm release  # runs changelogen in packages/plainfp: bumps version,
              # updates CHANGELOG.md, commits, tags, and pushes.
```

The pushed tag triggers `.github/workflows/release.yml`, which publishes to npm
with provenance via OIDC trusted publishing.

## License

MIT © Konstantinos Paparas
