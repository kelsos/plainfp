import codspeedPlugin from "@codspeed/vitest-plugin";
import { defineConfig } from "vite-plus";

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
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov", "json-summary"],
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.test.ts", "src/**/*.bench.ts", "src/**/index.ts"],
    },
  },
  lint: {
    ignorePatterns: ["dist/**", "node_modules/**"],
  },
  fmt: {},
});
