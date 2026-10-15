/**
 * Small formatting helpers shared by the API and the SSR renderer.
 * These never touch the DOM; they only normalise plain-text values that come
 * out of D1 (which are stored as TEXT, sometimes as JSON arrays).
 */

/**
 * Truncate a value to `max` characters, collapsing whitespace. Used for meta
 * descriptions and JSON-LD blurbs.
 *
 * @param {unknown} value
 * @param {number} [max]
 * @returns {string}
 */
export function truncate(value, max = 160) {
  const s = String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
  if (s.length <= max) return s;
  return s.slice(0, max - 1).trimEnd() + "\u2026";
}

/**
 * Normalise a list-like DB column into a clean array of strings.
 *
 * Accepts a real array, a JSON array string (`'["a","b"]'`), or a delimited
 * string (`"a, b; c"`). Blank entries are dropped.
 *
 * @param {unknown} value
 * @param {number} [max] Maximum number of entries to keep.
 * @returns {string[]}
 */
export function splitList(value, max = 24) {
  if (value === null || value === undefined) return [];
  if (Array.isArray(value)) {
    return value
      .map((v) => String(v).trim())
      .filter(Boolean)
      .slice(0, max);
  }
  const s = String(value).trim();
  if (!s) return [];
  if (s.startsWith("[")) {
    try {
      const parsed = JSON.parse(s);
      if (Array.isArray(parsed)) {
        return parsed
          .map((v) => String(v).trim())
          .filter(Boolean)
          .slice(0, max);
      }
    } catch {
      /* fall through to delimiter splitting */
    }
  }
  return s
    .split(/[,;|]/)
    .map((v) => v.trim())
    .filter(Boolean)
    .slice(0, max);
}

/**
 * Return a normalised http(s) URL, or null for anything else. This is a hard
 * guard against `javascript:` / `data:` URLs being rendered into `href`.
 *
 * @param {unknown} value
 * @returns {string|null}
 */
export function safeHttpUrl(value) {
  if (!value) return null;
  const s = String(value).trim();
  if (!/^https?:\/\//i.test(s)) return null;
  try {
    const u = new URL(s);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u.toString();
  } catch {
    return null;
  }
}

/**
 * A short, human label for a URL, used as link text on the SSR page.
 *
 * @param {string} value
 * @returns {string}
 */
export function urlLabel(value) {
  try {
    const u = new URL(value);
    const path = u.pathname === "/" ? "" : u.pathname;
    return (u.hostname.replace(/^www\./, "") + path).replace(/\/$/, "");
  } catch {
    return value;
  }
}
