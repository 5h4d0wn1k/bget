#!/usr/bin/env python3
"""Build manifesto.html from content/philosophy.md.

Usage (from the project root, or anywhere):

    python3 build-manifesto.py

What it does
------------
* Reads the source document ``content/philosophy.md`` (title block, chapters
  ``# 1.`` … ``# 26.``, ``# BGET in One Paragraph``, ``# The BGET North Star``).
* Converts the Markdown to HTML (structure only — the author's sentences are
  reproduced verbatim, never rewritten or trimmed).
* Pulls the shared chrome (announcement bar + sticky header + mobile drawer,
  footer) and the Tailwind config verbatim out of ``index.html`` so both pages
  stay byte-identical in structure, then rewrites the chrome anchors that must
  point back at the homepage (``#vision`` → ``index.html#vision`` etc.) and
  marks the Manifesto links with ``aria-current="page"``.
* Writes the complete document to ``manifesto.html``.

The build is deterministic: running it twice produces byte-identical output.
Standard library only — no dependencies.
"""

from __future__ import annotations

import html
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SOURCE = ROOT / "content" / "philosophy.md"
INDEX = ROOT / "index.html"
OUTPUT = ROOT / "manifesto.html"

PAGE_TITLE = "The BGET Manifesto — 26 chapters on human capability"
DESCRIPTION = (
    "The complete BGET manifesto — 26 chapters on character before capability, "
    "collective intelligence and real-world action, closing with the North Star."
)
OG_DESCRIPTION = (
    "Twenty-six chapters on what BGET stands for, who it is for and how human "
    "capability compounds — ending at the North Star."
)

# Chrome anchors that must resolve on the homepage, not on this page.
CHROME_FRAGMENTS = ("vision", "people", "character", "how", "labs", "north-star")

HEADING_RE = re.compile(r"^(#{1,6})\s+(.*?)\s*$")
BULLET_RE = re.compile(r"^-\s+(.*)$")
ORDERED_RE = re.compile(r"^\d+\.\s+(.*)$")
RULE_RE = re.compile(r"^-{3,}$")
NUMBERED_TITLE_RE = re.compile(r"^(\d+)\.\s+(.*)$")


# --------------------------------------------------------------------------
# helpers
# --------------------------------------------------------------------------
def die(msg: str) -> None:
    sys.exit(f"build-manifesto.py: error: {msg}")


def slugify(text: str) -> str:
    """URL-safe id fragment: lowercase, non-alphanumerics become hyphens."""
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def inline(text: str) -> str:
    """Escape Markdown text and convert **bold** to <strong>."""
    text = html.escape(text, quote=False)
    return re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", text)


def indent_block(text: str, pad: str) -> str:
    return "\n".join(pad + line if line else "" for line in text.split("\n"))


def extract_block(text: str, start_marker: str, end_marker: str) -> str:
    """Slice index.html between two comment markers, inclusive."""
    try:
        start = text.index(start_marker)
        end = text.index(end_marker) + len(end_marker)
    except ValueError:
        die(f"index.html is missing the marker {start_marker!r} / {end_marker!r}")
    if start > end:
        die(f"marker {start_marker!r} appears after {end_marker!r}")
    return text[start:end]


def extract_tailwind_config(text: str) -> str:
    """Copy the tailwind.config <script> block out of index.html verbatim."""
    m = re.search(
        r"[ \t]*<script>\s*\n\s*tailwind\.config = \{.*?\n\s*\}\s*\n\s*</script>",
        text,
        re.S,
    )
    if not m:
        die("index.html: could not find the tailwind.config script block")
    return m.group(0).strip("\n")


def prepare_chrome(block: str) -> str:
    """Apply the per-page rewrites inside a shared chrome block.

    * every link to manifesto.html gets aria-current="page"
    * chrome anchors that point at homepage sections are prefixed with
      index.html (``#top`` and links such as ``apply.html#process`` stay)
    """

    def mark_current(m: re.Match[str]) -> str:
        tag = m.group(0)
        if "aria-current" in tag:
            return tag
        return tag.replace('href="manifesto.html"', 'href="manifesto.html" aria-current="page"')

    block = re.sub(r'<a\s+href="manifesto\.html"[^>]*>', mark_current, block)
    for frag in CHROME_FRAGMENTS:
        block = block.replace(f'href="#{frag}"', f'href="index.html#{frag}"')
    return block


# --------------------------------------------------------------------------
# Markdown → block list
# --------------------------------------------------------------------------
def parse_blocks(lines: list[str]) -> list[dict]:
    """Turn a section's Markdown lines into a list of block dicts.

    Supported: ## / ### headings, paragraphs, bullet lists, numbered lists,
    '>' blockquotes, '**bold**', '---' (spacing only).
    """
    blocks: list[dict] = []
    para: list[str] = []
    bullets: list[str] = []
    ordered: list[str] = []
    quote_paras: list[list[str]] = []
    quote_cur: list[str] | None = None

    def flush_para() -> None:
        nonlocal para
        if para:
            blocks.append({"type": "p", "text": " ".join(para)})
            para = []

    def flush_lists() -> None:
        nonlocal bullets, ordered
        if bullets:
            blocks.append({"type": "ul", "items": bullets})
            bullets = []
        if ordered:
            blocks.append({"type": "ol", "items": ordered})
            ordered = []

    def flush_quote() -> None:
        nonlocal quote_cur
        if quote_cur:
            quote_paras.append(quote_cur)
            quote_cur = None
        if quote_paras:
            blocks.append({"type": "quote", "paras": [" ".join(p) for p in quote_paras]})
            quote_paras.clear()

    def flush_all() -> None:
        flush_para()
        flush_lists()
        flush_quote()

    for raw in lines:
        stripped = raw.strip()
        if not stripped:
            flush_all()
            continue
        if RULE_RE.match(stripped):
            # '---' is spacing only — it never appears as visible text.
            flush_all()
            continue

        if stripped.startswith(">"):
            flush_para()
            flush_lists()
            content = stripped[1:].strip()
            if not content:
                if quote_cur:
                    quote_paras.append(quote_cur)
                    quote_cur = None
                continue
            hm = HEADING_RE.match(content)
            if hm:
                content = hm.group(2)  # no stray '#' inside blockquotes
            if quote_cur is None:
                quote_cur = [content]
            else:
                quote_cur.append(content)
            continue

        hm = HEADING_RE.match(stripped)
        if hm:
            flush_all()
            blocks.append(
                {"type": "heading", "level": len(hm.group(1)), "text": hm.group(2)}
            )
            continue

        bm = BULLET_RE.match(stripped)
        if bm:
            flush_para()
            flush_quote()
            bullets.append(bm.group(1))
            continue

        om = ORDERED_RE.match(stripped)
        if om:
            flush_para()
            flush_quote()
            ordered.append(om.group(1))
            continue

        flush_lists()
        flush_quote()
        para.append(stripped)

    flush_all()
    return blocks


def para_class(text: str) -> str:
    t = text.strip()
    if t == "\u2193":                       # loop arrow in chapter 25
        return "prose md-arrow"
    if len(t) <= 130 and re.fullmatch(r"\*\*.+\*\*", t):
        return "prose md-emph"              # a bold-only line (balances, loop steps…)
    return "prose"


def render_blocks(blocks: list[dict]) -> str:
    out: list[str] = []
    for b in blocks:
        kind = b["type"]
        if kind == "heading":
            if b["level"] <= 3:
                out.append(f'<h3 class="prose-h3">{inline(b["text"])}</h3>')
            else:
                out.append(f'<h4 class="prose-h4">{inline(b["text"])}</h4>')
        elif kind == "p":
            out.append(f'<p class="{para_class(b["text"])}">{inline(b["text"])}</p>')
        elif kind == "ul":
            items = "\n".join(f"<li>{inline(i)}</li>" for i in b["items"])
            out.append(f'<ul class="prose-list">\n{items}\n</ul>')
        elif kind == "ol":
            items = "\n".join(f"<li>{inline(i)}</li>" for i in b["items"])
            out.append(f'<ol class="prose-list prose-ordered">\n{items}\n</ol>')
        elif kind == "quote":
            ps = "\n".join(f"<p>{inline(p)}</p>" for p in b["paras"])
            out.append(f'<blockquote class="prose-quote">\n{ps}\n</blockquote>')
    return "\n".join(out)


# --------------------------------------------------------------------------
# sections
# --------------------------------------------------------------------------
def split_sections(md_text: str) -> list[dict]:
    sections: list[dict] = []
    current: dict | None = None
    for line in md_text.splitlines():
        m = re.match(r"^# (.+)$", line)
        if m:
            if current is not None:
                sections.append(current)
            current = {"title": m.group(1).strip(), "body": []}
        else:
            if current is None:  # text before the first '#' (none expected)
                current = {"title": "", "body": []}
            current["body"].append(line)
    if current is not None:
        sections.append(current)
    return sections


def classify_sections(sections: list[dict]) -> None:
    if not sections or sections[0]["title"] != "BGET":
        die("content/philosophy.md: expected the document to open with '# BGET'")
    for i, sec in enumerate(sections):
        title = sec["title"]
        m = NUMBERED_TITLE_RE.match(title)
        if i == 0:
            sec.update(kind="intro", id="the-vision", num_label="00",
                       toc_label="The Vision", heading_text=title)
        elif m:
            n = int(m.group(1))
            sec.update(kind="chapter", num=n, num_label=f"{n:02d}",
                       toc_label=m.group(2), heading_text=m.group(2),
                       id=f"chapter-{n}-{slugify(m.group(2))}")
        else:
            sec.update(kind="closing", num_label="—", toc_label=title,
                       heading_text=title, id="chapter-" + slugify(title))
        sec["north_star"] = title == "The BGET North Star"
    ids = [s["id"] for s in sections]
    if len(set(ids)) != len(ids):
        die(f"duplicate section ids generated: {sorted(ids)}")


def parse_north_star(body: list[str]) -> dict:
    """Pull the tenets out of the closing chapter's blockquotes."""
    main = None
    tenets: list[str] = []
    closing_line = None
    closing_sub = None
    intros: list[str] = []
    for raw in body:
        s = raw.strip()
        if not s or RULE_RE.match(s):
            continue
        if s.startswith(">"):
            content = s[1:].strip()
            if not content:
                continue  # bare '>' — a paragraph break inside the blockquote
            m = re.match(r"^##\s+\*\*(.+?)\*\*$", content)
            if m:
                if main is None:
                    main = m.group(1)
                else:
                    closing_line = m.group(1)
                continue
            m = re.match(r"^###\s+\*\*(.+?)\*\*$", content)
            if m:
                tenets.append(m.group(1))
                continue
            m = re.match(r"^\*\*(.+?)\*\*$", content)
            if m:
                closing_sub = m.group(1)
                continue
            intros.append(re.sub(r"^#{1,6}\s+", "", content))
            continue
        intros.append(s)

    if main is None or closing_line is None or closing_sub is None:
        die("North Star chapter: could not find its headline / closing lines")
    if len(tenets) != 10:
        die(f"North Star chapter: expected 10 tenets, found {len(tenets)}")
    if intros != ["And beneath it:", "Finally:"]:
        die(f"North Star chapter: unexpected prose lines {intros!r}")
    return {"main": main, "tenets": tenets, "closing": closing_line,
            "closing_sub": closing_sub, "intros": intros}


# --------------------------------------------------------------------------
# page parts
# --------------------------------------------------------------------------
def render_document_header(intro: dict) -> str:
    blocks = parse_blocks(intro["body"])
    lead = None
    rest: list[dict] = []
    vision_label = False
    for b in blocks:
        if b["type"] == "heading":
            # "## Build. Grow. Evolve. Together." is folded into the <h1>;
            # "### The Vision" becomes the label above the lead paragraph.
            if b["text"].strip() == "Build. Grow. Evolve. Together.":
                continue
            if b["text"].strip() == "The Vision":
                vision_label = True
                continue
        if lead is None and b["type"] == "p":
            lead = b
            continue
        if b["type"] != "rule":
            rest.append(b)
    if lead is None:
        die("the document's intro has no lead paragraph")
    if not vision_label:
        die("the document's intro is missing '### The Vision'")

    lead_html = f'<p class="lead-body manifesto-lead">{inline(lead["text"])}</p>'
    rest_html = render_blocks(rest)
    chapter_count = sum(1 for s in SECTIONS if s["kind"] == "chapter")
    meta = (
        f'<span class="manifesto-meta-count">{chapter_count} chapters \u00b7 '
        'the complete document</span>\n'
        '            <a href="apply.html" class="manifesto-meta-link">'
        'Apply to join &rarr;</a>\n'
        '            <a href="index.html" class="manifesto-meta-link">'
        "Back to the homepage</a>"
    )
    return f"""    <!-- ============================ DOCUMENT HEADER ============================ -->
    <header class="manifesto-header" id="the-vision">
      <div class="max-w-[1360px] mx-auto px-6 lg:px-12">
        <div class="manifesto-header-inner">
          <span class="eyebrow-label manifesto-eyebrow">Vision &amp; Philosophy</span>
          <h1 class="manifesto-title">BGET — Build. Grow. Evolve. Together.</h1>
          <h2 class="manifesto-vision-label">The Vision</h2>
          {lead_html}
          <div class="manifesto-intro">
{indent_block(rest_html, "            ")}
          </div>
          <div class="manifesto-meta">
            {meta}
          </div>
        </div>
      </div>
    </header>"""


def render_toc() -> str:
    links = []
    for sec in SECTIONS:
        links.append(
            f'<a class="toc-link" href="#{sec["id"]}" data-target="{sec["id"]}">'
            f'<span class="toc-num">{sec["num_label"]}</span>'
            f'<span class="toc-label">{inline(sec["toc_label"])}</span></a>'
        )
    joined = "\n".join(f"            {l}" for l in links)
    return f"""      <!-- Table of contents -->
      <aside class="manifesto-toc" id="manifesto-toc" aria-label="Table of contents">
        <div class="manifesto-toc-head">
          <span class="eyebrow-label">Contents</span>
          <button type="button" class="toc-toggle" id="toc-toggle" aria-expanded="true" aria-controls="toc-list">Hide</button>
        </div>
        <div class="toc-list-wrap" id="toc-list">
          <nav class="toc-list">
{joined}
          </nav>
          <a href="apply.html" class="btn-primary btn-sm toc-apply">Apply to join</a>
        </div>
      </aside>"""


def render_chapter(sec: dict) -> str:
    body = render_blocks(parse_blocks(sec["body"]))
    body_html = indent_block(body, "          ")
    return f"""        <section id="{sec["id"]}" class="manifesto-chapter">
          <div class="manifesto-chapter-head">
            <span class="chapter-num">{sec["num_label"]}</span>
            <h2>{inline(sec["heading_text"])}</h2>
          </div>
{body_html}
        </section>"""


def render_north_star(sec: dict) -> str:
    ns = parse_north_star(sec["body"])
    tenets = "\n".join(f'            <li class="tenet">{inline(t)}</li>' for t in ns["tenets"])
    return f"""        <section id="{sec["id"]}" class="north-star manifesto-north-star">
          <div class="manifesto-chapter-head">
            <span class="chapter-num">{sec["num_label"]}</span>
            <h2>{inline(sec["heading_text"])}</h2>
          </div>

          <p class="manifesto-ns-hero">{inline(ns["main"])}</p>

          <p class="manifesto-ns-intro">{inline(ns["intros"][0])}</p>
          <ul class="manifesto-ns-grid">
{tenets}
          </ul>

          <p class="manifesto-ns-intro">{inline(ns["intros"][1])}</p>
          <div class="manifesto-ns-closing">
            <p class="manifesto-ns-closing-line">{inline(ns["closing"])}<br>
              <span class="manifesto-ns-closing-sub">{inline(ns["closing_sub"])}</span></p>
            <div class="manifesto-ns-actions">
              <a href="apply.html" class="btn-on-dark">
                Apply to join
                <i data-lucide="arrow-right" class="w-4 h-4"></i>
              </a>
            </div>
          </div>
        </section>"""


def render_prose() -> str:
    parts = []
    for sec in SECTIONS[1:]:
        if sec["north_star"]:
            parts.append(render_north_star(sec))
        else:
            parts.append(render_chapter(sec))
    return "\n\n".join(parts)


CTA = """    <!-- ============================ CLOSING CTA ============================ -->
    <section class="manifesto-cta" aria-label="Next step">
      <div class="max-w-[1360px] mx-auto px-6 lg:px-12 manifesto-cta-inner">
        <div class="manifesto-cta-copy">
          <span class="eyebrow-label">Next step</span>
          <p class="manifesto-cta-text">You have read the whole document. The next step is the first members.</p>
        </div>
        <div class="manifesto-cta-actions">
          <a href="apply.html" class="btn-primary">Apply to join &rarr;</a>
          <a href="index.html" class="btn-secondary">Back to the homepage</a>
        </div>
      </div>
    </section>"""


def build_page() -> str:
    index_text = INDEX.read_text(encoding="utf-8")
    header_block = prepare_chrome(
        extract_block(index_text, "<!-- SHARED:HEADER:START -->", "<!-- SHARED:HEADER:END -->")
    )
    footer_block = prepare_chrome(
        extract_block(index_text, "<!-- SHARED:FOOTER:START -->", "<!-- SHARED:FOOTER:END -->")
    )
    tailwind_config = extract_tailwind_config(index_text)

    head = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#111111">
  <title>{PAGE_TITLE}</title>
  <meta name="description" content="{DESCRIPTION}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <link rel="canonical" href="https://5h4d0wn1k.github.io/bget/manifesto.html">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="BGET">
  <meta property="og:title" content="{PAGE_TITLE}">
  <meta property="og:description" content="{OG_DESCRIPTION}">
  <meta property="og:url" content="https://5h4d0wn1k.github.io/bget/manifesto.html">
  <meta property="og:image" content="https://5h4d0wn1k.github.io/bget/assets/og-card.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Become more capable without becoming less human.">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{PAGE_TITLE}">
  <meta name="twitter:description" content="{OG_DESCRIPTION}">
  <meta name="twitter:image" content="https://5h4d0wn1k.github.io/bget/assets/og-card.png">
  <link rel="icon" type="image/png" href="assets/favicon.png">

  <!-- Type -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">

  <!-- Utility classes (design tokens mapped to `brand.*`) -->
  <script src="https://cdn.tailwindcss.com"></script>
{tailwind_config}

  <!-- Icons -->
  <script src="https://unpkg.com/lucide@0.460.0"></script>

  <!-- Design system + page styles -->
  <link rel="stylesheet" href="css/theme.css">
  <link rel="stylesheet" href="css/components.css">
  <link rel="stylesheet" href="css/bget.css">
  <link rel="stylesheet" href="css/manifesto.css">

  <script type="application/ld+json">
  [
    {{
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "BGET",
      "alternateName": "Build. Grow. Evolve. Together.",
      "description": "A global multidisciplinary community where human capability compounds.",
      "url": "https://5h4d0wn1k.github.io/bget/"
    }},
    {{
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "{PAGE_TITLE}",
      "description": "{DESCRIPTION}",
      "image": "https://5h4d0wn1k.github.io/bget/assets/og-card.png",
      "datePublished": "2026-10-07",
      "dateModified": "2026-10-07",
      "inLanguage": "en",
      "author": {{ "@type": "Organization", "name": "BGET", "url": "https://5h4d0wn1k.github.io/bget/" }},
      "publisher": {{ "@type": "Organization", "name": "BGET", "url": "https://5h4d0wn1k.github.io/bget/" }},
      "mainEntityOfPage": "https://5h4d0wn1k.github.io/bget/manifesto.html"
    }}
  ]
  </script>
</head>"""

    body = f"""{head}

<body class="bg-white text-brand-black antialiased selection:bg-brand-black selection:text-white">

  <!-- Skip link -->
  <a href="#top" class="skip-link">Skip to content</a>

{header_block}

  <!-- Reading progress -->
  <div id="manifesto-progress" class="manifesto-progress" aria-hidden="true"></div>

  <main id="top">

{render_document_header(SECTIONS[0])}

    <!-- ============================ THE DOCUMENT ============================ -->
    <div class="manifesto-layout max-w-[1360px] mx-auto px-6 lg:px-12">

{render_toc()}

      <!-- Prose -->
      <div class="manifesto-prose">
{render_prose()}
      </div>
    </div>

{CTA}

  </main>

{footer_block}

  <script src="js/bget.js"></script>
  <script src="js/manifesto.js"></script>
</body>
</html>
"""
    return body


# --------------------------------------------------------------------------
# main
# --------------------------------------------------------------------------
def main() -> int:
    check_only = "--check" in sys.argv
    if not SOURCE.is_file():
        die(f"missing source document: {SOURCE}")
    if not INDEX.is_file():
        die(f"missing index.html: {INDEX}")

    md_text = SOURCE.read_text(encoding="utf-8")
    global SECTIONS
    SECTIONS = split_sections(md_text)
    classify_sections(SECTIONS)

    page = build_page()

    # No raw Markdown may survive into the output.
    if "**" in page:
        die("unconverted '**' found in the output — check the source Markdown")
    if re.search(r"^\s*# ", page, re.M):
        die("an unconverted '# ' heading found in the output")

    if check_only:
        if OUTPUT.is_file() and OUTPUT.read_text(encoding="utf-8") == page:
            print(f"{OUTPUT.name} is up to date.")
            return 0
        die(f"{OUTPUT.name} is out of date — run `python3 build-manifesto.py`")

    OUTPUT.write_text(page, encoding="utf-8")

    chapters = sum(1 for s in SECTIONS if s["kind"] == "chapter")
    sections_html = page.count("<section")
    toc_links = page.count('class="toc-link"')
    print(
        f"Wrote {OUTPUT.name}: {len(page.encode('utf-8')):,} bytes, "
        f"{len(SECTIONS)} top-level headings "
        f"({chapters} chapters + intro/closings), "
        f"{sections_html} sections, {toc_links} TOC links."
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
