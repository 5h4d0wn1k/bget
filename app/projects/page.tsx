import type { Metadata } from "next";
import Link from "next/link";
import { PageShell, Section } from "@/components/site/page-shell";
import { ProjectsGallery } from "@/components/projects/projects-gallery";
import { ProjectForm } from "@/components/projects/project-form";
import { JsonLd, webPageLd } from "@/components/seo/json-ld";
import { pageMetadata } from "@/lib/site";

const DESCRIPTION =
  "Projects from the Build For Good community — member-submitted and human-reviewed. Real work at every stage, from idea to scaled, with the people and links behind it.";

export const metadata: Metadata = pageMetadata({
  title: "Projects",
  description: DESCRIPTION,
  path: "/projects",
});

const steps = [
  [
    "Submit",
    "A member sends a project — title, a one-line summary, what it is, its stage, and the links to go deeper.",
  ],
  [
    "Review",
    "A person reviews every submission: is it real, is the description honest, and is it the member's work to show?",
  ],
  [
    "Published",
    "Approved projects appear in the showcase above with their stage, lead, location, and tags — open to the world.",
  ],
];

export default function ProjectsPage() {
  return (
    <>
      <JsonLd
        data={webPageLd({
          path: "/projects",
          name: "Projects — Build For Good",
          description: DESCRIPTION,
        })}
      />
      <PageShell
        eyebrow="The showcase"
        title="Projects"
        lead="The public record of what Build For Good members are actually making — tools, research, prototypes, and small services built for real people, at every stage from idea to scaled."
      >
        <Section eyebrow="The showcase" title="Work that exists, not work that was promised.">
          <div className="grid gap-16 lg:grid-cols-2">
            <div className="space-y-6 text-lg leading-relaxed text-muted-foreground">
              <p>
                This showcase is the honest ledger of the community. Every entry is a project a
                member has built or is building — published with the stage it has reached, the
                people behind it, where it is rooted, and the links to explore it directly.
              </p>
              <p>
                Nothing here is aspirational marketing. Projects are{" "}
                <span className="text-foreground">submitted by members</span> and{" "}
                <span className="text-foreground">reviewed by a human</span> before they are
                published. A project at the <em className="text-foreground">idea</em> stage is
                labelled as such; one that is <em className="text-foreground">live</em> or{" "}
                <em className="text-foreground">scaled</em> shows its links so you can judge for
                yourself.
              </p>
              <p>
                We do not rank projects or chase vanity metrics. The point is to make the work
                visible, connect the people who can help, and let others learn from what worked and
                what did not.
              </p>
            </div>
            <div className="card-glow flex flex-col justify-between rounded-3xl border border-foreground/10 p-8 lg:p-10">
              <div>
                <h3 className="font-mono text-sm uppercase tracking-widest text-muted-foreground">
                  Submit your work
                </h3>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  If you have built something real — a tool, a prototype, a pilot, a small service,
                  a piece of research — it belongs on this wall. Submission is open to members; it
                  takes a few minutes, and a person reads every one.
                </p>
              </div>
              <Link
                href="#submit"
                className="hover-lift mt-8 inline-flex h-14 w-fit items-center justify-center rounded-full bg-foreground px-8 text-base font-medium text-background hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Submit a project
              </Link>
            </div>
          </div>
        </Section>

        <Section
          eyebrow="How it works"
          title="Submit → review → published."
          intro="Three deliberate steps, because a public showcase is only worth trusting if a person has stood behind each entry."
          muted
        >
          <div className="grid gap-px border border-foreground/10 bg-foreground/10 sm:grid-cols-3">
            {steps.map(([title, body], i) => (
              <div key={title} className="card-glow bg-background p-8">
                <span className="font-mono text-sm text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 text-2xl font-display">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
          <p className="mt-10 max-w-3xl text-lg text-muted-foreground">
            Projects usually begin with a problem worth solving. If you are still looking for one,
            the{" "}
            <Link href="/problems" className="link-underline text-foreground">
              Problem Commons
            </Link>{" "}
            is where real problems are brought, framed, and matched with the people who can move
            them.
          </p>
        </Section>

        <Section id="gallery" eyebrow="The gallery" title="Approved projects.">
          <ProjectsGallery />
        </Section>

        <Section
          id="submit"
          eyebrow="Submit"
          title="Add your project."
          intro="Tell us what you built. A person will review it before it appears in the showcase."
          muted
        >
          <ProjectForm />
        </Section>
      </PageShell>
    </>
  );
}
