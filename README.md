# BGET — Build. Grow. Evolve. Together.

The public website for **BGET**, a global, multidisciplinary community for
turning meaningful problems into collective action.

> Bring us a problem. We'll bring together the people who can help.

Production: **Cloudflare Workers** — <https://bget.nikhilnagpure203.workers.dev>
(The old GitHub Pages site is retired.)

---

## 1. Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router), **static export** (`output: 'export'`) |
| Language | TypeScript |
| UI | React 19, Tailwind v4 + design tokens (`app/globals.css`), lucide-react |
| Hosting | Cloudflare Workers static assets (`wrangler.toml` → `[assets]`) |
| API | `worker/index.js` — a tiny JSON API for the public forms |
| Database | Cloudflare D1 (`bget-forms`), schema in `migrations/` |

The Next app is fully static. The only server code is `worker/index.js`, which
serves the export through the `ASSETS` binding and handles `/api/*`.

## 2. Pages

| Route | What it is |
| --- | --- |
| `/` | Landing page (hero, what we do, how it works, disciplines, standard, three doors) |
| `/manifesto` | The BGET manifesto and the twelve dimensions |
| `/values` | The values, written as behaviour we reward vs. behaviour we correct |
| `/membership` | The filter, the process, and the **application form** |
| `/problems` | The Problem Commons loop and criteria, and the **problem-submission form** |
| `/activities` | The five recurring rituals |
| `/about` | What BGET is, the founder, and how we present people |

## 3. Project structure

```text
app/
├── layout.tsx             # Fonts + metadata
├── page.tsx               # Landing page
├── manifesto|values|membership|problems|activities|about/page.tsx
├── globals.css
components/
├── landing/               # Landing-page sections (design language + animations)
├── site/                  # Shared page shell + form UI + forms
│   ├── page-shell.tsx     # PageShell / Section / Eyebrow
│   ├── form-ui.tsx        # Field / TextInput / TextArea / Select / status
│   ├── apply-form.tsx     # → POST /api/apply
│   └── problem-form.tsx   # → POST /api/problems
└── ui/                    # shadcn-style primitives
worker/index.js            # Worker: static assets + /api/*
migrations/0001_init.sql   # D1 schema
wrangler.toml              # Worker name, assets binding, D1 binding
```

## 4. API

| Method | Route | Body | Stores in |
| --- | --- | --- | --- |
| `GET` | `/api/health` | — | — |
| `POST` | `/api/apply` | name, email, building, … | `applications` |
| `POST` | `/api/problems` | title, description, visibility, … | `problems` |

Both POST routes validate input, ignore a hidden honeypot field, and return
`{ ok: true, id }`. Non-POST requests to them return `405`.

## 5. Forms & data

Submissions are stored in the D1 database `bget-forms` (binding `DB`):

- `applications` — membership applications (private; never published).
- `problems` — Problem-Commons submissions, with a `visibility` flag
  (`public` / `bget` / `private`).

Schema: [`migrations/0001_init.sql`](migrations/0001_init.sql).

```bash
# create (already done)
npx wrangler d1 create bget-forms

# apply the schema
npx wrangler d1 execute bget-forms --remote --file=migrations/0001_init.sql
npx wrangler d1 execute bget-forms --local  --file=migrations/0001_init.sql

# read submissions
npx wrangler d1 execute bget-forms --remote --command "SELECT id, name, email, created_at FROM applications ORDER BY id DESC LIMIT 20;"
```

## 6. Local development

Requires Node ≥ 20 and a Cloudflare login (`npx wrangler login`).

```bash
npm ci
npm run build          # static export → out/
npm run preview        # wrangler dev — serves out/ + /api/* with a local D1
# → http://127.0.0.1:8787
```

`npm run dev` (plain `next dev`) renders the pages but has **no** `/api/*` —
that lives in the Worker. Use `npm run preview` to exercise forms.

Account selection (there are multiple accounts on this machine):

```bash
export CLOUDFLARE_ACCOUNT_ID=87fd5601199078add1a9f9f88d3608d6
```

## 7. Deployment

Push to `main` → GitHub Actions:

1. `.github/workflows/ci.yml` (job **`test`**) — `npm ci` + `npm run build`.
2. `.github/workflows/deploy.yml` — rebuilds the static export and runs
   `npx wrangler deploy` (uploads `out/` assets + `worker/index.js`).

Branch protection requires the status check literally named **`test`**.

Manual deploy:

```bash
export CLOUDFLARE_ACCOUNT_ID=87fd5601199078add1a9f9f88d3608d6
npm run build
npm run deploy         # wrangler deploy
```

Required GitHub secret: `CF_API_TOKEN` (Workers Scripts + D1 edit).

## 8. Community docs

The full BGET canon — manifesto, values, membership, problem commons,
activities, governance, branding — lives in the separate **`BGET/`** folder
outside this repo. This site is the public-facing expression of it.

## 9. License

MIT — see [LICENSE](LICENSE). See also [CONTRIBUTING.md](CONTRIBUTING.md),
[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) and [SECURITY.md](SECURITY.md).
