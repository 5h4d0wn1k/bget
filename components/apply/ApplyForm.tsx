"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Clipboard, FileText, Mail, Send, Upload, X } from "lucide-react";
import styles from "./apply.module.css";
import { SITE } from "@/lib/site";

/* ------------------------------------------------------------------ types */

type QuestionKind = "input" | "select" | "textarea";

interface Question {
  id: string;
  num: string;
  label: string;
  kind: QuestionKind;
  required?: boolean;
  minlength?: number;
  rows?: number;
  options?: readonly string[];
  placeholder?: string;
  help?: string;
  note?: string;
}

type Status = "idle" | "sending" | "error" | "success";
type ResumeMode = "upload" | "paste" | "none";

/* ------------------------------------------------------------------- data */

const MIN_FILL_MS = 8000;
const MAX_RESUME_BYTES = 10 * 1024 * 1024;
const MAX_PASTE_CHARS = 9000;

/**
 * The twelve questions of the BGET application — the real template.
 * Snake_case field names are delivered verbatim to the submit API.
 */
const QUESTIONS: readonly Question[] = [
  {
    id: "q_name",
    num: "Q1",
    label: "Name — what people call you",
    kind: "input",
    required: true,
    placeholder: "What people actually call you",
  },
  {
    id: "q_age",
    num: "Q2",
    label: "Age range",
    kind: "select",
    options: ["Under 18", "18–21", "22–25", "26–30", "30+"],
  },
  {
    id: "q_working_on",
    num: "Q3",
    label: "What are you working on, or toward, right now?",
    kind: "textarea",
    required: true,
    minlength: 80,
    rows: 5,
    placeholder: "Role, studies or craft — plain language, not a job title.",
    help: "Plain language beats polish. A person reads this.",
  },
  {
    id: "q_hardest_part",
    num: "Q4",
    label: "What's the hardest part of it right now?",
    kind: "textarea",
    rows: 4,
    placeholder: "Be specific — 'right now' means this week.",
    help: "Struggling honestly is respected here. There is no wrong answer.",
  },
  {
    id: "q_show_something",
    num: "Q5",
    label: "Show us something you've made, done, fixed, or started.",
    kind: "textarea",
    required: true,
    minlength: 60,
    rows: 5,
    placeholder: "One real thing, described honestly.",
    note: "Small and honest beats big and impressive. A repo, a write-up, a photo, a piece of music, an event — anything.",
  },
  {
    id: "q_being_wrong",
    num: "Q6",
    label: "Tell us about a time you were wrong or failed. What did you do about it?",
    kind: "textarea",
    rows: 4,
    placeholder: "A real one — how you handled it matters more than being right.",
  },
  {
    id: "q_changed_mind",
    num: "Q7",
    label: "What's something you believed a few years ago that you've changed your mind about?",
    kind: "textarea",
    rows: 4,
    placeholder: "A belief, a habit, a position — and what moved you.",
  },
  {
    id: "q_give",
    num: "Q8",
    label: "What can you give to other BGET members?",
    kind: "textarea",
    required: true,
    minlength: 60,
    rows: 4,
    placeholder: "What you'd actually share — time, skill, honesty, care.",
  },
  {
    id: "q_want",
    num: "Q9",
    label: "What do you want to get from BGET?",
    kind: "textarea",
    required: true,
    minlength: 60,
    rows: 4,
    placeholder: "Be specific. A genuine answer is an answer.",
  },
  {
    id: "q_last_helped",
    num: "Q10",
    label: "When did someone last help you — and did you pass it on?",
    kind: "textarea",
    required: true,
    minlength: 40,
    rows: 4,
    placeholder: "A real moment — both halves.",
  },
  {
    id: "q_leave",
    num: "Q11",
    label: "What would make you leave this community within six months?",
    kind: "textarea",
    rows: 4,
    placeholder: "The honest answer tells us what you'd need to stay.",
  },
  {
    id: "q_ask_us",
    num: "Q12",
    label: "Is there anything you'd want to ask us before deciding?",
    kind: "textarea",
    rows: 4,
    placeholder: "Ask it here — the question itself tells us something.",
  },
];

const TIMING_NOTICE =
  "That was quicker than it takes to read the questions — nothing you wrote was lost. Take another look above, then press submit again.";

const FAIL_TITLE = "Your application didn't reach us — that's on our side, not yours.";
const FAIL_BODY =
  "Nothing you wrote was lost — it's still on this page. Try again in a moment, or send the same answers by email and we'll treat them identically.";

/* ------------------------------------------------------------------ helpers */

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* ----------------------------------------------------------------- component */

export default function ApplyForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const honeypotWebsite = useRef<HTMLInputElement>(null);
  const honeypotFax = useRef<HTMLInputElement>(null);
  const mountedAt = useRef(0);
  const successRef = useRef<HTMLDivElement>(null);

  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(QUESTIONS.map((q) => [q.id, ""])),
  );
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [resumeMode, setResumeMode] = useState<ResumeMode>("none");
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
    successRef.current?.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "center",
    });
  }, [status]);

  function setValue(id: string, value: string) {
    setValues((prev) => ({ ...prev, [id]: value }));
    if (status === "error") setStatus("idle");
    if (id === "resume-text") setResumeMode((m) => (m === "upload" ? m : "paste"));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const chosen = e.target.files?.[0] ?? null;
    if (!chosen) {
      setFile(null);
      return;
    }
    if (chosen.size > MAX_RESUME_BYTES) {
      e.target.value = "";
      setFile(null);
      setFileError(
        `${chosen.name} is over 10 MB — please choose a smaller file, or paste your résumé as text instead.`,
      );
      return;
    }
    setFileError(null);
    setFile(chosen);
    setResumeMode("upload");
    if (status === "error") setStatus("idle");
  }

  const submit = useCallback(async () => {
    setNotice(null);
    setFileError(null);

    // Min-fill guard: a human spends real time reading twelve questions.
    if (Date.now() - mountedAt.current < MIN_FILL_MS) {
      setNotice(TIMING_NOTICE);
      return;
    }

    setStatus("sending");

    try {
      const fields: Record<string, string> = { ...values };

      // Honeypots: bots fill hidden traps, humans don't. Forward them so the
      // server can swallow the submission silently.
      const website = honeypotWebsite.current?.value ?? "";
      const fax = honeypotFax.current?.value ?? "";
      if (website.trim()) fields["website"] = website;
      if (fax.trim()) fields["fax"] = fax;

      let res: Response;
      if (file) {
        // Multipart — the submit API expects FormData when a résumé file is attached.
        const fd = new FormData();
        fd.append("kind", "apply");
        for (const [key, value] of Object.entries(fields)) fd.append(key, value);
        fd.append("resume-file", file, file.name);
        res = await fetch("/api/submit", { method: "POST", body: fd });
      } else {
        const payload = { ...fields };
        const pasted = values["resume-text"]?.trim();
        if (pasted) payload["resume-text"] = pasted;
        res = await fetch("/api/submit", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ kind: "apply", fields: payload }),
        });
      }

      const data = (await res.json()) as { ok?: boolean; ref?: unknown };
      if (!res.ok || !data.ok) throw new Error("submit-rejected");
      setReceipt(typeof data.ref === "string" ? data.ref : "BGET-A-LATER");
      setFile(null);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }, [file, values]);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!formRef.current?.checkValidity()) {
      formRef.current?.reportValidity();
      return;
    }
    void submit();
  }

  const sending = status === "sending";

  return (
    <div className={styles.formCard}>
      {status === "success" ? (
        <div ref={successRef} className={styles.success} role="status" aria-live="polite" tabIndex={-1}>
          <span className={styles.successIcon} aria-hidden="true">
            <Check size={24} />
          </span>
          <h3 className={styles.successTitle}>Your application is in.</h3>
          <p className={styles.receipt}>Receipt {receipt}</p>
          <p className={styles.successBody}>
            We read every application — expect a reply within 14 days, including a no.
          </p>
          <p className={styles.thankYou}>It takes real people time — thank you.</p>
          <a className={`${styles.inboxBtn} btn btn--ghost`} href={`mailto:${SITE.email}`}>
            Send us a note directly
            <ArrowRight size={15} aria-hidden="true" />
          </a>
        </div>
      ) : (
        <form ref={formRef} className={styles.form} onSubmit={onSubmit} noValidate aria-busy={sending}>
          <div className={styles.formIntro}>
            <p>
              Twelve questions, read in full by a person. A few facts, answers in your own words, and
              an optional résumé — upload or paste. None of this is scored by a machine.
            </p>
          </div>

          {QUESTIONS.map((q) => (
            <fieldset key={q.id} className={styles.fieldset}>
              <legend className={styles.legend}>
                <span className={styles.qnum}>{q.num}</span>
                <span className={styles.fieldTitle}>{q.label}</span>
                <span
                  className={`${styles.tag} ${q.required ? styles.tagReq : styles.tagOpt}`}
                  aria-hidden="true"
                >
                  {q.required ? "Required" : "Optional"}
                </span>
              </legend>

              {q.kind === "select" ? (
                <select
                  id={q.id}
                  name={q.id}
                  value={values[q.id]}
                  onChange={(e) => setValue(q.id, e.target.value)}
                  className={styles.select}
                >
                  <option value="">Choose the closest one</option>
                  {q.options?.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : q.kind === "input" ? (
                <input
                  id={q.id}
                  name={q.id}
                  type="text"
                  autoComplete="name"
                  required={q.required}
                  minLength={q.minlength}
                  value={values[q.id]}
                  onChange={(e) => setValue(q.id, e.target.value)}
                  placeholder={q.placeholder}
                  className={styles.input}
                  aria-describedby={q.help || q.note ? `hint-${q.id}` : undefined}
                />
              ) : (
                <textarea
                  id={q.id}
                  name={q.id}
                  rows={q.rows ?? 5}
                  required={q.required}
                  minLength={q.minlength}
                  value={values[q.id]}
                  onChange={(e) => setValue(q.id, e.target.value)}
                  placeholder={q.placeholder}
                  className={styles.textarea}
                  aria-describedby={q.help || q.note ? `hint-${q.id}` : undefined}
                />
              )}

              {q.help && (
                <p id={`hint-${q.id}`} className={styles.help}>
                  {q.help}
                </p>
              )}
              {q.note && <p className={styles.note}>{q.note}</p>}

              <p className={styles.counter} aria-live="polite">
                {(values[q.id] ?? "").length} chars
                {q.required && q.minlength ? ` · min ${q.minlength}` : ""}
              </p>
            </fieldset>
          ))}

          {/* Résumé / CV — optional, upload OR paste */}
          <fieldset className={`${styles.fieldset} ${styles.resumeBox}`}>
            <legend className={styles.resumeLegend}>
              <span className={styles.resumeLabel}>
                <FileText size={16} aria-hidden="true" />
                Résumé / CV — optional
              </span>
              {resumeMode !== "none" && (
                <span className={styles.modeChip} aria-hidden="true">
                  {resumeMode === "upload" ? "Upload" : "Paste"}
                </span>
              )}
            </legend>

            <div className={styles.segRow}>
              <p className={styles.resumeToggleNote}>Upload a file or paste its text — either is plenty.</p>
              <div className={styles.seg} role="group" aria-label="Résumé input method">
                <button
                  type="button"
                  className={styles.segBtn}
                  aria-pressed={resumeMode === "upload"}
                  onClick={() => setResumeMode("upload")}
                >
                  <Upload size={14} aria-hidden="true" />
                  Upload
                </button>
                <button
                  type="button"
                  className={styles.segBtn}
                  aria-pressed={resumeMode === "paste"}
                  onClick={() => {
                    setFile(null);
                    setFileError(null);
                    setResumeMode("paste");
                  }}
                >
                  <Clipboard size={14} aria-hidden="true" />
                  Paste
                </button>
              </div>
            </div>

            {resumeMode === "upload" && (
              <div className={styles.fileRow}>
                <label className={styles.fileBox}>
                  <FileText size={18} className={styles.fileIcon} aria-hidden="true" />
                  <span className={styles.fileName}>
                    {file ? file.name : "Choose a file"}
                  </span>
                  {file && <span className={styles.fileMeta}>{formatBytes(file.size)}</span>}
                  <input
                    type="file"
                    id="resume-file"
                    name="resume-file"
                    className={styles.fileInput}
                    accept=".pdf,.doc,.docx,.txt,.md,.rtf,image/png,image/jpeg"
                    onChange={handleFileChange}
                  />
                </label>
                {file && (
                  <button
                    type="button"
                    className={styles.removeBtn}
                    onClick={() => {
                      setFile(null);
                      setFileError(null);
                    }}
                  >
                    <X size={13} aria-hidden="true" />
                    Remove
                  </button>
                )}
              </div>
            )}

            {resumeMode === "paste" && (
              <textarea
                id="resume-text"
                name="resume-text"
                rows={7}
                maxLength={MAX_PASTE_CHARS}
                value={values["resume-text"] ?? ""}
                onChange={(e) => setValue("resume-text", e.target.value)}
                placeholder="A few lines is plenty: what you do, key work, links. Plain text, no formatting needed."
                className={`${styles.textarea} ${styles.fileRow}`}
              />
            )}

            {fileError && (
              <p className={styles.fileError} role="alert">
                {fileError}
              </p>
            )}

            <p className={styles.resumeHelp}>
              {resumeMode === "paste"
                ? `Pasted as text — up to ${MAX_PASTE_CHARS.toLocaleString()} characters.`
                : "PDF, DOC, DOCX, TXT, MD, RTF, PNG or JPG — under 10 MB."}{" "}
              Docs are read as part of your application and never shared.
            </p>
          </fieldset>

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
            />
            <label htmlFor="fax">Fax</label>
            <input
              ref={honeypotFax}
              type="text"
              id="fax"
              name="fax"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          {status === "error" && (
            <div className={styles.errorBox} role="alert">
              <p className={styles.errorTitle}>{FAIL_TITLE}</p>
              <p className={styles.errorBoxBody}>{FAIL_BODY}</p>
              <div className={styles.errorActions}>
                <button type="button" className="btn btn--ghost" onClick={() => void submit()}>
                  Try again
                </button>
                <a
                  className="btn btn--dark"
                  href={`mailto:${SITE.email}?subject=${encodeURIComponent("BGET application — resend")}`}
                >
                  Send it by email instead
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
            <button type="submit" className={`${styles.submitBtn} btn btn--primary`} disabled={sending}>
              {sending ? "Sending…" : "Submit application"}
              {!sending && <Send size={16} aria-hidden="true" />}
            </button>
            <p className={styles.submitNote}>
              Read personally, answered either way, usually within 14 days.
            </p>
          </div>
        </form>
      )}
    </div>
  );
}