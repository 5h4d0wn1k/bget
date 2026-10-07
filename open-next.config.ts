/**
 * BGET — Build. Grow. Evolve. Together.
 * A global community of builders, scientists, makers and thinkers.
 * Character before capability.
 *
 * Foundation config: Next.js + TypeScript + Cloudflare Workers (OpenNext).
 *
 * Caching: this is a fully-static marketing site (marketing pages are
 * `force-static`, only `/admin` + `/api/*` are dynamic). The default "dummy"
 * cache re-rendered every page on every request (~1s each, occasional 1102
 * CPU-limit errors). The static-assets incremental cache serves the
 * build-time prerendered HTML straight from the ASSETS binding — near-zero CPU,
 * no revalidation needed. `enableCacheInterception` lets cached routes skip
 * the Next.js server entirely.
 */
import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
  enableCacheInterception: true,
});