import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { PROBLEMS } from "@/lib/problems";
import { MANIFESTO } from "@/lib/manifesto";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [
    { url: `${SITE.url}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE.url}/problems`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE.url}/apply`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE.url}/manifesto`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
  ];

  // Programmatic SEO: one URL per queue problem.
  for (const p of PROBLEMS.problems) {
    entries.push({
      url: `${SITE.url}/problems/${p.id}`,
      lastModified: new Date(p.lastUpdated),
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }

  // Programmatic SEO: one URL per manifesto chapter.
  for (const c of MANIFESTO.chapters) {
    entries.push({
      url: `${SITE.url}/manifesto/${c.slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  // Programmatic SEO: the two closing sections of the manifesto.
  for (const c of MANIFESTO.closing) {
    entries.push({
      url: `${SITE.url}/manifesto/${c.slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  return entries;
}