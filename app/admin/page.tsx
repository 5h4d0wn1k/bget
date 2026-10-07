import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ClipboardList, Users } from "lucide-react";
import { hasDb, listSubmissions } from "@/lib/server/db";
import styles from "./admin.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard — BGET Admin",
};

const ROADMAP = [
  {
    phase: "v1 triage",
    text: "The status picker is live now — move rows new → reviewing → accepted / declined (archived for out-of-scope).",
  },
  {
    phase: "soon",
    text: "Wire app/api/submit to recordSubmission(...) so every Discord delivery also lands in D1 (data layer is ready in lib/server/db.ts).",
  },
  {
    phase: "later",
    text: "Founder login beyond the ADMIN_TOKEN header, per-application threads, a moderation queue, CSV export, audit log.",
  },
] as const;

export default async function AdminDashboardPage() {
  const [applyRows, problemRows] = await Promise.all([
    listSubmissions("apply"),
    listSubmissions("problems"),
  ]);

  const newApplications = applyRows.filter((row) => row.status === "new").length;
  const newProblems = problemRows.filter((row) => row.status === "new").length;
  const bound = hasDb();

  return (
    <>
      <header className={styles.pageHeader}>
        <div>
          <p className="eyebrow">BGET · Admin</p>
          <h1 className={styles.pageTitle}>Dashboard</h1>
          <p className={styles.pageLead}>
            Incoming applications and problem submissions, newest first. Everything here reads
            from D1 — the panel is a v0 scaffold, honest about what it is.
          </p>
        </div>
        <span className={`${styles.pill} ${bound ? styles.pillAccepted : styles.pillUnknown}`}>
          {bound ? "D1 bound" : "D1 unbound"}
        </span>
      </header>

      <div className={styles.statGrid}>
        <Link href="/admin/applications" className={styles.statCard}>
          <span className={styles.statCardLabel}>
            <Users size={15} aria-hidden="true" /> New applications
          </span>
          <span className={styles.statCardValue}>{newApplications}</span>
          <span className={styles.statCardHint}>
            {applyRows.length} total recorded · review queue
          </span>
        </Link>
        <Link href="/admin/problems" className={styles.statCard}>
          <span className={styles.statCardLabel}>
            <ClipboardList size={15} aria-hidden="true" /> New problems
          </span>
          <span className={styles.statCardValue}>{newProblems}</span>
          <span className={styles.statCardHint}>
            {problemRows.length} total recorded · triage queue
          </span>
        </Link>
      </div>

      <section className={styles.panel}>
        <p className="eyebrow">How the panel grows</p>
        <h2 className={styles.panelTitle}>v0 today — three read-mostly pages.</h2>
        <ul className={styles.panelList}>
          {ROADMAP.map((item) => (
            <li key={item.phase} className={styles.panelListItem}>
              <strong>{item.phase}</strong>
              <span>{item.text}</span>
            </li>
          ))}
        </ul>
      </section>

      {!bound && (
        <section className={styles.empty} aria-live="polite">
          <h2 className={styles.emptyTitle}>No D1 binding yet</h2>
          <p className={styles.emptyText}>
            Connect Cloudflare, create the database and run{" "}
            <code>npx wrangler d1 execute bget-db --file=drizzle/schema.sql --remote</code> — the
            panel then shows live rows. Full steps in the README, “D1 setup”.
          </p>
        </section>
      )}

      <Link href="/admin/applications" className={styles.linkArrow}>
        Open the applications queue <ArrowRight size={15} aria-hidden="true" />
      </Link>
    </>
  );
}