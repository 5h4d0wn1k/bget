/**
 * Shared helpers for the /admin internal panel.
 * Pure functions only — safe to import from both server pages and client
 * components (e.g. StatusSelect).
 */

export const SUBMISSION_STATUSES = ["new", "reviewing", "accepted", "declined", "archived"] as const;

export type AdminStatus = (typeof SUBMISSION_STATUSES)[number];

export const STATUS_LABELS: Record<AdminStatus, string> = {
  new: "New",
  reviewing: "Reviewing",
  accepted: "Accepted",
  declined: "Declined",
  archived: "Archived",
};

/** CSS-module tone key for the status pill; unknown statuses get "unknown". */
export function statusTone(status: string): string {
  return (SUBMISSION_STATUSES as readonly string[]).includes(status) ? status : "unknown";
}

/** Parse the stored fields_json into a plain object (never throws). */
export function parseFields(json: string): Record<string, string> {
  try {
    const raw: unknown = JSON.parse(json);
    if (raw && typeof raw === "object") {
      const out: Record<string, string> = {};
      for (const [key, value] of Object.entries(raw)) {
        out[key] = String(value ?? "");
      }
      return out;
    }
  } catch {
    /* malformed JSON — show an empty map */
  }
  return {};
}

/** Human-friendly date for a unix-ms timestamp. */
export function formatDate(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) return "—";
  return new Date(ms).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
}

/** Clamp long text for table cells. */
export function clamp(text: string, max = 180): string {
  const trimmed = (text ?? "").trim();
  return trimmed.length > max ? `${trimmed.slice(0, max).trimEnd()}…` : trimmed;
}

/** "q_name" → "Q name", "problem_what" → "Problem what". */
export function humanName(key: string): string {
  return key
    .replace(/[_-]+/g, " ")
    .split(" ")
    .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1) : word))
    .join(" ");
}