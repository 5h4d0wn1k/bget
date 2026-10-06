/**
 * BGET — manifesto page behaviour
 * Vanilla JS, zero dependencies (Lucide + Tailwind are loaded from CDN).
 * Sections: reading progress bar, TOC scroll-spy, mobile TOC collapse.
 *
 * Every lookup is guarded — this file is safe if any of those elements
 * (or the whole TOC) is missing from the page.
 */

(function () {
  'use strict';

  function initManifesto() {
    /* ---------- Elements (all optional) ---------- */
    var progress = document.getElementById('manifesto-progress');
    var toc = document.getElementById('manifesto-toc');
    var listWrap = document.getElementById('toc-list');
    var toggle = document.getElementById('toc-toggle');

    var links = listWrap
      ? Array.prototype.slice.call(listWrap.querySelectorAll('a.toc-link'))
      : [];

    // Pair each TOC link with the section it points at; drop dead links.
    var entries = [];
    links.forEach(function (link) {
      var id = (link.getAttribute('href') || '').replace(/^#/, '');
      var section = id ? document.getElementById(id) : null;
      if (section) entries.push({ link: link, section: section });
    });

    /* ---------- Reading progress bar ---------- */
    function updateProgress() {
      if (!progress) return;
      var doc = document.documentElement;
      var max = doc.scrollHeight - window.innerHeight;
      var ratio = max > 0 ? window.scrollY / max : 0;
      if (ratio < 0) ratio = 0;
      if (ratio > 1) ratio = 1;
      progress.style.transform = 'scaleX(' + ratio.toFixed(4) + ')';
    }

    /* ---------- Scroll-spy ---------- */
    var active = null;

    // Keep the active entry inside the TOC's own scroll box (never the page).
    function keepVisible(link) {
      var scroller = null;
      if (toc && toc.scrollHeight > toc.clientHeight + 1) scroller = toc;
      else if (listWrap && listWrap.scrollHeight > listWrap.clientHeight + 1) {
        scroller = listWrap;
      }
      if (!scroller) return;
      var lr = link.getBoundingClientRect();
      var cr = scroller.getBoundingClientRect();
      var pad = 24;
      if (lr.top < cr.top + pad) scroller.scrollTop -= cr.top + pad - lr.top;
      else if (lr.bottom > cr.bottom - pad) {
        scroller.scrollTop += lr.bottom - (cr.bottom - pad);
      }
    }

    function updateSpy() {
      if (!entries.length) return;
      // A section counts as "current" once its top passes this line.
      // Anchor navigation lands a section at 192px (scroll-padding-top 96px on
      // <html> + scroll-margin-top 96px on sections), so the line sits just
      // below that — otherwise the *previous* chapter would stay active after
      // a TOC click.
      var line = 210;
      var current = entries[0];
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].section.getBoundingClientRect().top <= line) {
          current = entries[i];
        }
      }
      // At the very bottom of the page the closing chapter is current.
      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 4
      ) {
        current = entries[entries.length - 1];
      }
      if (current === active) return;
      if (active) {
        active.link.classList.remove('is-active');
        active.link.removeAttribute('aria-current');
      }
      active = current;
      current.link.classList.add('is-active');
      current.link.setAttribute('aria-current', 'location');
      keepVisible(current.link);
    }

    /* ---------- Mobile TOC collapse (the button is hidden at lg) ---------- */
    if (toggle && toc) {
      toggle.addEventListener('click', function () {
        var collapsed = toc.classList.toggle('is-collapsed');
        toggle.setAttribute('aria-expanded', String(!collapsed));
        toggle.textContent = collapsed ? 'Show' : 'Hide';
      });
    }

    /* ---------- Wiring: rAF-throttled scroll / resize ---------- */
    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      var run = function () {
        ticking = false;
        updateProgress();
        updateSpy();
      };
      if (window.requestAnimationFrame) window.requestAnimationFrame(run);
      else run();
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    // Re-measure once fonts/CDN styles have settled.
    window.addEventListener('load', onScroll);

    updateProgress();
    updateSpy();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initManifesto);
  } else {
    initManifesto();
  }
})();
