import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

// Required for `output: "export"` — emit a static robots.txt at build time.
export const dynamic = "force-static";

/**
 * robots.txt — crawl everything public, keep private endpoints out of the
 * index, and point crawlers at the generated sitemap.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/"],
    },
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
