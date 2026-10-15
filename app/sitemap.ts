import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

// Required for `output: "export"` — emit a static sitemap.xml at build time.
export const dynamic = "force-static";

/**
 * Sitemap for every public route.
 *
 * `SITE.url` is the canonical origin (currently the Cloudflare Workers URL) —
 * swap it once a custom domain lands and every entry follows automatically.
 *
 * `/admin` is intentionally absent: it is private and disallowed in robots.ts.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const routes: Array<{
    path: string;
    priority: number;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  }> = [
    { path: "/", priority: 1.0, changeFrequency: "weekly" },
    { path: "/membership", priority: 0.9, changeFrequency: "weekly" },
    { path: "/problems", priority: 0.9, changeFrequency: "weekly" },
    // Dynamic showcase: projects are pulled from data, but the index page is a
    // single stable URL, so it stays in the sitemap as `/projects`.
    { path: "/projects", priority: 0.8, changeFrequency: "weekly" },
    { path: "/manifesto", priority: 0.8, changeFrequency: "monthly" },
    { path: "/values", priority: 0.7, changeFrequency: "monthly" },
    { path: "/activities", priority: 0.7, changeFrequency: "weekly" },
    { path: "/about", priority: 0.7, changeFrequency: "monthly" },
    { path: "/founders", priority: 0.6, changeFrequency: "monthly" },
    { path: "/contact", priority: 0.6, changeFrequency: "monthly" },
  ];

  return routes.map(({ path, priority, changeFrequency }) => ({
    url: path === "/" ? `${SITE.url}/` : `${SITE.url}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));
}
