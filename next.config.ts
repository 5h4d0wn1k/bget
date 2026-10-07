/**
 * BGET — Build. Grow. Evolve. Together.
 * A global community of builders, scientists, makers and thinkers.
 * Character before capability.
 *
 * Foundation config: Next.js + TypeScript + Cloudflare Workers (OpenNext).
 * Marketing pages render statically by default; forms post to `/api/*`
 * routes (see `app/api/submit`); Discord delivery happens server-side.
 */
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  trailingSlash: false,
  images: { unoptimized: true }, // fully static output; no image optimizer on Workers
};

export default nextConfig;