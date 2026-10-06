/**
 * BGET — homepage behaviour
 * Vanilla JS, zero dependencies (Lucide + Tailwind are loaded from CDN).
 * Sections: chrome, marquee, balances, labs, reveal, globe.
 */

function initBget() {
  /* ---------- Icons ---------- */
  if (window.lucide) window.lucide.createIcons();

  /* ---------- Announcement bar ---------- */
  const closeBar = document.getElementById('close-announcement');
  const announcement = document.getElementById('top-announcement-bar');
  if (closeBar && announcement) {
    closeBar.addEventListener('click', () => { announcement.style.display = 'none'; });
  }

  /* ---------- Sticky header shadow ---------- */
  const header = document.querySelector('header');
  if (header) {
    const onScroll = () => header.classList.toggle('shadow-sm', window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Mobile drawer ---------- */
  const menuBtn = document.getElementById('mobile-menu-btn');
  const closeBtn = document.getElementById('close-mobile-menu');
  const drawer = document.getElementById('mobile-drawer');
  const setDrawer = (open, restoreFocus) => {
    if (!drawer) return;
    drawer.classList.toggle('open', open);
    // Closed drawer must not be reachable by keyboard (tab / screen reader).
    drawer.inert = !open;
    menuBtn?.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) closeBtn?.focus();
    else if (restoreFocus) menuBtn?.focus();
  };
  if (drawer) drawer.inert = !drawer.classList.contains('open');
  menuBtn?.addEventListener('click', () => setDrawer(true, false));
  closeBtn?.addEventListener('click', () => setDrawer(false, true));
  drawer?.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setDrawer(false, false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer?.classList.contains('open')) setDrawer(false, true);
  });

  /* ---------- "Together" marquee (20 languages, duplicated for the loop) ---------- */
  const mq = document.getElementById('bget-marquee-track');
  if (mq) {
    const words = [
      ['Together', 'en'], ['Juntos', 'es'], ['Zusammen', 'de'], ['Ensemble', 'fr'],
      ['Insieme', 'it'], ['一緒に', 'ja'], ['함께', 'ko'], ['一起', 'zh'],
      ['साथ मिलकर', 'hi'], ['معًا', 'ar'], ['Pamoja', 'sw'], ['Razem', 'pl'],
      ['Birlikte', 'tr'], ['Bersama', 'id'], ['Samen', 'nl'], ['Вместе', 'ru'],
      ['Μαζί', 'el'], ['ביחד', 'he'], ['با هم', 'fa'], ['Juntos', 'pt']
    ];
    mq.innerHTML = [...words, ...words]
      .map(([word, lang]) => `<span lang="${lang}">${word}</span>`)
      .join('');
  }

  /* ---------- Balance sliders ---------- */
  const balances = document.getElementById('bget-balances');
  if (balances) {
    const pairs = [
      ['Ambition', 'Humility'], ['Intelligence', 'Compassion'],
      ['Capability', 'Responsibility'], ['Technology', 'Nature'],
      ['Thinking', 'Action'], ['Hard work', 'Play'],
      ['Individual dreams', 'Collective purpose'], ['Competition', 'Cooperation'],
      ['Progress', 'Sustainability'], ['Faith', 'Openness'],
      ['Power', 'Ethics'], ['Depth', 'Breadth']
    ];
    balances.innerHTML = pairs.map(([a, b], i) => `
      <div class="bal-row">
        <div class="bal-labels"><span>${a}</span><span>${b}</span></div>
        <div class="bal-track" style="--d:${5 + (i % 5)}s;--delay:-${i}s"></div>
      </div>`).join('');
  }

  /* ---------- World clocks (“somewhere, it's always morning”) ---------- */
  const clocks = document.getElementById('bget-clocks');
  if (clocks) {
    const cities = [
      ['San Francisco', 'America/Los_Angeles'], ['Mexico City', 'America/Mexico_City'],
      ['New York', 'America/New_York'], ['São Paulo', 'America/Sao_Paulo'],
      ['London', 'Europe/London'], ['Lagos', 'Africa/Lagos'],
      ['Nairobi', 'Africa/Nairobi'], ['Dubai', 'Asia/Dubai'],
      ['Mumbai', 'Asia/Kolkata'], ['Singapore', 'Asia/Singapore'],
      ['Tokyo', 'Asia/Tokyo'], ['Sydney', 'Australia/Sydney']
    ];

    clocks.innerHTML = cities.map(([name]) => `
      <div role="listitem" class="border-r border-b border-brand-border p-5">
        <div class="text-xs text-brand-subtle">${name}</div>
        <div class="text-[26px] font-medium tracking-tight text-brand-black tabular-nums mt-1" data-clock="${name}">--:--</div>
        <div class="text-[11px] uppercase tracking-wider text-brand-subtle mt-0.5" data-period="${name}"></div>
      </div>`).join('');

    const tick = () => {
      const now = new Date();
      cities.forEach(([name, zone]) => {
        const hour = Number(new Intl.DateTimeFormat('en-GB', {
          hour: 'numeric', hourCycle: 'h23', timeZone: zone
        }).format(now));
        const time = new Intl.DateTimeFormat([], {
          hour: '2-digit', minute: '2-digit', timeZone: zone
        }).format(now);
        const period = hour >= 5 && hour < 12 ? 'Morning'
          : hour >= 12 && hour < 17 ? 'Afternoon'
          : hour >= 17 && hour < 21 ? 'Evening' : 'Night';

        const timeEl = clocks.querySelector(`[data-clock="${name}"]`);
        const periodEl = clocks.querySelector(`[data-period="${name}"]`);
        if (timeEl) timeEl.textContent = time;
        if (periodEl) {
          periodEl.textContent = period;
          periodEl.className = `text-[11px] uppercase tracking-wider mt-0.5 ${
            period === 'Morning' ? 'text-emerald-700' : 'text-brand-subtle'
          }`;
        }
      });
    };
    tick();
    setInterval(tick, 20000);
  }

  /* ---------- BGET Labs: problem tabs + room of people ---------- */
  const tabs = document.getElementById('bget-labs-tabs');
  if (tabs) {
    const rooms = {
      'Energy waste in cities': ['Electrical engineer', 'Software engineer', 'Data scientist', 'Environmental scientist', 'Economist', 'Urban planner', 'Entrepreneur', 'Policy specialist'],
      'Clean water for remote communities': ['Civil engineer', 'Hydrologist', 'Chemist', 'Biologist', 'Electrical engineer', 'Software engineer', 'Economist', 'Logistics lead', 'Local community voice'],
      'Accessible healthcare': ['Doctor', 'Public-health specialist', 'Software engineer', 'Cybersecurity researcher', 'Designer', 'Psychologist', 'Policy thinker', 'Entrepreneur']
    };
    const question = document.getElementById('bget-labs-question');
    const room = document.getElementById('bget-labs-room');
    const count = document.getElementById('bget-labs-count');
    if (count) count.textContent = `${Object.keys(rooms).length} problems`;
    const select = (key) => {
      tabs.querySelectorAll('button').forEach((b) => {
        b.setAttribute('aria-pressed', String(b.dataset.room === key));
      });
      if (question) question.textContent = `How can we solve: ${key.toLowerCase()}?`;
      if (room) {
        room.innerHTML = rooms[key]
          .map((role, i) => `<span class="lab-role" style="animation-delay:${i * 55}ms">${role}</span>`)
          .join('');
      }
    };
    Object.keys(rooms).forEach((key) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'lab-tab';
      btn.dataset.room = key;
      btn.textContent = key;
      btn.addEventListener('click', () => select(key));
      tabs.appendChild(btn);
    });
    select(Object.keys(rooms)[0]);
  }

  /* ---------- Scroll reveal ----------
     A plain scroll sweep (instead of IntersectionObserver) so that jumping
     past a section — anchor link, scrollbar drag, restored scroll position —
     can never leave content stuck at opacity 0. */
  const revealables = [...document.querySelectorAll('.reveal')];
  if (revealables.length) {
    let pending = revealables;
    const sweep = () => {
      // Anything whose top edge has reached the bottom of the viewport is
      // revealed — so at max scroll nothing can stay stuck at opacity 0.
      const limit = window.innerHeight;
      pending = pending.filter((el) => {
        if (el.getBoundingClientRect().top < limit) {
          el.classList.add('in');
          return false;
        }
        return true;
      });
      if (!pending.length) {
        window.removeEventListener('scroll', sweep);
        window.removeEventListener('resize', sweep);
      }
    };
    window.addEventListener('scroll', sweep, { passive: true });
    window.addEventListener('resize', sweep);
    sweep();
  }

  /* ---------- Hero globe (drag to rotate) ---------- */
  initGlobe();
}

/* --------------------------------------------------------------------------
 * Dot globe with connection arcs between world cities.
 * Neutral palette to sit inside the editorial (white) design system.
 * ------------------------------------------------------------------------ */
function initGlobe() {
  const canvas = document.getElementById('bget-globe');
  if (!canvas || !canvas.getContext) return;

  const ctx = canvas.getContext('2d');
  const host = canvas.parentElement;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  const TILT = 0.4;
  const rad = Math.PI / 180;

  let W, H, R, cx, cy;
  let rot = 0.9;
  let drag = null;
  let arcs = [];

  // Fibonacci sphere of dots
  const dots = [];
  for (let i = 0, n = 1400; i < n; i++) {
    const y = 1 - 2 * (i + 0.5) / n;
    const r = Math.sqrt(1 - y * y);
    const t = i * 2.399963;
    dots.push([r * Math.cos(t), y, r * Math.sin(t)]);
  }

  const ll = (lat, lon) => [
    Math.cos(lat * rad) * Math.sin(lon * rad),
    Math.sin(lat * rad),
    Math.cos(lat * rad) * Math.cos(lon * rad)
  ];
  const cities = [
    [37.8, -122.4], [40.7, -74], [19.4, -99.1], [-23.5, -46.6], [-34.6, -58.4],
    [51.5, -0.1], [52.5, 13.4], [55.7, 37.6], [30, 31.2], [6.5, 3.4],
    [-1.3, 36.8], [25.2, 55.3], [19.1, 72.9], [1.35, 103.8], [35.7, 139.7],
    [-33.9, 151.2], [-26.2, 28], [39.9, 116.4]
  ].map(([a, o]) => ll(a, o));

  const rotate = ([px, py, pz]) => {
    const ca = Math.cos(rot), sa = Math.sin(rot);
    const X = px * ca + pz * sa;
    let Z = -px * sa + pz * ca;
    const ct = Math.cos(TILT), st = Math.sin(TILT);
    const Y = py * ct - Z * st;
    Z = py * st + Z * ct;
    return [X, Y, Z];
  };
  const project = (v) => [cx + v[0] * R, cy - v[1] * R];

  const slerp = (A, B, t) => {
    const d = Math.max(-1, Math.min(1, A[0] * B[0] + A[1] * B[1] + A[2] * B[2]));
    const w = Math.acos(d);
    const s = Math.sin(w) || 1;
    const k = Math.sin((1 - t) * w) / s;
    const m = Math.sin(t * w) / s;
    const lift = 1 + 0.26 * Math.sin(Math.PI * t) * Math.min(1, w / 1.6);
    return [(A[0] * k + B[0] * m) * lift, (A[1] * k + B[1] * m) * lift, (A[2] * k + B[2] * m) * lift];
  };

  const spawn = () => {
    const a = Math.random() * cities.length | 0;
    let b;
    do { b = Math.random() * cities.length | 0; } while (b === a);
    arcs.push({ a: cities[a], b: cities[b], p: 0, v: 0.003 + Math.random() * 0.003 });
  };

  function size() {
    W = host.clientWidth;
    H = host.clientHeight;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    const wide = W > 900;
    R = Math.min(wide ? W * 0.3 : W * 0.5, H * 0.42);
    cx = wide ? W * 0.72 : W * 0.5;
    cy = wide ? H * 0.5 : H * 0.42;
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Sphere body
    let g = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.1, cx, cy, R);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(1, 'rgba(233,231,224,0.75)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, 7);
    ctx.fill();
    ctx.strokeStyle = 'rgba(17,17,17,0.10)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, 7);
    ctx.stroke();

    // Dot cloud
    for (const d of dots) {
      const v = rotate(d);
      if (v[2] < -0.1) continue;
      const q = project(v);
      ctx.fillStyle = `rgba(17,17,17,${v[2] > 0 ? 0.10 + 0.45 * v[2] : 0.05})`;
      ctx.fillRect(q[0], q[1], 1.5, 1.5);
    }

    // Connection arcs (emerald), city markers (blue)
    if (!reduced && arcs.length < 9 && Math.random() < 0.04) spawn();
    for (const a of arcs) {
      a.p += a.v;
      const head = a.p;
      for (let i = 0, N = 48; i < N; i++) {
        const t0 = i / N, t1 = (i + 1) / N;
        const v0 = rotate(slerp(a.a, a.b, t0));
        const v1 = rotate(slerp(a.a, a.b, t1));
        if (v0[2] < 0 && v1[2] < 0) continue;
        const trail = t1 <= head ? Math.max(0, 1 - (head - t1) * 4) : 0;
        ctx.strokeStyle = `rgba(5,150,105,${(0.14 + 0.8 * trail) * Math.max(0, 1.4 - head)})`;
        ctx.lineWidth = 0.8 + trail * 1.3;
        const p0 = project(v0), p1 = project(v1);
        ctx.beginPath();
        ctx.moveTo(p0[0], p0[1]);
        ctx.lineTo(p1[0], p1[1]);
        ctx.stroke();
      }
      if (head < 1) {
        const v = rotate(slerp(a.a, a.b, head));
        if (v[2] > 0) {
          const q = project(v);
          ctx.fillStyle = '#059669';
          ctx.beginPath();
          ctx.arc(q[0], q[1], 2.6, 0, 7);
          ctx.fill();
        }
      }
    }
    arcs = arcs.filter((a) => a.p < 1.4);

    for (const c of cities) {
      const v = rotate(c);
      if (v[2] <= 0) continue;
      const q = project(v);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(q[0], q[1], 4.5, 0, 7);
      ctx.fill();
      ctx.fillStyle = '#0057ff';
      ctx.beginPath();
      ctx.arc(q[0], q[1], 2.6, 0, 7);
      ctx.fill();
    }

    if (drag === null) rot += 0.0015;
    if (!reduced) requestAnimationFrame(draw);
  }

  host.addEventListener('pointerdown', (e) => {
    if (e.target.closest('a')) return;
    drag = e.clientX;
  });
  window.addEventListener('pointerup', () => { drag = null; });
  host.addEventListener('pointermove', (e) => {
    if (drag === null) return;
    rot += (e.clientX - drag) * 0.006;
    drag = e.clientX;
    if (reduced) draw();
  });
  window.addEventListener('resize', () => { size(); if (reduced) draw(); });

  size();
  for (let i = 0; i < 6; i++) { spawn(); arcs[i].p = Math.random() * 0.9; }
  draw();
}

document.addEventListener('DOMContentLoaded', initBget);
