import { SITE } from "@/lib/site";

/**
 * Render structured data as JSON-LD. Rendered server-side so crawlers that
 * do not execute JavaScript still see it. `<` is escaped to avoid breaking
 * out of the script tag with untrusted content.
 */
export function JsonLd({
  data,
}: {
  data: Record<string, unknown> | Record<string, unknown>[];
}) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

/**
 * Compact WebPage node for a top-level route. References the Organization and
 * WebSite nodes emitted once in the root layout via stable `@id`s.
 */
export function webPageLd({
  path,
  name,
  description,
  type = "WebPage",
}: {
  path: string;
  name: string;
  description: string;
  type?: "WebPage" | "AboutPage";
}) {
  return {
    "@context": "https://schema.org",
    "@type": type,
    "@id": `${SITE.url}${path}#webpage`,
    url: `${SITE.url}${path}`,
    name,
    description,
    isPartOf: { "@id": `${SITE.url}/#website` },
    inLanguage: "en",
    ...(type === "AboutPage" ? { about: { "@id": `${SITE.url}/#organization` } } : {}),
  };
}

/** Article node for long-form editorial pages (e.g. the manifesto). */
export function articleLd({
  path,
  headline,
  description,
}: {
  path: string;
  headline: string;
  description: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${SITE.url}${path}#article`,
    headline,
    description,
    mainEntityOfPage: `${SITE.url}${path}`,
    author: { "@type": "Organization", "@id": `${SITE.url}/#organization`, name: SITE.name, url: SITE.url },
    publisher: { "@id": `${SITE.url}/#organization` },
    inLanguage: "en",
  };
}
