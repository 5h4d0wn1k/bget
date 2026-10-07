import styles from "./home.module.css";

const WORDS = ["Build", "Grow", "Evolve", "Together"];

/** Number of full copies of the word set per half of the track. */
const COPIES = 3;

/**
 * MARQUEE — a slow, purely-CSS ticker band. Pauses on hover, killed by the
 * global reduced-motion styles. Decorative: duplicates the tagline already
 * present in the page, so it is hidden from assistive tech.
 */
export default function Marquee() {
  const half = Array.from({ length: COPIES }, () => WORDS).flat();

  const renderHalf = (keyPrefix: string) =>
    half.map((word, i) => (
      <span key={`${keyPrefix}-${i}`} className={styles.marqueeInner}>
        <span className={styles.marqueeWord}>{word}</span>
        <span className={styles.marqueeDot} aria-hidden="true">
          ·
        </span>
      </span>
    ));

  return (
    <div className={styles.marquee} aria-hidden="true">
      <div className={styles.marqueeTrack}>
        {renderHalf("a")}
        {renderHalf("b")}
      </div>
    </div>
  );
}