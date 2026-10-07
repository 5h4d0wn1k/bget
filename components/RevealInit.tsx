"use client";

import { useEffect } from "react";

/**
 * Motion bootstrap: adds `html.js` once (mount-only, guards all reveal CSS),
 * then observes `.reveal` elements and flips them to `.is-in` when they enter
 * the viewport. Fully inert when JS never runs or user prefers reduced motion
 * (CSS handles those cases — content stays visible).
 */
export default function RevealInit() {
  useEffect(() => {
    const doc = document.documentElement;
    if (!doc.classList.contains("js")) doc.classList.add("js");

    const reduce =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const targets = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    if (targets.length === 0) return;

    if (!("IntersectionObserver" in window)) {
      targets.forEach((el) => el.classList.add("is-in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    targets.forEach((el) => io.observe(el));

    return () => io.disconnect();
  }, []);

  return null;
}