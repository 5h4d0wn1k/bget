import { Reveal, RevealText } from "@/components/motion/reveal";
import { Navigation } from "@/components/landing/navigation";
import { FooterSection } from "@/components/landing/footer-section";

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-3 font-mono text-[11px] tracking-[0.2em] uppercase text-muted-foreground">
      <span className="w-12 h-px bg-foreground/20" />
      {children}
    </span>
  );
}

export function PageShell({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <Navigation />
      <header className="relative pt-40 pb-20 lg:pt-52 lg:pb-28 border-b border-foreground/10 overflow-hidden">
        <div className="aurora pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="relative max-w-[1400px] mx-auto px-6 lg:px-12">
          <Reveal y={14} duration={650}>
            <Eyebrow>{eyebrow}</Eyebrow>
          </Reveal>
          <Reveal delay={90} y={24} duration={850}>
            <h1 className="mt-8 text-5xl md:text-7xl lg:text-[104px] font-display tracking-tight leading-[0.92] max-w-5xl">
              {title}
            </h1>
          </Reveal>
          {lead ? (
            <Reveal delay={190} y={24}>
              <p className="mt-10 text-xl lg:text-2xl text-muted-foreground leading-relaxed max-w-3xl">
                {lead}
              </p>
            </Reveal>
          ) : null}
        </div>
      </header>
      {children}
      <FooterSection />
    </main>
  );
}

export function Section({
  id,
  eyebrow,
  title,
  intro,
  muted = false,
  children,
}: {
  id?: string;
  eyebrow?: string;
  title?: React.ReactNode;
  intro?: React.ReactNode;
  muted?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className={`border-b border-foreground/10 ${muted ? "bg-foreground/[0.02]" : ""}`}
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-20 lg:py-28">
        {eyebrow || title || intro ? (
          <div className="mb-14">
            {eyebrow ? (
              <Reveal y={12} duration={600}>
                <Eyebrow>{eyebrow}</Eyebrow>
              </Reveal>
            ) : null}
            {typeof title === "string" ? (
              <RevealText
                as="h2"
                text={title}
                delay={60}
                className="mt-6 text-4xl md:text-5xl lg:text-6xl font-display tracking-tight leading-[0.98] max-w-3xl"
              />
            ) : title ? (
              <Reveal delay={60} y={20}>
                <h2 className="mt-6 text-4xl md:text-5xl lg:text-6xl font-display tracking-tight leading-[0.98] max-w-3xl">
                  {title}
                </h2>
              </Reveal>
            ) : null}
            {intro ? (
              <Reveal delay={130} y={20}>
                <p className="mt-8 text-lg text-muted-foreground leading-relaxed max-w-2xl">
                  {intro}
                </p>
              </Reveal>
            ) : null}
          </div>
        ) : null}
        {children ? (
          <Reveal delay={80} y={26}>
            {children}
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}
