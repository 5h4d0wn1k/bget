import { NextResponse } from "next/server";

import { deliverToDiscord, field, type BgetFormKind } from "@/lib/server/discord";
import { recordSubmission } from "@/lib/server/db";

const MAX_SUBMITS = 6;
const RATE_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_LIMITER_ENTRIES = 500;

// Per-(ip, kind) timestamps of recent submissions. Best-effort single-isolate
// defense only — NOT a global rate limit. A cross-isolate cap needs a shared
// store (D1/KV), documented as a future owner step.
const submitHits = new Map<string, number[]>();

/** Best-effort client IP: Cloudflare's header, then X-Forwarded-For, then unknown. */
function clientIp(request: Request): string {
  const cf = request.headers.get("cf-connecting-ip");
  if (cf?.trim()) return cf.trim();
  const xff = request.headers.get("x-forwarded-for");
  if (xff?.trim()) return xff.split(",")[0].trim();
  return "unknown";
}

/** True when this (ip, kind) still has budget under MAX_SUBMITS per 15 minutes. */
function allowRequest(ip: string, kind: string): boolean {
  const now = Date.now();
  // Prune stale entries once per call when the map grows past ~500 entries.
  if (submitHits.size > MAX_LIMITER_ENTRIES) {
    for (const [key, hits] of submitHits) {
      if (hits[hits.length - 1] < now - RATE_WINDOW_MS) submitHits.delete(key);
    }
  }
  const key = `${ip}::${kind}`;
  const recent = (submitHits.get(key) ?? []).filter((t) => t > now - RATE_WINDOW_MS);
  if (recent.length >= MAX_SUBMITS) {
    submitHits.set(key, recent);
    return false;
  }
  recent.push(now);
  submitHits.set(key, recent);
  return true;
}

/**
 * Form delivery endpoint — used by the Apply and Problem forms.
 *
 * Accepts:
 *   POST /api/submit
 *   Content-Type: application/json
 *   { "kind": "apply" | "problems", "fields": { name: value } }
 *
 *   — or —
 *
 *   Content-Type: multipart/form-data  (used when a résumé file is attached)
 *   form data: kind, plus any number of text inputs, plus optional `resume-file`.
 *
 * The browser NEVER sees a webhook: this route runs server-side, forwards to
 * Discord under an env binding, and returns a reference id for the receipt UI.
 *
 * Secrets live in Cloudflare environment bindings / process.env — never in
 * client code.
 */
export async function POST(request: Request) {
  // Reject oversized payloads before any parsing or delivery.
  const contentLength = Number(request.headers.get("content-length"));
  if (contentLength > 1_500_000) {
    return NextResponse.json(
      {
        ok: false,
        error: "payload-too-large",
        message: "This submission is too large to accept — please trim it and try again.",
      },
      { status: 413 }
    );
  }

  const contentType = request.headers.get("content-type") || "";

  let kind: BgetFormKind | "" = "";
  let fields: Record<string, string> = {};
  let resumeMeta: string | null = null;
  let resumeText: string | null = null;

  if (contentType.includes("multipart/form-data")) {
    const fd = await request.formData();
    // Reject any attached file (résumé or otherwise) that is too large.
    for (const value of fd.values()) {
      if (value instanceof File && value.size > 2_000_000) {
        return NextResponse.json(
          {
            ok: false,
            error: "file-too-large",
            message: "The attached file is too large — please keep it under 2 MB.",
          },
          { status: 413 }
        );
      }
    }
    const raw = (fd.get("kind") as string | null) ?? "";
    kind = raw === "apply" || raw === "problems" ? raw : "";
    for (const [key, value] of fd.entries()) {
      if (key === "kind") continue;
      if (value instanceof File) {
        const meta = `${value.name} · ${(value.size / 1024).toFixed(0)} KB · ${value.type || "file"}`;
        if (key === "resume-file") {
          resumeMeta = meta;
          if (value.size > 0 && value.size <= 300 * 1024) {
            try {
              const text = await value.text();
              if (text.trim()) resumeText = text.trim().slice(0, 3000);
            } catch {
              /* binary file — keep meta only */
            }
          }
        } else {
          fields[key] = meta;
        }
      } else {
        fields[key] = String(value);
      }
    }
  } else {
    let body: { kind?: string; fields?: Record<string, unknown> } = {};
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 });
    }
    kind = (body.kind ?? "") as BgetFormKind | "";
    fields = {};
    for (const [k, v] of Object.entries(body.fields ?? {})) {
      fields[k] = String(v ?? "");
    }
    if (JSON.stringify(fields).length > 1_500_000) {
      return NextResponse.json(
        {
          ok: false,
          error: "payload-too-large",
          message: "This submission is too large to accept — please trim it and try again.",
        },
        { status: 413 }
      );
    }
    const paste = fields["resume-text"];
    if (paste) {
      resumeText = paste.trim().slice(0, 3000);
      delete fields["resume-text"];
    }
  }

  if (kind !== "apply" && kind !== "problems") {
    return NextResponse.json({ ok: false, error: "bad-kind" }, { status: 400 });
  }

  // Best-effort per-IP cap for POST /api/submit (single-isolate only — not a
  // global limit). A shared store is the documented future owner step.
  if (!allowRequest(clientIp(request), kind)) {
    return NextResponse.json(
      {
        ok: false,
        error: "rate-limited",
        message: "You're submitting too fast — please wait a few minutes and try again.",
        retryAfter: 900,
      },
      { status: 429 }
    );
  }

  // Honeypots — bots fill hidden traps, humans don't. Swallow silently.
  if (fields["website"]?.trim() || fields["fax"]?.trim()) {
    return NextResponse.json({ ok: true, ref: "-" });
  }

  // Render embed fields (trim + truncate each value).
  const embedFields = Object.entries(fields)
    .filter(([, v]) => v && v.trim() !== "")
    .map(([k, v]) => field(k.replace(/[_]+/g, " "), v.trim()));

  // Résumé as a single field (paste text first, else the uploaded file).
  if (resumeText) {
    embedFields.push(field("Résumé", resumeText.slice(0, 1024)));
  } else if (resumeMeta) {
    embedFields.push(field("Résumé (file)", resumeMeta));
  }

  const title = kind === "apply" ? "📋 New BGET application" : "🌍 New problem submission";
  const delivered = await deliverToDiscord(kind, title, embedFields);
  if (delivered !== true) {
    // Never claim a form was accepted when the webhook rejected it.
    return NextResponse.json(
      {
        ok: false,
        error: "not-delivered",
        message: "We couldn't deliver your submission right now — please email it to us.",
      },
      { status: 502 }
    );
  }

  const ref = `BGET-${kind === "apply" ? "A" : "P"}-${Date.now().toString(36).toUpperCase()}`;

  // Persist for the admin panel (growth path). Fail-soft + never blocks: if D1
  // is unbound or the write fails, the form was already delivered to Discord,
  // so the applicant still gets their ref.
  await recordSubmission(kind, fields, ref);

  return NextResponse.json({ ok: true, ref });
}