"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import type { ProblemCategoryId } from "@/lib/problems";
import styles from "./problems.module.css";

export interface QueueItem {
  id: string;
  categoryId: Exclude<ProblemCategoryId, "all">;
  card: ReactNode;
}

/**
 * Category filter for the queue. The full list is delivered as server-rendered
 * elements (so every card is in the SSR HTML); this component only decides
 * which subset to display, client-side.
 */
export default function QueueFilter({
  categories,
  items,
}: {
  categories: { id: ProblemCategoryId; label: string }[];
  items: QueueItem[];
}) {
  const [active, setActive] = useState<ProblemCategoryId>("all");

  const shown = active === "all" ? items : items.filter((item) => item.categoryId === active);

  return (
    <div className={styles.queueFilter}>
      <div className={styles.filters} role="group" aria-label="Filter the queue by category">
        {categories.map((cat) => {
          const count =
            cat.id === "all" ? items.length : items.filter((i) => i.categoryId === cat.id).length;
          const isActive = active === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              className={`${styles.chip}${isActive ? ` ${styles.chipActive}` : ""}`}
              aria-pressed={isActive}
              onClick={() => setActive(cat.id)}
            >
              {cat.label}
              <span className={styles.chipCount} aria-hidden="true">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <ul className={styles.cardList}>
        {shown.map((item) => (
          <li key={item.id} className={styles.cardListItem}>
            {item.card}
          </li>
        ))}
      </ul>
    </div>
  );
}