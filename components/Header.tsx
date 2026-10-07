"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowRight } from "lucide-react";
import styles from "./Header.module.css";
import { NAV, SITE } from "@/lib/site";

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand} aria-label={`${SITE.name} — home`}>
          <span className={styles.brandMark} aria-hidden="true">
            <span className={styles.brandCell} />
            <span className={styles.brandCell} />
            <span className={styles.brandCell} />
            <span className={styles.brandCell} />
          </span>
          <span className={styles.brandWord}>{SITE.name}</span>
        </Link>

        <nav className={styles.nav} aria-label="Primary">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navLink}${active ? ` ${styles.navLinkActive}` : ""}`}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className={styles.ctaWrap}>
          <Link href="/problems" className={styles.cta}>
            Propose a problem
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
          <button
            type="button"
            className={styles.menuBtn}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          </button>
        </div>
      </div>

      {open && (
        <div id="mobile-menu" className={styles.mobile}>
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={styles.mobileLink}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Link href="/apply" className={styles.mobileCta} onClick={() => setOpen(false)}>
            Propose a problem
          </Link>
        </div>
      )}
    </header>
  );
}