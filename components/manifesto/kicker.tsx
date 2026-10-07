import type { CSSProperties, ReactNode } from "react";

type KickerProps = {
  children: ReactNode;
  /** Tint of the mono kicker — green by default, gold on dark bands. */
  tone?: "green" | "gold";
  className?: string;
  style?: CSSProperties;
};

/**
 * Mono eyebrow label — thin wrapper over the global `.eyebrow` primitive so
 * pages keep one vocabulary for section kickers.
 */
export default function Kicker({ children, tone = "green", className, style }: KickerProps) {
  return (
    <p
      className={`eyebrow${tone === "gold" ? " eyebrow--gold" : ""}${className ? ` ${className}` : ""}`}
      style={style}
    >
      {children}
    </p>
  );
}