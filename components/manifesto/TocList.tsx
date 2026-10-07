import Link from "next/link";
import { ArrowRight } from "@/components/icons";
import { MANIFESTO } from "@/lib/manifesto";
import { delay, pad2 } from "@/lib/manifesto-utils";
import styles from "./manifesto.module.css";

/**
 * Book-style table of contents — all 26 numbered chapters as hairline rows
 * with mono ledger numerals and a staggered reveal.
 */
export default function TocList() {
  return (
    <ul className={styles.tocList}>
      {MANIFESTO.chapters.map((chapter, index) => (
        <li
          key={chapter.slug}
          className={`${styles.tocItem} reveal`}
          style={delay(Math.min(index, 14) * 45)}
        >
          <Link className={styles.tocRow} href={`/manifesto/${chapter.slug}`}>
            <span className={styles.tocNum}>{pad2(chapter.number)}</span>
            <span className={styles.tocTitle}>{chapter.title}</span>
            <span className={styles.tocRead}>
              Read
              <ArrowRight size={14} aria-hidden="true" />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}