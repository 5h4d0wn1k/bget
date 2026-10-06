## What changed

<!-- A sentence or two describing the change. -->

## Why

<!-- What problem does this solve? Link the issue if there is one: Fixes #123 -->

## Checklist

- [ ] Tests pass locally (`python3 tests/static_check.py` and `python3 tests/smoke.py`)
- [ ] No console errors when loading the affected pages (DevTools Console + Network)
- [ ] Only relative paths used (no `/root-absolute` href/src — the site lives at a subpath)
- [ ] Shared-chrome markers kept if header/footer were touched (`SHARED:HEADER` / `SHARED:FOOTER`, balanced and in order, on all pages)
- [ ] Docs updated (`README.md` / `CONTRIBUTING.md`) if behaviour, commands or structure changed

## Screenshots

Not needed for this change — include them only if you changed visual design,
and then before/after shots help.
