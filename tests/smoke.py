#!/usr/bin/env python3
"""End-to-end smoke test for the BGET site using Playwright.

Works locally and in CI:

    python3 -m http.server 8000 &
    BASE_URL=http://127.0.0.1:8000 python3 tests/smoke.py

BASE_URL defaults to http://127.0.0.1:8000.

For each of /, /apply.html and /manifesto.html (missing optional pages are
skipped with a warning) it asserts:

  * zero console errors and zero failed same-origin requests
  * zero horizontal overflow at 1440x900 and at 390x844
  * exactly one <h1>
  * <html lang="..."> is set
  * the mobile drawer opens and closes at 390px width
  * after scrolling to the bottom, no .reveal element is stuck invisible

Safety: any request to formsubmit.co is intercepted and answered with fake
{"success": true} JSON — this test never contacts the real form endpoint.

Exit status: 0 when everything passes, 1 otherwise.
"""

from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.request

BASE_URL = os.environ.get("BASE_URL", "http://127.0.0.1:8000").rstrip("/")

# (path, required?) — manifesto.html is generated separately and may be absent.
PAGES = [("/", True), ("/apply.html", True), ("/manifesto.html", False)]

VIEWPORTS = [(1440, 900), (390, 844)]

FAKE_FORMSUBMIT_RESPONSE = json.dumps({"success": True, "message": "intercepted by smoke test"})


def is_same_origin(url: str) -> bool:
    from urllib.parse import urlsplit

    page_origin = urlsplit(BASE_URL)
    req = urlsplit(url)
    return req.netloc == page_origin.netloc


def formsubmit_predicate(url: str) -> bool:
    return "formsubmit.co" in url.lower()


def probe(url_path: str) -> tuple[str, str]:
    """Return ('ok' | 'missing' | 'unreachable', detail)."""
    try:
        with urllib.request.urlopen(BASE_URL + url_path, timeout=10) as resp:
            if resp.status >= 400:
                return "missing", f"HTTP {resp.status}"
            return "ok", f"HTTP {resp.status}"
    except urllib.error.HTTPError as exc:
        if exc.code == 404:
            return "missing", "HTTP 404"
        return "missing", f"HTTP {exc.code}"
    except Exception as exc:  # connection refused / DNS / timeout
        return "unreachable", str(exc)


class Result:
    def __init__(self) -> None:
        self.rows: list[tuple[str, str, str, str]] = []
        self.warnings: list[str] = []
        self.failed = 0
        self.passed = 0

    def add(self, page: str, check: str, ok: bool | None, note: str = "") -> None:
        if ok is None:
            status = "SKIP"
            self.warnings.append(f"{page}: {check} — {note}" if note else f"{page}: {check}")
        else:
            status = "PASS" if ok else "FAIL"
            if ok:
                self.passed += 1
            else:
                self.failed += 1
                if not note:
                    note = "assertion failed"
        self.rows.append((page, check, status, note))

    @property
    def exit_code(self) -> int:
        return 1 if self.failed else 0


def print_report(results: Result) -> None:
    print()
    page_w = max([len(r[0]) for r in results.rows] + [4])
    check_w = max([len(r[1]) for r in results.rows] + [5])
    print(f"{'Page':<{page_w}}  {'Check':<{check_w}}  {'Result':<6}  Notes")
    print(f"{'-' * page_w}  {'-' * check_w}  {'-' * 6}  {'-' * 40}")
    for page, check, status, note in results.rows:
        print(f"{page:<{page_w}}  {check:<{check_w}}  {status:<6}  {note}")
    if results.warnings:
        print("\nWarnings:")
        for w in results.warnings:
            print(f"  ! {w}")
    print(f"\n{results.passed} passed, {results.failed} failed"
          f"{f', {len(results.warnings)} skipped/warning(s)' if results.warnings else ''}")
    print(f"RESULT: {'FAIL' if results.failed else 'PASS'}")


def run() -> int:
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("ERROR: playwright is not installed. Run: pip install playwright "
              "&& playwright install --with-deps chromium", file=sys.stderr)
        return 1

    results = Result()
    print(f"BGET smoke test — BASE_URL={BASE_URL}")

    # ---- availability probe ------------------------------------------------
    available: list[tuple[str, str]] = []
    deferred: list[tuple[str, str, bool | None, str]] = []  # skips, added after page rows
    for path, required in PAGES:
        status, detail = probe(path)
        if status == "ok":
            available.append((path, required))
        elif status == "missing":
            if required:
                results.add(path, "page loads", False, f"page missing ({detail})")
            else:
                deferred.append((path, "page loads", None,
                                 f"not present yet ({detail}) — skipped"))
        else:  # unreachable server
            if required:
                results.add(path, "page loads", False,
                            f"server unreachable at {BASE_URL} ({detail})")
            else:
                deferred.append((path, "page loads", None,
                                 f"server unreachable — skipped"))

    intercepted = {"count": 0}

    with sync_playwright() as p:
        try:
            browser = p.chromium.launch()
        except Exception as exc:
            print(f"ERROR: could not launch chromium: {exc}", file=sys.stderr)
            return 1
        context = browser.new_context(viewport={"width": 1440, "height": 900})

        # ---- never hit formsubmit.co --------------------------------------
        def block_formsubmit(route):
            intercepted["count"] += 1
            route.fulfill(
                status=200,
                content_type="application/json",
                body=FAKE_FORMSUBMIT_RESPONSE,
            )

        context.route(formsubmit_predicate, block_formsubmit)

        for path, _required in available:
            for page_name, check, ok, note in check_page(context, path):
                results.add(page_name, check, ok, note)

        browser.close()

    print(f"formsubmit.co interceptor armed — "
          f"{intercepted['count']} request(s) intercepted "
          f"(0 is expected: the form must not fire on load)")
    for row_deferred in deferred:
        results.add(*row_deferred)

    print_report(results)
    return results.exit_code


def check_page(context, path: str) -> list[tuple[str, str, bool | None, str]]:
    """Run all checks against one page; returns (page, check, ok|None, note)."""
    rows: list[tuple[str, str, bool | None, str]] = []
    console_errors: list[str] = []
    network_errors: list[str] = []

    page = context.new_page()

    def on_console(msg):
        if msg.type == "error":
            console_errors.append(msg.text[:300])

    def on_page_error(exc):
        console_errors.append(f"pageerror: {exc}"[:300])

    def on_request_failed(req):
        if is_same_origin(req.url):
            network_errors.append(f"{req.url} — {req.failure}")

    def on_response(resp):
        if resp.status >= 400 and is_same_origin(resp.url):
            network_errors.append(f"{resp.url} — HTTP {resp.status}")

    page.on("console", on_console)
    page.on("pageerror", on_page_error)
    page.on("requestfailed", on_request_failed)
    page.on("response", on_response)

    def row(check: str, ok: bool | None, note: str = "") -> None:
        rows.append((path, check, ok, note))

    # ---- load -------------------------------------------------------------
    try:
        response = page.goto(BASE_URL + path, wait_until="load", timeout=45_000)
        page.wait_for_timeout(300)
        if response is None or response.status >= 400:
            row("page loads", False, f"HTTP {response.status if response else '?'}")
            page.close()
            return rows
    except Exception as exc:
        row("page loads", False, str(exc).splitlines()[0][:120])
        page.close()
        return rows
    row("page loads", True)

    # ---- console + network checks run LAST (below) so that late/lazy
    #      errors from all the interactions are captured too.

    # ---- html lang --------------------------------------------------------
    lang = page.evaluate("() => document.documentElement.getAttribute('lang')")
    row("html lang set", bool(lang and lang.strip()), f'lang="{lang}"' if lang else "missing lang")

    # ---- exactly one h1 ---------------------------------------------------
    h1_count = page.evaluate("() => document.querySelectorAll('h1').length")
    row("exactly one <h1>", h1_count == 1, f"found {h1_count}")

    # ---- horizontal overflow at both viewports ---------------------------
    for width, height in VIEWPORTS:
        page.set_viewport_size({"width": width, "height": height})
        page.wait_for_timeout(250)
        overflow = page.evaluate(
            """() => {
                const de = document.documentElement;
                const b = document.body;
                return {
                    doc: de.scrollWidth - window.innerWidth,
                    body: b ? b.scrollWidth - window.innerWidth : 0,
                };
            }"""
        )
        worst = max(overflow["doc"], overflow["body"])
        row(f"no h-overflow @{width}x{height}", worst <= 1,
            "scrollWidth exceeds viewport by {}px".format(worst) if worst > 1 else "")

    # ---- mobile drawer ----------------------------------------------------
    page.set_viewport_size({"width": 390, "height": 844})
    page.wait_for_timeout(250)
    drawer_ok, drawer_note = check_drawer(page)
    row("mobile drawer opens/closes", drawer_ok, drawer_note)

    # ---- scroll reveal ----------------------------------------------------
    page.set_viewport_size({"width": 1440, "height": 900})
    page.wait_for_timeout(150)
    page.evaluate("() => window.scrollTo({top: 0, behavior: 'instant'})")
    page.wait_for_timeout(150)
    page.evaluate(
        "() => window.scrollTo({top: document.documentElement.scrollHeight, behavior: 'instant'})"
    )
    page.wait_for_timeout(1500)
    stuck = page.evaluate(
        """() => [...document.querySelectorAll('.reveal')]
              .filter(el => parseFloat(getComputedStyle(el).opacity) < 0.5)
              .map(el => (el.id ? '#' + el.id : (el.className || el.tagName).toString())
                     .replace(/\\s+/g, ' ').slice(0, 60))"""
    )
    row("no .reveal stuck invisible", len(stuck) == 0,
        f"{len(stuck)} stuck: {', '.join(stuck[:3])}" if stuck else "")

    # ---- console + network (now that everything has run) -----------------
    row("no console errors", len(console_errors) == 0,
        "; ".join(console_errors[:3])[:200])
    row("no failed same-origin requests", len(network_errors) == 0,
        "; ".join(network_errors[:3])[:200])

    page.close()
    return rows


def check_drawer(page) -> tuple[bool, str]:
    """Open and close the mobile drawer at 390px width."""
    missing = page.evaluate(
        """() => ({
            btn: !!document.getElementById('mobile-menu-btn'),
            drawer: !!document.getElementById('mobile-drawer'),
            close: !!document.getElementById('close-mobile-menu'),
        })"""
    )
    if not all(missing.values()):
        missing_names = [k for k, v in missing.items() if not v]
        return False, f"missing element(s): {', '.join(missing_names)}"

    try:
        page.click("#mobile-menu-btn", timeout=5_000)
        page.wait_for_timeout(300)
        opened = page.evaluate(
            """() => {
                const d = document.getElementById('mobile-drawer');
                const b = document.getElementById('mobile-menu-btn');
                return d.classList.contains('open') && !d.inert &&
                       b.getAttribute('aria-expanded') === 'true';
            }"""
        )
        if not opened:
            return False, "drawer did not open (class/inert/aria-expanded wrong)"

        page.click("#close-mobile-menu", timeout=5_000)
        page.wait_for_timeout(300)
        closed = page.evaluate(
            """() => {
                const d = document.getElementById('mobile-drawer');
                const b = document.getElementById('mobile-menu-btn');
                return !d.classList.contains('open') && d.inert &&
                       b.getAttribute('aria-expanded') === 'false';
            }"""
        )
        if not closed:
            return False, "drawer did not close (class/inert/aria-expanded wrong)"
    except Exception as exc:
        return False, str(exc).splitlines()[0][:120]
    return True, ""


if __name__ == "__main__":
    sys.exit(run())
