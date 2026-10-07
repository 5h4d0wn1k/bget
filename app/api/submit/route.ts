import { NextResponse } from "next/server";
import { deliverToDiscord, field, type BgetFormKind } from "@/lib/server/discord";

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
  const contentType = request.headers.get("content-type") || "";

  let kind: BgetFormKind | "" = "";
  let fields: Record<string, string> = {};
  let resumeMeta: string | null = null;
  let resumeText: string | null = null;

  if (contentType.includes("multipart/form-data")) {
    const fd = await request.formData();
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
    const paste = fields["resume-text"];
    if (paste) {
      resumeText = paste.trim().slice(0, 3000);
      delete fields["resume-text"];
    }
  }

  if (kind !== "apply" && kind !== "problems") {
    return NextResponse.json({ ok: false, error: "bad-kind" }, { status: 400 });
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
  await deliverToDiscord(kind, title, embedFields);

  const ref = `BGET-${kind === "apply" ? "A" : "P"}-${Date.now().toString(36).toUpperCase()}`;

  return NextResponse.json({ ok: true, ref });
}