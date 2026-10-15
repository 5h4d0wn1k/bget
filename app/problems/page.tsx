import type { Metadata } from "next";
import { PageShell, Section } from "@/components/site/page-shell";
import { ProblemForm } from "@/components/site/problem-form";

export const metadata: Metadata = {
  title: "Problem Commons — Build For Good",
  description:
    "Bring us a problem. We'll bring together the people who can help — across disciplines, borders, and status.",
};

const loop = [
  ["Submit", "Anyone, anywhere, brings a problem."],
  ["Understand", "Is it real? Who is affected? What has been tried, and what is missing?"],
  ["Assemble", "Find the disciplines the problem actually needs."],
  ["Lab", "A small team researches, designs, prototypes, and tests."],
  ["Validate", "Does it work outside a document?"],
  ["Deploy", "Can it be implemented where the affected people are?"],
  ["Impact", "Who benefited, what changed, what did we learn."],
  ["Share", "Open the knowledge, where appropriate."],
];

const criteria = [
  ["Severity", "How bad is it for the people living it?"],
  ["People affected", "How many, and how underserved?"],
  ["Urgency", "Does delay make it worse?"],
  ["Neglectedness", "Is anyone credible already on it?"],
  ["Feasibility", "Can small teams actually move it?"],
  ["Expertise available", "Do the needed disciplines exist among or near us?"],
  ["Testability", "Can we find out whether a solution worked?"],
  ["Scalability", "Could it help far beyond the first site?"],
  ["Safety & ethics", "Could working on this harm anyone?"],
];

const lifecycle = [
  "Submitted", "Reviewed", "Framed", "Research", "Lab forms",
  "Prototype", "Pilot", "Deployment", "Impact", "Learn",
];

export default function ProblemsPage() {
  return (
    <PageShell
      eyebrow="Problem Commons"
      title={<>Bring us a problem.<br />We'll bring the people.</>}
      lead="The world doesn't have a shortage of problems. It has a shortage of people willing and capable of solving them — across disciplines, borders, and status. Submission is open to anyone. No membership required."
    >
      <Section eyebrow="The loop" title="From the world, back to the world.">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-foreground/10 border border-foreground/10">
          {loop.map(([k, v], i) => (
            <div key={k} className="bg-background p-8">
              <span className="font-mono text-sm text-muted-foreground">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 text-2xl font-display">{k}</h3>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{v}</p>
            </div>
          ))}
        </div>
        <p className="mt-10 text-lg text-muted-foreground max-w-3xl">
          No problem in, no loop. A loop without deployment is a study group.
          Deployment without learning is a one-off.
        </p>
      </Section>

      <Section
        eyebrow="What we promise"
        title="Every submission gets a human answer within 72 hours."
        muted
      >
        <div className="grid lg:grid-cols-2 gap-16">
          <div className="space-y-6 text-lg">
            <p className="text-muted-foreground line-through decoration-red-400/60">
              “Submit your problem and Build For Good will solve it.”
            </p>
            <p>
              “Submit a problem. Build For Good will help determine whether, how, and with whom
              it can be meaningfully worked on.”
            </p>
          </div>
          <div className="border border-foreground/10 p-8">
            <h3 className="font-mono text-sm uppercase tracking-widest text-muted-foreground">
              The capacity rule
            </h3>
            <ul className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
              <li>Every submission is framed, parked, or declined with a reason.</li>
              <li>
                If submissions outpace reviews, we <em className="text-foreground">close
                intake honestly</em> rather than let them rot unanswered.
              </li>
              <li>An unanswered submission is a broken promise. A closed door is not.</li>
            </ul>
          </div>
        </div>
      </Section>

      <Section eyebrow="How we choose" title="No upvotes. Ever.">
        <p className="text-lg text-muted-foreground max-w-2xl mb-12">
          Voting picks popularity, not importance. A meme with 14,000 votes would bury
          a rural healthcare problem with four. So we weigh every submission on:
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-foreground/10 border border-foreground/10">
          {criteria.map(([k, v]) => (
            <div key={k} className="bg-background p-6">
              <h3 className="font-medium">{k}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{v}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Lifecycle"
        title="Every problem shows its current stage."
        muted
      >
        <ol className="flex flex-wrap items-center gap-3">
          {lifecycle.map((stage, i) => (
            <li key={stage} className="flex items-center gap-3">
              <span className="border border-foreground/15 px-5 py-3 text-sm">{stage}</span>
              {i < lifecycle.length - 1 ? (
                <span className="text-muted-foreground/40">→</span>
              ) : null}
            </li>
          ))}
        </ol>
        <p className="mt-10 text-lg text-muted-foreground max-w-3xl">
          Paused and archived are honest endings. A closed problem with a written
          reason beats an abandoned problem with a green badge. Stage 10 — what
          worked, what failed, what the next team should know — is mandatory.
        </p>
      </Section>

      <Section id="submit" eyebrow="Submit" title="Tell us what's actually happening.">
        <ProblemForm />
      </Section>
    </PageShell>
  );
}
