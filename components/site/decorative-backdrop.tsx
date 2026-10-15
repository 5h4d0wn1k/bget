import type { ReactNode } from "react";

/**
 * Layered decorative backdrop shared by page headers and empty states:
 * aurora wash + technical grid + noise + two slowly drifting orb SVGs.
 * Purely decorative, `aria-hidden`, and pointer-events-none.
 */
export function DecorativeBackdrop({
  variant = "aurora",
  className = "",
}: {
  variant?: "aurora" | "grid" | "dots";
  className?: string;
}) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      {variant === "aurora" ? <div className="aurora absolute inset-0" /> : null}
      {variant === "grid" ? <div className="grid-fade absolute inset-0 opacity-70" /> : null}
      {variant === "dots" ? <div className="dot-grid absolute inset-0 opacity-60" /> : null}
      <div className="noise-overlay absolute inset-0 opacity-[0.5]" />
    </div>
  );
}

/** A soft, slowly rotating "orbit" mark used as page-header artwork. */
export function OrbitMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 240"
      className={`spin-slow ${className}`}
      fill="none"
      aria-hidden="true"
    >
      <circle cx="120" cy="120" r="112" stroke="currentColor" strokeOpacity="0.12" />
      <circle
        cx="120"
        cy="120"
        r="86"
        stroke="currentColor"
        strokeOpacity="0.16"
        strokeDasharray="4 10"
      />
      <circle cx="120" cy="120" r="58" stroke="currentColor" strokeOpacity="0.1" />
      <circle cx="120" cy="8" r="3.5" fill="#eca8d6" />
      <circle cx="206" cy="120" r="2.5" fill="#a78bfa" />
      <circle cx="120" cy="232" r="2" fill="#67e8f9" />
    </svg>
  );
}

/** Small gradient hairline rule used between stacked content blocks. */
export function AccentRule({ className = "" }: { className?: string }) {
  return <span className={`rule-accent block w-full ${className}`} aria-hidden="true" />;
}

export function SectionIndex({ children }: { children: ReactNode }) {
  return (
    <span className="index-badge inline-flex h-9 min-w-9 items-center justify-center rounded-full border border-foreground/15 px-2.5 font-mono text-[11px] tracking-[0.1em] text-muted-foreground">
      {children}
    </span>
  );
}
