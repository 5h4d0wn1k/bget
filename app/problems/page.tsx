import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ChevronDown, Check, ShieldCheck, X } from "@/components/icons";
import { PROBLEMS } from "@/lib/problems";
import { SITE } from "@/lib/site";
import Queue from "@/components/problems/Queue";
import ProblemForm from "@/components/problems/ProblemForm";
import styles from "@/components/problems/problems.module.css";

export const metadata: Metadata = {
  title: "The Problem Queue — propose a world problem",
  description: PROBLEMS.page.description,
  alternates: { canonical: `${SITE.url}/problems` },
  openGraph: {
    title: PROBLEMS.page.title,
    description: PROBLEMS.page.description,
    url: `${SITE.url}/problems`,
    images: [
      {
        url: SITE.ogImage,
        width: 1200,
        height: 630,
        alt: "BGET — Build. Grow. Evolve. Together.",
      },
    ],
  },
};

function delay(ms: number): CSSProperties {
  return { "--reveal-delay": `${ms}ms` } as CSSProperties;
}

/**
 * Split the hero h1 into three masked lines with the accent word ("next?")
 * isolated on its own oversized serif-italic line.
 */
function splitHeroLines(): [string, string, string] {
  const accent = PROBLEMS.hero.h1Accent;
  const index = PROBLEMS.hero.h1.indexOf(accent);
  if (index === -1) return [PROBLEMS.hero.h1, "", accent];
  const prefix = PROBLEMS.hero.h1.slice(0, index).trimEnd();
  const words = prefix.split(" ");
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(" "), words.slice(mid).join(" "), accent];
}

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: PROBLEMS.faq.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

export default function ProblemsPage() {
  const [heroLine1, heroLine2, heroAccent] = splitHeroLines();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* --------------------------------------- 1 · Dark cover band */}
      <section className={`${styles.cover} grain`} aria-labelledby="problems-hero-title">
        <div className={`${styles.coverInner} container`}>
          <p className="eyebrow eyebrow--gold reveal" style={delay(0)}>
            {PROBLEMS.hero.eyebrow}
          </p>

          <h1 id="problems-hero-title" className={styles.coverH1}>
            <span className={`reveal ${styles.h1line}`} style={delay(90)}>
              <span className={styles.h1mask}>
                <span className={styles.h1maskInner}>{heroLine1}</span>
              </span>
            </span>
            <span className={`reveal ${styles.h1line}`} style={delay(180)}>
              <span className={styles.h1mask}>
                <span className={styles.h1maskInner}>{heroLine2}</span>
              </span>
            </span>
            <span className={`reveal ${styles.h1line}`} style={delay(270)}>
              <span className={styles.h1mask}>
                <span className={styles.h1maskInner}>
                  <em className={styles.h1Accent}>{heroAccent}</em>
                </span>
              </span>
            </span>
          </h1>

          <p className={`reveal ${styles.coverLead}`} style={delay(420)}>
            {PROBLEMS.hero.lead}
          </p>

          <p className={`reveal ${styles.coverTrust}`} style={delay(520)}>
            {PROBLEMS.hero.trust}
          </p>

          <div className={`reveal ${styles.coverCtas}`} style={delay(620)}>
            <Link href={PROBLEMS.hero.ctaPrimary.href} className="btn btn--gold">
              {PROBLEMS.hero.ctaPrimary.label}
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link
              href={PROBLEMS.hero.ctaSecondary.href}
              className={`btn ${styles.btnGhostOnDark}`}
            >
              {PROBLEMS.hero.ctaSecondary.label}
            </Link>
          </div>
        </div>
      </section>

      {/* ------------------------------------------ 2 · Founder note */}
      <section className={styles.founder} aria-label="A note from the founder">
        <div className={`${styles.founderInner} container-narrow reveal`}>
          <div className={styles.founderRow}>
            <span className={styles.founderInitial} aria-hidden="true">
              N
            </span>
            <blockquote className={styles.founderQuote}>
              <p>{PROBLEMS.founderNote.quote}</p>
              <footer className={styles.founderAttribution}>
                {PROBLEMS.founderNote.attribution}
              </footer>
            </blockquote>
          </div>
        </div>
      </section>

      {/* ------------------------------------------- 3 · How it works */}
      <section className={styles.steps} aria-labelledby="steps-title">
        <div className={`${styles.stepsInner} container-narrow`}>
          <header className={`${styles.stepsHead} reveal`}>
            <p className="eyebrow">The path of a problem</p>
            <h2 id="steps-title" className={styles.stepsTitle}>
              {PROBLEMS.stepsLabel}
            </h2>
          </header>

          <ol className={styles.stepsGrid}>
            {PROBLEMS.steps.map((step, i) => (
              <li key={step.num} className={`${styles.step} reveal`} style={delay(90 * i)}>
                <span className={styles.stepNum}>{step.num}</span>
                <div className={styles.stepBody}>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepText}>{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ------------------------------------------ 4 · Earns / Doesn't */}
      <section className={styles.columns} aria-label="What earns a place in the queue">
        <div className={`${styles.columnsInner} container-narrow`}>
          <div className={`${styles.col} reveal`}>
            <h2 className={styles.colTitle}>{PROBLEMS.earnsTitle}</h2>
            <ul className={styles.colList}>
              {PROBLEMS.earns.map((item) => (
                <li key={item} className={styles.colItem}>
                  <span className={styles.colIcon} aria-hidden="true">
                    <Check size={15} />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className={`${styles.col} ${styles.colDoesnt} reveal`} style={delay(140)}>
            <h2 className={styles.colTitle}>{PROBLEMS.doesntTitle}</h2>
            <ul className={styles.colList}>
              {PROBLEMS.doesnt.map((item) => (
                <li key={item} className={styles.colItem}>
                  <span className={styles.colIconNo} aria-hidden="true">
                    <X size={14} />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* --------------------------------------------- 5 · The Queue */}
      <Queue />

      {/* --------------------------------------------- 6 · Submit form */}
      <section id="submit" className={styles.submitSection} aria-labelledby="submit-title">
        <div className={`${styles.submitInner} container-narrow`}>
          <header className={`${styles.submitHead} reveal`}>
            <p className="eyebrow">{PROBLEMS.submitLabel}</p>
            <h2 id="submit-title" className={styles.submitTitle}>
              {PROBLEMS.submitTitle}
            </h2>
            <p className={styles.submitSub}>{PROBLEMS.submitSub}</p>
          </header>

          <div className="reveal" style={delay(120)}>
            <ProblemForm />
          </div>

          <div className={`${styles.privacyNote} reveal`} style={delay(200)}>
            <ShieldCheck size={18} aria-hidden="true" />
            <p>{PROBLEMS.privacyNote}</p>
          </div>
        </div>
      </section>

      {/* -------------------------------- 7 · Partner / honesty clause */}
      <section className={styles.partner} aria-labelledby="partner-title">
        <div className={`${styles.partnerInner} container-narrow`}>
          <h2 id="partner-title" className={`${styles.partnerHeading} reveal`}>
            {PROBLEMS.partnerNote.heading}
          </h2>
          <div className={styles.partnerParagraphs}>
            {PROBLEMS.partnerNote.paragraphs.map((paragraph) => (
              <p key={paragraph} className={`${styles.partnerPara} reveal`}>
                {paragraph}
              </p>
            ))}
          </div>
          <div className={styles.partnerLinks}>
            {PROBLEMS.partnerNote.links.map((link, i) => (
              <Link
                key={link.url}
                href={link.url}
                className={`btn ${i === 0 ? "btn--primary" : "btn--ghost"} ${styles.partnerLink}`}
              >
                {link.label}
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ 8 · FAQ */}
      <section className={styles.faq} aria-labelledby="faq-title">
        <div className={`${styles.faqInner} container-narrow`}>
          <header className="reveal">
            <p className="eyebrow">FAQ</p>
            <h2 id="faq-title" className={styles.faqTitle}>
              Straight answers.
            </h2>
          </header>
          <div className={styles.faqList}>
            {PROBLEMS.faq.map((item, i) => (
              <details
                key={item.q}
                className={`${styles.faqItem} reveal`}
                style={delay(80 * (i + 1))}
              >
                <summary className={styles.faqSummary}>
                  <span>{item.q}</span>
                  <ChevronDown size={16} className={styles.faqChevron} aria-hidden="true" />
                </summary>
                <p className={styles.faqAnswer}>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------- 9 · Closing CTA */}
      <section className={`${styles.cta} grain`} aria-labelledby="cta-title">
        <div className={`${styles.ctaInner} container-narrow reveal`}>
          <p className="eyebrow eyebrow--gold">The queue is open</p>
          <h2 id="cta-title" className={styles.ctaTitle}>
            {PROBLEMS.cta.label}
          </h2>
          <div className={styles.ctaCtas}>
            <Link href={PROBLEMS.cta.ctaPrimary.href} className="btn btn--gold">
              {PROBLEMS.cta.ctaPrimary.label}
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link href={PROBLEMS.cta.ctaSecondary.href} className={`btn ${styles.btnGhostOnDark}`}>
              {PROBLEMS.cta.ctaSecondary.label}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}