import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "@/components/icons";
import { MANIFESTO } from "@/lib/manifesto";
import { SITE } from "@/lib/site";
import { closingExcerpt, delay, demoteHeadings, pad2 } from "@/lib/manifesto-utils";
import ChapterBody from "@/components/manifesto/ChapterBody";
import TocList from "@/components/manifesto/TocList";
import Kicker from "@/components/manifesto/kicker";
import styles from "@/components/manifesto/manifesto.module.css";

export const metadata: Metadata = {
  title: "The Manifesto — 26 chapters on human capability",
  description:
    "What BGET believes about capability, character and the compounding of human potential — twenty-six chapters, one north star.",
  alternates: { canonical: `${SITE.url}/manifesto` },
  openGraph: {
    title: "The BGET Manifesto — 26 chapters on human capability",
    description:
      "What BGET believes about capability, character and the compounding of human potential — twenty-six chapters, one north star.",
    url: `${SITE.url}/manifesto`,
  },
};

/**
 * The BGET Manifesto — a book landing with the full 26-chapter table of
 * contents, the founder's preamble, two closing sections, and a final call.
 */
export default function ManifestoPage() {
  return (
    <>
      {/* ------------------------------------------- 1 · Dark cover band */}
      <section className={`${styles.cover} grain`} aria-labelledby="manifesto-title">
        <div className={`${styles.coverInner} container`}>
          <Kicker tone="gold" className="reveal" style={delay(0)}>
            BGET · The Manifesto
          </Kicker>

          <h1 id="manifesto-title" className={`${styles.coverH1} reveal`} style={delay(90)}>
            The BGET Manifesto
          </h1>

          <p className={`${styles.coverLead} reveal`} style={delay(200)}>
            What BGET believes about capability, character, and the compounding of human{" "}
            <em className={styles.coverLeadAccent}>potential</em> — in twenty-six chapters.
          </p>

          <p className={`${styles.coverTrust} reveal`} style={delay(320)}>
            26 CHAPTERS · READ THE WHOLE THING IN ABOUT AN HOUR
          </p>
        </div>
      </section>

      {/* ------------------------------------------- 2 · The preamble */}
      <section className={styles.intro} aria-label="The vision">
        <div className="container-narrow">
          <Kicker className="reveal">The vision</Kicker>
          <div className="reveal" style={delay(80)}>
            <ChapterBody markdown={demoteHeadings(MANIFESTO.intro.body)} variant="intro" />
          </div>
        </div>
      </section>

      {/* ------------------------------------------- 3 · Table of contents */}
      <section className={styles.toc} aria-labelledby="toc-title">
        <div className="container-narrow">
          <header className={`${styles.tocHead} reveal`}>
            <Kicker>Contents</Kicker>
            <h2 id="toc-title" className={styles.tocTitle}>
              Twenty-six chapters.
            </h2>
            <p className={styles.tocLead}>
              Numbered like a book, readable in about an hour. Each chapter stands alone;
              read together, they compound.
            </p>
          </header>
          <TocList />
        </div>
      </section>

      {/* ------------------------------------------- 4 · Closing sections */}
      <section className={styles.closing} aria-labelledby="closing-title">
        <div className="container-narrow">
          <header className={`${styles.closingHead} reveal`}>
            <Kicker>Closing</Kicker>
            <h2 id="closing-title" className={styles.closingTitle}>
              Two pages to take with you.
            </h2>
          </header>

          <div className={styles.closingGrid}>
            {MANIFESTO.closing.map((section, i) => (
              <Link
                key={section.slug}
                href={`/manifesto/${section.slug}`}
                className={`${styles.closingCard} reveal`}
                style={delay(Math.min(i + 1, 4) * 70)}
              >
                <span className={styles.closingTag}>{pad2(i + 1)} · Closing</span>
                <span className={styles.closingCardTitle}>{section.title}</span>
                <span className={styles.closingQuote}>{closingExcerpt(section.body)}</span>
                <span className={styles.closingRead}>
                  Read this page
                  <ArrowRight size={14} aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------- 5 · Closing CTA band */}
      <section className={`${styles.cta} grain`} aria-labelledby="manifesto-cta-title">
        <div className={`${styles.ctaInner} container-narrow reveal`}>
          <Kicker tone="gold">Now it&rsquo;s yours</Kicker>
          <h2 id="manifesto-cta-title" className={styles.ctaTitle}>
            Read the whole thing — then come build something.
          </h2>
          <div className={styles.ctaCtas}>
            <Link href="/apply" className="btn btn--gold">
              Apply to join BGET
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link href="/problems" className={`btn ${styles.btnGhostOnDark}`}>
              Propose a problem
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}