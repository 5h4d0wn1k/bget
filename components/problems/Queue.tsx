import type { CSSProperties } from "react";
import { PROBLEMS, getProblems } from "@/lib/problems";
import QueueCard from "./QueueCard";
import QueueFilter from "./QueueFilter";
import { statusDot, statusLabel } from "./status";
import styles from "./problems.module.css";

function delay(ms: number): CSSProperties {
  return { "--reveal-delay": `${ms}ms` } as CSSProperties;
}

/**
 * The Queue — status legend plus the client-filtered list.
 * Every card is rendered server-side; QueueFilter only toggles visibility.
 */
export default function Queue() {
  const problems = getProblems(); // champions first, then by index
  const items = problems.map((p) => ({
    id: p.id,
    categoryId: p.categoryId,
    card: <QueueCard key={p.id} problem={p} />,
  }));

  return (
    <section id="queue" className={styles.queue} aria-labelledby="queue-title">
      <div className={`${styles.queueInner} container`}>
        <header className={`${styles.queueHead} reveal`}>
          <p className="eyebrow">Live · curated by hand</p>
          <h2 id="queue-title" className={styles.queueTitle}>
            {PROBLEMS.queueLabel}
          </h2>
          <p className={styles.queueSub}>{PROBLEMS.queueSub}</p>
        </header>

        <div className={`${styles.legend} reveal`} style={delay(120)}>
          <p className={styles.legendTitle}>{PROBLEMS.queueLegendLabel}</p>
          <ul className={styles.legendGrid}>
            {PROBLEMS.statuses.map((status) => (
              <li key={status.id} className={styles.legendItem}>
                <span className={`${styles.legendDot} ${statusDot(status.id)}`} aria-hidden="true" />
                <span className={styles.legendMeta}>
                  <span className={styles.legendLabel}>{statusLabel(status.id)}</span>
                  <span className={styles.legendBlurb}>{status.blurb}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="reveal" style={delay(200)}>
          <QueueFilter categories={PROBLEMS.categories} items={items} />
        </div>
      </div>
    </section>
  );
}