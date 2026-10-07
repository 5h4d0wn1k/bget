import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowUpRight } from "lucide-react";
import styles from "./home.module.css";

interface LedgerRow {
  num: string;
  word: string;
  rest: string;
  href: string;
}

const ROWS: LedgerRow[] = [
  {
    num: "01",
    word: "Global",
    rest: "multidisciplinary community",
    href: "/manifesto",
  },
  {
    num: "02",
    word: "26 chapters",
    rest: "of the BGET Manifesto",
    href: "/manifesto",
  },
  {
    num: "03",
    word: "0 barriers",
    rest: "no paywall, no pedigree required",
    href: "/apply",
  },
  {
    num: "04",
    word: "1 rule",
    rest: "character before capability",
    href: "/apply",
  },
];

/**
 * THE LEDGER — four monospaced rows on paper, sitting on the dark→light edge.
 * Tabular numerals, hairlines, green-tinted hover fill + arrow.
 */
export default function Ledger() {
  return (
    <section className={styles.ledger} aria-label="The BGET ledger">
      <div className={`${styles.ledgerInner} container`}>
        <p className={`${styles.ledgerLabel} reveal`}>BGET · in four rows</p>
        <ol className={styles.ledgerList}>
          {ROWS.map((row, i) => (
            <li
              key={row.num}
              className={`reveal ${styles.ledgerRow}`}
              style={delay(i * 110)}
            >
              <Link href={row.href} className={styles.ledgerLink}>
                <span className={styles.ledgerNum} aria-hidden="true">
                  {row.num}
                </span>
                <span className={styles.ledgerText}>
                  <span className={styles.ledgerWord}>{row.word}</span>
                  <span className={styles.ledgerDash} aria-hidden="true">
                    —
                  </span>
                  <span className={styles.ledgerRest}>{row.rest}</span>
                </span>
                <ArrowUpRight size={18} className={styles.ledgerArrow} aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function delay(ms: number): CSSProperties {
  return { "--reveal-delay": `${ms}ms` } as CSSProperties;
}