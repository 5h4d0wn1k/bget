import { NextResponse } from "next/server";
import { getAdminToken, updateSubmissionStatus } from "@/lib/server/db";

/**
 * Admin status endpoint — v0, guarded by a single shared token.
 *
 *   POST /api/admin/status
 *   Content-Type: application/json
 *   { "id": 12, "status": "reviewing" }
 *
 * When the ADMIN_TOKEN env/binding is set, the request must carry
 * `Authorization: Bearer <ADMIN_TOKEN>`. When it is not set the endpoint is
 * open (see the "open mode" chip in the admin top bar) — that is a deliberate
 * v0 trade-off documented in the README.
 */
async function authorized(request: Request): Promise<boolean> {
  const token = getAdminToken();
  if (!token) return true; // open mode
  const header = request.headers.get("authorization") ?? "";
  return header === `Bearer ${token}`;
}

export async function POST(request: Request) {
  if (!(await authorized(request))) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let body: { id?: unknown; status?: unknown } = {};
  try {
    body = (await request.json()) as { id?: unknown; status?: unknown };
  } catch {
    return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 });
  }

  const id = Number(body.id);
  const status = typeof body.status === "string" ? body.status : "";
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ ok: false, error: "bad-id" }, { status: 400 });
  }

  const ok = await updateSubmissionStatus(id, status);
  if (!ok) {
    return NextResponse.json(
      { ok: false, error: "bad-status-or-db" },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true });
}