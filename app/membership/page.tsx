import type { Metadata } from "next";
import Link from "next/link";
import { PageShell, Section } from "@/components/site/page-shell";
import { ApplyForm } from "@/components/site/apply-form";
import { JsonLd, webPageLd } from "@/components/seo/json-ld";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Membership",
  description:
    "Open to problems, selective with people. The Build For Good filter: the twelve dimensions, the conversation, and the 30-day trial.",
  path: "/membership",
});

const dimensions = [
  ["Character (gate)", "Keeps promises, honest when it costs"],
  ["Kindness", "Makes people feel respected and safe"],
  ["Curiosity", "Asks better questions than they answer"],
  ["Ambition", "Real goals, visible consistent effort"],
  ["Competence", "Can show something built or done"],
  ["Humility", "“I don't know”, accepts correction"],
  ["Critical thinking", "Questions their own assumptions"],
  ["Collaboration", "Makes others better"],
  ["Responsibility", "Thinks about consequences"],
  ["Discipline", "Follows through repeatedly"],
  ["Growth mindset", "Uses criticism as fuel"],
  ["Positive intent", "Wants capability to create, not dominate"],
];

const doors = [
  {
    title: "Bring a problem",
    standard: "Open to anyone, anywhere",
    why: "The world doesn't need our permission to have problems.",
    href: "/problems",
    cta: "Submit a problem",
  },
  {
    title: "Join Build For Good",
    standard: "Application → conversation → 30-day trial",
    why: "The filter protects members from people who would make the community worse.",
    href: "#apply",
    cta: "Apply to join",
  },
  {
    title: "Join a Lab",
    standard: "Depends on what the project needs",
    why: "Some work needs a domain expert; some needs a translator — you don't have to be a member.",
    href: "/problems",
    cta: "See the Problem Commons",
  },
];

export default function MembershipPage() {
  return (
    <>
      <JsonLd
        data={webPageLd({
          path: "/membership",
          name: "Membership — Build For Good",
          description:
            "The Build For Good filter: the twelve dimensions, the conversation, and the 30-day trial.",
        })}
      />
      <PageShell
        eyebrow="Membership"
        title={<>Open to problems.<br />Selective with people.</>}
        lead="We would rather stay small and excellent than grow fast and become ordinary. The application exists to protect the people already here — not to gatekeep status."
      >
        <Section eyebrow="Three doors" title="Everyone finds their door in one screen.">
          <div className="grid lg:grid-cols-3 gap-px bg-foreground/10 border border-foreground/10">
            {doors.map((d) => (
              <div key={d.title} className="card-glow hover-lift bg-background p-8 lg:p-10 flex flex-col">
                <h3 className="text-3xl font-display">{d.title}</h3>
                <p className="mt-4 font-mono text-xs uppercase tracking-widest text-[#eca8d6]">
                  {d.standard}
                </p>
                <p className="mt-4 text-muted-foreground leading-relaxed flex-1">{d.why}</p>
                <Link
                  href={d.href}
                  className="link-underline mt-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  {d.cta} →
                </Link>
              </div>
            ))}
          </div>
        </Section>

        <Section
          eyebrow="The filter"
          title="Twelve dimensions. Character is a gate, not an average."
          muted
        >
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-foreground/10 border border-foreground/10">
            {dimensions.map(([name, desc]) => (
              <div key={name} className="card-glow bg-background p-6">
                <h3 className="font-medium">{name}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <p className="mt-10 text-lg text-muted-foreground max-w-2xl">
            Score each 1–5. Anyone scoring 1–2 on Character is declined regardless of
            every other score. Otherwise: Character ≥ 4, average of the rest ≥ 3. The
            full standard is public in our{" "}
            <Link href="/values" className="link-underline text-foreground">
              values
            </Link>
            .
          </p>
        </Section>

        <Section eyebrow="The process" title="Under ten minutes to apply. Then a real conversation.">
          <div className="grid sm:grid-cols-3 gap-px bg-foreground/10 border border-foreground/10">
            {[
              ["Apply", "No CV, no years-of-experience field — deliberately. We ask what you've made, and one thing you're struggling with."],
              ["Talk", "A 15–20 minute voice conversation. Not an interrogation — you're deciding whether we're worth your time too."],
              ["Trial", "Membership is provisional for 30 days. Introduce yourself, help someone, show up once. Then it's confirmed."],
            ].map(([k, v], i) => (
              <div key={k} className="card-glow bg-background p-8">
                <span className="font-mono text-sm text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 text-2xl font-display">{k}</h3>
                <p className="mt-3 text-muted-foreground leading-relaxed">{v}</p>
              </div>
            ))}
          </div>
          <p className="mt-10 text-lg text-muted-foreground max-w-3xl">
            Not ready to apply? You can still{" "}
            <Link href="/problems" className="link-underline text-foreground">
              bring a problem
            </Link>{" "}
            or join a Lab — contributing to a problem never requires membership.
          </p>
        </Section>

        <Section id="apply" eyebrow="Apply" title="Bring us your honesty, not your résumé." muted>
          <ApplyForm />
        </Section>

        <Section>
          <p className="text-2xl md:text-3xl font-display max-w-3xl leading-tight">
            We judge by conduct, not credentials. A small group of exceptional,
            trustworthy people is worth more than thousands of inactive ones.
          </p>
        </Section>
      </PageShell>
    </>
  );
}
