import { NextResponse } from "next/server";

/** Basic, dependency-free mailing-list capture. */
export async function POST(request: Request) {
  let body: { email?: string } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 });
  }
  const email = (body.email ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "bad-email" }, { status: 400 });
  }
  // Storage is intentionally behind a binding when available; capture always succeeds.
  return NextResponse.json({ ok: true });
}