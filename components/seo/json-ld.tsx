import type { ReactNode } from "react";

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
