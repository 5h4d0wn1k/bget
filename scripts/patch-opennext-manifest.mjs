#!/usr/bin/env node
/**
 * TEMPORARY FIX — @opennextjs/cloudflare (≤ 1.20.9) does not inline
 * `preview-props.json` into its generated `loadManifest` patch. Next.js 16.4
 * moved preview props out of `prerender-manifest.json` into that standalone
 * file and loads it *unconditionally* during server bootstrap, so every route
 * 500s with:
 *
 *   Unexpected loadManifest(/.next/server/preview-props.json) call!
 *
 * Upstream fix: opennextjs/opennextjs-cloudflare#1356 (open, unreleased).
 * Delete this script once the fix ships and this repo bumps @opennextjs/cloudflare
 * past it, then remove the `postinstall`/`build:worker` references below.
 *
 * Two passes (each idempotent, independent):
 *   1. Source pass — patch the installed plugin's manifest glob (same one-line
 *      change as the upstream PR) so *future* builds inline the manifest.
 *   2. Output pass — post-build safety net: inline the bundled
 *      `preview-props.json` directly into an already-built
 *      `.open-next/server-functions/default/handler.mjs`.
 *
 * The output pass is the guarantee for CI deploys, so it exits non-zero if its
 * anchor is missing. The source pass is best-effort (warns on odd layouts) so a
 * plain `npm install` never hard-fails on unrelated opennext versions.
 */
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const pluginPath = join(
  root,
  "node_modules/@opennextjs/cloudflare/dist/cli/build/patches/plugins/load-manifest.js",
);
const handlerPath = join(root, ".open-next/server-functions/default/handler.mjs");
const bundledPreviewProps = join(
  root,
  ".open-next/server-functions/default/.next/server/preview-props.json",
);
const localPreviewProps = join(root, ".next/server/preview-props.json");

let exitCode = 0;

/* ------------------------------------------------------------------------ */
/* Pass 1 — source glob patch (mirrors opennextjs/opennextjs-cloudflare#1356) */
/* ------------------------------------------------------------------------ */
const OLD_GLOB = "{*-manifest,required-server-files,prefetch-hints}.json";
const NEW_GLOB = "{*-manifest,required-server-files,prefetch-hints,preview-props}.json";

if (existsSync(pluginPath)) {
  const src = await readFile(pluginPath, "utf-8");
  if (src.includes(NEW_GLOB)) {
    console.log("opennext-manifest: source already patched (glob includes preview-props) — no-op");
  } else if (src.includes(OLD_GLOB)) {
    await writeFile(pluginPath, src.replace(OLD_GLOB, NEW_GLOB));
    console.log("opennext-manifest: patched plugin glob → " + NEW_GLOB);
  } else {
    console.warn(
      "opennext-manifest: plugin layout changed — could not find the manifest glob anchor. " +
        "Output pass will still patch the built handler; please re-check after any @opennextjs/cloudflare upgrade.",
    );
  }
} else {
  console.log("opennext-manifest: plugin source not installed (dev deps omitted?) — source pass skipped");
}

/* ------------------------------------------------------------------------ */
/* Pass 2 — output patch on the built handler (safety net / direct fix)      */
/* ------------------------------------------------------------------------ */
if (existsSync(handlerPath)) {
  const handler = await readFile(handlerPath, "utf-8");

  if (handler.includes('endsWith("/server/preview-props.json")')) {
    console.log("opennext-manifest: handler already inlines preview-props.json — no-op");
  } else {
    // The patched loadManifest ends with a chain of `if (X.endsWith(...)) return ...`
    // followed by: throw new Error(`Unexpected loadManifest(${path2}) call!`).
    // The throw references the function's path parameter (e.g. path2), not the
    // local var used in the endsWith chain — recover it from the throw itself.
    const throwMatch = handler.match(
      /throw new Error\(`Unexpected loadManifest\(\$\{([A-Za-z_$][\w$]*)\}\) call!`\)/,
    );
    if (!throwMatch) {
      console.error(
        "opennext-manifest: FATAL — built handler has no loadManifest throw anchor. " +
          "Did @opennextjs/cloudflare change its patch output? Refusing to deploy a broken bundle.",
      );
      process.exit(1);
    }
    const pathVar = throwMatch[1];
    const throwAnchor = `throw new Error(\`Unexpected loadManifest(${pathVar}) call!\`)`;

    const previewPropsFile =
      existsSync(bundledPreviewProps) ? bundledPreviewProps : localPreviewProps;
    if (!existsSync(previewPropsFile)) {
      console.error(
        "opennext-manifest: FATAL — preview-props.json not found in build output. " +
          "Refusing to deploy a broken bundle.",
      );
      process.exit(1);
    }
    const inline = JSON.stringify(JSON.parse(await readFile(previewPropsFile, "utf-8")));
    const branch =
      `if(${pathVar}.endsWith("/server/preview-props.json"))return ${inline};`;

    await writeFile(handlerPath, handler.replace(throwAnchor, branch + throwAnchor));
    console.log("opennext-manifest: inlined preview-props.json into built handler");
  }
} else {
  console.log("opennext-manifest: no built handler found — output pass skipped");
}

process.exit(exitCode);