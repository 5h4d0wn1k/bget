import type { Metadata } from "next";
import { hasDb, listSubmissions } from "@/lib/server/db";
import StatusSelect from "../StatusSelect";
import { clamp, formatDate, parseFields } from "../admin-utils";
import styles from "../admin.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Problems — BGET Admin",
};

const PILL_CLASS: Record<string, string> = {
  new: styles.pillNew,
  reviewing: styles.pillReviewing,
  accepted: styles.pillAccepted,
  declined: styles.pillDeclined,
  archived: styles.pillArchived,
};

export default async function AdminProblemsPage() {
  const rows = await listSubmissions("problems");
  const bound = hasDb();

  return (
    <>
      <header className={styles.pageHeader}>
        <div>
          <p className="eyebrow">BGET · Admin</p>
          <h1 className={styles.pageTitle}>Problems</h1>
          <p className={styles.pageLead}>
            Problem submissions from the queue form, newest first. Every submission is read
            personally — statuses reflect where triage stands.
          </p>
        </div>
      </header>

      {!bound ? (
        <section className={styles.empty}>
          <h2 className={styles.emptyTitle}>No D1 binding yet</h2>
          <p className={styles.emptyText}>
            Connect Cloudflare and run{" "}
            <code>npx wrangler d1 execute bget-db --file=drizzle/schema.sql --remote</code> (see
            README, “D1 setup”).
          </p>
        </section>
      ) : rows.length === 0 ? (
        <section className={styles.empty}>
          <h2 className={styles.emptyTitle}>No problems recorded</h2>
          <p className={styles.emptyText}>
            Once app/api/submit calls <code>recordSubmission(...)</code>, every problem lands here
            with its receipt ref.
          </p>
        </section>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Ref</th>
                <th>Received</th>
                <th>Problem</th>
                <th>Where · credit</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const fields = parseFields(row.fields_json);
                const problem = clamp(fields["problem_what"], 220) || "—";
                const where =
                  clamp(fields["problem_where"] ?? fields["where"], 70) || undefined;
                const credit = fields["credit"] || undefined;
                return (
                  <tr key={row.id}>
                    <td className={styles.ref}>{row.ref}</td>
                    <td className={styles.dateCell}>{formatDate(row.created_at)}</td>
                    <td className={styles.cellClamped}>{problem}</td>
                    <td className={styles.cellClamped}>
                      {[where, credit].filter(Boolean).join(" · ") || "—"}
                    </td>
                    <td className={styles.statusCol}>
                      <span className={`${styles.pill} ${PILL_CLASS[row.status] ?? styles.pillUnknown}`}>
                        {row.status}
                      </span>
                      <StatusSelect id={row.id} status={row.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {bound && rows.length > 0 && (
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Triage</h2>
          <p className={styles.panelText}>
            Same loop as applications: <strong>new</strong> → <strong>reviewing</strong> →{" "}
            <strong>accepted</strong> / <strong>declined</strong>, or{" "}
            <strong>archived</strong>. Accepted problems may graduate to the public queue in
            content/problems.json.
          </p>
        </div>
      )}
    </>
  );
}