import type { CSSProperties } from "react";

/** Reveal-stagger helper — sets the `--reveal-delay` custom property per element. */
export function delay(ms: number): CSSProperties {
  return { "--reveal-delay": `${ms}ms` } as CSSProperties;
}

/** Zero-pad a number to two digits for mono ledger numerals (e.g. `01`). */
export function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/**
 * Strip Markdown *syntax* (not text) so bodies can feed meta descriptions and
 * open-graph copy. Order matters: images → links → code → blockquote markers
 * (so `> ## Heading` sheds both) → headings → bold+italic → bold → italic →
 * lists → rules.
 */
export function stripMarkdown(md: string): string {
  return md
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/`{1,3}([^`]*)`{1,3}/g, "$1")
    .replace(/^>\s?/gm, "")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*\*|___/g, "")
    .replace(/\*\*|__/g, "")
    .replace(/\*|_/g, "")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/^\s*[-_*]{3,}\s*$/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Truncate to `max` chars at a word boundary, appending an ellipsis. */
export function clampText(text: string, max = 150): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${lastSpace > 0 ? cut.slice(0, lastSpace) : cut}…`;
}

/**
 * Shift every heading level up by `levels` (capped at h6). Used to embed the
 * intro preamble (which contains a top-level `# BGET`) under a page's single
 * existing h1 without breaking heading hierarchy.
 */
export function demoteHeadings(md: string, levels = 1): string {
  return md.replace(/^(#{1,6})(?=\s)/gm, (_match, hashes: string) => {
    const next = Math.min(6, hashes.length + levels);
    return "#".repeat(next);
  });
}

/**
 * Editorial excerpt for closing-section cards: use the first line when it is
 * brief (a pull quote), otherwise clamp the stripped body to `max` chars.
 */
export function closingExcerpt(md: string, max = 200): string {
  const firstLine = md.split("\n").find((line) => line.trim().length > 0) ?? "";
  const stripped = stripMarkdown(firstLine);
  return stripped.length <= max ? stripped : clampText(stripMarkdown(md), max);
}