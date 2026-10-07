/**
 * Status → label/tone/dot mappings for the Problem Queue.
 * Labels come from content/problems.json (single source of truth); the tone and
 * dot classes are the CSS-module lookups in problems.module.css.
 */
import { PROBLEMS } from "@/lib/problems";
import type { ProblemStatusId } from "@/lib/problems";
import styles from "./problems.module.css";

const LABELS = new Map(PROBLEMS.statuses.map((s) => [s.id, s.label]));

export function statusLabel(id: ProblemStatusId): string {
  return LABELS.get(id) ?? id;
}

/** Pill tone class per status id. */
export function statusTone(id: ProblemStatusId): string {
  switch (id) {
    case "under-review":
      return styles.toneReview;
    case "being-scoped":
      return styles.toneScoped;
    case "in-the-labs":
      return styles.toneLabs;
    case "shipped":
      return styles.toneShipped;
    case "closed":
      return styles.toneClosed;
  }
}

/** Legend dot class per status id. */
export function statusDot(id: ProblemStatusId): string {
  switch (id) {
    case "under-review":
      return styles.dotReview;
    case "being-scoped":
      return styles.dotScoped;
    case "in-the-labs":
      return styles.dotLabs;
    case "shipped":
      return styles.dotShipped;
    case "closed":
      return styles.dotClosed;
  }
}