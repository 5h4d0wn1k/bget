import { defineConfig } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
  ...nextCoreWebVitals,
  {
    ignores: ["node_modules/**", ".next/**", ".open-next/**", ".wrangler/**", "out/**", "wrangler/**", "public/**"],
  },
]);