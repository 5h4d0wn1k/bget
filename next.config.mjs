/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export -> `out/`, deployed to Cloudflare Workers as static assets
  // (see wrangler.toml). The `main` worker script (worker/index.js) serves the
  // export through the ASSETS binding and handles the /api/* form endpoints.
  output: 'export',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
