"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Mail, Send } from "@/components/icons";
import { PROBLEMS } from "@/lib/problems";
import { SITE } from "@/lib/site";
import styles from "./problems.module.css";

/* --------------------------------------------------------------- types */

type FieldKind = "input" | "textarea" | "select" | "radio";
type Status = "idle" | "sending" | "error" | "success";

interface FieldOption {
  value: string;
  label: string;
  hint?: string;
}

interface FieldDef {
  id: string;
  num: string;
  label: string;
  kind: FieldKind;
  required?: boolean;
  minlength?: number;
  rows?: number;
  placeholder?: string;
  help?: string;
  note?: string;
  options?: readonly FieldOption[];
}

/* ---------------------------------------------------------------- data */

/** A human spends real time reading a fourteen-field form. */
const MIN_FILL_MS = 8000;

/**
 * The official BGET problem-submission template.
 * Snake_case names are delivered verbatim to the submit API.
 */
const FIELDS: readonly FieldDef[] = [
  {
    id: "problem_what",
    num: "01",
    label: "What is the problem?",
    kind: "textarea",
    required: true,
    minlength: 40,
    rows: 5,
    placeholder: "Name it plainly — who, what, and why it isn't already solved.",
    help: "Specific beats grand. It happens to real people, right now.",
  },
  {
    id: "problem_where",
    num: "02",
    label: "Where is it happening?",
    kind: "input",
    required: true,
    placeholder: "A region, a city, a district — or everywhere.",
  },
  {
    id: "who_affected",
    num: "03",
    label: "Who is affected, and roughly how many?",
    kind: "input",
    placeholder: "e.g. ~40,000 households outside the municipal water line",
  },
  {
    id: "why_it_matters",
    num: "04",
    label: "Why does it matter?",
    kind: "textarea",
    rows: 4,
    placeholder: "What breaks, or gets worse, if this goes unsolved?",
  },
  {
    id: "evidence",
    num: "05",
    label: "What evidence do you have?",
    kind: "textarea",
    rows: 4,
    placeholder: "A report, a photo, a measurement, a story — a link is plenty.",
    note: "I've seen it firsthand is honest and acceptable.",
  },
  {
    id: "already_tried",
    num: "06",
    label: "What has already been tried? Why didn't it work?",
    kind: "textarea",
    rows: 4,
    placeholder: "Organizations, approaches, and where they fell short.",
  },
  {
    id: "success_looks_like",
    num: "07",
    label: "What would success look like? Measurable if possible.",
    kind: "textarea",
    rows: 4,
    placeholder: "A finish line beats grand intent.",
    help: "A clear finish line beats grand intent.",
  },
  {
    id: "may_help",
    num: "08",
    label: "What do you think might help? Your best guess.",
    kind: "textarea",
    rows: 4,
    placeholder: "No need to be right — a direction is enough.",
  },
  {
    id: "why_bget",
    num: "09",
    label: "Why might BGET be useful here?",
    kind: "textarea",
    rows: 4,
    placeholder: "Builders, scientists, makers, thinkers — where could we fit?",
  },
  {
    id: "can_contribute",
    num: "10",
    label: "What can you contribute?",
    kind: "textarea",
    rows: 4,
    placeholder: "Time, skills, access, a network, a test site…",
  },
  {
    id: "safety_concerns",
    num: "11",
    label: "Any safety concerns we should know about?",
    kind: "select",
    options: [
      { value: "none", label: "None that I know of" },
      { value: "yes", label: "Yes — details below" },
      { value: "not_sure", label: "Not sure" },
    ],
  },
  {
    id: "contact",
    num: "12",
    label: "May BGET contact you for clarification?",
    kind: "input",
    placeholder: "Email or Discord handle",
    help: "Optional — the answer is read either way.",
  },
  {
    id: "visibility",
    num: "13",
    label: "Who can see your submission?",
    kind: "radio",
    required: true,
    options: [
      { value: "public", label: "Public", hint: "Appears in the queue — anonymized by default" },
      { value: "bget_review_only", label: "BGET review only", hint: "Read by us, never published" },
      { value: "private", label: "Private", hint: "Kept off the queue entirely" },
    ],
  },
  {
    id: "credit",
    num: "14",
    label: "How should we credit you?",
    kind: "radio",
    options: [
      { value: "yes_both", label: "Both", hint: "First name and country" },
      { value: "first_name_only", label: "First name only", hint: "No country" },
      { value: "anonymous", label: "Anonymous", hint: "No credit at all" },
    ],
  },
];

const DEFAULT_VALUES: Record<string, string> = {
  safety_concerns: "none", // privacy-first defaults: no risk assumed, no credit assumed
  credit: "anonymous",
};

const TIMING_NOTICE =
  "That was quicker than it takes to read the form — nothing you wrote was lost. Take another look, then press submit again.";

const FAIL_TITLE = "It didn't reach us — that's on our side, not yours.";
const FAIL_BODY =
  "Nothing you wrote was lost. Try again in a moment, or send the same answers by email and we'll treat them identically.";

/* ------------------------------------------------------------- helpers */

function computeFieldErrors(values: Record<string, string>): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const field of FIELDS) {
    const value = (values[field.id] ?? "").trim();
    if (field.required && !value) {
      errors[field.id] = "This one is required.";
    } else if (field.required && field.minlength && value.length < field.minlength) {
      errors[field.id] = `Please write at least ${field.minlength} characters — you've written ${value.length}.`;
    }
  }
  return errors;
}

/* ------------------------------------------------------------ component */

export default function ProblemForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const honeypotWebsite = useRef<HTMLInputElement>(null);
  const honeypotFax = useRef<HTMLInputElement>(null);
  const mountedAt = useRef(0);
  const successRef = useRef<HTMLDivElement>(null);

  const [values, setValues] = useState<Record<string, string>>(() => ({
    ...Object.fromEntries(FIELDS.map((f) => [f.id, ""])),
    ...DEFAULT_VALUES, // privacy-first defaults: no risk assumed, no credit assumed
  }));
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [receipt, setReceipt] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);

  useEffect(() => {
    if (status !== "success") return;
    const reduce =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    successRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
  }, [status]);

  function setValue(id: string, value: string) {
    setValues((prev) => ({ ...prev, [id]: value }));
    if (status === "error") setStatus("idle");
    if (fieldErrors[id]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  }

  const submit = useCallback(async () => {
    setNotice(null);

    // Min-fill guard — reject bot-speed submissions.
    if (Date.now() - mountedAt.current < MIN_FILL_MS) {
      setNotice(TIMING_NOTICE);
      return;
    }

    const errors = computeFieldErrors(values);
    const firstInvalid = FIELDS.find((f) => errors[f.id]);
    if (firstInvalid) {
      setFieldErrors(errors);
      requestAnimationFrame(() => {
        formRef.current
          ?.querySelector<HTMLElement>(`[name="${firstInvalid.id}"]`)
          ?.focus({ preventScroll: false });
      });
      return;
    }
    setFieldErrors({});
    setStatus("sending");

    try {
      const fields: Record<string, string> = { ...values };

      // Honeypots: bots fill hidden traps, humans don't. Forward them so the
      // server can swallow the submission silently.
      const website = honeypotWebsite.current?.value ?? "";
      const fax = honeypotFax.current?.value ?? "";
      if (website.trim()) fields["website"] = website;
      if (fax.trim()) fields["fax"] = fax;

      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind: "problems", fields }),
      });
      const data = (await res.json()) as { ok?: boolean; ref?: unknown };
      if (!res.ok || !data.ok) throw new Error("submit-rejected");
      setReceipt(typeof data.ref === "string" ? data.ref : "BGET-P-LATER");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }, [values]);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    void submit();
  }

  const sending = status === "sending";

  function fieldErrorId(id: string): string | undefined {
    return fieldErrors[id] ? `error-${id}` : undefined;
  }

  return (
    <div className={styles.formCard}>
      {status === "success" ? (
        <div
          ref={successRef}
          className={styles.success}
          role="status"
          aria-live="polite"
          tabIndex={-1}
        >
          <span className={styles.successIcon} aria-hidden="true">
            <Check size={24} />
          </span>
          <h3 className={styles.successTitle}>It&#39;s in the queue.</h3>
          <p className={styles.receipt}>Receipt {receipt}</p>
          <p className={styles.successBody}>
            A person will read it. Updates land in the queue within two weeks.
          </p>
          <p className={styles.thankYou}>Thank you for naming it clearly.</p>
        </div>
      ) : (
        <form ref={formRef} className={styles.form} onSubmit={onSubmit} noValidate aria-busy={sending}>
          <div className={styles.formIntro}>
            <p>
              Fourteen questions — five minutes, no account. A person reads this, usually within two
              weeks, and you always receive an answer.
            </p>
            <p className={styles.formIntroMono}>Private by default · public only if you choose</p>
          </div>

          {FIELDS.map((field) => {
            const error = fieldErrors[field.id];
            const describedBy = [
              field.help ? `hint-${field.id}` : "",
              field.note ? `note-${field.id}` : "",
              error ? `error-${field.id}` : "",
            ]
              .filter(Boolean)
              .join(" ") || undefined;

            if (field.kind === "radio") {
              return (
                <fieldset key={field.id} className={styles.fieldsetRadio}>
                  <legend className={styles.legend}>
                    <span className={styles.fnum}>{field.num}</span>
                    <span className={styles.fieldTitle}>{field.label}</span>
                    <span className={`${styles.tag} ${field.required ? styles.tagReq : styles.tagOpt}`}>
                      {field.required ? "Required" : "Optional"}
                    </span>
                  </legend>
                  <div className={styles.radioOptions} role="radiogroup" aria-labelledby={`label-${field.id}`}>
                    <span id={`label-${field.id}`} className="sr-only">
                      {field.label}
                    </span>
                    {field.options?.map((option) => {
                      const selected = (values[field.id] ?? "") === option.value;
                      return (
                        <label
                          key={option.value}
                          className={`${styles.radioOption}${
                            selected ? ` ${styles.radioOptionSelected}` : ""
                          }`}
                        >
                          <input
                            type="radio"
                            name={field.id}
                            value={option.value}
                            checked={selected}
                            required={field.required && !values[field.id]}
                            onChange={() => setValue(field.id, option.value)}
                          />
                          <span className={styles.radioText}>
                            <span className={styles.radioLabel}>{option.label}</span>
                            {option.hint && <span className={styles.radioHint}>{option.hint}</span>}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                  {error && (
                    <p id={`error-${field.id}`} className={styles.fieldError} role="alert">
                      {error}
                    </p>
                  )}
                </fieldset>
              );
            }

            return (
              <fieldset key={field.id} className={styles.fieldset}>
                <legend className={styles.legend}>
                  <span className={styles.fnum}>{field.num}</span>
                  <span className={styles.fieldTitle}>
                    {field.required ? <span id={`label-${field.id}`}>{field.label}</span> : field.label}
                  </span>
                  <span className={`${styles.tag} ${field.required ? styles.tagReq : styles.tagOpt}`}>
                    {field.required ? "Required" : "Optional"}
                  </span>
                </legend>

                {field.kind === "select" ? (
                  <select
                    id={field.id}
                    name={field.id}
                    value={values[field.id] ?? ""}
                    onChange={(e) => setValue(field.id, e.target.value)}
                    className={`${styles.select}${error ? ` ${styles.invalid}` : ""}`}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={describedBy}
                  >
                    {field.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : field.kind === "input" ? (
                  <input
                    id={field.id}
                    name={field.id}
                    type="text"
                    autoComplete="off"
                    required={field.required}
                    minLength={field.minlength}
                    value={values[field.id] ?? ""}
                    onChange={(e) => setValue(field.id, e.target.value)}
                    placeholder={field.placeholder}
                    className={`${styles.input}${error ? ` ${styles.invalid}` : ""}`}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={describedBy}
                  />
                ) : (
                  <textarea
                    id={field.id}
                    name={field.id}
                    rows={field.rows ?? 4}
                    required={field.required}
                    minLength={field.minlength}
                    value={values[field.id] ?? ""}
                    onChange={(e) => setValue(field.id, e.target.value)}
                    placeholder={field.placeholder}
                    className={`${styles.textarea}${error ? ` ${styles.invalid}` : ""}`}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={describedBy}
                  />
                )}

                {field.help && (
                  <p id={`hint-${field.id}`} className={styles.help}>
                    {field.help}
                  </p>
                )}
                {field.note && (
                  <p id={`note-${field.id}`} className={styles.note}>
                    {field.note}
                  </p>
                )}
                {error && (
                  <p id={`error-${field.id}`} className={styles.fieldError} role="alert">
                    {error}
                  </p>
                )}

                {field.kind === "textarea" && (
                  <p className={styles.counter} aria-live="polite">
                    {(values[field.id] ?? "").length} chars
                    {field.required && field.minlength
                      ? ` · min ${field.minlength}`
                      : ""}
                  </p>
                )}
              </fieldset>
            );
          })}

          {/* Honeypots — invisible, never filled by humans */}
          <div aria-hidden="true" className={styles.honeypot}>
            <label htmlFor="website">Website</label>
            <input
              ref={honeypotWebsite}
              type="text"
              id="website"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              className={styles.honeypot}
            />
            <label htmlFor="fax">Fax</label>
            <input
              ref={honeypotFax}
              type="text"
              id="fax"
              name="fax"
              tabIndex={-1}
              autoComplete="off"
              className={styles.honeypot}
            />
          </div>

          {status === "error" && (
            <div className={styles.errorBox} role="alert">
              <p className={styles.errorTitle}>{FAIL_TITLE}</p>
              <p className={styles.errorBody}>{FAIL_BODY}</p>
              <div className={styles.errorActions}>
                <button type="button" className="btn btn--ghost" onClick={() => void submit()}>
                  Try again
                </button>
                <a
                  className="btn btn--dark"
                  href={`mailto:${SITE.email}?subject=${encodeURIComponent(
                    "BGET problem submission — resend",
                  )}`}
                >
                  Email it instead
                  <Mail size={15} aria-hidden="true" />
                </a>
              </div>
            </div>
          )}

          {notice && (
            <p className={styles.timingNote} role="status" aria-live="polite">
              {notice}
            </p>
          )}

          <div className={styles.submitRow}>
            <button
              type="submit"
              className={`${styles.submitBtn} btn btn--primary`}
              disabled={sending}
            >
              {sending ? "Sending…" : PROBLEMS.submitButton}
              {!sending && <Send size={16} aria-hidden="true" />}
            </button>
            <p className={styles.submitNote}>{PROBLEMS.submitNote}</p>
          </div>
        </form>
      )}
    </div>
  );
}