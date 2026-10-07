import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Cloudflare/OpenNext build output:
    ".open-next/**",
    ".wrangler/**",
    ".wrangler-dryrun/**",
    // One-off asset tooling (sticker/riso generation). CommonJS helpers run by
    // hand, outside the app's module surface and not part of any build step.
    // Linting them only ever reported `require()` style imports, and it broke
    // `npm run lint` in CI on a commit that added them.
    "scripts/**",
  ]),
]);

export default eslintConfig;
