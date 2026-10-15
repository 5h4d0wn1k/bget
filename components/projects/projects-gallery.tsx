"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { ProjectCard, type Project } from "@/components/projects/project-card";

type FetchState = "loading" | "ready" | "error";

/** Pull an array of rows out of whatever envelope the Worker responds with. */
function pickArray(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    for (const key of ["projects", "items", "data", "results"]) {
      const value = (data as Record<string, unknown>)[key];
      if (Array.isArray(value)) return value;
    }
  }
  return [];
}

/** Narrow an unknown row to a usable Project, dropping anything malformed. */
function toProject(value: unknown): Project | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const slug = typeof row.slug === "string" ? row.slug.trim() : "";
  const title = typeof row.title === "string" ? row.title.trim() : "";
  if (!slug || !title) return null;

  const status = typeof row.status === "string" ? row.status : null;
  // The endpoint only returns approved rows, but stay defensive if it doesn't.
  if (status && status !== "approved") return null;

  const str = (key: string): string | null =>
    typeof row[key] === "string" && (row[key] as string).trim() ? (row[key] as string) : null;

  return {
    slug,
    title,
    one_liner: str("one_liner"),
    description: str("description"),
    disciplines: str("disciplines"),
    stage: str("stage"),
    url: str("url"),
    repo: str("repo"),
    demo: str("demo"),
    cover_image: str("cover_image"),
    lead_name: str("lead_name"),
    location: str("location"),
    team: str("team"),
    tags:
      typeof row.tags === "string"
        ? (row.tags as string)
        : Array.isArray(row.tags)
          ? (row.tags as unknown[]).map((tag) => String(tag))
          : null,
    featured:
      typeof row.featured === "number"
        ? (row.featured as number)
        : typeof row.featured === "boolean"
          ? (row.featured ? 1 : 0)
          : null,
    status,
    created_at: str("created_at"),
  };
}

function LoadingGrid() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" role="status" aria-busy="true">
      <span className="sr-only">Loading projects…</span>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-3xl border border-foreground/10 p-7" aria-hidden="true">
          <div className="h-5 w-20 animate-pulse rounded-full bg-foreground/10" />
          <div className="mt-6 h-8 w-3/4 animate-pulse rounded bg-foreground/10" />
          <div className="mt-4 h-4 w-full animate-pulse rounded bg-foreground/10" />
          <div className="mt-2 h-4 w-2/3 animate-pulse rounded bg-foreground/10" />
          <div className="mt-10 h-4 w-1/3 animate-pulse rounded bg-foreground/10" />
        </div>
      ))}
    </div>
  );
}

export function ProjectsGallery() {
  const [state, setState] = useState<FetchState>("loading");
  const [projects, setProjects] = useState<Project[]>([]);

  const load = useCallback(async () => {
    setState("loading");
    try {
      const res = await fetch("/api/projects", { headers: { accept: "application/json" } });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = await res.json().catch(() => null);
      const list = pickArray(data)
        .map(toProject)
        .filter((project): project is Project => project !== null)
        .sort((a, b) => Number(b.featured ?? 0) - Number(a.featured ?? 0));
      setProjects(list);
      setState("ready");
    } catch {
      setState("error");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (state === "loading") return <LoadingGrid />;

  if (state === "error") {
    return (
      <div
        role="alert"
        className="card-glow rounded-3xl border border-foreground/10 p-10 text-center lg:p-14"
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          Connection lost
        </p>
        <h3 className="mt-4 text-3xl font-display">We couldn&apos;t load the showcase.</h3>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          The gallery is fetched live from our database. Check your connection and try again — or
          submit a project while you&apos;re here.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <button
            type="button"
            onClick={() => void load()}
            className="hover-lift inline-flex h-12 items-center justify-center rounded-full bg-foreground px-7 text-sm font-medium text-background hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Try again
          </button>
          <Link
            href="#submit"
            className="hover-lift inline-flex h-12 items-center justify-center rounded-full border border-foreground/20 px-7 text-sm hover:bg-foreground/5"
          >
            Submit a project
          </Link>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="card-glow rounded-3xl border border-foreground/10 p-10 text-center lg:p-14">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          Nothing published yet
        </p>
        <h3 className="mt-4 text-3xl font-display">Be the first in the showcase.</h3>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Approved projects appear here. If you have built something real — a tool, a prototype, a
          pilot, a small service — it belongs on this wall.
        </p>
        <Link
          href="#submit"
          className="hover-lift mt-8 inline-flex h-12 items-center justify-center rounded-full bg-foreground px-7 text-sm font-medium text-background hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Submit a project
        </Link>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project, i) => (
        <Reveal key={project.slug} delay={(i % 3) * 70} y={24} className="h-full">
          <ProjectCard project={project} />
        </Reveal>
      ))}
    </div>
  );
}
