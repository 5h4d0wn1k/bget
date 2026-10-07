#!/usr/bin/env node
/**
 * BGET build smoke test.
 *
 * Shells `npm run build` (which runs the prebuild chapter splitter, then
 * `next build`), captures the build log, and asserts:
 *
 *   1. the build exits 0
 *   2. the log shows "Compiled successfully" and the route table
 *   3. the marketing routes compiled: /apply, /problems, /manifesto,
 *      /problems/[id], /manifesto/[slug]
 *   4. .next/BUILD_ID exists (a real Next build ran)
 *   5. content/chapters.json has exactly 26 chapters
 *   6. content/problems.json has at least one queued problem
 *
 * No browser, no running server, no static export — works entirely off the
 * .next build output. Exits non-zero on any failure.
 *
 *   node tests/smoke.mjs
 */
import { spawn } from "node:child_process";
import { ROOT, checkFileAsserts, hasRouteInLog } from "./run-smoke.mjs";

const BUILD_TIMEOUT_MS = 15 * 60 * 1000; // generous: cold npm ci + next build

/** Routes the marketing site must compile. */
const REQUIRED_ROUTES = ["/apply", "/problems", "/manifesto", "/problems/[id]", "/manifesto/[slug]"];

/**
 * Run `npm run build`, capturing stdout/stderr. Resolves with
 * { code | error, out, err } — never rejects.
 */
function runBuild() {
  return new Promise((resolve) => {
    console.log("→ npm run build (prebuild regenerates chapters.json, then next build)");
    const child = spawn("npm", ["run", "build"], {
      cwd: ROOT,
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let out = "";
    let err = "";
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      console.error("smoke: build exceeded the timeout and was killed (SIGKILL)");
      child.kill("SIGKILL");
    }, BUILD_TIMEOUT_MS);

    child.stdout.on("data", (chunk) => (out += chunk));
    child.stderr.on("data", (chunk) => (err += chunk));
    child.on("error", (error) => {
      clearTimeout(timer);
      resolve({ error, out, err, timedOut });
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({ code, out, err, timedOut });
    });
  });
}

async function main() {
  const result = await runBuild();

  if (result.error) {
    console.error(`smoke: could not start the build: ${result.error.message}`);
    process.exit(1);
  }
  if (result.timedOut || result.code !== 0) {
    console.error(`smoke: build failed (exit ${result.code ?? "killed"}) — log tail:`);
    console.error((result.err + "\n" + result.out).slice(-5000));
    process.exit(1);
  }
  console.log(`  ok  next build exited 0`);

  const log = result.out;
  const failures = [];

  if (!log.includes("Compiled successfully")) {
    failures.push('build log is missing "Compiled successfully"');
  }
  if (!log.includes("Route (app)")) {
    failures.push('build log is missing the route table ("Route (app)" header)');
  }
  for (const route of REQUIRED_ROUTES) {
    if (hasRouteInLog(log, route)) {
      console.log(`  ok  route compiled: ${route}`);
    } else {
      failures.push(`route not found in the build log: ${route}`);
    }
  }

  failures.push(...checkFileAsserts());

  if (failures.length > 0) {
    for (const failure of failures) console.error(`  ✗ ${failure}`);
    console.error("\nsmoke: FAIL");
    process.exit(1);
  }
  console.log("\nsmoke: PASS — build is healthy, chapters fresh, queue populated.");
}

main().catch((error) => {
  console.error("smoke: unexpected error:", error);
  process.exit(1);
});