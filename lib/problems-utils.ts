/**
 * Small helpers for the Problem Queue pages.
 * Kept deliberately tiny — the queue's data lives in @/lib/problems (content/problems.json).
 */
import { getProblem, getProblems } from "@/lib/problems";
import type { Problem } from "@/lib/problems";

/**
 * "2026-10-07" → "Oct 7, 2026".
 * Date-only strings are parsed as local calendar dates so timezones can never
 * shift a queue row across midnight.
 */
export function formatProblemDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, (m || 1) - 1, d || 1);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Clamp text to a clean word boundary at `max` chars, with an ellipsis. */
export function clampText(text: string, max = 155): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max).replace(/\s+\S*$/, "")}…`;
}

/**
 * Same-category problems (champions first) excluding the given id —
 * used to cross-link a few related queue entries on a problem's page.
 */
export function relatedProblems(id: string, limit = 3): Problem[] {
  const target = getProblem(id);
  if (!target) return [];
  return getProblems()
    .filter((p) => p.id !== id && p.categoryId === target.categoryId)
    .slice(0, limit);
}