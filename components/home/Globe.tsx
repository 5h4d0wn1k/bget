"use client";

import { useEffect, useRef } from "react";
import styles from "./home.module.css";

/**
 * Inverted wireframe globe — a static-DOM SVG with a slow rAF-driven spin.
 * Respects prefers-reduced-motion (renders static) and pauses its own
 * animation loop when scrolled out of view via IntersectionObserver.
 * Purely decorative: never receives focus, hidden from AT.
 */

/** One full rotation in ~40s — a slow, quiet orbit. */
const SPIN_MS = 40000;

type DotTone = "base" | "gold" | "green" | "glint";

interface Dot {
  x: number;
  y: number;
  r: number;
  tone: DotTone;
}

/** Scattered nodes sitting on the sphere's surface (all within r=100 of 160,160). */
const DOTS: Dot[] = [
  { x: 198, y: 104, r: 2, tone: "base" },
  { x: 224, y: 166, r: 2, tone: "base" },
  { x: 196, y: 220, r: 2, tone: "base" },
  { x: 160, y: 242, r: 2, tone: "base" },
  { x: 122, y: 222, r: 2, tone: "base" },
  { x: 94, y: 164, r: 2, tone: "base" },
  { x: 122, y: 104, r: 2, tone: "base" },
  { x: 162, y: 126, r: 2.2, tone: "base" },
  { x: 150, y: 172, r: 2.2, tone: "base" },
  { x: 186, y: 190, r: 2, tone: "base" },
  { x: 212, y: 132, r: 2, tone: "base" },
  { x: 108, y: 192, r: 2, tone: "base" },
  { x: 132, y: 140, r: 2.2, tone: "base" },
  { x: 188, y: 160, r: 2.2, tone: "base" },
  { x: 164, y: 200, r: 2.2, tone: "base" },
  { x: 160, y: 66, r: 3.4, tone: "glint" },
  { x: 232, y: 204, r: 2.6, tone: "gold" },
  { x: 90, y: 138, r: 2.6, tone: "green" },
  { x: 230, y: 122, r: 2.4, tone: "gold" },
];

/** Fixed star specks outside the globe wireframe. */
const STARS: Array<{ x: number; y: number; r: number }> = [
  { x: 52, y: 82, r: 1.2 },
  { x: 268, y: 70, r: 1.4 },
  { x: 286, y: 154, r: 1 },
  { x: 270, y: 244, r: 1.2 },
  { x: 56, y: 232, r: 1 },
  { x: 150, y: 24, r: 1.1 },
  { x: 184, y: 298, r: 1.3 },
  { x: 244, y: 290, r: 0.9 },
  { x: 76, y: 62, r: 0.9 },
];

function dotClass(tone: DotTone): string {
  switch (tone) {
    case "gold":
      return styles.dotGold;
    case "green":
      return styles.dotGreen;
    case "glint":
      return styles.globeGlint;
    default:
      return styles.dotBase;
  }
}

export default function Globe() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const spin = node.querySelector<SVGGElement>("[data-globe-spin]");
    if (!spin) return;

    if (typeof window === "undefined") return;
    if (typeof IntersectionObserver !== "function") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let running = false;
    let firstFrame: number | null = null;

    function tick(t: number) {
      if (firstFrame === null) firstFrame = t;
      const deg = ((t - firstFrame) / SPIN_MS) * 360;
      spin!.setAttribute("transform", `rotate(${deg} 160 160)`);
      raf = requestAnimationFrame(tick);
    }

    function start() {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(tick);
    }

    function stop() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) start();
          else stop();
        }
      },
      { threshold: 0.05 }
    );
    io.observe(node);

    return () => {
      io.disconnect();
      stop();
    };
  }, []);

  return (
    <div ref={ref} className={styles.globe} aria-hidden="true">
      <svg className={styles.globeSvg} viewBox="0 0 320 320" focusable="false">
        <g>
          {STARS.map((s, i) => (
            <circle
              key={i}
              className={styles.globeStars}
              cx={s.x}
              cy={s.y}
              r={s.r}
            />
          ))}
        </g>
        <circle className={styles.globeHalo} cx="160" cy="160" r="114" />
        <g data-globe-spin>
          <circle className={styles.globeRing} cx="160" cy="160" r="100" />
          <ellipse className={styles.globeLine} cx="160" cy="160" rx="100" ry="28" />
          <ellipse className={styles.globeLine} cx="160" cy="160" rx="28" ry="100" />
          <ellipse className={styles.globeLine} cx="160" cy="160" rx="72" ry="100" />
          <ellipse className={styles.globeLine} cx="160" cy="160" rx="100" ry="70" />
          {DOTS.map((d, i) => (
            <circle key={i} className={dotClass(d.tone)} cx={d.x} cy={d.y} r={d.r} />
          ))}
        </g>
      </svg>
    </div>
  );
}