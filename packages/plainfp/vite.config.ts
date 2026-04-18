import codspeedPlugin from "@codspeed/vitest-plugin";
import { createRequire } from "node:module";
import { defineConfig } from "vite-plus";

// Workaround: @codspeed/vitest-plugin reads vitest's package.json to detect
// the major version, but pnpm overrides alias vitest to vite-plus-test
// (v0.1.18), so the plugin misdetects version 0 and falls back to the
// vitest 3 config path (poolOptions.forks.execArgv) which vitest 4 ignores.
// Provide execArgv directly so the V8 flags reach the benchmark workers.
function getCodSpeedExecArgv(): string[] | undefined {
  if (process.env.CODSPEED_ENV === undefined) return undefined;
  const require = createRequire(import.meta.url);
  const { getV8Flags } = require("@codspeed/core");
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
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.test.ts", "src/**/*.bench.ts", "src/**/index.ts"],
    },
  },
  lint: {
    ignorePatterns: ["dist/**", "node_modules/**"],
  },
  fmt: {},
});
