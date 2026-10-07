/** Manifesto content loader — chapters derived from content/philosophy.md. */
import chapters from "@/content/chapters.json";

export interface ManifestoChapter {
  number: number;
  title: string;
  slug: string;
  body: string;
}

export interface ManifestoSection {
  title: string;
  slug: string;
  body: string;
}

export const MANIFESTO = chapters as {
  intro: { title: string; body: string };
  chapters: ManifestoChapter[];
  closing: ManifestoSection[];
};

export function getChapter(slug: string): ManifestoChapter | undefined {
  return MANIFESTO.chapters.find((c) => c.slug === slug);
}

export function getChapterByNumber(n: number): ManifestoChapter | undefined {
  return MANIFESTO.chapters.find((c) => c.number === n);
}