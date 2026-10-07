import Link from "next/link";
import styles from "@/components/manifesto/manifesto.module.css";

/**
 * Branded 404 — ink cover, one headline, two ways home.
 * Rendered by the root layout, so Header/Footer stay in place.
 */
export default function NotFound() {
  return (
    <section className={`${styles.cover} grain`} aria-labelledby="not-found-title">
      <div className={`${styles.coverInner} container-narrow`}>
        <p className="eyebrow eyebrow--gold">BGET · Four-oh-four</p>

        <h1 id="not-found-title" className={styles.coverH1}>
          This page is <em className={styles.coverAccent}>missing</em>.
        </h1>

        <p className={styles.coverTrust}>ERROR 404 · NOWHERE IN THE MANIFESTO</p>

        <p className={styles.notFoundCopy}>
          The page you&rsquo;re after doesn&rsquo;t exist — or it moved. Either way, the community
          is right here.
        </p>

        <div className={styles.notFoundCtas}>
          <Link href="/" className="btn btn--primary">
            Back home
          </Link>
          <Link href="/manifesto" className={`btn ${styles.btnGhostOnDark}`}>
            Read the manifesto
          </Link>
        </div>
      </div>
    </section>
  );
}