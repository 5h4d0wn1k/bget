"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    /** Fail-safe timer armed by the root layout's inline script. */
    __bgetRevealFailsafe?: number;
  }
}

/**
 * Motion bootstrap: observes `.reveal` elements and flips them to `.is-in`
 * when they enter the viewport.
 *
 * Fail-safe by design — content is NEVER allowed to stay hidden:
 *   - The `.js` gate is added by an inline script in the root layout before
 *     first paint (no flash). That inline script ALSO arms a fail-safe timer
 *     that removes `.js` after a few seconds if this component never mounts
 *     (JS disabled / hydration blocked) — so the page always becomes visible.
 *   - On mount we clear that timer, add `.is-in` to everything already in the
 *     viewport, and observe the rest. If IntersectionObserver is missing we
 *     reveal everything immediately.
 *   - A short safety timeout force-reveals anything still hidden, so a broken
 *     observer can never leave the page black.
 */
export default function RevealInit() {
  useEffect(() => {
    const doc = document.documentElement;
    if (!doc.classList.contains("js")) doc.classList.add("js");

    // Cancel the inline failsafe — the page is hydrating.
    if (typeof window.__bgetRevealFailsafe === "number") {
      window.clearTimeout(window.__bgetRevealFailsafe);
      window.__bgetRevealFailsafe = undefined;
    }

    const reduce =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      // Reduced motion: content must be fully visible, no waiting on JS.
      doc.classList.remove("js");
      return;
    }

    const targets = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    if (targets.length === 0) return;

    if (!("IntersectionObserver" in window)) {
      targets.forEach((el) => el.classList.add("is-in"));
      return;
    }

    // Reveal anything already in the viewport right now (belt & suspenders —
    // some browsers/browser extensions can delay the IO initial callback).
    const vh = window.innerHeight || 0;
    for (const el of targets) {
      const rect = el.getBoundingClientRect();
      if (rect.top < vh && rect.bottom > 0) {
        el.classList.add("is-in");
      }
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
    targets.forEach((el) => {
      if (!el.classList.contains("is-in")) io.observe(el);
    });

    // Last-resort fail-safe: if anything is still hidden shortly after load,
    // reveal it. Motion is a bonus, never a gate on content.
    const safety = window.setTimeout(() => {
      document.querySelectorAll<HTMLElement>(".reveal:not(.is-in)").forEach((el) => {
        el.classList.add("is-in");
      });
    }, 2000);
    const onScrollDone = () => {
      const hidden = document.querySelectorAll<HTMLElement>(".reveal:not(.is-in)");
      if (hidden.length > 0) {
        hidden.forEach((el) => {
          const rect = el.getBoundingClientRect();
          if (rect.top < (window.innerHeight || 0) && rect.bottom > 0) {
            el.classList.add("is-in");
          }
        });
      }
    };
    window.addEventListener("scroll", onScrollDone, { passive: true, once: true });

    return () => {
      window.clearTimeout(safety);
      window.removeEventListener("scroll", onScrollDone);
      io.disconnect();
    };
  }, []);

  return null;
}