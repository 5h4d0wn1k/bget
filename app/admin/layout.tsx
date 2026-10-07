import type { Metadata } from "next";
import Link from "next/link";
import { getAdminToken } from "@/lib/server/db";
import styles from "./admin.module.css";

/**
 * Admin layout — the ONE layout exception. It renders its own minimal shell
 * and imports nothing from the public Header/Footer components. The root
 * layout still wraps the document; admin.module.css hides the public chrome
 * on /admin so only this shell shows.
 */

export const metadata: Metadata = {
  title: "BGET Admin",
  robots: { index: false, follow: false },
};

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/applications", label: "Applications" },
  { href: "/admin/problems", label: "Problems" },
] as const;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const openMode = !getAdminToken();

  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <div className={styles.topbarInner}>
          <Link href="/admin" className={styles.brand}>
            BGET <span className={styles.brandDot}>·</span> Admin
          </Link>
          <nav className={styles.nav} aria-label="Admin">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className={styles.navLink}>
                {item.label}
              </Link>
            ))}
          </nav>
          {openMode ? (
            <span
              className={`${styles.modeChip} ${styles.modeChipOpen}`}
              title="No ADMIN_TOKEN configured — anyone can update statuses. Set the secret to lock the panel."
            >
              open mode
            </span>
          ) : (
            <span
              className={`${styles.modeChip} ${styles.modeChipLocked}`}
              title="ADMIN_TOKEN is set — status updates require it."
            >
              token mode
            </span>
          )}
        </div>
      </header>

      <main className={styles.main}>
        <div className="container">{children}</div>
      </main>

      <footer className={styles.footer}>
        <div className="container">
          Internal tool · not indexed · v0 scaffold — see README “Admin panel”.
        </div>
      </footer>
    </div>
  );
}