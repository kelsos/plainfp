# plainfp — monorepo

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
