import Link from "next/link";

/**
 * Shape of an approved project as returned by `GET /api/projects`.
 * Field names mirror the D1 `projects` table (migrations/0002_projects.sql).
 * Everything except `slug`/`title` is treated as optional so the card renders
 * gracefully even if the Worker returns a partial row.
 */
export type Project = {
  slug: string;
  title: string;
  one_liner?: string | null;
  description?: string | null;
  disciplines?: string | null;
  stage?: string | null;
  url?: string | null;
  repo?: string | null;
  demo?: string | null;
  cover_image?: string | null;
  lead_name?: string | null;
  location?: string | null;
  team?: string | null;
  tags?: string | string[] | null;
  featured?: number | boolean | null;
  status?: string | null;
  created_at?: string | null;
};

const STAGE_LABELS: Record<string, string> = {
  idea: "Idea",
  prototype: "Prototype",
  pilot: "Pilot",
  live: "Live",
  scaled: "Scaled",
};

/** Tags may arrive as a comma-separated string (D1 TEXT) or an array. */
export function projectTags(tags: Project["tags"]): string[] {
  if (!tags) return [];
  if (Array.isArray(tags)) {
    return tags.map((tag) => String(tag).trim()).filter(Boolean);
  }
  return String(tags)
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

/** Normalise a possibly-bare URL into something safe to put in an href. */
export function safeHref(value?: string | null): string | null {
  const raw = (value ?? "").trim();
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw) || raw.startsWith("/")) return raw;
  return `https://${raw.replace(/^\/+/, "")}`;
}

export function ProjectCard({ project }: { project: Project }) {
  const tags = projectTags(project.tags);
  const shownTags = tags.slice(0, 3);
  const extraTags = tags.length - shownTags.length;

  const stage =
    project.stage && project.stage.trim()
      ? STAGE_LABELS[project.stage.trim().toLowerCase()] ?? project.stage.trim()
      : null;

  const external = [
    { label: "Website", href: safeHref(project.url) },
    { label: "Repo", href: safeHref(project.repo) },
    { label: "Demo", href: safeHref(project.demo) },
  ].flatMap((link) => (link.href ? [{ label: link.label, href: link.href }] : []));

  const cover = project.cover_image?.trim();
  const meta = [project.lead_name, project.location]
    .map((value) => (value ?? "").trim())
    .filter((value): value is string => Boolean(value));

  return (
    <article className="card-glow hover-lift group flex h-full flex-col overflow-hidden rounded-3xl border border-foreground/10 bg-foreground/[0.02]">
      {cover ? (
        <img
          src={cover}
          alt={`${project.title} — project cover`}
          loading="lazy"
          className="aspect-[16/10] w-full object-cover"
        />
      ) : null}

      <div className="flex flex-1 flex-col p-7">
        {stage ? (
          <span className="inline-flex w-fit items-center rounded-full border border-[#eca8d6]/30 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-[#eca8d6]">
            {stage}
          </span>
        ) : null}

        <h3 className="mt-4 text-2xl font-display leading-snug tracking-tight">
          <Link href={`/projects/${project.slug}`} className="link-underline">
            {project.title}
          </Link>
        </h3>

        {project.one_liner ? (
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{project.one_liner}</p>
        ) : null}

        {shownTags.length ? (
          <ul className="mt-5 flex flex-wrap gap-2">
            {shownTags.map((tag) => (
              <li
                key={tag}
                className="rounded-full border border-foreground/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground"
              >
                {tag}
              </li>
            ))}
            {extraTags > 0 ? (
              <li className="rounded-full border border-foreground/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground/70">
                +{extraTags}
              </li>
            ) : null}
          </ul>
        ) : null}

        <div className="mt-auto pt-6">
          {meta.length ? (
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
              {meta.map((part, i) => (
                <span key={part} className="flex items-center gap-2">
                  {i > 0 ? (
                    <span aria-hidden="true" className="text-muted-foreground/40">
                      ·
                    </span>
                  ) : null}
                  {part}
                </span>
              ))}
            </p>
          ) : null}

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[11px] uppercase tracking-[0.15em]">
            <Link href={`/projects/${project.slug}`} className="link-underline text-foreground">
              View project →
            </Link>
            {external.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="link-underline text-muted-foreground hover:text-foreground"
              >
                {link.label} ↗
              </a>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
