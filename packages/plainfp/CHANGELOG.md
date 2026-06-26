# Changelog

## v0.1.1

[compare changes](https://github.com/kelsos/plainfp/compare/v0.1.0...v0.1.1)

### 🚀 Enhancements

- **result:** Add build/field/value Do-style builder ([4ba116c](https://github.com/kelsos/plainfp/commit/4ba116c))
- **option:** Add build/field/value Do-style builder ([c21a8ee](https://github.com/kelsos/plainfp/commit/c21a8ee))
- **result-async:** Add build/field/value Do-style builder ([922adeb](https://github.com/kelsos/plainfp/commit/922adeb))

### 📖 Documentation

- Fix branded-type make() signature in README example ([e882f94](https://github.com/kelsos/plainfp/commit/e882f94))
- **skill:** Add plainfp Claude Code skill with install instructions ([0e32ab4](https://github.com/kelsos/plainfp/commit/0e32ab4))
- **skill:** Clarify ResultAsync is Promise<Result>, add combinator/flow/zod recipes ([3dabefa](https://github.com/kelsos/plainfp/commit/3dabefa))
- **skill:** Document pipe/flow chaining for ResultAsync ([02e5982](https://github.com/kelsos/plainfp/commit/02e5982))
- **skill:** Add local fetchJson ResultAsync helper recipe ([a31cb7b](https://github.com/kelsos/plainfp/commit/a31cb7b))
- **skill:** Add Do-style builder recipe and exports ([7c593bc](https://github.com/kelsos/plainfp/commit/7c593bc))

### 🏡 Chore

- **ci:** Bump setup-node to v6.4.0 and pnpm/action-setup to v6.0.3 ([761629b](https://github.com/kelsos/plainfp/commit/761629b))

### 🤖 CI

- Source Node version from .nvmrc outside the test matrix ([399cb95](https://github.com/kelsos/plainfp/commit/399cb95))
- **deps:** Update pinned GitHub Actions to latest ([4c98f08](https://github.com/kelsos/plainfp/commit/4c98f08))
- Harden workflows to pass zizmor --pedantic ([1297f0e](https://github.com/kelsos/plainfp/commit/1297f0e))
- Bump attw to 0.18.3 to fix packaging-hygiene crash ([d7004a4](https://github.com/kelsos/plainfp/commit/d7004a4))

### ❤️ Contributors

- Konstantinos Paparas <kelsos86@gmail.com>

## v0.1.0

### 🚀 Enhancements

- **result,option:** Add tap/tapError + tap/tapNone ([669d5b9](https://github.com/kelsos/plainfp/commit/669d5b9))
- **option,result:** Option.all/any/zip + Option↔Result interop ([16d89f3](https://github.com/kelsos/plainfp/commit/16d89f3))

### 🔥 Performance

- Add benches for Option, ResultAsync, and Records ([a4b6d4f](https://github.com/kelsos/plainfp/commit/a4b6d4f))

### 🩹 Fixes

- **ci:** Inject CodSpeed V8 flags via vitest execArgv ([ea43477](https://github.com/kelsos/plainfp/commit/ea43477))
- **result-async:** Propagate factory rejections in allWithConcurrency + fill coverage gaps ([25bae7a](https://github.com/kelsos/plainfp/commit/25bae7a))

### 📖 Documentation

- Add TSDoc across public APIs and auto-publish TypeDoc site ([377d35d](https://github.com/kelsos/plainfp/commit/377d35d))
- Sync README API map with current exports ([30549a3](https://github.com/kelsos/plainfp/commit/30549a3))

### 🏡 Chore

- Initial commit ([02fe78c](https://github.com/kelsos/plainfp/commit/02fe78c))

### ✅ Tests

- Property-based tests for Result/Option/Arrays/pipe laws ([5153437](https://github.com/kelsos/plainfp/commit/5153437))
- Add integration suite covering cross-module compositions ([003916b](https://github.com/kelsos/plainfp/commit/003916b))

### 🤖 CI

- Wire CodSpeed OIDC, Codecov, and status badges ([f9077da](https://github.com/kelsos/plainfp/commit/f9077da))

### ❤️ Contributors

- Konstantinos Paparas <kelsos86@gmail.com>
