import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ChevronRight } from "@/components/icons";
import {
  MANIFESTO,
  type ManifestoChapter,
  type ManifestoSection,
  getChapterByNumber,
} from "@/lib/manifesto";
import { SITE } from "@/lib/site";
import { clampText, delay, pad2, stripMarkdown } from "@/lib/manifesto-utils";
import ChapterBody from "@/components/manifesto/ChapterBody";
import styles from "@/components/manifesto/manifesto.module.css";

export const dynamic = "force-static";

export async function generateStaticParams() {
  return [...MANIFESTO.chapters, ...MANIFESTO.closing].map((s) => ({ slug: s.slug }));
}

type ChapterPageProps = {
  params: Promise<{ slug: string }>;
};

/** Resolve a URL slug to a numbered chapter or a closing section. */
function getSection(
  slug: string
): { chapter?: ManifestoChapter; closing?: ManifestoSection } {
  const chapter = MANIFESTO.chapters.find((c) => c.slug === slug);
  if (chapter) return { chapter };
  const closing = MANIFESTO.closing.find((c) => c.slug === slug);
  if (closing) return { closing };
  return {};
}

export async function generateMetadata({ params }: ChapterPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { chapter, closing } = getSection(slug);
  const title = chapter ? chapter.title : closing?.title;
  if (!title) return {};
  const body = (chapter ?? closing)?.body ?? "";
  const description = clampText(stripMarkdown(body), 155);
  const canonical = `${SITE.url}/manifesto/${slug}`;
  const fullTitle = `${title} — The BGET Manifesto`;
  return {
    title: { absolute: fullTitle },
    description,
    alternates: { canonical },
    openGraph: { title: fullTitle, description, url: canonical },
  };
}

export default async function ChapterPage({ params }: ChapterPageProps) {
  const { slug } = await params;
  const { chapter, closing } = getSection(slug);
  if (!chapter && !closing) notFound();

  const title = chapter ? chapter.title : closing!.title;
  const body = chapter ? chapter.body : closing!.body;
  const canonical = `${SITE.url}/manifesto/${slug}`;
  const description = clampText(stripMarkdown(body), 155);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    url: canonical,
    articleSection: "BGET Manifesto",
    author: { "@type": "Organization", name: SITE.name, url: SITE.url },
    publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
    inLanguage: "en-US",
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE.url}/` },
      { "@type": "ListItem", position: 2, name: "The Manifesto", item: `${SITE.url}/manifesto` },
      { "@type": "ListItem", position: 3, name: title, item: canonical },
    ],
  };

  // Numbered chapters get their neighbours; closing sections pick up from the
  // final chapter and hand back to the table of contents.
  const prev = chapter
    ? getChapterByNumber(chapter.number - 1)
    : getChapterByNumber(MANIFESTO.chapters.length);
  const next = chapter ? getChapterByNumber(chapter.number + 1) : undefined;

  const prevCell = prev
    ? {
        href: `/manifesto/${prev.slug}`,
        kicker: "Previous",
        line: `Chapter ${prev.number}`,
        title: prev.title,
      }
    : {
        href: "/manifesto",
        kicker: "Start of the book",
        line: "Table of contents",
        title: "Back to the manifesto",
      };

  const nextCell = next
    ? {
        href: `/manifesto/${next.slug}`,
        kicker: "Next",
        line: `Chapter ${next.number}`,
        title: next.title,
      }
    : {
        href: "/manifesto",
        kicker: "End of the book",
        line: "Table of contents",
        title: "Back to the manifesto",
      };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <section className={styles.detail} aria-labelledby="chapter-title">
        <div className={`${styles.detailInner} container-narrow`}>
          <Link href="/manifesto" className={`${styles.detailBack} reveal`}>
            <ChevronRight size={14} className={styles.backArrow} aria-hidden="true" />
            The Manifesto
          </Link>

          <p className={`${styles.detailTag} reveal`} style={delay(60)}>
            {chapter ? `CHAPTER ${pad2(chapter.number)} / 26` : "CLOSING · THE MANIFESTO"}
          </p>

          <h1 id="chapter-title" className={`${styles.detailH1} reveal`} style={delay(140)}>
            {title}
          </h1>

          <div className={`${styles.detailBody} reveal`} style={delay(220)}>
            <ChapterBody markdown={body} />
          </div>

          <nav className={`${styles.nav} reveal`} style={delay(300)} aria-label="Chapter navigation">
            <Link className={styles.navLinkBlock} href={prevCell.href}>
              <span className={styles.navKicker}>{prevCell.kicker}</span>
              <span className={styles.navLine}>
                <ChevronRight size={15} className={`${styles.navArrow} ${styles.navArrowPrev}`} aria-hidden="true" />
                {prevCell.line}
              </span>
              <span className={styles.navTitle}>{prevCell.title}</span>
            </Link>

            <Link className={`${styles.navLinkBlock} ${styles.navLinkBlockNext}`} href={nextCell.href}>
              <span className={styles.navKicker}>{nextCell.kicker}</span>
              <span className={styles.navLine}>
                {nextCell.line}
                <ArrowRight size={15} className={styles.navArrow} aria-hidden="true" />
              </span>
              <span className={styles.navTitle}>{nextCell.title}</span>
            </Link>
          </nav>
        </div>
      </section>
    </>
  );
}