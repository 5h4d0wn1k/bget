import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Mail, ShieldCheck } from "lucide-react";
import ApplyForm from "@/components/apply/ApplyForm";
import styles from "@/components/apply/apply.module.css";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Apply to join BGET",
  description:
    "Applications are read personally within 14 days — most are declined by design. Character before capability.",
};

const HOW_IT_WORKS = [
  {
    num: "01",
    title: "Apply",
    desc: "One form, read in full. Write like a human, not a cover letter.",
  },
  {
    num: "02",
    title: "Read personally",
    desc: "Every answer is read by a person. No filters, no auto-rejections, no algorithms.",
  },
  {
    num: "03",
    title: "Reply",
    desc: "Within 14 days, either way. A kind, honest no still respects your time.",
  },
  {
    num: "04",
    title: "Decision",
    desc: "If there’s a fit, a real conversation with a member before anything is confirmed.",
  },
] as const;

const RUBRIC = [
  { key: "Character", val: "Bottom line — are they genuine?" },
  { key: "Intent", val: "Do they care about people and positive impact?" },
  { key: "Capability", val: "What can they do — and what could they become?" },
  { key: "Trajectory", val: "Are they continuously improving?" },
  { key: "Balance", val: "Hard work while living a healthy, joyful life." },
] as const;

export default function ApplyPage() {
  return (
    <>
      {/* ------------------------------------------------ Header band */}
      <section className={styles.cover}>
        <div className={`${styles.coverInner} reveal`}>
          <p className="eyebrow">BGET · Membership</p>
          <h1 className={styles.coverH1}>
            Applications are open — and <em>read personally.</em>
          </h1>
          <p className={styles.lead}>
            BGET is a global community of builders, scientists, makers and thinkers. We add members
            slowly, by invitation and application — character before capability. Every application is
            read in full by a person, and every applicant receives an answer, including a no.
          </p>
          <p className={styles.trustLine} aria-label="Read personally · answered within 14 days · no is mostly the answer">
            <span className={styles.trustPart}>Read personally</span>
            <span className={styles.trustPart}>Answered within 14 days</span>
            <span className={styles.trustPart}>No is mostly the answer</span>
          </p>
        </div>
      </section>

      {/* ------------------------------------------- The honesty section */}
      <section className={styles.honesty}>
        <div className={`${styles.honestyInner} reveal`}>
          <p className="eyebrow">Before you apply</p>
          <h2 className={styles.honestyH2}>Straight answers, first.</h2>
          <p className={styles.honestyLead}>
            Three things worth knowing before you spend a quarter of an hour on this.
          </p>
          <ul className={styles.bullets}>
            <li className={styles.bullet}>
              <span className={styles.bulletIcon} aria-hidden="true">
                <Check size={16} />
              </span>
              <span>This takes about 15 honest minutes — twelve short essays.</span>
            </li>
            <li className={styles.bullet}>
              <span className={styles.bulletIcon} aria-hidden="true">
                <Check size={16} />
              </span>
              <span>
                There are no credentials required and no ranking boards. We judge character,
                trajectory, and how you think.
              </span>
            </li>
            <li className={styles.bullet}>
              <span className={styles.bulletIcon} aria-hidden="true">
                <Check size={16} />
              </span>
              <span>
                Most applications are declined. That is not a failure of yours — it is us being
                honest about fit.
              </span>
            </li>
          </ul>
          <blockquote className={styles.pullQuote}>
            <p className={styles.pullQuoteKicker}>A note on fit</p>
            <p className={styles.pullQuoteText}>
              Exceptional capability without character is not enough.
            </p>
          </blockquote>
        </div>
      </section>

      {/* ------------------------------------------- The application */}
      <section id="application" className={styles.apply}>
        <div className={styles.applyInner}>
          <div className={`${styles.applyIntro} reveal`}>
            <p className="eyebrow">The application</p>
            <h2 className={styles.applyH2}>Take your time. Write like yourself.</h2>
            <p className={styles.applyIntroLead}>
              A few facts, twelve short essays, and an optional résumé. Nothing here is scored by a
              machine — everything here is read by a person.
            </p>
          </div>

          <div className={styles.grid}>
            <div className="reveal">
              <ApplyForm />
            </div>

            <aside className={styles.aside} aria-label="How it works">
              <div className={`${styles.asideCard} reveal`}>
                <h3 className={styles.asideCardTitle}>How it works</h3>
                <div className={styles.howList}>
                  {HOW_IT_WORKS.map((step) => (
                    <div key={step.num} className={styles.howStep}>
                      <span className={styles.howNum}>{step.num}</span>
                      <div>
                        <p className={styles.howStepTitle}>{step.title}</p>
                        <p className={styles.howStepDesc}>{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`${styles.asideCard} reveal`}>
                <h3 className={`${styles.asideCardTitle} ${styles.rubricCardTitle}`}>
                  Character before capability
                </h3>
                {RUBRIC.map((row) => (
                  <div key={row.key} className={styles.rubricRow}>
                    <span className={styles.rubricKey}>{row.key}</span>
                    <span className={styles.rubricVal}>{row.val}</span>
                  </div>
                ))}
              </div>

              <div className={`${styles.asideCard} reveal`}>
                <h3 className={styles.asideCardTitle}>
                  <Mail size={14} aria-hidden="true" />
                  Applications inbox
                </h3>
                <a className={styles.inboxEmail} href={`mailto:${SITE.email}`}>
                  {SITE.email}
                </a>
                <p className={styles.asideNote}>
                  We reply to every application within 14 days — including a no. Add our address to
                  your contacts so the reply isn’t filtered.
                </p>
              </div>

              <div className={`${styles.asideCard} reveal`}>
                <h3 className={styles.asideCardTitle}>
                  <ShieldCheck size={14} aria-hidden="true" />
                  Docs & résumés
                </h3>
                <p className={styles.asideNote}>
                  Anything you attach is read as part of your application and never shared — it isn’t
                  stored publicly or syndicated anywhere.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ------------------------------------------- Cross-link to /problems */}
      <section className={`${styles.cross} grain`}>
        <div className={`${styles.crossInner} reveal`}>
          <p className="eyebrow eyebrow--gold">Have a problem, not a résumé?</p>
          <h2 className={styles.crossH2}>The Problem Queue needs no application.</h2>
          <p className={styles.crossLead}>
            The Problem Queue is where BGET accepts world problems from anyone — no application
            needed. Character not required; clarity is.
          </p>
          <Link href="/problems" className={`${styles.crossLink} btn btn--gold`}>
            Open the Problem Queue
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}