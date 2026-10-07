# BGET

**Build. Grow. Evolve. Together.**

A global community of builders, scientists, makers and thinkers — every
country, every discipline. _Character before capability._ This repository is
the public website: a Next.js 16 App Router site that runs on **Cloudflare
Workers via OpenNext**, with forms, Discord delivery, a D1-backed admin panel,
and programmatic SEO built in.

Production lives on Cloudflare Workers (GitHub Pages is retired). The admin
panel is an internal tool — `/admin` is `noindex`.

---

## 1. Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router), statically generated marketing pages + dynamic admin |
| Language | TypeScript (strict) |
| UI | React 19, CSS modules + design tokens (`app/globals.css`), lucide-react icons |
| Content | `content/philosophy.md` → generated `content/chapters.json`, plus `content/problems.json` |
| Database | Cloudflare D1 (raw SQL; schema in `drizzle/schema.sql`, read via `lib/server/db.ts`) |
| Delivery | Discord webhooks, server-side only (`lib/server/discord.ts`, `app/api/submit`) |
| Runtime | Cloudflare Workers via OpenNext (`open-next.config.ts`, `wrangler.toml`) |

No Tailwind, no external UI kit, no ORM magic — drizzle-orm is installed but the
D1 layer uses prepared statements on purpose (dependency-light, easy to read).

## 2. Quick start

Requires Node ≥ 20 (this repo is developed on Node 26; CI uses Node 22).

```bash
npm ci
npm run dev        # http://localhost:3000 — `predev` regenerates chapters.json
```

Other scripts:

```bash
npm run typecheck      # tsc --noEmit
npm run lint           # eslint .
npm run check          # typecheck + lint
npm run chapters       # node scripts/split-manifesto.mjs (regenerates chapters.json)
npm run build          # next build (prebuild regenerates chapters.json)
node tests/smoke.mjs   # build + verify: routes compile, 26 chapters, queue populated
```

To run with Cloudflare bindings (D1, secrets) locally:

```bash
npm run build
npx wrangler dev       # serves .open-next/worker.js with wrangler.toml bindings
```

## 3. Project structure

```text
app/
├── layout.tsx            # Public root layout: fonts, OG/JSON-LD, Header/Footer
├── page.tsx              # Home
├── problems/             # Problem queue + /problems/[id] detail pages
├── manifesto/            # Manifesto index + /manifesto/[slug] chapters
├── apply/                # Application form page
├── admin/                # Internal admin panel (separate layout, noindex)
├── api/
│   ├── submit/           # Form delivery → Discord (works today)
│   └── admin/status/     # Admin status updates (POST { id, status })
├── sitemap.ts · robots.ts · globals.css
components/               # public chrome + page components (CSS modules)
content/
├── philosophy.md         # Manifesto source of truth
├── chapters.json         # Generated — commit it fresh (prebuild + CI check)
└── problems.json         # Curated problem queue
lib/
├── site.ts               # ONE constant for the site URL (SEO canonical)
├── manifesto.ts · problems.ts · *-utils.ts
└── server/
    ├── discord.ts        # Discord webhook delivery (untouched — owned elsewhere)
    └── db.ts             # D1 access layer (getDb / record / list / update status)
scripts/split-manifesto.mjs   # philosophy.md → chapters.json
drizzle/schema.sql            # D1 schema (applied via wrangler d1 execute)
tests/smoke.mjs               # build smoke test (Node-only)
workers/bget-forms/           # LEGACY relay worker — retired, kept for reference
```

## 4. Forms & delivery

Two public forms — **Apply** (`/apply`) and **Problems** (`/problems`) — share
one endpoint, `POST /api/submit`:

1. The client form (`components/apply/ApplyForm.tsx`, `components/problems/ProblemForm.tsx`)
   validates, enforces a minimum fill time, and posts JSON (or multipart when a
   résumé is attached) to `/api/submit`.
2. The route (`app/api/submit/route.ts`) runs **server-side on the Worker**,
   flushes honeypot fields, renders a Discord embed, and calls
   `deliverToDiscord(...)` from `lib/server/discord.ts`. The browser never sees
   a webhook URL.
3. It returns a receipt ref (`BGET-A-…` / `BGET-P-…`) for the success UI.

Secrets (never in the repo, never on the client):

```bash
# local dev
echo "https://discord.com/api/webhooks/…" >> .env   # DISCORD_APPLY_WEBHOOK
echo "https://discord.com/api/webhooks/…" >> .env   # DISCORD_PROBLEMS_WEBHOOK

# Cloudflare (also done automatically by the deploy workflow)
printf '%s' "https://discord.com/api/webhooks/…" | npx wrangler secret put DISCORD_APPLY_WEBHOOK
printf '%s' "https://discord.com/api/webhooks/…" | npx wrangler secret put DISCORD_PROBLEMS_WEBHOOK
```

If a webhook is unset, delivery is a silent no-op — the forms never fail loudly.

## 5. D1 setup

The admin panel reads from D1. One-time setup:

```bash
npx wrangler d1 create bget-db
# → copy the printed database_id and un-comment [[d1_databases]] in wrangler.toml:
#     binding = "DB"
#     database_name = "bget-db"
#     database_id = "<paste>"

# apply the schema — idempotent, safe to re-run
npx wrangler d1 execute bget-db --file=drizzle/schema.sql --remote   # production
npx wrangler d1 execute bget-db --file=drizzle/schema.sql --local    # local dev
```

Once the binding exists, `lib/server/db.ts` resolves it through
`getCloudflareContext({ async: false }).env.DB` (falling back to
`process.env.DB` locally) and never crashes when it is absent — admin pages
render an empty state instead.

**Current production flow:** v0 delivers to Discord; `app/api/submit` does not
record to D1 yet. The data layer (`recordSubmission` in `lib/server/db.ts`) and
the admin panel that reads it are ready. When D1 is live, the submit route adds
one call:

```ts
// in app/api/submit/route.ts, before returning the ref:
await recordSubmission(kind, fields, ref);
```

So the sequence is: create D1 → bind in `wrangler.toml` → deploy → wire
`recordSubmission` into the submit route. Until then the queue rows simply stay
empty.

## 6. Deployment (production = Cloudflare)

**GitHub Pages is retired.** The only deploy path is `.github/workflows/deploy.yml`
(push to `main` or `workflow_dispatch`), which mirrors the GitHub Pages job
that used to exist but now targets Workers:

1. `npm ci`, then `npx opennextjs-cloudflare build` — runs `next build` and
   bundles the app into `.open-next/worker.js` (the `main` in `wrangler.toml`).
2. `npx wrangler deploy` — publishes the worker.
3. Idempotently re-applies the D1 schema and (re)sets worker secrets
   `DISCORD_APPLY_WEBHOOK`, `DISCORD_PROBLEMS_WEBHOOK`, `ADMIN_TOKEN` from GitHub
   secrets; missing secrets warn instead of failing, so first-time deploys work.

Required GitHub secrets:

| Secret | Purpose |
| --- | --- |
| `CF_API_TOKEN` | Cloudflare API token (deploy, secrets, D1) — has Workers + D1 edit permissions |
| `DISCORD_APPLY_WEBHOOK` | Apply-form Discord webhook URL |
| `DISCORD_PROBLEMS_WEBHOOK` | Problems-form Discord webhook URL |
| `ADMIN_TOKEN` | Optional — locks the admin panel's status endpoint |

Pull requests only run CI (`.github/workflows/ci.yml`): `npm ci`, typecheck,
lint, then `node tests/smoke.mjs` (which shells `npm run build` and asserts the
route table + content), plus a fresh-chapters check
(`node scripts/split-manifesto.mjs --check`). CI needs no secrets.

Manual deploy from a laptop:

```bash
npm ci
npx opennextjs-cloudflare build
npx wrangler deploy
```

**Domain:** the site serves on `<worker>.workers.dev` by default. When you buy
a domain, change **one constant** — `SITE.url` in `lib/site.ts` — and
rebuild: canonical, sitemap, robots, and OG all derive from it. Then point the
domain at the worker in the Cloudflare dashboard (Workers → bget → Settings →
Domains).

## 7. Admin panel

`/admin` is the internal review tool — `noindex` (its own layout sets
`robots: { index: false, follow: false }`), no public Header/Footer, minimal
top bar (Dashboard / Applications / Problems).

- **Dashboard** — new-vs-total counts for applications and problems plus a
  short roadmap (v1 triage → login → per-application threads → moderation).
- **Applications** — apply rows (kind `apply`): ref, received date, name,
  status, expandable fields JSON.
- **Problems** — problem rows (kind `problems`): ref, date, `problem_what`
  (clamped), where/credit, status.
- **Status updates** — the per-row `StatusSelect` posts to
  `POST /api/admin/status` (`{ id, status }`), which calls
  `updateSubmissionStatus` in `lib/server/db.ts`. Statuses:
  `new → reviewing → accepted / declined`, plus `archived`.

Security is deliberately v0: when the `ADMIN_TOKEN` secret is set, the status
endpoint requires `Authorization: Bearer <token>` (keep it in browser
localStorage under `bget.adminToken`, e.g. via DevTools); when it is unset, the
panel runs in **open mode** — the top bar shows an "open mode" chip to make
that obvious. Set `ADMIN_TOKEN` before sharing `/admin` with anyone.

D1 requirements: the database + schema from section 5. Without a binding the
panel shows "No D1 binding yet" empty states instead of crashing.

## 8. SEO & content architecture

- **Manifesto chapters** — `scripts/split-manifesto.mjs` derives
  `content/chapters.json` from `content/philosophy.md`. Exactly **26 chapters**,
  each a URL `/manifesto/<slug>`. `prebuild`/`predev` regenerate it; CI checks
  it is committed fresh.
- **Problem pages** — each entry in `content/problems.json` is a
  `/problems/<id>` URL.
- **Sitemap** — `app/sitemap.ts` emits ~30+ URLs (roots + every problem +
  every chapter). **Robots** — `app/robots.ts` blocks `/api/` and `/admin/`.
- **Structured data** — `Organization` (root layout), `FAQPage` (problems
  queue), `Article` (manifesto chapters), Q&A markup (problem detail).
- **Open Graph** — `public/assets/og-card.png` referenced from the root layout.
- **SEO constant** — all canonicals flow from `SITE.url` (see section 6).

## 9. Code of conduct / contributing / license

- [CONTRIBUTING.md](CONTRIBUTING.md) — how to fork, branch, and keep the bar high.
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) — the community standard.
- [SECURITY.md](SECURITY.md) — private reporting for vulnerabilities.
- License: MIT — see [LICENSE](LICENSE).

## 10. Owner checklist

Current state (October 2026): the platform is **live on Cloudflare Workers**
(`https://bget.nikhilnagpure203.workers.dev`, OpenNext + D1). Forms deliver to
Discord and persist to D1, the admin panel is secured behind `ADMIN_TOKEN`, and
deploys run automatically from `main` (the `CF_API_TOKEN` repo secret is set).
Any push to `main` rebuilds, redeploys, re-applies the D1 schema and re-sets
secrets via `.github/workflows/deploy.yml`.

- [x] **Create D1** — `npx wrangler d1 create bget-db`; the `database_id` is
      committed in `wrangler.toml`.
- [x] **Apply the schema** — `npx wrangler d1 execute bget-db
      --file=drizzle/schema.sql --remote` (idempotent: `IF NOT EXISTS`).
- [x] **Set worker secrets** — `ADMIN_TOKEN` (admin panel locked) is set on the
      worker and as a GitHub secret. **Remaining:** provide the two Discord
      webhook URLs (`DISCORD_APPLY_WEBHOOK`, `DISCORD_PROBLEMS_WEBHOOK`) — until
      then `/api/submit` returns an honest 502. Set them with
      `printf '%s' "$URL" | npx wrangler secret put <NAME>` and as GitHub
      secrets, or the deploy workflow can't set them automatically.
- [x] **Wire the submit route to D1** — `app/api/submit/route.ts` now calls
      `recordSubmission(...)` after a successful Discord delivery (fail-soft).
- [x] **Deploy** — live on Workers; push to `main` to redeploy.
- [ ] **Buy a custom domain** — set it in the Cloudflare dashboard, change
      `SITE.url` in `lib/site.ts`, rebuild + redeploy so canonical/sitemap/robots/OG
      follow.
- [ ] **Submit the sitemap** — `/sitemap.xml` to Google Search Console and Bing
      Webmaster Tools once the canonical domain is live.
- [ ] **Invite a collaborator** — add a maintainer and turn on branch protection
      (CI + deploy must stay green).
- [ ] **Replace the superadmin token** — `CF_API_TOKEN` currently holds a
      full-account token. Rotate to a scoped "Workers Scripts + D1 Edit" token
      (API tokens → create) once the site is stable.

Build notes: `.github/workflows/deploy.yml` runs `npm run build:worker`
(`opennextjs-cloudflare build` + `scripts/patch-opennext-manifest.mjs`). That
script is a **temporary fix** for Next.js 16.4's `preview-props.json` manifest,
which `@opennextjs/cloudflare` ≤ 1.20.9 did not inline (every route 500ed);
upstream fix pending at opennextjs/opennextjs-cloudflare#1356. Delete the script
once a release ships it.