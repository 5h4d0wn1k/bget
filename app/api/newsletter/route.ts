import { NextResponse } from "next/server";
import { recordSubscriber } from "@/lib/server/db";

/** Basic, dependency-free mailing-list capture backed by D1. */
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

  const stored = await recordSubscriber(email);
  if (!stored) {
    // Never claim the signup succeeded when it wasn't persisted.
    return NextResponse.json(
      {
        ok: false,
        error: "not-stored",
        message: "We couldn't save your email right now — message us at nikhilnagpure1111@gmail.com instead.",
      },
      { status: 503 }
    );
  }

  return NextResponse.json({ ok: true });
}