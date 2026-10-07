#!/usr/bin/env python3
"""Generate sitemap.xml from the real page files.

Usage (from anywhere):

    python3 tools/build_sitemap.py           # write sitemap.xml
    python3 tools/build_sitemap.py --check   # exit 1 if the file is stale

The <lastmod> comes from each page's on-disk mtime, so a listing can never
rot: whenever a page changes, the generator stamps it. Order and priority
are fixed below; add a page here the same day you add it to the nav.

Deterministic: identical output for identical files. Standard library only.
"""

from __future__ import annotations

import sys
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "sitemap.xml"
BASE = "https://5h4d0wn1k.github.io/bget"

# (file, loc, changefreq, priority) — order matters, it's the crawl order too.
PAGES = [
    ("index.html", BASE + "/", "weekly", "1.0"),
    ("apply.html", BASE + "/apply.html", "weekly", "0.9"),
    ("manifesto.html", BASE + "/manifesto.html", "monthly", "0.8"),
    ("problems.html", BASE + "/problems.html", "weekly", "0.7"),
]

HEADER = '<?xml version="1.0" encoding="UTF-8"?>\n'
URLSET = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'


def build() -> str:
    entries: list[str] = []
    for filename, loc, changefreq, priority in PAGES:
        path = ROOT / filename
        if not path.is_file():
            sys.exit(f"build_sitemap.py: error: {filename} missing — add it to the repo")
        lastmod = datetime.fromtimestamp(path.stat().st_mtime).strftime("%Y-%m-%d")
        entries.append("  <url>")
        entries.append(f"    <loc>{loc}</loc>")
        entries.append(f"    <lastmod>{lastmod}</lastmod>")
        entries.append(f"    <changefreq>{changefreq}</changefreq>")
        entries.append(f"    <priority>{priority}</priority>")
        entries.append("  </url>")
    return "\n".join([HEADER, URLSET, *entries, "</urlset>", ""])


def main() -> int:
    check_only = "--check" in sys.argv
    xml = build()
    if check_only:
        if OUTPUT.is_file() and OUTPUT.read_text(encoding="utf-8") == xml:
            print("sitemap.xml is up to date.")
            return 0
        sys.exit("sitemap.xml is out of date — run `python3 tools/build_sitemap.py`")
    OUTPUT.write_text(xml, encoding="utf-8")
    print(f"Wrote {OUTPUT.name}: {len(xml.encode('utf-8')):,} bytes, "
          f"{len(PAGES)} URLs, lastmod from file mtimes.")
    return 0


if __name__ == "__main__":
    sys.exit(main())