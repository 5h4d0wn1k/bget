/**
 * Problem Queue content — single source of truth: content/problems.json.
 * Read-only; the queue is curated by a person editing statuses one row at a time.
 */
import problemsJson from "@/content/problems.json";

export type ProblemCategoryId = "all" | "water" | "energy" | "health" | "education";
export type ProblemStatusId =
  | "under-review"
  | "being-scoped"
  | "in-the-labs"
  | "shipped"
  | "closed";

export interface ProblemStatus {
  id: ProblemStatusId;
  label: string;
  blurb: string;
}

export interface Problem {
  id: string;
  index: string;
  title: string;
  category: string;
  categoryId: Exclude<ProblemCategoryId, "all">;
  champion: boolean;
  summary: string;
  location: string;
  proposedBy: string;
  lastUpdated: string;
  status: ProblemStatusId;
  efforts: { label: string; url: string }[];
  discussion: string;
}

export interface ProblemsContent {
  page: { title: string; description: string; ogDescription: string; image: string };
  hero: {
    eyebrow: string;
    h1: string;
    h1Accent: string;
    lead: string;
    trust: string;
    ctaPrimary: { label: string; href: string };
    ctaSecondary: { label: string; href: string };
  };
  founderNote: { quote: string; attribution: string };
  stepsLabel: string;
  steps: { num: string; title: string; text: string }[];
  earnsTitle: string;
  earns: string[];
  doesntTitle: string;
  doesnt: string[];
  privacyNote: string;
  queueLabel: string;
  queueSub: string;
  queueLegendLabel: string;
  categories: { id: ProblemCategoryId; label: string }[];
  statuses: ProblemStatus[];
  problems: Problem[];
  submitLabel: string;
  submitTitle: string;
  submitSub: string;
  submitButton: string;
  submitNote: string;
  partnerNote: { heading: string; paragraphs: string[]; links: { label: string; url: string }[] };
  faq: { q: string; a: string }[];
  cta: { label: string; ctaPrimary: { label: string; href: string }; ctaSecondary: { label: string; href: string } };
}

export const PROBLEMS: ProblemsContent = problemsJson as ProblemsContent;

/** Our own championed problems always listed first, then by index. */
export function getProblems(): Problem[] {
  return [...PROBLEMS.problems].sort((a, b) => {
    if (a.champion !== b.champion) return a.champion ? -1 : 1;
    return a.index.localeCompare(b.index);
  });
}

export function getProblem(id: string): Problem | undefined {
  return PROBLEMS.problems.find((p) => p.id === id);
}