/**
 * BGET — Build. Grow. Evolve. Together.
 * A global community of builders, scientists, makers and thinkers.
 * Character before capability.
 *
 * Foundation config: Next.js + TypeScript + Cloudflare Workers (OpenNext/vinext).
 * Marketing pages are statically generated (force-static); forms use Server
 * Actions backed by D1; Discord delivery happens server-side.
 */
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  trailingSlash: false,
  images: { unoptimized: true }, // fully static output; no image optimizer on Workers
  experimental: {
    // Server Actions are the form backbone (App Router default in Next 15+).
  },
};

export default nextConfig;