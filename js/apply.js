/**
 * BGET — application page behaviour
 * Vanilla JS, zero dependencies (Lucide + Tailwind are loaded from CDN).
 *
 * Everything here is defensive: on a page without the form this file is a no-op.
 * Sections: validation, counters, anti-spam, client-side submission.
 */

/* --------------------------------------------------------------------------
 * Config
 * ------------------------------------------------------------------------ */
const APPLY_CONFIG = {
  endpoint: 'https://formsubmit.co/ajax/nikhilnagpure1111@gmail.com',
  email: 'nikhilnagpure1111@gmail.com',
  minFillMs: 8000,           // submissions faster than this after load are rejected
  submitLabel: 'Submit application',
  /* Optional Cloudflare Worker relay (see workers/bget-forms/README.md).
     Set relayEndpoint to the deployed Worker URL and relayToken to the
     FORM_TOKEN variable to also deliver submissions into Discord. The email
     path above keeps working either way; the relay is best-effort and never
     changes the result the applicant sees. */
  relayEndpoint: '',         // e.g. 'https://bget-forms.<account>.workers.dev'
  relayToken: '',
  relayForm: 'apply'
};

/* --------------------------------------------------------------------------
 * Small helpers
 * ------------------------------------------------------------------------ */
function makeApplicationId() {
  const d = new Date();
  const stamp = d.getFullYear()
    + String(d.getMonth() + 1).padStart(2, '0')
    + String(d.getDate()).padStart(2, '0');
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let rand = '';
  for (let i = 0; i < 4; i++) rand += chars.charAt(Math.floor(Math.random() * chars.length));
  return 'BGET-' + stamp + '-' + rand;
}

function minLengthOf(el) {
  const raw = el.getAttribute('minlength');
  const n = raw ? parseInt(raw, 10) : NaN;
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function fieldWrapper(el) {
  return el && el.closest ? el.closest('.apply-field') : null;
}

function findMessage(field, id) {
  if (!field) return null;
  return field.querySelector('.apply-error-msg[data-for="' + id + '"]');
}

/* --------------------------------------------------------------------------
 * Validation
 * ------------------------------------------------------------------------ */
function validateField(el) {
  if (el.type === 'checkbox') {
    if (el.required && !el.checked) return 'Please confirm this before submitting.';
    return '';
  }

  const value = (el.value || '').trim();
  if (el.required && !value) return 'This one is required.';
  if (!value) return '';

  if (el.type === 'email') {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
      return "That email doesn't look right — we need a working address to reply to.";
    }
    return '';
  }

  const min = minLengthOf(el);
  if (min && value.length < min) {
    return 'Please write at least ' + min + ' characters — you are at ' + value.length + ' right now.';
  }
  return '';
}

function setError(el, message) {
  const field = fieldWrapper(el);
  if (!field) return;
  let msg = findMessage(field, el.id);
  if (!msg) {
    msg = document.createElement('p');
    msg.className = 'apply-error-msg text-[12px] text-red-600 mt-1.5';
    msg.dataset.for = el.id;
    msg.id = 'err-' + el.id;
    field.appendChild(msg);
  }
  msg.textContent = message;

  field.classList.add('has-error');
  el.setAttribute('aria-invalid', 'true');
  if (el.type !== 'checkbox') {
    el.classList.add('is-error');
    el.classList.remove('is-valid');
  }
  const hint = field.querySelector('.apply-hint');
  el.setAttribute('aria-describedby', [hint ? hint.id : '', msg.id].filter(Boolean).join(' '));
}

function clearError(el) {
  const field = fieldWrapper(el);
  const msg = findMessage(field, el.id);
  if (msg) msg.remove();

  el.removeAttribute('aria-invalid');
  if (el.type !== 'checkbox') el.classList.remove('is-error');

  const hint = field ? field.querySelector('.apply-hint') : null;
  if (hint && hint.id) el.setAttribute('aria-describedby', hint.id);
  else el.removeAttribute('aria-describedby');

  if (field && !field.querySelector('.apply-error-msg')) field.classList.remove('has-error');
}

function markValid(el) {
  if (el.type === 'checkbox') return;
  const value = (el.value || '').trim();
  if (value && validateField(el) === '') {
    el.classList.add('is-valid');
    el.classList.remove('is-error');
  } else {
    el.classList.remove('is-valid');
  }
}

/* Live character counter under any field that declares a minlength. */
function updateCounter(el) {
  const field = fieldWrapper(el);
  if (!field) return;
  const counter = field.querySelector('.apply-counter');
  const min = minLengthOf(el);
  if (!counter || !min) return;

  const len = (el.value || '').trim().length;
  if (len >= min) {
    counter.textContent = len + ' / ' + min + ' characters — enough';
    counter.classList.remove('is-short');
    counter.classList.add('is-ok');
  } else {
    counter.textContent = len + ' / ' + min + ' characters — keep going';
    counter.classList.add('is-short');
    counter.classList.remove('is-ok');
  }
}

/* --------------------------------------------------------------------------
 * Page init
 * ------------------------------------------------------------------------ */
function initApply() {
  /* Icons (bget.js normally handles this; cover the case where it didn't) */
  if (window.lucide && document.querySelector('i[data-lucide]')) {
    window.lucide.createIcons();
  }

  /* Shared chrome links point at homepage anchors (#vision, #people, #labs…).
     Those ids don't exist on this page, so send the link home instead of
     letting it silently jump to the top. Never touches the shared markup's
     own hrefs that do resolve (e.g. apply.html#process). */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    const hash = a.getAttribute('href').slice(1);
    if (!hash) return;
    if (!document.getElementById(hash)) a.setAttribute('href', 'index.html#' + hash);
  });

  /* The shared drawer may carry a static `inert` attribute; js/bget.js toggles
     only the .open class, so keep `inert` in sync here (removing it while the
     drawer is open so its links and close button stay clickable). */
  const drawer = document.getElementById('mobile-drawer');
  if (drawer) {
    const syncInert = () => {
      if (drawer.classList.contains('open')) drawer.removeAttribute('inert');
      else drawer.setAttribute('inert', '');
    };
    if (window.MutationObserver) {
      new MutationObserver(syncInert).observe(drawer, { attributes: true, attributeFilter: ['class'] });
    }
    syncInert();
  }

  const form = document.getElementById('bget-application');
  if (!form) return;

  const startedAt = Date.now();
  const applicationId = makeApplicationId();

  const submitBtn = document.getElementById('apply-submit');
  const errorBlock = document.getElementById('apply-error');
  const timingBlock = document.getElementById('apply-timing');
  const successPanel = document.getElementById('apply-success');
  const honeypot = document.getElementById('f-honey');
  const retryBtn = document.getElementById('apply-retry');
  const emailFallback = document.getElementById('apply-mailto-error');
  const successFallback = document.getElementById('apply-mailto');
  const liveRegion = document.getElementById('apply-live');

  /* Polite announcement for screen readers (the individual messages are also
     tied to each field via aria-describedby). */
  function announce(text) {
    if (liveRegion) liveRegion.textContent = text || '';
  }

  const requiredFields = [...form.querySelectorAll('[required], [minlength]')];
  const checkboxes = requiredFields.filter((el) => el.type === 'checkbox');
  const textFields = requiredFields.filter((el) => el.type !== 'checkbox');

  /* ---------- Counters on load ---------- */
  textFields.forEach(updateCounter);

  /* ---------- Clear a field's error as soon as it is edited ---------- */
  form.addEventListener('input', (e) => {
    const el = e.target;
    if (!el || !el.id || el.type === 'checkbox') return;
    updateCounter(el);
    if (findMessage(fieldWrapper(el), el.id)) clearError(el);
    markValid(el);
    if (timingBlock && !timingBlock.classList.contains('hidden')) {
      timingBlock.classList.add('hidden');
    }
  });

  form.addEventListener('change', (e) => {
    const el = e.target;
    if (!el) return;

    if (el.type === 'checkbox') {
      const allConfirmed = checkboxes.every((box) => box.checked);
      if (allConfirmed) checkboxes.forEach(clearError);
      return;
    }

    updateCounter(el);
    if (findMessage(fieldWrapper(el), el.id)) clearError(el);
    markValid(el);
  });

  /* ---------- Validate the whole form ---------- */
  function validateForm() {
    let firstInvalid = null;

    textFields.forEach((el) => {
      const err = validateField(el);
      if (err) {
        setError(el, err);
        if (!firstInvalid) firstInvalid = el;
      } else {
        clearError(el);
        markValid(el);
      }
    });

    const unchecked = checkboxes.filter((box) => !box.checked);
    if (unchecked.length) {
      const message = unchecked.length === 1
        ? 'Please confirm this before we can read your application.'
        : 'Please confirm all three commitments before submitting.';
      unchecked.forEach((box, i) => {
        if (i === 0) setError(box, message);
        else box.setAttribute('aria-invalid', 'true');
      });
      if (!firstInvalid) firstInvalid = unchecked[0];
    } else {
      checkboxes.forEach(clearError);
    }

    return firstInvalid;
  }

  /* ---------- Payload ---------- */
  function collectPayload() {
    const payload = {};
    for (const el of form.elements) {
      if (!el.name || el.disabled) continue;
      // Anti-spam honeypot: it gates the send above but is never part of the
      // payload — an empty `_honey` row would show up in the emailed table.
      if (el.name === '_honey') continue;
      // Second honeypot for the Discord relay (name `website`); never sent to
      // the email path, included in the relay payload so the Worker can drop bots.
      if (el.name === 'website') continue;
      // Files can't ride in a JSON payload — handled separately in send().
      if (el.type === 'file') continue;
      if (el.type === 'checkbox') {
        if (el.checked) payload[el.name] = el.value || 'Yes';
        continue;
      }
      payload[el.name] = (el.value || '').trim();
    }

    const name = (document.getElementById('f-name') || {}).value || '';
    const discipline = (document.getElementById('f-discipline') || {}).value || '';

    payload._subject = 'BGET application — ' + (name.trim() || 'Unnamed') + ' (' + discipline + ')';
    payload._captcha = 'false';
    payload._template = 'table';
    payload['Application ID'] = applicationId;
    payload['Submitted'] = new Date().toISOString();
    return payload;
  }

  function buildMailto(payload) {
    const subject = payload._subject || 'BGET application';
    const lines = ['BGET application', ''];
    for (const [key, value] of Object.entries(payload)) {
      // `Application ID` is appended explicitly below — don't print it twice.
      if (key.charAt(0) === '_' || !value || key === 'Application ID') continue;
      lines.push(key + ': ' + value);
    }
    lines.push('', 'Application ID: ' + (payload['Application ID'] || applicationId));
    return 'mailto:' + APPLY_CONFIG.email
      + '?subject=' + encodeURIComponent(subject)
      + '&body=' + encodeURIComponent(lines.join('\n'));
  }

  /* ---------- Button + panel states ---------- */
  function setSending(on) {
    if (!submitBtn) return;
    submitBtn.disabled = on;
    if (on) {
      submitBtn.setAttribute('aria-busy', 'true');
      submitBtn.innerHTML = '<span class="apply-spinner" aria-hidden="true"></span> Sending your application…';
    } else {
      submitBtn.removeAttribute('aria-busy');
      submitBtn.textContent = APPLY_CONFIG.submitLabel;
    }
  }

  function showSuccess(payload) {
    if (errorBlock) errorBlock.classList.add('hidden');
    if (timingBlock) timingBlock.classList.add('hidden');
    announce('');
    form.classList.add('hidden');

    const idEl = document.getElementById('apply-id');
    if (idEl) idEl.textContent = applicationId;
    if (successFallback) successFallback.href = buildMailto(payload || collectPayload());

    if (successPanel) {
      successPanel.classList.remove('hidden');
      successPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
      successPanel.focus({ preventScroll: true });
    }
  }

  function showFailure(payload) {
    if (emailFallback) emailFallback.href = buildMailto(payload);
    if (successFallback) successFallback.href = buildMailto(payload);
    if (errorBlock) {
      errorBlock.classList.remove('hidden');
      errorBlock.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  /* ---------- Files (resume upload, optional) ---------- */
  function attachedFiles() {
    const out = [];
    for (const el of form.elements) {
      if (el.type === 'file' && el.files && el.files[0]) {
        out.push({ name: el.name || 'Attachment', file: el.files[0] });
      }
    }
    return out;
  }

  /* ---------- Send ---------- */
  let inFlight = false;
  async function send() {
    const payload = collectPayload();
    const files = attachedFiles();
    inFlight = true;
    setSending(true);

    try {
      const res = await post(payload, files);

      let data = null;
      try { data = await res.json(); } catch (ignore) { data = null; }

      const succeeded = Boolean(res.ok && data
        && (data.success === true || data.success === 'true'));

      if (succeeded) showSuccess(payload);
      else showFailure(payload);

      /* Best-effort Discord relay — runs after the email path, never blocks
         or changes the UI. The Worker validates origin, honeypot and token. */
      if (succeeded && APPLY_CONFIG.relayEndpoint) {
        try {
          const body = Object.assign({}, payload, {
            token: APPLY_CONFIG.relayToken,
            website: (honeypot && honeypot.value) || ''
          });
          await fetch(APPLY_CONFIG.relayEndpoint + '?form=' + APPLY_CONFIG.relayForm, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
          });
        } catch (ignore) { /* the email path already succeeded */ }
      }
    } catch (err) {
      showFailure(payload);
    } finally {
      inFlight = false;
      setSending(false);
    }
  }

  /* With a file attached we must send multipart/form-data (the JSON route
     can't carry attachments; the table email template can't either). */
  function post(payload, files) {
    if (files.length) {
      const fd = new FormData();
      for (const [key, value] of Object.entries(payload)) {
        if (key === '_template') continue; // table template is text-only
        if (value === undefined || value === null) continue;
        fd.append(key, String(value));
      }
      for (const f of files) fd.append(f.name, f.file, f.file.name);
      return fetch(APPLY_CONFIG.endpoint, { method: 'POST', body: fd });
    }
    return fetch(APPLY_CONFIG.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload)
    });
  }

  /* ---------- Submit ---------- */
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    /* A second submit event can already be queued (Enter + click, double Enter)
       before the button is disabled — never fire twice. */
    if (inFlight) return;
    if (timingBlock) timingBlock.classList.add('hidden');

    const firstInvalid = validateForm();
    if (firstInvalid) {
      const open = form.querySelectorAll('.apply-error-msg').length;
      announce(open === 1
        ? 'One answer still needs attention before this can be sent.'
        : open + ' answers still need attention before this can be sent.');
      firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      window.setTimeout(() => firstInvalid.focus({ preventScroll: true }), 250);
      return;
    }
    announce('');

    /* Honeypot filled: pretend success, send nothing. */
    if (honeypot && honeypot.value) {
      showSuccess(collectPayload());
      return;
    }

    /* Minimum-time anti-spam check. */
    if (Date.now() - startedAt < APPLY_CONFIG.minFillMs) {
      if (timingBlock) timingBlock.classList.remove('hidden');
      return;
    }

    send();
  });

  /* ---------- Failure retry ---------- */
  if (retryBtn) {
    retryBtn.addEventListener('click', () => {
      if (errorBlock) errorBlock.classList.add('hidden');
      if (submitBtn) {
        submitBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
        submitBtn.focus({ preventScroll: true });
      }
    });
  }
}

/* DOMContentLoaded-safe entry point (same pattern as js/bget.js). */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApply);
} else {
  initApply();
}
