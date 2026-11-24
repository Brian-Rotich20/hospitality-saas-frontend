// eslint-config-next 15.x ships legacy (eslintrc) configs; FlatCompat adapts them to
// ESLint 9 flat config. (The direct flat imports only work with eslint-config-next 16+.)
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) });

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Pre-existing code has ~110 `any`s that the previously broken config never reported.
      // Kept visible as warnings (and removed from files as they are touched) rather than
      // failing every build.
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  {
    ignores: [".next/**", "out/**", "build/**", "next-env.d.ts", ".agents/**"],
  },
];

export default eslintConfig;
