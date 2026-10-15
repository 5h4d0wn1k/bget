/**
 * Input validation / sanitisation helpers.
 *
 * All user-supplied values pass through `clean()` (trim + hard length cap)
 * before they reach a bound SQL parameter, and every query in this Worker uses
 * bound parameters — never string interpolation.
 */

/** Reject request bodies larger than this (100 KiB). */
export const MAX_BODY_BYTES = 100 * 1024;

/**
 * Trim a value and cap its length. Non-strings become "".
 *
 * @param {unknown} value Raw input.
 * @param {number} max Maximum number of characters to keep.
 * @returns {string}
 */
export function clean(value, max = 2000) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

/**
 * Pragmatic email check: non-empty local part, an `@`, a dot in the domain.
 * Length-capped at 254 chars (RFC 5321).
 *
 * @param {string} value
 * @returns {boolean}
 */
export function isEmail(value) {
  return (
    typeof value === "string" &&
    value.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  );
}

/**
 * Coerce a value to an integer bounded by `min`/`max`.
 * Returns `fallback` when the input is missing or out of range.
 *
 * @param {unknown} value
 * @param {{min?: number|null, max?: number|null, fallback?: number|null}} [opts]
 * @returns {number|null}
 */
export function asInt(value, { min = null, max = null, fallback = null } = {}) {
  if (value === undefined || value === null || value === "") return fallback;
  const n = typeof value === "number" ? value : Number.parseInt(String(value), 10);
  if (!Number.isFinite(n)) return fallback;
  const i = Math.trunc(n);
  if (min !== null && i < min) return fallback;
  if (max !== null && i > max) return fallback;
  return i;
}

/**
 * Read and parse a request body, enforcing the 100 KiB cap.
 *
 * Supports `application/json` (the API contract) and, as a convenience,
 * `application/x-www-form-urlencoded` form posts.
 *
 * @param {Request} request
 * @returns {Promise<{ok: true, body: Record<string, unknown>}
 *   | {ok: false, status: number, error: string}>}
 */
export async function readBody(request) {
  const contentType = (request.headers.get("content-type") || "").toLowerCase();
  const declared = Number(request.headers.get("content-length") || 0);
  if (declared > MAX_BODY_BYTES) {
    return { ok: false, status: 413, error: "payload_too_large" };
  }

  let text;
  try {
    text = await request.text();
  } catch {
    return { ok: false, status: 400, error: "invalid_body" };
  }

  // Guard against a missing/understated Content-Length header.
  if (text.length > MAX_BODY_BYTES) {
    return { ok: false, status: 413, error: "payload_too_large" };
  }
  if (!text) return { ok: true, body: {} };

  try {
    if (contentType.includes("application/x-www-form-urlencoded")) {
      const body = {};
      for (const [key, value] of new URLSearchParams(text)) body[key] = value;
      return { ok: true, body };
    }
    const parsed = JSON.parse(text);
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
      return { ok: false, status: 400, error: "invalid_json" };
    }
    return { ok: true, body: parsed };
  } catch {
    return { ok: false, status: 400, error: "invalid_json" };
  }
}

/**
 * Honeypot check. Forms include a hidden `company` (or legacy `website`) field;
 * only bots fill it in. When tripped we return a fake success and skip the write.
 *
 * @param {Record<string, unknown>} body
 * @returns {boolean}
 */
export function isHoneypot(body) {
  return Boolean(clean(body.company, 100) || clean(body.website, 100));
}

/**
 * Collect the names of required fields that are empty, for a helpful 422 body.
 *
 * @param {Record<string, string>} fields
 * @returns {string[]}
 */
export function missingFields(fields) {
  return Object.entries(fields)
    .filter(([, value]) => !value)
    .map(([name]) => name);
}
