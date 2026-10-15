/**
 * HTML escaping + HTML response helper.
 *
 * Everything that originates from user input MUST pass through `escapeHtml`
 * before being interpolated into markup. `safeHttpUrl` (in format.js) guards
 * attribute URLs separately.
 */

const ESCAPE_MAP = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/**
 * Escape `& < > " '` in a value. Nullish values become "".
 *
 * @param {unknown} value
 * @returns {string}
 */
export function escapeHtml(value) {
  if (value === null || value === undefined) return "";
  return String(value).replace(/[&<>"']/g, (ch) => ESCAPE_MAP[ch]);
}

/**
 * Build an HTML `Response`.
 *
 * @param {string} body
 * @param {number} [status]
 * @param {Record<string,string>} [headers]
 * @returns {Response}
 */
export function htmlResponse(body, status = 200, headers = {}) {
  return new Response(body, {
    status,
    headers: { "content-type": "text/html; charset=utf-8", ...headers },
  });
}

/**
 * Serialise an object for safe embedding inside a `<script type="application/ld+json">`.
 * `<` is escaped so user content can never terminate the script element.
 *
 * @param {unknown} data
 * @returns {string}
 */
export function jsonScript(data) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

/**
 * Render a plain-text field as one or more `<p>` blocks, split on blank lines.
 * Single newlines inside a block become `<br />`. All content is escaped.
 *
 * @param {unknown} text
 * @returns {string}
 */
export function paragraphs(text) {
  const value = String(text ?? "").trim();
  if (!value) return "";
  return value
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => `<p>${escapeHtml(block).replace(/\n/g, "<br />")}</p>`)
    .join("\n");
}
