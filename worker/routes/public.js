/**
 * Public JSON API.
 *
 * All handlers return JSON. POST bodies are validated, length-capped, and
 * written to D1 with bound parameters only. A honeypot field (`company`, or the
 * legacy `website`) short-circuits bots with a fake success.
 *
 *   GET  /api/health
 *   POST /api/apply        -> applications
 *   POST /api/problems     -> problems
 *   POST /api/contact      -> contact_messages
 *   POST /api/suggestions  -> suggestions
 *   POST /api/feedback     -> feedback
 *   GET  /api/projects     -> approved projects (public fields)
 *   POST /api/projects     -> projects (status = pending)
 *   GET  /api/projects/:slug
 */

import { json, methodNotAllowed } from "../lib/json.js";
import {
  asInt,
  clean,
  isEmail,
  isHoneypot,
  missingFields,
  readBody,
} from "../lib/validate.js";
import { uniqueSlug } from "../lib/slug.js";

/** Columns safe to expose to the public for an approved project. */
const PUBLIC_PROJECT_FIELDS = [
  "id",
  "slug",
  "title",
  "one_liner",
  "description",
  "disciplines",
  "stage",
  "url",
  "repo",
  "demo",
  "cover_image",
  "lead_name",
  "location",
  "team",
  "tags",
  "featured",
  "created_at",
].join(", ");

const KINDS = ["praise", "bug", "idea", "other"];
const VISIBILITIES = ["public", "bget", "private"];

/**
 * Entry point for every non-admin `/api/*` request.
 *
 * @param {Request} request
 * @param {{DB: D1Database}} env
 * @param {ExecutionContext} ctx
 * @param {URL} url
 * @returns {Promise<Response>}
 */
export async function handlePublic(request, env, ctx, url) {
  const { pathname } = url;
  const method = request.method;
  const isRead = method === "GET" || method === "HEAD";

  // GET /api/health
  if (pathname === "/api/health") {
    if (!isRead) return methodNotAllowed("GET, HEAD, OPTIONS");
    return json({ ok: true, service: "buildforgood" });
  }

  // /api/projects (list + create)
  if (pathname === "/api/projects") {
    if (isRead) return listProjects(env, url);
    if (method === "POST") return createProject(request, env);
    return methodNotAllowed("GET, POST, OPTIONS");
  }

  // /api/projects/:slug
  if (pathname.startsWith("/api/projects/")) {
    if (!isRead) return methodNotAllowed("GET, HEAD, OPTIONS");
    const slug = decodeURIComponent(
      pathname.slice("/api/projects/".length),
    ).replace(/\/+$/, "");
    if (!slug || slug.includes("/")) {
      return json({ ok: false, error: "not_found" }, 404);
    }
    return getProjectBySlug(env, slug);
  }

  // Write-only form endpoints.
  if (pathname === "/api/apply" || pathname === "/api/problems") {
    if (method !== "POST") return methodNotAllowed("POST, OPTIONS");
    return pathname === "/api/apply"
      ? handleApply(request, env)
      : handleProblems(request, env);
  }
  if (pathname === "/api/contact") {
    if (method !== "POST") return methodNotAllowed("POST, OPTIONS");
    return handleContact(request, env);
  }
  if (pathname === "/api/suggestions") {
    if (method !== "POST") return methodNotAllowed("POST, OPTIONS");
    return handleSuggestions(request, env);
  }
  if (pathname === "/api/feedback") {
    if (method !== "POST") return methodNotAllowed("POST, OPTIONS");
    return handleFeedback(request, env);
  }

  return json({ ok: false, error: "not_found" }, 404);
}

/* ------------------------------------------------------------------ */
/* Form handlers                                                        */
/* ------------------------------------------------------------------ */

/** POST /api/apply -> applications */
async function handleApply(request, env) {
  const parsed = await readBody(request);
  if (!parsed.ok) return json({ ok: false, error: parsed.error }, parsed.status);
  const body = parsed.body;
  if (isHoneypot(body)) return json({ ok: true, id: null });

  const fields = {
    name: clean(body.name, 120),
    email: clean(body.email, 254).toLowerCase(),
    building: clean(body.building, 5000),
  };
  const missing = missingFields(fields);
  if (missing.length) {
    return json({ ok: false, error: "invalid", fields: missing }, 422);
  }
  if (!isEmail(fields.email)) {
    return json({ ok: false, error: "invalid", fields: ["email"] }, 422);
  }

  const result = await env.DB.prepare(
    `INSERT INTO applications
       (name, email, location, disciplines, links, building, struggling, why_bget, referral, user_agent)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      fields.name,
      fields.email,
      clean(body.location, 160),
      clean(body.disciplines, 500),
      clean(body.links, 1000),
      fields.building,
      clean(body.struggling, 5000),
      clean(body.why_bget, 5000),
      clean(body.referral, 200),
      clean(request.headers.get("user-agent"), 400),
    )
    .run();

  return json({ ok: true, id: result.meta?.last_row_id ?? null });
}

/** POST /api/problems -> problems */
async function handleProblems(request, env) {
  const parsed = await readBody(request);
  if (!parsed.ok) return json({ ok: false, error: parsed.error }, parsed.status);
  const body = parsed.body;
  if (isHoneypot(body)) return json({ ok: true, id: null });

  const title = clean(body.title, 200);
  const description = clean(body.description, 8000);
  const email = clean(body.email, 254).toLowerCase();

  const missing = missingFields({ title, description });
  if (missing.length) {
    return json({ ok: false, error: "invalid", fields: missing }, 422);
  }
  if (email && !isEmail(email)) {
    return json({ ok: false, error: "invalid", fields: ["email"] }, 422);
  }

  const requestedVisibility = clean(body.visibility, 20).toLowerCase();
  const visibility = VISIBILITIES.includes(requestedVisibility)
    ? requestedVisibility
    : "bget";

  const result = await env.DB.prepare(
    `INSERT INTO problems
       (title, description, submitter_name, email, location, affected, tried, success_looks_like, why_bget, contribution, visibility, user_agent)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      title,
      description,
      clean(body.submitter_name, 120),
      email,
      clean(body.location, 160),
      clean(body.affected, 4000),
      clean(body.tried, 4000),
      clean(body.success_looks_like, 4000),
      clean(body.why_bget, 4000),
      clean(body.contribution, 4000),
      visibility,
      clean(request.headers.get("user-agent"), 400),
    )
    .run();

  return json({ ok: true, id: result.meta?.last_row_id ?? null });
}

/** POST /api/contact -> contact_messages */
async function handleContact(request, env) {
  const parsed = await readBody(request);
  if (!parsed.ok) return json({ ok: false, error: parsed.error }, parsed.status);
  const body = parsed.body;
  if (isHoneypot(body)) return json({ ok: true, id: null });

  const fields = {
    name: clean(body.name, 120),
    email: clean(body.email, 254).toLowerCase(),
    message: clean(body.message, 8000),
  };
  const missing = missingFields(fields);
  if (missing.length) {
    return json({ ok: false, error: "invalid", fields: missing }, 422);
  }
  if (!isEmail(fields.email)) {
    return json({ ok: false, error: "invalid", fields: ["email"] }, 422);
  }

  const result = await env.DB.prepare(
    `INSERT INTO contact_messages (name, email, subject, message, user_agent)
     VALUES (?, ?, ?, ?, ?)`,
  )
    .bind(
      fields.name,
      fields.email,
      clean(body.subject, 200),
      fields.message,
      clean(request.headers.get("user-agent"), 400),
    )
    .run();

  return json({ ok: true, id: result.meta?.last_row_id ?? null });
}

/** POST /api/suggestions -> suggestions */
async function handleSuggestions(request, env) {
  const parsed = await readBody(request);
  if (!parsed.ok) return json({ ok: false, error: parsed.error }, parsed.status);
  const body = parsed.body;
  if (isHoneypot(body)) return json({ ok: true, id: null });

  const topic = clean(body.topic, 200);
  const text = clean(body.body, 8000);
  const email = clean(body.email, 254).toLowerCase();

  const missing = missingFields({ topic, body: text });
  if (missing.length) {
    return json({ ok: false, error: "invalid", fields: missing }, 422);
  }
  if (email && !isEmail(email)) {
    return json({ ok: false, error: "invalid", fields: ["email"] }, 422);
  }

  const result = await env.DB.prepare(
    `INSERT INTO suggestions (topic, body, name, email, user_agent)
     VALUES (?, ?, ?, ?, ?)`,
  )
    .bind(
      topic,
      text,
      clean(body.name, 120),
      email,
      clean(request.headers.get("user-agent"), 400),
    )
    .run();

  return json({ ok: true, id: result.meta?.last_row_id ?? null });
}

/** POST /api/feedback -> feedback */
async function handleFeedback(request, env) {
  const parsed = await readBody(request);
  if (!parsed.ok) return json({ ok: false, error: parsed.error }, parsed.status);
  const body = parsed.body;
  if (isHoneypot(body)) return json({ ok: true, id: null });

  const text = clean(body.body, 8000);
  if (!text) return json({ ok: false, error: "invalid", fields: ["body"] }, 422);

  const requestedKind = clean(body.kind, 20).toLowerCase();
  const kind = KINDS.includes(requestedKind) ? requestedKind : "idea";

  let rating = null;
  if (body.rating !== undefined && body.rating !== null && body.rating !== "") {
    rating = asInt(body.rating, { min: 1, max: 5, fallback: null });
    if (rating === null) {
      return json({ ok: false, error: "invalid", fields: ["rating"] }, 422);
    }
  }

  const email = clean(body.email, 254).toLowerCase();
  if (email && !isEmail(email)) {
    return json({ ok: false, error: "invalid", fields: ["email"] }, 422);
  }

  const result = await env.DB.prepare(
    `INSERT INTO feedback (kind, page, body, email, rating, user_agent)
     VALUES (?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      kind,
      clean(body.page, 300),
      text,
      email,
      rating,
      clean(request.headers.get("user-agent"), 400),
    )
    .run();

  return json({ ok: true, id: result.meta?.last_row_id ?? null });
}

/* ------------------------------------------------------------------ */
/* Projects                                                             */
/* ------------------------------------------------------------------ */

/** GET /api/projects -> approved projects, newest/most-featured first. */
async function listProjects(env, url) {
  const limit = asInt(url.searchParams.get("limit"), {
    min: 1,
    max: 200,
    fallback: 100,
  });

  const { results } = await env.DB.prepare(
    `SELECT ${PUBLIC_PROJECT_FIELDS}
       FROM projects
      WHERE status = 'approved'
      ORDER BY featured DESC, created_at DESC
      LIMIT ?`,
  )
    .bind(limit)
    .all();

  return json({ ok: true, projects: results ?? [] });
}

/** GET /api/projects/:slug -> a single approved project. */
async function getProjectBySlug(env, slug) {
  const project = await env.DB.prepare(
    `SELECT ${PUBLIC_PROJECT_FIELDS}
       FROM projects
      WHERE slug = ? AND status = 'approved'
      LIMIT 1`,
  )
    .bind(slug)
    .first();

  if (!project) return json({ ok: false, error: "not_found" }, 404);
  return json({ ok: true, project });
}

/** POST /api/projects -> create a pending project submission. */
async function createProject(request, env) {
  const parsed = await readBody(request);
  if (!parsed.ok) return json({ ok: false, error: parsed.error }, parsed.status);
  const body = parsed.body;
  if (isHoneypot(body)) return json({ ok: true, id: null, slug: null });

  const fields = {
    title: clean(body.title, 200),
    one_liner: clean(body.one_liner, 300),
    description: clean(body.description, 10000),
    lead_name: clean(body.lead_name, 120),
  };
  const missing = missingFields(fields);
  if (missing.length) {
    return json({ ok: false, error: "invalid", fields: missing }, 422);
  }

  const leadEmail = clean(body.lead_email, 254).toLowerCase();
  if (leadEmail && !isEmail(leadEmail)) {
    return json({ ok: false, error: "invalid", fields: ["lead_email"] }, 422);
  }

  const slug = await uniqueSlug(env, fields.title);

  const result = await env.DB.prepare(
    `INSERT INTO projects
       (slug, title, one_liner, description, disciplines, stage, url, repo, demo, cover_image,
        lead_name, lead_email, location, team, tags, status, user_agent)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
  )
    .bind(
      slug,
      fields.title,
      fields.one_liner,
      fields.description,
      clean(body.disciplines, 500),
      clean(body.stage, 40),
      clean(body.url, 500),
      clean(body.repo, 500),
      clean(body.demo, 500),
      clean(body.cover_image, 500),
      fields.lead_name,
      leadEmail,
      clean(body.location, 160),
      clean(body.team, 1000),
      clean(body.tags, 500),
      clean(request.headers.get("user-agent"), 400),
    )
    .run();

  return json({
    ok: true,
    id: result.meta?.last_row_id ?? null,
    slug,
  });
}
