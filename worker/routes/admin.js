/**
 * Admin JSON API — protected by Cloudflare Access.
 *
 * Every route requires a valid `Cf-Access-Jwt-Assertion` (verified in
 * ../access.js). When Access is not configured the Worker fails closed and
 * returns 401 for all admin requests.
 *
 *   GET    /api/admin/me
 *   GET    /api/admin/summary
 *   GET    /api/admin/:collection                  ?status=&limit=&offset=
 *   PATCH  /api/admin/:collection/:id              { status?, notes? }
 *   DELETE /api/admin/:collection/:id
 *
 * Table and column identifiers are never taken from user input: `:collection`
 * is resolved against the `COLLECTIONS` allowlist and ids are validated as
 * integers. All values are bound parameters.
 */

import { json, methodNotAllowed, optionsResponse } from "../lib/json.js";
import { asInt, clean, readBody } from "../lib/validate.js";
import { verifyAccess } from "../access.js";

/**
 * Allowlist of collections that may be listed, updated, or deleted.
 * `reviewedAt` marks the collections that carry a `reviewed_at` column.
 */
const COLLECTIONS = {
  applications: { table: "applications", reviewedAt: true },
  problems: { table: "problems", reviewedAt: true },
  projects: { table: "projects", reviewedAt: true },
  contact_messages: { table: "contact_messages", reviewedAt: false },
  suggestions: { table: "suggestions", reviewedAt: false },
  feedback: { table: "feedback", reviewedAt: false },
};

const METHODS = "GET, PATCH, DELETE, OPTIONS";

/**
 * Entry point for `/api/admin/*`.
 *
 * @param {Request} request
 * @param {{DB: D1Database}} env
 * @param {ExecutionContext} ctx
 * @param {URL} url
 * @returns {Promise<Response>}
 */
export async function handleAdmin(request, env, ctx, url) {
  // Answer preflight before auth so browsers get a clean 204. Genuine
  // cross-origin callers get no ACAO header and are blocked by the browser.
  if (request.method === "OPTIONS") {
    return optionsResponse(METHODS, request, url);
  }

  const auth = await verifyAccess(request, env);
  if (!auth.ok) {
    return json({ ok: false, error: "unauthorized" }, 401);
  }

  const parts = url.pathname
    .slice("/api/admin/".length)
    .split("/")
    .filter(Boolean);

  // GET /api/admin/me
  if (parts.length === 1 && parts[0] === "me") {
    if (request.method !== "GET") return methodNotAllowed("GET, OPTIONS");
    return json({ ok: true, email: auth.email });
  }

  // GET /api/admin/summary
  if (parts.length === 1 && parts[0] === "summary") {
    if (request.method !== "GET") return methodNotAllowed("GET, OPTIONS");
    return summary(env);
  }

  const collection = COLLECTIONS[parts[0]];
  if (!collection) return json({ ok: false, error: "not_found" }, 404);

  // GET /api/admin/:collection
  if (parts.length === 1) {
    if (request.method !== "GET") return methodNotAllowed("GET, OPTIONS");
    return list(env, url, collection);
  }

  // PATCH / DELETE /api/admin/:collection/:id
  if (parts.length === 2) {
    const id = asInt(parts[1], { min: 1 });
    if (id === null) return json({ ok: false, error: "invalid_id" }, 400);

    if (request.method === "PATCH") return update(request, env, collection, id);
    if (request.method === "DELETE") return remove(env, collection, id);
    return methodNotAllowed("PATCH, DELETE, OPTIONS");
  }

  return json({ ok: false, error: "not_found" }, 404);
}

/* ------------------------------------------------------------------ */
/* Handlers                                                             */
/* ------------------------------------------------------------------ */

/** Counts per collection and per status. */
async function summary(env) {
  const result = {};

  for (const [name, config] of Object.entries(COLLECTIONS)) {
    const totalRow = await env.DB.prepare(
      `SELECT COUNT(*) AS n FROM ${config.table}`,
    ).first();

    const { results } = await env.DB.prepare(
      `SELECT status, COUNT(*) AS n FROM ${config.table} GROUP BY status`,
    ).all();

    const byStatus = {};
    for (const row of results ?? []) {
      byStatus[row.status ?? "unknown"] = row.n;
    }

    result[name] = { total: totalRow?.n ?? 0, status: byStatus };
  }

  return json({ ok: true, summary: result });
}

/**
 * List a collection with optional status filter and pagination.
 *
 * @param {{DB: D1Database}} env
 * @param {URL} url
 * @param {{table: string, reviewedAt: boolean}} config
 * @returns {Promise<Response>}
 */
async function list(env, url, config) {
  const limit = asInt(url.searchParams.get("limit"), {
    min: 1,
    max: 500,
    fallback: 100,
  });
  const offset = asInt(url.searchParams.get("offset"), {
    min: 0,
    max: 10_000_000,
    fallback: 0,
  });
  const status = clean(url.searchParams.get("status"), 40);

  const where = status ? "WHERE status = ?" : "";
  const filterBinds = status ? [status] : [];

  const totalRow = await env.DB.prepare(
    `SELECT COUNT(*) AS n FROM ${config.table} ${where}`,
  )
    .bind(...filterBinds)
    .first();

  const { results } = await env.DB.prepare(
    `SELECT * FROM ${config.table} ${where} ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?`,
  )
    .bind(...filterBinds, limit, offset)
    .all();

  return json({ ok: true, items: results ?? [], total: totalRow?.n ?? 0 });
}

/**
 * Update a row's `status` and/or `notes`. When `status` changes on a
 * review-aware collection we also stamp `reviewed_at`.
 *
 * @param {Request} request
 * @param {{DB: D1Database}} env
 * @param {{table: string, reviewedAt: boolean}} config
 * @param {number} id
 * @returns {Promise<Response>}
 */
async function update(request, env, config, id) {
  const parsed = await readBody(request);
  if (!parsed.ok) return json({ ok: false, error: parsed.error }, parsed.status);
  const body = parsed.body;

  const sets = [];
  const binds = [];
  let statusChanged = false;

  if (body.status !== undefined) {
    const status = clean(body.status, 40);
    if (!status) return json({ ok: false, error: "invalid", fields: ["status"] }, 422);
    sets.push("status = ?");
    binds.push(status);
    statusChanged = true;
  }

  if (body.notes !== undefined) {
    sets.push("notes = ?");
    binds.push(clean(body.notes, 10000));
  }

  if (!sets.length) {
    return json({ ok: false, error: "invalid", fields: ["status", "notes"] }, 422);
  }

  if (statusChanged && config.reviewedAt) {
    sets.push("reviewed_at = datetime('now')");
  }

  binds.push(id);

  await env.DB.prepare(
    `UPDATE ${config.table} SET ${sets.join(", ")} WHERE id = ?`,
  )
    .bind(...binds)
    .run();

  return json({ ok: true });
}

/**
 * Hard-delete a row.
 *
 * @param {{DB: D1Database}} env
 * @param {{table: string}} config
 * @param {number} id
 * @returns {Promise<Response>}
 */
async function remove(env, config, id) {
  await env.DB.prepare(`DELETE FROM ${config.table} WHERE id = ?`)
    .bind(id)
    .run();
  return json({ ok: true });
}
