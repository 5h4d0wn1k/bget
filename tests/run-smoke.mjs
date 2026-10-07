/**
 * Shared smoke assertions for the BGET build output.
 *
 * Run directly (after a build) or imported by tests/smoke.mjs (which shells
 * `npm run build` first). Node-only — no browser, no server needed.
 *
 *   node tests/run-smoke.mjs          # assert against an existing .next/
 *   node tests/smoke.mjs              # build, then assert everything
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));

const EXPECTED_CHAPTERS = 26;
const MIN_PROBLEMS = 1;

/**
 * File-level assertions against the build + content output.
 * Returns a list of failure strings (empty when everything is fine).
 */
export function checkFileAsserts() {
  const failures = [];

  // 1. A real Next build produced a build id.
  const buildIdPath = join(ROOT, ".next", "BUILD_ID");
  if (!existsSync(buildIdPath)) {
    failures.push(`missing .next/BUILD_ID — run \`npm run build\` first`);
  } else {
    const buildId = readFileSync(buildIdPath, "utf8").trim();
    if (!buildId) {
      failures.push(`.next/BUILD_ID exists but is empty — the build output looks corrupt`);
    } else {
      console.log(`  ok  .next/BUILD_ID present (${buildId})`);
    }
  }

  // 2. The prebuild step produced exactly 26 manifesto chapters.
  const chaptersPath = join(ROOT, "content", "chapters.json");
  if (!existsSync(chaptersPath)) {
    failures.push(
      `missing content/chapters.json — run \`node scripts/split-manifesto.mjs\` (prebuild does this)`
    );
  } else {
    let chapters = null;
    try {
      chapters = JSON.parse(readFileSync(chaptersPath, "utf8"));
    } catch {
      chapters = null;
    }
    if (!chapters || !Array.isArray(chapters.chapters)) {
      failures.push(`content/chapters.json is malformed (expected { intro, chapters, closing })`);
    } else {
      const count = chapters.chapters.length;
      if (count !== EXPECTED_CHAPTERS) {
        failures.push(`expected exactly ${EXPECTED_CHAPTERS} manifesto chapters, found ${count}`);
      } else {
        console.log(`  ok  content/chapters.json has exactly ${EXPECTED_CHAPTERS} chapters`);
      }
    }
  }

  // 3. The problem queue has at least one entry (programmatic SEO depends on it).
  const problemsPath = join(ROOT, "content", "problems.json");
  if (!existsSync(problemsPath)) {
    failures.push(`missing content/problems.json`);
  } else {
    let problems = null;
    try {
      problems = JSON.parse(readFileSync(problemsPath, "utf8"));
    } catch {
      problems = null;
    }
    const count = problems && Array.isArray(problems.problems) ? problems.problems.length : 0;
    if (count < MIN_PROBLEMS) {
      failures.push(`expected at least ${MIN_PROBLEMS} queued problem(s), found ${count}`);
    } else {
      console.log(`  ok  content/problems.json has ${count} problem(s)`);
    }
  }

  return failures;
}

/** Assert the captured `next build` stdout contains a compiled route row. */
export function hasRouteInLog(log, route) {
  if (route.includes("[") || route.includes("]")) {
    // Dynamic groups print a bare group row, e.g. `├   /manifesto/[slug]`,
    // with the concrete SSG pages (`●`) nested underneath.
    return log.includes(route);
  }
  const escaped = route.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // Static/SSG/dynamic rows look like:  ├ ○ /apply   ·   └ ƒ /admin
  return new RegExp(`[○●ƒ]\\s+${escaped}\\s`).test(log);
}

function main() {
  const failures = checkFileAsserts();
  if (failures.length > 0) {
    for (const failure of failures) console.error(`  ✗ ${failure}`);
    console.error("\nrun-smoke: FAIL");
    process.exit(1);
  }
  console.log("\nrun-smoke: PASS");
}

// Direct execution (not when imported) — ESM guard.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}