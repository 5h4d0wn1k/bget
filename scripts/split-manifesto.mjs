/**
 * Split content/philosophy.md into BGET manifesto chapters.
 * Produces content/chapters.json consumed by lib/manifesto.ts.
 *
 *   node scripts/split-manifesto.mjs   # write content/chapters.json
 *   node scripts/split-manifesto.mjs --check  # exit 1 if stale
 *
 * Deterministic: identical output for identical source.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, "..");
const SRC = join(ROOT, "content", "philosophy.md");
const OUT = join(ROOT, "content", "chapters.json");

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function splitChapters() {
  const md = readFileSync(SRC, "utf8");
  const lines = md.split(/\r?\n/);

  const intro = { title: "", body: [] };
  const chapters = [];
  const closing = [];

  let current = null;
  let section = null;

  for (const line of lines) {
    const chapter = line.match(/^# (\d+)\.\s+(.+)$/);
    const closingHead = line.match(/^# (BGET in One Paragraph|The BGET North Star)$/);
    const introHead = line.startsWith("# BGET") || (line.startsWith("## ") && !section);

    if (chapter) {
      if (section) chapters.push(section);
      section = {
        number: parseInt(chapter[1], 10),
        title: chapter[2].trim(),
        slug: slugify(chapter[2].trim()),
        body: [],
      };
      current = "chapter";
      continue;
    }
    if (closingHead) {
      if (section) {
        if (current === "chapter") chapters.push(section);
        else if (current === "closing") closing.push(section);
      }
      section = { title: closingHead[1], slug: slugify(closingHead[1]), body: [] };
      current = "closing";
      continue;
    }
    // Intro: everything before the first numbered chapter (the Vision + preamble).
    if (!section && !current) {
      intro.body.push(line);
      continue;
    }
    if (section) section.body.push(line);
  }
  if (section) {
    if (current === "chapter") chapters.push(section);
    else if (current === "closing") closing.push(section);
  }

  return {
    intro: { title: "", body: intro.body.join("\n").trim() },
    chapters: chapters.map((c) => ({ ...c, body: c.body.join("\n").trim() })),
    closing: closing.map((c) => ({ ...c, body: c.body.join("\n").trim() })),
  };
}

const data = splitChapters();

if (process.argv.includes("--check")) {
  if (!existsSync(OUT)) {
    console.error("chapters.json missing — run `node scripts/split-manifesto.mjs`");
    process.exit(1);
  }
  const cur = readFileSync(OUT, "utf8");
  const next = JSON.stringify(data, null, 2) + "\n";
  if (cur === next) {
    console.log("chapters.json is up to date.");
    process.exit(0);
  }
  console.error(
    `chapters.json is out of date (${data.chapters.length} chapters derived) — run the generator.`
  );
  process.exit(1);
}

writeFileSync(OUT, JSON.stringify(data, null, 2) + "\n");
console.log(
  `Wrote ${data.chapters.length} chapters (intro + ${data.closing.length} closing sections) to content/chapters.json`
);