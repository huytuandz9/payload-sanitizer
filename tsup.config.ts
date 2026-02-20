import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs", "iife"],
  globalName: "PayloadSanitizer",
  dts: true,
  sourcemap: true,
  clean: true,
  minify: true,
  treeshake: true,
});
