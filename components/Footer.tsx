"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import styles from "./Footer.module.css";
import { NAV, SITE } from "@/lib/site";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");

  async function subscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) return;
    setState("loading");
    try {
      await fetch("/api/newsletter", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setState("done");
    } catch {
      setState("idle");
    }
  }

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <div className={styles.brandCol}>
            <p className={styles.brand}>{SITE.name}</p>
            <p className={styles.tag}>{SITE.tagline}</p>
            <p className={styles.blurb}>
              A global community of builders, scientists, makers and thinkers.{" "}
              <em className={styles.serif}>Character before capability.</em>
            </p>
          </div>

          <nav className={styles.col} aria-label="Footer">
            <p className={styles.colTitle}>Explore</p>
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className={styles.link}>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className={styles.col}>
            <p className={styles.colTitle}>The North Star</p>
            <p className={styles.northStar}>
              Become more capable
              <br />
              without becoming less human.
            </p>
            <Link href="/manifesto" className={styles.link}>
              Read the manifesto <ArrowRight size={13} aria-hidden="true" />
            </Link>
          </div>

          <div className={styles.col}>
            <p className={styles.colTitle}>Stay close</p>
            {state === "done" ? (
              <p className={styles.done}>You&apos;re on the list.</p>
            ) : (
              <form className={styles.form} onSubmit={subscribe}>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={styles.input}
                  aria-label="Email address"
                />
                <button type="submit" className={styles.formBtn} disabled={state === "loading"}>
                  Join
                </button>
              </form>
            )}
            <p className={styles.formNote}>Occasional letters. No noise, ever.</p>
            <a className={styles.link} href={`mailto:${SITE.email}`}>
              {SITE.email}
            </a>
          </div>
        </div>

        <div className={styles.bottom}>
          <p>
            © {new Date().getFullYear()} BGET · Built in the open on{" "}
            <a className={styles.plain} href={SITE.github} rel="noreferrer" target="_blank">
              GitHub
            </a>
          </p>
          <p className={styles.rule}>Character before capability.</p>
        </div>
      </div>
    </footer>
  );
}