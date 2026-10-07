import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowUpRight, ChevronRight } from "@/components/icons";
import { PROBLEMS, getProblem, getProblems } from "@/lib/problems";
import { SITE } from "@/lib/site";
import { clampText, formatProblemDate, relatedProblems } from "@/lib/problems-utils";
import { statusLabel, statusTone } from "@/components/problems/status";
import styles from "@/components/problems/problems.module.css";

export const dynamic = "force-static";

export function generateStaticParams() {
  return getProblems().map((p) => ({ id: p.id }));
}

function delay(ms: number): CSSProperties {
  return { "--reveal-delay": `${ms}ms` } as CSSProperties;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const problem = getProblem(id);
  if (!problem) return {};
  return {
    title: { absolute: `${problem.title} — BGET` },
    description: clampText(problem.summary, 155),
    alternates: { canonical: `${SITE.url}/problems/${problem.id}` },
    openGraph: {
      title: `${problem.title} — BGET`,
      description: clampText(problem.summary, 155),
      url: `${SITE.url}/problems/${problem.id}`,
      images: [
        {
          url: SITE.ogImage,
          width: 1200,
          height: 630,
          alt: "BGET — Build. Grow. Evolve. Together.",
        },
      ],
    },
  };
}

export default async function ProblemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const problem = getProblem(id);
  if (!problem) notFound();

  const status = PROBLEMS.statuses.find((s) => s.id === problem.status);
  const related = relatedProblems(problem.id, 3);
  const canonical = `${SITE.url}/problems/${problem.id}`;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE.url}/` },
      { "@type": "ListItem", position: 2, name: "The Problem Queue", item: `${SITE.url}/problems` },
      { "@type": "ListItem", position: 3, name: problem.title, item: canonical },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <section className={styles.detail} aria-labelledby="detail-title">
        <div className={`${styles.detailInner} container-narrow`}>
          <Link href="/problems" className={`${styles.detailBack} reveal`}>
            <ChevronRight size={14} className={styles.backArrow} aria-hidden="true" />
            The Problem Queue
          </Link>

          <div className={`${styles.detailTop} reveal`} style={delay(60)}>
            <span className={styles.detailIndex}>
              {problem.index}
              <span className={styles.detailCat} aria-hidden="true">
                {" "}
                ·{" "}
              </span>
              {problem.category}
            </span>
            <span className={`${styles.pill} ${statusTone(problem.status)}`}>
              {statusLabel(problem.status)}
            </span>
            {problem.champion && <span className={styles.championPill}>Championed</span>}
          </div>

          <h1 id="detail-title" className={`${styles.detailTitle} reveal`} style={delay(140)}>
            {problem.title}
          </h1>

          {status && (
            <p className={`${styles.detailStatus} reveal`} style={delay(220)}>
              {status.blurb}
            </p>
          )}

          <p className={`${styles.detailSummary} reveal`} style={delay(300)}>
            {problem.summary}
          </p>

          <dl className={`${styles.facts} reveal`} style={delay(380)}>
            <div className={styles.factRow}>
              <dt className={styles.factKey}>Location</dt>
              <dd className={styles.factVal}>{problem.location}</dd>
            </div>
            <div className={styles.factRow}>
              <dt className={styles.factKey}>Proposed by</dt>
              <dd className={styles.factVal}>{problem.proposedBy}</dd>
            </div>
            <div className={styles.factRow}>
              <dt className={styles.factKey}>Last updated</dt>
              <dd className={styles.factVal}>
                <time dateTime={problem.lastUpdated}>{formatProblemDate(problem.lastUpdated)}</time>
              </dd>
            </div>
          </dl>

          {problem.efforts.length > 0 && (
            <section className={`${styles.detailBlock} reveal`} aria-labelledby="efforts-title">
              <h2 id="efforts-title" className={styles.blockTitle}>
                Already working on this
              </h2>
              <p className={styles.blockLead}>
                We name the organizations doing this work publicly — that&#39;s part of the honesty
                clause.
              </p>
              <ul className={styles.effortList}>
                {problem.efforts.map((effort) => (
                  <li key={effort.url}>
                    <a
                      className={styles.effortLink}
                      href={effort.url}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      {effort.label}
                      <ArrowUpRight size={15} aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className={`${styles.detailBlock} reveal`} aria-labelledby="discuss-title">
            <h2 id="discuss-title" className={styles.blockTitle}>
              Get involved
            </h2>
            <p className={styles.blockLead}>
              Discuss this problem with the community, or propose the next one.
            </p>
            <div className={styles.discussRow}>
              <a
                className="btn btn--ghost"
                href={problem.discussion}
                target="_blank"
                rel="noreferrer noopener"
              >
                Open the discussion
                <ArrowUpRight size={15} aria-hidden="true" />
              </a>
              <Link className="btn btn--primary" href="/problems#submit">
                Propose a problem
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </section>

          {related.length > 0 && (
            <section className={`${styles.detailBlock} reveal`} aria-labelledby="related-title">
              <h2 id="related-title" className={styles.blockTitle}>
                Related in {problem.category}
              </h2>
              <ul className={styles.relatedGrid}>
                {related.map((sibling, i) => (
                  <li key={sibling.id}>
                    <Link
                      className={styles.relCard}
                      href={`/problems/${sibling.id}`}
                      style={delay(80 * (i + 1))}
                    >
                      <span className={styles.relIndex}>{sibling.index}</span>
                      <span className={styles.relTitle}>{sibling.title}</span>
                      <span className={styles.relCat}>{sibling.category}</span>
                      <span className={styles.relArrow}>
                        Read more
                        <ArrowRight size={13} aria-hidden="true" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </section>
    </>
  );
}