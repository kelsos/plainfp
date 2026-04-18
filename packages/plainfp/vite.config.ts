import { createRequire } from "node:module";
import codspeedPlugin from "@codspeed/vitest-plugin";
import { defineConfig } from "vite-plus";

// Workaround for CodSpeed + vite-plus:
// @codspeed/vitest-plugin reads vitest's package.json to detect the major
// version and picks the v3 vs v4 execArgv injection path accordingly. Our
// pnpm override aliases `vitest` to `@voidzero-dev/vite-plus-test@0.1.18`,
// so the plugin sees major version 0 and falls back to the v3 path
// (`poolOptions.forks.execArgv`), which vitest 4 ignores — CodSpeed's
// `--allow-natives-syntax` flag never reaches the benchmark worker and
// `%OptimizeFunctionOnNextCall` throws a SyntaxError.
//
// Fix: when CodSpeed is running the benches (`CODSPEED_ENV` set by the
// action), resolve V8 flags from @codspeed/core ourselves and inject them
// into vitest 4's top-level `execArgv`.
function getCodSpeedExecArgv(): string[] | undefined {
  if (process.env["CODSPEED_ENV"] === undefined) return undefined;
  const require = createRequire(import.meta.url);
  const { getV8Flags } = require("@codspeed/core") as { getV8Flags: () => string[] };
  return getV8Flags();
}

const codspeedExecArgv = getCodSpeedExecArgv();

export default defineConfig({
  plugins: [codspeedPlugin()],
  pack: {
    entry: [
      "src/index.ts",
      "src/pipe.ts",
      "src/result/index.ts",
      "src/option/index.ts",
      "src/arrays/index.ts",
      "src/records/index.ts",
      "src/strings/index.ts",
      "src/predicates/index.ts",
      "src/functions/index.ts",
      "src/result-async/index.ts",
      "src/brand/index.ts",
      "src/non-empty-array/index.ts",
      "src/tagged/index.ts",
      "src/interop/zod/index.ts",
    ],
    external: ["zod"],
    format: "esm",
    dts: true,
    sourcemap: true,
    platform: "neutral",
    outDir: "dist",
    clean: true,
    target: "es2022",
  },
  test: {
    include: ["src/**/*.test.ts"],
    benchmark: {
      include: ["src/**/*.bench.ts"],
    },
    ...(codspeedExecArgv && { execArgv: codspeedExecArgv }),
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov", "json-summary"],
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.test.ts", "src/**/*.bench.ts", "src/**/index.ts"],
    },
  },
  lint: {
    ignorePatterns: ["dist/**", "node_modules/**", "docs/api/**"],
  },
  fmt: {
    ignorePatterns: ["dist/**", "node_modules/**", "docs/api/**"],
  },
});
