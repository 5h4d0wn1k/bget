import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "@/components/icons";
import type { Problem } from "@/lib/problems";
import { formatProblemDate } from "@/lib/problems-utils";
import { statusLabel, statusTone } from "./status";
import styles from "./problems.module.css";

/**
 * A single row of the queue — rendered server-side so the full list is always
 * present in the SSR HTML for crawlers. Client filtering only toggles which
 * cards are shown; it never refetches.
 */
export default function QueueCard({ problem }: { problem: Problem }) {
  const p = problem;
  const href = `/problems/${p.id}`;

  return (
    <article className={styles.card}>
      <header className={styles.cardTop}>
        <span className={styles.cardIndex} aria-hidden="true">
          {p.index}
        </span>
        <span className={`${styles.pill} ${statusTone(p.status)}`}>{statusLabel(p.status)}</span>
        {p.champion && <span className={styles.championPill}>Championed</span>}
      </header>

      <h3 className={styles.cardTitle}>
        <Link href={href}>{p.title}</Link>
      </h3>

      <p className={styles.cardSummary}>{p.summary}</p>

      <p className={styles.cardMeta}>
        <span>{p.location}</span>
        <span aria-hidden="true">·</span>
        <span>{p.proposedBy}</span>
        <span aria-hidden="true">·</span>
        <time dateTime={p.lastUpdated}>{formatProblemDate(p.lastUpdated)}</time>
      </p>

      <footer className={styles.cardFooter}>
        <div className={styles.cardLinks}>
          {p.efforts.map((effort) => (
            <a
              key={effort.url}
              className={styles.extLink}
              href={effort.url}
              target="_blank"
              rel="noreferrer noopener"
            >
              {effort.label}
              <ArrowUpRight size={12} aria-hidden="true" />
            </a>
          ))}
          <a
            className={styles.extLink}
            href={p.discussion}
            target="_blank"
            rel="noreferrer noopener"
          >
            Discussion
            <ArrowUpRight size={12} aria-hidden="true" />
          </a>
        </div>

        <Link className={styles.detailsBtn} href={href}>
          Details
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </footer>
    </article>
  );
}