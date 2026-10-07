"use client";

import { useState, useTransition } from "react";
import styles from "./admin.module.css";
import { SUBMISSION_STATUSES } from "./admin-utils";

interface StatusSelectProps {
  id: number;
  status: string;
}

/**
 * Per-row status picker (new → reviewing → accepted/declined/archived).
 * POSTs to /api/admin/status. When ADMIN_TOKEN is configured, the token is
 * read from localStorage (`bget.adminToken`) and sent as a Bearer header;
 * set it with e.g. localStorage.setItem("bget.adminToken", "…").
 */
export default function StatusSelect({ id, status }: StatusSelectProps) {
  const [current, setCurrent] = useState(status);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleChange(next: string) {
    if (next === current) return;
    setError(null);
    try {
      const token =
        typeof window !== "undefined" ? window.localStorage.getItem("bget.adminToken") : null;
      const res = await fetch("/api/admin/status", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(token ? { authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ id, status: next }),
      });
      const body = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || body.ok !== true) {
        setError(body.error ?? "update failed");
        return;
      }
      startTransition(() => setCurrent(next));
    } catch {
      setError("update failed");
    }
  }

  return (
    <span className={styles.statusCell}>
      <select
        className={styles.statusSelect}
        value={current}
        disabled={pending}
        onChange={(event) => handleChange(event.target.value)}
        aria-label={`Status for submission ${id}`}
      >
        {SUBMISSION_STATUSES.map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </select>
      {error && <span className={styles.statusError}>{error}</span>}
    </span>
  );
}