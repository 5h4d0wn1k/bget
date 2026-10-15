/**
 * JSON / HTTP response helpers for the Build For Good API.
 *
 * Every API response is UTF-8 JSON and is marked `x-robots-tag: noindex` so
 * crawlers never index raw API payloads. CORS is deliberately restricted to the
 * same origin: we never reflect an arbitrary `Origin` back to the caller.
 */

/** Headers applied to every JSON API response. */
export const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "x-robots-tag": "noindex",
};

/**
 * Serialise `data` as a JSON response.
 *
 * @param {unknown} data   Body to serialise (must be JSON-safe).
 * @param {number}  status HTTP status code.
 * @param {Record<string,string>} headers Extra headers to merge in.
 * @returns {Response}
 */
export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...JSON_HEADERS, ...headers },
  });
}

/**
 * Standard 405 response including an `Allow` header for the matched route.
 *
 * @param {string} allow Comma-separated list of permitted methods.
 * @returns {Response}
 */
export function methodNotAllowed(allow) {
  return json({ ok: false, error: "method_not_allowed" }, 405, { allow });
}

/**
 * 204 response for CORS preflight / OPTIONS requests. We only advertise CORS
 * for same-origin callers, so genuine cross-origin preflights receive no
 * `access-control-allow-origin` and are therefore blocked by the browser.
 *
 * @param {string} allow Comma-separated list of permitted methods.
 * @param {Request} request Incoming request (used only for its Origin header).
 * @param {URL} url Parsed request URL (used for the same-origin comparison).
 * @returns {Response}
 */
export function optionsResponse(allow, request, url) {
  const headers = { allow, "x-robots-tag": "noindex" };
  const origin = request.headers.get("origin");
  if (origin && origin === url.origin) {
    headers["access-control-allow-origin"] = origin;
    headers["access-control-allow-methods"] = allow;
    headers["access-control-allow-headers"] = "content-type";
    headers["access-control-max-age"] = "86400";
    headers["vary"] = "origin";
  }
  return new Response(null, { status: 204, headers });
}
