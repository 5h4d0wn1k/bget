import type { Metadata } from "next";
import Link from "next/link";
import { PageShell, Section } from "@/components/site/page-shell";

export const metadata: Metadata = {
  title: "Values — Build For Good",
  description:
    "A value nobody can act on is decoration. Each Build For Good value, written as the behaviour we reward and the behaviour we correct.",
};

const values = [
  {
    n: "01",
    title: "Character before capability",
    reward: "People who keep promises, admit mistakes early, and do the right thing when it costs them something.",
    correct: "Brilliance used as a licence. Status is never a shield.",
  },
  {
    n: "02",
    title: "Intellectual humility",
    reward: "“I don't know.” “I was wrong.” “Can you explain that to me?” “Here is something I'm struggling with.”",
    correct: "Performing expertise, dismissing questions, one-upmanship, citing credentials instead of reasoning.",
  },
  {
    n: "03",
    title: "Constructive disagreement",
    reward: "Attacking the idea, steelmanning the other side, changing your mind publicly when the evidence warrants it.",
    correct: "Personal attacks, sarcasm as a weapon, pile-ons, arguing to win.",
  },
  {
    n: "04",
    title: "Generosity as a default",
    reward: "Answering questions, reviewing someone's code, making an introduction, sharing a resource without being asked, crediting others.",
    correct: "Hoarding knowledge, gatekeeping, only showing up to ask for something.",
  },
  {
    n: "05",
    title: "Follow-through",
    reward: "Shipping, small consistent contributions, closing the loop, saying no rather than silently ghosting.",
    correct: "Enthusiasm followed by disappearance, starting everything and finishing nothing.",
  },
  {
    n: "06",
    title: "Respect for people and planet",
    reward: "Kindness to newcomers, patience with different skill levels, environmental and social awareness in what we build.",
    correct: "Cruelty disguised as “just being direct”, exploiting people, building harm and calling it progress.",
  },
  {
    n: "07",
    title: "Ownership without empire-building",
    reward: "“I'll take care of that” — then actually doing it.",
    correct: "Seeking authority without service, treating members as an audience or a workforce.",
  },
  {
    n: "08",
    title: "Privacy and trust",
    reward: "Keeping confidences, asking before quoting someone externally, handling personal data carefully.",
    correct: "Screenshotting drama, sharing member details, recruiting people out of Build For Good without consent.",
  },
];

export default function ValuesPage() {
  return (
    <PageShell
      eyebrow="Values"
      title={<>How we behave,<br />not what we claim.</>}
      lead="A value nobody can act on is decoration. So each value below is written twice: the behaviour we reward, and the behaviour we correct."
    >
      <Section>
        <div className="grid gap-px bg-foreground/10 border border-foreground/10">
          {values.map((v) => (
            <div key={v.n} className="bg-background p-8 lg:p-12 grid lg:grid-cols-12 gap-8">
              <div className="lg:col-span-1 font-mono text-sm text-muted-foreground pt-2">{v.n}</div>
              <h2 className="lg:col-span-4 text-3xl md:text-4xl font-display leading-tight">{v.title}</h2>
              <div className="lg:col-span-7 grid sm:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-mono text-[11px] uppercase tracking-[0.15em] text-[#eca8d6] mb-3">
                    We reward
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">{v.reward}</p>
                </div>
                <div>
                  <h3 className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground mb-3">
                    We correct
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">{v.correct}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="The culture test"
        title="Two questions before you send anything."
        muted
      >
        <ol className="grid md:grid-cols-2 gap-8">
          <li className="border border-foreground/10 p-8 text-lg leading-relaxed">
            <span className="font-mono text-sm text-muted-foreground block mb-4">01</span>
            Would I be comfortable if this were screenshotted and shown to everyone here?
          </li>
          <li className="border border-foreground/10 p-8 text-lg leading-relaxed">
            <span className="font-mono text-sm text-muted-foreground block mb-4">02</span>
            Does this make Build For Good more or less the place exceptional people want to stay?
          </li>
        </ol>
        <p className="mt-10 text-xl font-display">If either answer is no — don't send it.</p>
      </Section>

      <Section eyebrow="Set by the first ten" title="Culture is enforced by who you let in.">
        <div className="grid sm:grid-cols-3 gap-px bg-foreground/10 border border-foreground/10">
          {[
            ["What you tolerate", "becomes the standard."],
            ["What you celebrate", "becomes the goal."],
            ["What you ignore", "becomes the culture."],
          ].map(([k, v]) => (
            <div key={k} className="bg-background p-8">
              <h3 className="text-xl font-medium">{k}</h3>
              <p className="mt-2 text-muted-foreground">{v}</p>
            </div>
          ))}
        </div>
        <div className="mt-12">
          <Link
            href="/membership"
            className="inline-flex items-center justify-center rounded-full bg-foreground px-8 h-14 text-base font-medium text-background hover:bg-foreground/90 transition-all"
          >
            See how we choose people
          </Link>
        </div>
      </Section>
    </PageShell>
  );
}
