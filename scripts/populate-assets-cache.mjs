/**
 * BGET — deploy helper
 * Copies the OpenNext route cache (`.open-next/cache`) into the Workers static
 * assets directory (`.open-next/assets/cdn-cgi/_next_cache`) so the
 * StaticAssetsIncrementalCache (open-next.config.ts) can serve build-time
 * prerendered pages straight from the ASSETS binding.
 *
 * This mirrors `populateStaticAssetsIncrementalCache` from
 * `@opennextjs/cloudflare/dist/cli/commands/populate-cache.js` (which `wrangler
 * deploy` alone does NOT run). Idempotent; safe to run on every build.
 */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const cacheDir = path.join(root, ".open-next", "cache");
const destDir = path.join(root, ".open-next", "assets", "cdn-cgi", "_next_cache");

if (!fs.existsSync(cacheDir)) {
  console.warn("populate-assets-cache: .open-next/cache not found — skipping (nothing cached)");
  process.exit(0);
}

fs.rmSync(destDir, { recursive: true, force: true });
fs.cpSync(cacheDir, destDir, { recursive: true });
console.log("populate-assets-cache: copied route cache into static assets -> cdn-cgi/_next_cache");