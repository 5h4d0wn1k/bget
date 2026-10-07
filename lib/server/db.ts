/**
 * BGET — D1 access layer (server-side).
 *
 * The admin panel reads and writes a small `submissions` table in D1
 * (schema: `drizzle/schema.sql`, applied with `wrangler d1 execute`).
 *
 * Every function here is defensive: when no D1 binding is configured (plain
 * `next dev`, a build without bindings, a Worker before `wrangler.toml` is
 * wired), `getDb()` returns null and callers degrade to an empty state instead
 * of crashing. The panel is an internal tool — it must never 500 because a
 * database binding is missing.
 */

import type { D1Database } from "@cloudflare/workers-types";

export type SubmissionKind = "apply" | "problems";
export type SubmissionStatus = "new" | "reviewing" | "accepted" | "declined" | "archived";

export interface Submission {
  id: number;
  ref: string;
  kind: string;
  fields_json: string;
  status: string;
  created_at: number;
}

export const SUBMISSION_STATUSES: readonly SubmissionStatus[] = [
  "new",
  "reviewing",
  "accepted",
  "declined",
  "archived",
];

export function isSubmissionStatus(value: string): value is SubmissionStatus {
  return (SUBMISSION_STATUSES as readonly string[]).includes(value);
}

const SUBMISSION_COLUMNS = "id, ref, kind, fields_json, status, created_at";

/** Resolve Cloudflare bindings from the OpenNext/Workers context, if present. */
function cloudflareEnv(): Record<string, unknown> | null {
  try {
    // The OpenNext runtime exposes Cloudflare bindings through getCloudflareContext.
    const { getCloudflareContext } = require("@opennextjs/cloudflare") as {
      getCloudflareContext: (options: { async: false }) => { env: unknown };
    };
    return getCloudflareContext({ async: false }).env as Record<string, unknown>;
  } catch {
    return null; // not running under OpenNext/Workers (plain dev, local, build)
  }
}

/** Resolve the D1 binding from the OpenNext/Workers context, if present. */
function bindingFromCloudflareContext(): D1Database | null {
  const db = cloudflareEnv()?.DB;
  return typeof db === "object" && db !== null ? (db as unknown as D1Database) : null;
}

/** Resolve the D1 binding from process.env (local dev), if present. */
function bindingFromEnv(): D1Database | null {
  const proc = process as unknown as { env?: Record<string, unknown> };
  const db = proc.env?.DB;
  return typeof db === "object" && db !== null ? (db as unknown as D1Database) : null;
}

/** The D1 binding, or null when unbound. Callers render an empty state on null. */
export function getDb(): D1Database | null {
  return bindingFromCloudflareContext() ?? bindingFromEnv();
}

/** True when a D1 binding is actually available. */
export function hasDb(): boolean {
  return getDb() !== null;
}

/**
 * Resolve the admin auth token (Workers binding first, then process.env for
 * local dev). Undefined = the panel runs in open mode.
 */
export function getAdminToken(): string | undefined {
  const bound = cloudflareEnv()?.ADMIN_TOKEN;
  if (typeof bound === "string" && bound) return bound;
  return process.env.ADMIN_TOKEN;
}

/**
 * Persist a form submission (apply or problems). No-op when D1 is unbound, so
 * form delivery is never blocked on the database. `fields` is stored verbatim
 * as JSON in `fields_json`; the panel parses it back on read.
 */
export async function recordSubmission(
  kind: SubmissionKind,
  fields: Record<string, string>,
  ref: string
): Promise<void> {
  const db = getDb();
  if (!db) return;
  try {
    await db
      .prepare(
        "INSERT INTO submissions (kind, ref, fields_json, status, created_at) VALUES (?, ?, ?, 'new', ?)"
      )
      .bind(kind, ref, JSON.stringify(fields), Date.now())
      .run();
  } catch (error) {
    // The panel must survive a broken DB; log and continue.
    console.error("[db] recordSubmission failed:", error);
  }
}

/** Latest-first rows for one kind (or every kind). Empty array when unbound. */
export async function listSubmissions(kind?: SubmissionKind): Promise<Submission[]> {
  const db = getDb();
  if (!db) return [];
  try {
    const result = kind
      ? await db
          .prepare(
            `SELECT ${SUBMISSION_COLUMNS} FROM submissions WHERE kind = ? ORDER BY id DESC`
          )
          .bind(kind)
          .all<Submission>()
      : await db
          .prepare(`SELECT ${SUBMISSION_COLUMNS} FROM submissions ORDER BY id DESC`)
          .all<Submission>();
    return result.results;
  } catch (error) {
    console.error("[db] listSubmissions failed:", error);
    return [];
  }
}

/** Flip a submission's status. Returns false when unbound or status is invalid. */
export async function updateSubmissionStatus(id: number, status: string): Promise<boolean> {
  const db = getDb();
  if (!db || !isSubmissionStatus(status)) return false;
  try {
    await db.prepare("UPDATE submissions SET status = ? WHERE id = ?").bind(status, id).run();
    return true;
  } catch (error) {
    console.error("[db] updateSubmissionStatus failed:", error);
    return false;
  }
}