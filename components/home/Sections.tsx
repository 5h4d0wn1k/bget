import Link from "next/link";
import type { CSSProperties } from "react";
import {
  ArrowRight,
  Atom,
  Brain,
  Briefcase,
  Cpu,
  HeartPulse,
  Repeat,
  Sparkles,
  Wrench,
} from "lucide-react";
import styles from "./home.module.css";
import { PROBLEMS } from "@/lib/problems";
import { SITE } from "@/lib/site";

type IconType = typeof Atom;

interface Discipline {
  icon: IconType;
  name: string;
  blurb: string;
}

const DISCIPLINES: Discipline[] = [
  {
    icon: Atom,
    name: "Science",
    blurb: "Mathematics · Physics · Chemistry · Biology · Astronomy",
  },
  {
    icon: HeartPulse,
    name: "Medicine & Health",
    blurb: "Doctors · Surgeons · Neuroscientists · Psychologists",
  },
  {
    icon: Wrench,
    name: "Engineering",
    blurb: "Software · Robotics · Civil · Aerospace · Energy",
  },
  {
    icon: Cpu,
    name: "Technology",
    blurb: "AI · Security · Systems · Infrastructure · Open source",
  },
  {
    icon: Briefcase,
    name: "Business & Entrepreneurship",
    blurb: "Founders · Operators · Investors · Economists",
  },
  {
    icon: Brain,
    name: "Strategy & Thought",
    blurb: "Philosophers · Analysts · Planners · Educators",
  },
  {
    icon: Sparkles,
    name: "Other disciplines",
    blurb: "Law · Design · Arts · Agriculture · Space",
  },
];

interface LoopStep {
  num: string;
  title: string;
  desc: string;
  repeat?: boolean;
}

const LOOP: LoopStep[] = [
  {
    num: "01",
    title: "Find exceptional people",
    desc: "Every country. Every discipline. Character before capability.",
  },
  {
    num: "02",
    title: "Build together",
    desc: "Combine knowledge, skills and perspectives into action — not just discussion.",
  },
  {
    num: "03",
    title: "Test in the real world",
    desc: "Measure whether it actually works. Learn. Improve. Deploy responsibly.",
  },
  {
    num: "04",
    title: "Create positive impact",
    desc: "Solve real problems for real people — software, research, infrastructure, public good.",
  },
  {
    num: "05",
    title: "Repeat",
    desc: "Each pass attracts more exceptional people. Capability compounds.",
    repeat: true,
  },
];

const COMPULSIONS = [
  "Build boldly.",
  "Grow continuously.",
  "Evolve consciously.",
  "Help others rise.",
  "Think deeply.",
  "Act relentlessly.",
  "Stay humble.",
  "Care deeply.",
];

function delay(ms: number): CSSProperties {
  return { "--reveal-delay": `${ms}ms` } as CSSProperties;
}

/* --------------------------------------------------------------------------
   VISION
   -------------------------------------------------------------------------- */
export function VisionSection() {
  return (
    <section id="vision" className={styles.section} aria-labelledby="vision-title">
      <div className="container">
        <p className="eyebrow reveal">The vision</p>
        <h2 id="vision-title" className={`${styles.sectionTitle} reveal`} style={delay(80)}>
          One community. <em className={styles.serifAccent}>Every discipline.</em> Every
          country.
        </h2>
        <div className={styles.visionGrid}>
          <p className={`${styles.visionLead} reveal`} style={delay(160)}>
            {SITE.description}
          </p>
          <p className={`${styles.visionBody} reveal`} style={delay(220)}>
            BGET brings together people with different forms of intelligence, knowledge,
            skills, experiences, cultures and dreams — and turns those differences into a
            source of collective intelligence and collective action. Not a group chat.
            Not a conference. A compounding.
          </p>
        </div>
      </div>
      <div className="container-narrow">
        <blockquote className={`${styles.pullQuote} reveal`} style={delay(160)}>
          “The long-term vision is to create a place where{" "}
          <em>human capability compounds</em>.”
        </blockquote>
        <Link href="/manifesto" className={`${styles.pullAttribution} reveal`} style={delay(240)}>
          The BGET Manifesto · The Vision
          <ArrowRight size={13} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------------------
   DISCIPLINES
   -------------------------------------------------------------------------- */
export function DisciplinesSection() {
  return (
    <section id="disciplines" className={styles.section} aria-labelledby="disciplines-title">
      <div className="container">
        <p className="eyebrow reveal">Disciplines</p>
        <h2
          id="disciplines-title"
          className={`${styles.sectionTitle} reveal`}
          style={delay(80)}
        >
          Multidisciplinary <em className={styles.serifAccent}>by design.</em>
        </h2>
        <p className={`${styles.loopSub} reveal`} style={delay(160)}>
          Not a club for any single field. Exceptional people from virtually every
          discipline — and disciplines that do not exist yet.
        </p>
        <div className={styles.disciplineGrid}>
          {DISCIPLINES.map((d, i) => {
            const Icon = d.icon;
            return (
              <article
                key={d.name}
                className={`reveal ${styles.disciplineCard}`}
                style={delay(i * 90)}
              >
                <Icon className={styles.disciplineIcon} aria-hidden="true" />
                <h3 className={styles.disciplineName}>{d.name}</h3>
                <p className={styles.disciplineBlurb}>{d.blurb}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------------------
   THE BGET LOOP
   -------------------------------------------------------------------------- */
export function LoopSection() {
  return (
    <section id="loop" className={styles.section} aria-labelledby="loop-title">
      <div className="container">
        <p className="eyebrow reveal">How it works</p>
        <h2 id="loop-title" className={`${styles.sectionTitle} reveal`} style={delay(80)}>
          The BGET <em className={styles.serifAccent}>loop.</em>
        </h2>
        <p className={`${styles.loopSub} reveal`} style={delay(160)}>
          The whole philosophy in five moves, repeated until it compounds.
        </p>
        <ol className={styles.loopRows}>
          {LOOP.map((step, i) => (
            <li
              key={step.num}
              className={`reveal ${styles.loopRow}`}
              style={delay(i * 100)}
            >
              <span className={styles.loopNum}>{step.num}</span>
              <h3 className={styles.loopTitle}>
                {step.title}
                {step.repeat && <Repeat size={15} className={styles.loopRepeat} aria-hidden="true" />}
              </h3>
              <p className={styles.loopDesc}>{step.desc}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------------------
   THE PROBLEM QUEUE TEASER
   -------------------------------------------------------------------------- */
export function ProblemsTeaser() {
  return (
    <section
      id="problems"
      className={`${styles.problems} grain`}
      aria-labelledby="problems-title"
    >
      <div className={`${styles.problemsInner} container`}>
        <p className="eyebrow eyebrow--gold reveal">The problem queue</p>
        <h2
          id="problems-title"
          className={`${styles.problemsTitle} reveal`}
          style={delay(80)}
        >
          The world has a queue of{" "}
          <em className={styles.serifAccentGold}>unsolved problems</em>.
        </h2>
        <p className={`${styles.problemsLead} reveal`} style={delay(180)}>
          {PROBLEMS.hero.lead}
        </p>
        <div className={`${styles.problemsCtas} reveal`} style={delay(280)}>
          <Link href="/problems" className="btn btn--primary">
            Propose a problem
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <Link href="/apply" className={`btn ${styles.btnGhostInvert}`}>
            Apply to help build
          </Link>
        </div>
        <p className={`${styles.problemsTrust} reveal`} style={delay(360)}>
          No automation · No pay-to-play · Every submission is read by a person
        </p>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------------------
   NORTH STAR
   -------------------------------------------------------------------------- */
export function NorthStarSection() {
  return (
    <section
      id="north-star"
      className={styles.northStar}
      aria-labelledby="north-star-title"
    >
      <div className="container-narrow">
        <p className="eyebrow reveal">North star</p>
        <h2
          id="north-star-title"
          className={`${styles.nsTitle} reveal`}
          style={delay(80)}
        >
          Become more capable
          <br />
          without becoming less human.
        </h2>
        <p className={`${styles.nsSub} reveal`} style={delay(180)}>
          The compulsions we build on
        </p>
        <ul className={styles.nsList}>
          {COMPULSIONS.map((c, i) => (
            <li
              key={c}
              className={`${styles.nsItem} reveal`}
              style={delay(200 + i * 70)}
            >
              <span className={styles.nsIndex} aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              {c}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------------------
   CLOSING CTA
   -------------------------------------------------------------------------- */
export function ClosingCta() {
  return (
    <section id="join" className={styles.closing} aria-labelledby="closing-title">
      <div className="container-narrow">
        <p className={`${styles.closingKicker} reveal`}>Apply</p>
        <h2
          id="closing-title"
          className={`${styles.closingTitle} reveal`}
          style={delay(80)}
        >
          BGET is growing deliberately.
        </h2>
        <p className={`${styles.closingBody} reveal`} style={delay(180)}>
          Applications are read by a person. No automation, no pay-to-play — if you
          apply, your work speaks for you.
        </p>
        <div className={`${styles.closingCtas} reveal`} style={delay(280)}>
          <Link href="/apply" className="btn btn--dark">
            Apply to join BGET
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <Link href="/manifesto" className={`btn ${styles.btnInkGhost}`}>
            Read the manifesto
          </Link>
        </div>
      </div>
    </section>
  );
}