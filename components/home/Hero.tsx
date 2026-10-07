import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowRight } from "lucide-react";
import Globe from "./Globe";
import styles from "./home.module.css";
import { SITE } from "@/lib/site";

function delay(ms: number): CSSProperties {
  return { "--reveal-delay": `${ms}ms` } as CSSProperties;
}

/**
 * THE COVER — the ink band above the fold.
 * Single h1 lockup, masked line-by-line reveal, gold/ghost CTAs and the
 * inverted wireframe globe. `.grain` (globals) adds the static grain overlay.
 */
export default function Hero() {
  return (
    <section className={`${styles.cover} grain`} aria-labelledby="hero-heading">
      <div className={`${styles.coverInner} container`}>
        <div className={styles.heroText}>
          <p className="eyebrow eyebrow--gold reveal" style={delay(0)}>
            BGET — Build. Grow. Evolve. Together.
          </p>

          <h1 id="hero-heading" className={styles.heroTitle}>
            <span className={`reveal ${styles.h1line}`} style={delay(80)}>
              <span className={styles.h1mask}>
                <span className={styles.h1maskInner}>The world has hard problems.</span>
              </span>
            </span>
            <span className={`reveal ${styles.h1line}`} style={delay(190)}>
              <span className={styles.h1mask}>
                <span className={styles.h1maskInner}>
                  We are <em className={styles.becoming}>becoming</em> the people who solve
                  them.
                </span>
              </span>
            </span>
          </h1>

          <p className={`reveal ${styles.heroSupport}`} style={delay(320)}>
            {SITE.description}
          </p>

          <div className={`reveal ${styles.heroCtas}`} style={delay(420)}>
            <Link href="/problems" className="btn btn--gold">
              Propose a problem
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link href="/apply" className={`btn ${styles.btnGhostInvert}`}>
              Apply to join BGET
            </Link>
          </div>

          <p className={`reveal ${styles.heroTrust}`} style={delay(520)}>
            Applications read personally · every problem answered
          </p>
        </div>

        <Globe />
      </div>
    </section>
  );
}