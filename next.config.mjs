/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export -> `out/`, deployed to Cloudflare Workers as static assets
  // (see wrangler.toml). No server code; add a `main` worker script later if
  // the site needs dynamic routes.
  output: 'export',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
