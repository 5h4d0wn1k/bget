/**
 * URL slug generation for project pages.
 *
 * Slugs are lowercase, alphanumeric + hyphens, and unique across the
 * `projects` table (duplicates get a `-2`, `-3`, … suffix).
 */

/**
 * Convert arbitrary text into a URL-safe slug.
 *
 * @param {unknown} input
 * @param {number} [max] Maximum slug length.
 * @returns {string}
 */
export function slugify(input, max = 80) {
  return String(input ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // strip combining accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, max)
    .replace(/-+$/g, "");
}

/**
 * Resolve a unique slug for a project title, appending `-2`, `-3`, … on
 * collision.
 *
 * @param {{DB: D1Database}} env
 * @param {string} title
 * @returns {Promise<string>}
 */
export async function uniqueSlug(env, title) {
  const base = slugify(title) || "project";
  let candidate = base;
  let suffix = 1;

  for (;;) {
    const existing = await env.DB.prepare(
      "SELECT id FROM projects WHERE slug = ? LIMIT 1",
    )
      .bind(candidate)
      .first();
    if (!existing) return candidate;

    suffix += 1;
    candidate = `${base}-${suffix}`;

    // Safety valve: practically unreachable, but avoids an infinite loop.
    if (suffix > 1000) return `${base}-${Date.now().toString(36)}`;
  }
}
