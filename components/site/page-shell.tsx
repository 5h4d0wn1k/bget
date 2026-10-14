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
      <header className="relative pt-40 pb-20 lg:pt-52 lg:pb-28 border-b border-foreground/10">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="mt-8 text-5xl md:text-7xl lg:text-[104px] font-display tracking-tight leading-[0.92] max-w-5xl">
            {title}
          </h1>
          {lead ? (
            <p className="mt-10 text-xl lg:text-2xl text-muted-foreground leading-relaxed max-w-3xl">
              {lead}
            </p>
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
            {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
            {title ? (
              <h2 className="mt-6 text-4xl md:text-5xl lg:text-6xl font-display tracking-tight leading-[0.98] max-w-3xl">
                {title}
              </h2>
            ) : null}
            {intro ? (
              <p className="mt-8 text-lg text-muted-foreground leading-relaxed max-w-2xl">
                {intro}
              </p>
            ) : null}
          </div>
        ) : null}
        {children}
      </div>
    </section>
  );
}
