/**
 * BGET Worker
 *
 * Serves the static Next.js export (via the ASSETS binding) and handles the
 * small JSON API used by the public forms:
 *
 *   GET  /api/health    -> liveness probe
 *   POST /api/apply     -> membership application      -> D1 `applications`
 *   POST /api/problems  -> problem-commons submission  -> D1 `problems`
 *
 * Everything else falls through to the static export.
 */

const JSON_HEADERS = { "content-type": "application/json; charset=utf-8" };

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}

function clean(value, max = 2000) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

function isEmail(value) {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function readBody(request) {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) return {};
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) {
      try {
        return await handleApi(request, env, url);
      } catch {
        return json({ ok: false, error: "server_error" }, 500);
      }
    }
    // Static export handles the rest.
    return env.ASSETS.fetch(request);
  },
};

async function handleApi(request, env, url) {
  const path = url.pathname;

  if (path === "/api/health") {
    return json({ ok: true, service: "bget" });
  }

  if (request.method !== "POST") {
    return json({ ok: false, error: "method_not_allowed" }, 405);
  }

  const body = await readBody(request);
  if (body === null) return json({ ok: false, error: "invalid_json" }, 400);

  // Honeypot: real people never fill a hidden "website" field. Pretend success.
  if (clean(body.website)) return json({ ok: true, id: null });

  if (path === "/api/apply") return handleApply(body, env, request);
  if (path === "/api/problems") return handleProblems(body, env, request);

  return json({ ok: false, error: "not_found" }, 404);
}

async function handleApply(body, env, request) {
  const name = clean(body.name, 120);
  const email = clean(body.email, 254);
  const building = clean(body.building, 3000);

  if (!name || !isEmail(email) || !building) {
    return json({ ok: false, error: "missing_fields" }, 422);
  }

  const result = await env.DB.prepare(
    `INSERT INTO applications
       (name, email, location, disciplines, links, building, struggling, why_bget, referral, user_agent)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      name,
      email,
      clean(body.location, 160),
      clean(body.disciplines, 500),
      clean(body.links, 1000),
      building,
      clean(body.struggling, 3000),
      clean(body.why_bget, 3000),
      clean(body.referral, 200),
      clean(request.headers.get("user-agent"), 400),
    )
    .run();

  return json({ ok: true, id: result.meta?.last_row_id ?? null });
}

async function handleProblems(body, env, request) {
  const title = clean(body.title, 200);
  const description = clean(body.description, 5000);
  const email = clean(body.email, 254);

  if (!title || !description) {
    return json({ ok: false, error: "missing_fields" }, 422);
  }
  if (email && !isEmail(email)) {
    return json({ ok: false, error: "invalid_email" }, 422);
  }

  const requested = clean(body.visibility, 20);
  const visibility = ["public", "bget", "private"].includes(requested) ? requested : "bget";

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
      clean(body.affected, 3000),
      clean(body.tried, 3000),
      clean(body.success_looks_like, 3000),
      clean(body.why_bget, 3000),
      clean(body.contribution, 3000),
      visibility,
      clean(request.headers.get("user-agent"), 400),
    )
    .run();

  return json({ ok: true, id: result.meta?.last_row_id ?? null });
}
