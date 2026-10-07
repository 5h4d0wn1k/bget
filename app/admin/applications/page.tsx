import type { Metadata } from "next";
import { hasDb, listSubmissions } from "@/lib/server/db";
import StatusSelect from "../StatusSelect";
import { clamp, formatDate, parseFields } from "../admin-utils";
import styles from "../admin.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Applications — BGET Admin",
};

const PILL_CLASS: Record<string, string> = {
  new: styles.pillNew,
  reviewing: styles.pillReviewing,
  accepted: styles.pillAccepted,
  declined: styles.pillDeclined,
  archived: styles.pillArchived,
};

export default async function AdminApplicationsPage() {
  const rows = await listSubmissions("apply");
  const bound = hasDb();

  return (
    <>
      <header className={styles.pageHeader}>
        <div>
          <p className="eyebrow">BGET · Admin</p>
          <h1 className={styles.pageTitle}>Applications</h1>
          <p className={styles.pageLead}>
            Membership applications, newest first. Read personally, one row at a time — the
            status picker is the whole triage loop for now.
          </p>
        </div>
      </header>

      {!bound ? (
        <section className={styles.empty}>
          <h2 className={styles.emptyTitle}>No D1 binding yet</h2>
          <p className={styles.emptyText}>
            Connect Cloudflare and run{" "}
            <code>npx wrangler d1 execute bget-db --file=drizzle/schema.sql --remote</code> (see
            README, “D1 setup”). Submissions recorded before the binding exists are not backfilled.
          </p>
        </section>
      ) : rows.length === 0 ? (
        <section className={styles.empty}>
          <h2 className={styles.emptyTitle}>No applications recorded</h2>
          <p className={styles.emptyText}>
            Once app/api/submit calls <code>recordSubmission(...)</code>, every application lands
            here with its receipt ref.
          </p>
        </section>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Ref</th>
                <th>Received</th>
                <th>Name</th>
                <th>Status</th>
                <th>Fields</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const fields = parseFields(row.fields_json);
                const name = clamp(fields["q_name"] ?? fields["name"] ?? "", 60);
                return (
                  <tr key={row.id}>
                    <td className={styles.ref}>{row.ref}</td>
                    <td className={styles.dateCell}>{formatDate(row.created_at)}</td>
                    <td className={styles.cellClamped}>{name || "—"}</td>
                    <td className={styles.statusCol}>
                      <span className={`${styles.pill} ${PILL_CLASS[row.status] ?? styles.pillUnknown}`}>
                        {row.status}
                      </span>
                      <StatusSelect id={row.id} status={row.status} />
                    </td>
                    <td>
                      <details className={styles.fields}>
                        <summary className={styles.fieldsSummary}>View fields JSON</summary>
                        <pre className={styles.fieldsPre}>{JSON.stringify(fields, null, 2)}</pre>
                      </details>
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
            Use the status picker on each row: <strong>new</strong> → <strong>reviewing</strong>{" "}
            → <strong>accepted</strong> / <strong>declined</strong>, or{" "}
            <strong>archived</strong> to park rows you do not want in the live view. The picker
            posts to /api/admin/status.
          </p>
        </div>
      )}
    </>
  );
}