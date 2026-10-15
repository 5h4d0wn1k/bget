import type { Metadata } from "next";

/**
 * Single source of truth for site-wide metadata and links.
 * Import this anywhere instead of hard-coding the name/URL.
 *
 * NOTE: while there is no custom domain, the canonical origin is the
 * Cloudflare Workers URL. Swap `NEXT_PUBLIC_SITE_URL` (or the fallback
 * below) once a domain is purchased — nothing else needs to change.
 */
export const SITE = {
  name: "Build For Good",
  shortName: "Build For Good",
  tagline: "Build. Grow. Evolve. Together.",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://buildforgood.nikhilnagpure203.workers.dev").replace(/\/$/, ""),
  description:
    "Build For Good is a global, multidisciplinary community for turning meaningful problems into collective action. Exceptional people, across every field, building things that matter — together.",
  shortDescription: "A global community turning meaningful problems into collective action.",
  founder: "Nikhil Nagpure",
  locale: "en_US",
  github: "https://github.com/5h4d0wn1k/bget",
  email: "hello@buildforgood.org",
  keywords: [
    "Build For Good",
    "community",
    "problem commons",
    "collective action",
    "multidisciplinary",
    "social impact",
    "builders",
    "open problems",
    "civic tech",
    "global community",
  ],
} as const;

export type SiteConfig = typeof SITE;

/**
 * Build per-page metadata from the shared site config so titles, canonicals,
 * and social cards stay consistent across every route. `title` is the
 * page-level title only — the root layout template appends the brand name.
 * `path` is a root-relative path (e.g. "/manifesto"); `metadataBase` in the
 * root layout resolves it to an absolute URL.
 */
export function pageMetadata({
  title,
  description,
  path,
  type = "website",
}: {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
}): Metadata {
  const fullTitle = `${title} — ${SITE.name}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type,
      url: path,
      siteName: SITE.name,
      title: fullTitle,
      description,
      locale: SITE.locale,
      images: [
        { url: "/og.png", width: 1200, height: 630, alt: `${SITE.name} — ${SITE.tagline}` },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: ["/og.png"],
    },
  };
}
