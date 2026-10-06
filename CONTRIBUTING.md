# Contributing to BGET

Thanks for helping improve the BGET website. This is a small, deliberately
simple static site — contributions that keep it that way are the most welcome.

**Quality over quantity** applies to contributions too: one focused pull
request that fixes a real problem beats five that add noise. The same bar we
hold for community membership — character before capability, careful work over
volume — applies here.

## Getting started

```bash
git clone https://github.com/5h4d0wn1k/bget.git
cd bget
python3 -m http.server 8000
# → http://127.0.0.1:8000
```

There is no build step. Edit, refresh the browser, done.

## The flow: fork → branch → PR

1. **Fork** the repository and create a branch from `main`:
   ```bash
   git checkout -b fix/short-description
   ```
2. **Make your changes.** Keep them scoped — one idea per pull request.
3. **Test locally** (see below). Both checks must pass before you open a PR.
4. **Push and open a pull request** against `main`. Fill in the PR template:
   what changed and *why*.
5. **Respond to review.** Small, reviewable diffs get reviewed quickly.

## What makes a good pull request

- **Tests pass.** `tests/static_check.py` and `tests/smoke.py` both pass
  locally (CI runs them on every PR).
- **No console errors.** Open DevTools, reload, and check the Console and
  Network tabs. Nothing red.
- **Design system rules are respected:**
  - Type is **Inter**, primary text is near-black **`#111111`**, sections are
    separated by **hairline borders** (`border-brand-border`, `#e7e5de`) —
    not heavy rules or drop shadows.
  - Use the existing tokens in `css/theme.css` (mirrored as `brand.*` in
    Tailwind) instead of one-off hex values.
  - Buttons are pills, headings use tight tracking and light weights. Match
    what is already on the page.
- **Relative paths only.** Never use root-absolute URLs (`src="/css/x.css"`)
  — the site is served from `https://5h4d0wn1k.github.io/bget/`, a subpath.
- **Shared chrome stays shared.** `index.html`, `apply.html` and
  `manifesto.html` each contain `<!-- SHARED:HEADER:START -->` /
  `<!-- SHARED:HEADER:END -->` and the matching `FOOTER` markers around the
  header and footer. If you touch that chrome, keep the markers in place,
  balanced and in the same order, and update all three pages consistently.
- **Docs updated.** If you change behaviour, commands or structure, update
  `README.md` (and this file, if the process itself changes).

## Running the tests locally

```bash
# 1. Static checks — HTML tag balance, duplicate ids, one <h1> per page,
#    anchor/link resolution, no root-absolute paths, shared markers.
python3 tests/static_check.py

# 2. Syntax-check the JavaScript
for f in js/*.js; do node --check "$f"; done

# 3. Browser smoke test (needs Playwright + Chromium, one-time install)
pip install playwright
playwright install --with-deps chromium

python3 -m http.server 8000 &
BASE_URL=http://127.0.0.1:8000 python3 tests/smoke.py
```

Both scripts exit non-zero on failure and print a clear summary. CI
(`.github/workflows/ci.yml`) runs exactly these steps on every pull request.

The smoke test never contacts `formsubmit.co` — any such request is
intercepted and answered with fake JSON, so running it cannot submit a real
application.

## Reporting bugs and proposing features

Use the [issue templates](../../issues/new/choose). For security issues,
follow [SECURITY.md](SECURITY.md) instead — please do not open a public issue
for vulnerabilities.

## Code of conduct

This project follows the [Contributor Covenant 2.1](CODE_OF_CONDUCT.md).
Be thoughtful, be kind, be precise. Enforcement reports go to
nikhilnagpure1111@gmail.com.

## License

By contributing, you agree that your contributions are licensed under the
[MIT License](LICENSE).
