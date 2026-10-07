"use client";

import Link from "next/link";
import styles from "@/components/manifesto/manifesto.module.css";

/**
 * Root error boundary — minimal, on-brand. Renders inside the root layout so
 * Header/Footer stay in place while the page is replaced.
 */
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className={styles.errorWrap}>
      <div className={styles.errorCard}>
        <p className={styles.errorCode}>ERROR 500</p>
        <h1 className={styles.errorTitle}>Something broke.</h1>
        <p className={styles.errorText}>
          That&rsquo;s on us, not you. Back home is safe — or try the page once more.
        </p>
        <div className={styles.errorCtas}>
          <Link href="/" className="btn btn--primary">
            Back home
          </Link>
          <button type="button" className="btn btn--ghost" onClick={() => reset()}>
            Try again
          </button>
        </div>
      </div>
    </section>
  );
}