# BGET

**Build. Grow. Evolve. Together.**

[![CI](https://github.com/5h4d0wn1k/bget/actions/workflows/ci.yml/badge.svg)](https://github.com/5h4d0wn1k/bget/actions/workflows/ci.yml)
[![Deploy Pages](https://github.com/5h4d0wn1k/bget/actions/workflows/pages.yml/badge.svg)](https://github.com/5h4d0wn1k/bget/actions/workflows/pages.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

The public website of **BGET** — a global multidisciplinary community — served
from GitHub Pages at <https://5h4d0wn1k.github.io/bget/>.

> **Screenshots:** none yet. It's a plain static site — clone it and run the
> local server below (takes about ten seconds) to see it.

## The vision

BGET is a community of capable, curious and compassionate people from every
country and discipline, building real solutions together — where human
capability compounds without losing humanity. *Character before capability* is
the filter; quality over quantity is the rule. The full reasoning lives in the
[manifesto](https://5h4d0wn1k.github.io/bget/manifesto.html) (source:
[`content/philosophy.md`](content/philosophy.md)).

## What's on the site

| Page | What it is |
| --- | --- |
| [`index.html`](index.html) | Homepage — vision, disciplines, the compounding loop, BGET Labs, North Star |
| [`manifesto.html`](manifesto.html) | The BGET manifesto, generated from `content/philosophy.md` |
| [`apply.html`](apply.html) | The membership application form |

## The application process

Joining is **quality over quantity**: every application is read and reviewed
personally — no automated rejection, no growth-hacking. The form lives at
<https://5h4d0wn1k.github.io/bget/apply.html> and submissions are reviewed at
**nikhilnagpure1111@gmail.com**. If you'd rather just ask a question, that
address works for that too.

## Tech stack

- **Vanilla HTML / CSS / JavaScript** — no framework, no bundler, **no build
  step** for the site itself
- **Tailwind CSS via CDN** (`cdn.tailwindcss.com`) with the `brand.*` design
  tokens inlined in each page's `<head>`
- **Inter** from Google Fonts, **Lucide** for icons (both CDN)
- Design tokens and shared components in `css/theme.css` and
  `css/components.css`; page-specific styles in `css/bget.css`, `css/apply.css`
- The only build-like script is `build-manifesto.py`, which renders
  `manifesto.html` from Markdown (see below)

## Local development

```bash
git clone https://github.com/5h4d0wn1k/bget.git
cd bget
python3 -m http.server 8000
# → http://127.0.0.1:8000
```

Any static file server works; `python3 -m http.server` is the simplest. Open
`index.html` directly in a browser also works, but serving over HTTP makes the
tests below behave exactly like production.

## Project structure

```text
bget/
├── index.html               # Homepage: vision, people, labs, North Star
├── apply.html               # Membership application form
├── manifesto.html           # Generated from content/philosophy.md
├── css/
│   ├── theme.css            # Design tokens: Inter type scale, #111 palette, hairlines
│   ├── components.css       # Shared chrome: header, mobile drawer, footer, buttons
│   ├── bget.css             # Homepage styles: marquee, globe, labs, scroll reveal
│   ├── apply.css            # Apply page styles
│   └── manifesto.css        # Manifesto reading styles + TOC
├── js/
│   ├── bget.js              # Drawer, marquee, world clocks, labs tabs, globe, reveal
│   ├── apply.js             # Form validation, honeypot/timing, submission
│   └── manifesto.js         # TOC scroll-spy, mobile TOC, reading progress
├── assets/                  # Logo + favicon
├── content/
│   └── philosophy.md        # Source of truth for the manifesto
├── build-manifesto.py       # philosophy.md → manifesto.html
├── tools/
│   └── sync_chrome.py       # Sync shared header/footer across pages
├── tests/
│   ├── static_check.py      # Static checks (stdlib only)
│   └── smoke.py             # Playwright smoke test
├── .github/
│   ├── workflows/ci.yml     # Tests on every pull request
│   ├── workflows/pages.yml  # Test, then deploy to GitHub Pages on main
│   ├── ISSUE_TEMPLATE/      # Bug report + feature request forms
│   └── PULL_REQUEST_TEMPLATE.md
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── SECURITY.md
├── LICENSE                  # MIT
└── README.md
```

`reference/` and `drafts/` are working directories excluded from the published
repository via `.gitignore`.

## Regenerating the manifesto

`manifesto.html` is rendered from Markdown so prose edits happen in one place:

```bash
python3 build-manifesto.py
```

The generator also extracts the shared chrome (header, drawer, footer) from
`index.html`, so run it after editing the homepage's shared chrome. If you edit
the chrome outside the generator, run `python3 tools/sync_chrome.py` to push the
change to `apply.html` too.

Always regenerate and commit **both** `content/philosophy.md` and the resulting
`manifesto.html` together, so the rendered page never drifts from its source.

## Testing

Two layers, both run locally and in CI:

```bash
# 1) Static checks — HTML tag balance, duplicate ids, exactly one <h1> per page,
#    anchor + relative link resolution, no root-absolute paths, shared-chrome
#    markers. Standard library only.
python3 tests/static_check.py

# 2) JavaScript syntax
for f in js/*.js; do node --check "$f"; done

# 3) Browser smoke test — Playwright/Chromium: loads each page, asserts zero
#    console errors, zero failed same-origin requests, no horizontal overflow
#    at 1440x900 and 390x844, one <h1>, lang set, mobile drawer opens/closes,
#    and no scroll-reveal element stuck invisible. Never contacts formsubmit.co.
pip install playwright            # one-time
playwright install --with-deps chromium   # one-time

python3 -m http.server 8000 &
BASE_URL=http://127.0.0.1:8000 python3 tests/smoke.py
```

Both scripts exit non-zero on failure and print a summary. `BASE_URL` defaults
to `http://127.0.0.1:8000` if unset.

## Deployment

GitHub Pages, via GitHub Actions — no manual publishing:

- **Pull requests** run `.github/workflows/ci.yml` (job name: `test`):
  `node --check`, `tests/static_check.py`, then the Playwright smoke test.
- **Pushes to `main`** run `.github/workflows/pages.yml`: the same `test` job
  runs first, and only if it passes does the `deploy` job publish the site to
  GitHub Pages (`actions/deploy-pages`).

A broken check therefore blocks the deploy. The live site ends up at
<https://5h4d0wn1k.github.io/bget/>.

First time on a fresh repo: set **Settings → Pages → Source** to *GitHub
Actions*, and make `test` a required status check under branch protection if
you want PRs blocked on it.

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) — fork, branch, keep tests green,
respect the design system (Inter / `#111` / hairline borders, relative paths,
shared-chrome markers), and follow the
[Code of Conduct](CODE_OF_CONDUCT.md). Quality over quantity, in patches too.

Security reports go to [SECURITY.md](SECURITY.md) — please keep those private.

## License

[MIT](LICENSE) © 2026 Nikhil Nagpure.
