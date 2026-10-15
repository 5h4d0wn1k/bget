import type { Metadata } from "next";
import Link from "next/link";
import { PageShell, Section } from "@/components/site/page-shell";
import { JsonLd, articleLd } from "@/components/seo/json-ld";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Manifesto",
  description:
    "Capability without character is not enough. Why Build For Good exists, what we build, and the standard we hold each other to.",
  path: "/manifesto",
  type: "article",
});

const whatWeDo = [
  { k: "Build", v: "Software, startups, research, open source, hardware, creative work — real things that solve real problems." },
  { k: "Grow", v: "Technically, intellectually, physically, emotionally, socially. We do not separate the engineer from the human." },
  { k: "Evolve", v: "We challenge our own assumptions, take criticism without fragility, and become better thinkers than we were last month." },
  { k: "Together", v: "We collaborate instead of competing destructively. Someone else's win is information, not a threat." },
  { k: "Impact", v: "We measure success by what leaves the world better than we found it — people, society, and nature." },
  { k: "Harmoniously", v: "Ambition without cruelty. Competition without hatred. Disagreement without disrespect." },
];

const beliefs = [
  "Our actions matter, even when nobody is watching. Integrity is what you do in the dark.",
  "Intellectual humility and high ambition belong together. \u201cI don't know — let's figure it out\u201d is the most powerful sentence in any room.",
  "Character is a prerequisite, not a bonus. A brilliant person who manipulates, humiliates, or exploits others does not belong here.",
  "We are not a résumé club. Struggling out loud is respected here; pretending not to struggle is not.",
  "The first ten set the tone for the next thousand. We would rather stay small and excellent than grow fast and become ordinary.",
];

const nots = [
  "Not a networking farm.",
  "Not a self-promotion channel.",
  "Not a place where status is measured in certifications.",
  "Not owned by any founder's startup — Build For Good belongs to its members.",
  "Not for people who are only here to extract.",
];

const dimensions = [
  ["Character", "Honest, trustworthy, keeps promises"],
  ["Kindness", "Does not treat people as tools"],
  ["Curiosity", "Wants to understand, not merely to appear knowledgeable"],
  ["Ambition", "Has meaningful goals and actually works on them"],
  ["Competence", "Can show something they have built or done"],
  ["Humility", "Comfortable saying \u201cI don't know\u201d"],
  ["Critical thinking", "Questions assumptions — including their own"],
  ["Collaboration", "Makes other people better"],
  ["Responsibility", "Thinks about consequences before acting"],
  ["Discipline", "Follows through"],
  ["Growth mindset", "Takes criticism without becoming defensive"],
  ["Positive intent", "Wants their capability to create, not destroy"],
];

export default function ManifestoPage() {
  return (
    <>
      <JsonLd
        data={articleLd({
          path: "/manifesto",
          headline: "Capability without character is not enough.",
          description:
            "Why Build For Good exists, what we build, and the standard we hold each other to.",
        })}
      />
      <PageShell
        eyebrow="Manifesto"
        title={<>Capability without character<br />is not enough.</>}
        lead="We are a community of ambitious, capable people across every discipline who believe the engineer cannot be separated from the human. Anyone can learn to code. Fewer learn to think clearly. Fewest combine skill with humility, ambition with kindness."
      >
        <Section eyebrow="What we do" title="Build. Grow. Evolve. Together.">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-foreground/10 border border-foreground/10">
            {whatWeDo.map((item) => (
              <div key={item.k} className="card-glow hover-lift bg-background p-8 lg:p-10">
                <h3 className="text-3xl font-display">{item.k}</h3>
                <p className="mt-4 text-muted-foreground leading-relaxed">{item.v}</p>
              </div>
            ))}
          </div>
          <p className="mt-10 text-lg text-muted-foreground max-w-3xl">
            These are not slogans — they show up as a weekly rhythm of{" "}
            <Link href="/activities" className="link-underline text-foreground">
              Build Nights, Deep Dives, and Challenges
            </Link>
            .
          </p>
        </Section>

        <Section eyebrow="What we believe" title="Five things we actually act on." muted>
          <ul className="grid gap-px bg-foreground/10 border border-foreground/10">
            {beliefs.map((b) => (
              <li key={b} className="card-glow bg-background px-8 py-7 text-lg leading-relaxed">
                {b}
              </li>
            ))}
          </ul>
        </Section>

        <Section
          eyebrow="What we are not"
          title="The boundaries matter as much as the mission."
        >
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {nots.map((n) => (
              <li
                key={n}
                className="card-glow hover-lift border border-foreground/10 p-6 text-muted-foreground leading-relaxed"
              >
                {n}
              </li>
            ))}
          </ul>
          <p className="mt-10 text-lg text-muted-foreground max-w-3xl">
            Everything we do reward is written down as an explicit behaviour in our{" "}
            <Link href="/values" className="link-underline text-foreground">
              values
            </Link>
            .
          </p>
        </Section>

        <Section
          eyebrow="Our commitment"
          title="What you get, and what we ask."
          muted
        >
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <h3 className="font-mono text-sm uppercase tracking-widest text-muted-foreground mb-6">
                We promise you
              </h3>
              <ol className="space-y-4 text-lg">
                {[
                  "You will be surrounded by people who make you better.",
                  "You will be judged by your conduct, not your credentials.",
                  "You will be helped when you ask.",
                  "You will be told the truth, kindly.",
                  "Your work and your words are safe here.",
                ].map((p, i) => (
                  <li key={p} className="flex gap-4">
                    <span className="font-mono text-sm text-muted-foreground pt-1">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span>{p}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <h3 className="font-mono text-sm uppercase tracking-widest text-muted-foreground mb-6">
                We ask of you
              </h3>
              <ol className="space-y-4 text-lg">
                {[
                  "Show up. Contribute more than you extract.",
                  "Stay humble. Nobody here is finished.",
                  "Leave it better. Every project, every channel, every relationship you touch.",
                ].map((p, i) => (
                  <li key={p} className="flex gap-4">
                    <span className="font-mono text-sm text-muted-foreground pt-1">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span>{p}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </Section>

        <Section
          id="standard"
          eyebrow="The Build For Good standard"
          title="Twelve dimensions. Character is the gate."
        >
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-foreground/10 border border-foreground/10">
            {dimensions.map(([name, desc]) => (
              <div key={name} className="card-glow bg-background p-6">
                <h3 className="font-medium">{name}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <p className="mt-10 text-xl font-display">
            Character is the gate. Everything else is built on top of it.
          </p>
        </Section>

        <Section muted>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
            <p className="text-3xl md:text-4xl font-display max-w-2xl leading-tight">
              Build boldly. Grow continuously. Evolve consciously. Help others rise.
              Leave the world better than you found it.
            </p>
            <div className="flex flex-wrap gap-4 shrink-0">
              <Link
                href="/membership"
                className="hover-lift inline-flex items-center justify-center rounded-full bg-foreground px-8 h-14 text-base font-medium text-background hover:bg-foreground/90"
              >
                Apply to join
              </Link>
              <Link
                href="/values"
                className="hover-lift inline-flex items-center justify-center rounded-full border border-foreground/20 px-8 h-14 text-base hover:bg-foreground/5"
              >
                Read our values
              </Link>
            </div>
          </div>
        </Section>
      </PageShell>
    </>
  );
}
