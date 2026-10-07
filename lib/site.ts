/**
 * Site-wide configuration.
 *
 * IMPORTANT (SEO): set BGET_PUBLIC_URL to your real production origin. Until a
 * custom domain is bought, the GitHub Pages deployment stays canonical — it is
 * fully indexable. When you deploy to Cloudflare + buy a domain, change this one
 * constant and rebuild; canonical/sitemap/robots/OG follow automatically.
 */
export const SITE = {
  name: "BGET",
  tagline: "Build. Grow. Evolve. Together.",
  description:
    "BGET is a global community of builders, scientists, makers and thinkers — every country, every discipline. Character before capability.",
  url: "https://5h4d0wn1k.github.io/bget", // <-- set once
  email: "nikhilnagpure1111@gmail.com",
  ogImage: "/assets/og-card.png",
  github: "https://github.com/5h4d0wn1k/bget",
  founder: "Nikhil",
} as const;

/** Current deployment base for routing — "/" on Cloudflare, "/bget" on GH Pages. */
export const BASE_PATH = "/";

export const NAV = [
  { href: "/", label: "Home" },
  { href: "/problems", label: "The Problem Queue" },
  { href: "/manifesto", label: "Manifesto" },
  { href: "/apply", label: "Apply" },
] as const;

export const PROBLEM_STATUSES = {
  "under-review": { label: "Under review", tone: "review" },
  "being-scoped": { label: "Being scoped", tone: "scoped" },
  "in-the-labs": { label: "In the labs", tone: "labs" },
  shipped: { label: "Shipped", tone: "shipped" },
  closed: { label: "Closed", tone: "closed" },
} as const;