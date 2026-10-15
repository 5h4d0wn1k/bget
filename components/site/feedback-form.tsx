"use client";

import { useState } from "react";
import { Reveal } from "@/components/motion/reveal";
import { Field, TextInput, TextArea, Select, SubmitButton, FormStatus } from "@/components/site/form-ui";

type Status = { type: "idle" | "ok" | "error"; message?: string };
type Errors = Partial<Record<"body" | "email", string>>;

const initial = {
  kind: "idea",
  page: "",
  body: "",
  email: "",
  rating: "",
  company: "", // honeypot
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <span id={id} className="mt-2 block text-sm text-red-400">
      {message}
    </span>
  );
}

export function FeedbackForm() {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>({ type: "idle" });
  const [loading, setLoading] = useState(false);

  const set = (key: keyof typeof initial) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key as keyof Errors];
      return next;
    });
  };

  function validate(): Errors {
    const next: Errors = {};
    if (!form.body.trim()) next.body = "Please tell us what happened.";
    if (form.email.trim() && !EMAIL_RE.test(form.email.trim()))
      next.email = "That doesn't look like a valid email address.";
    return next;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const found = validate();
    if (Object.keys(found).length > 0) {
      setErrors(found);
      setStatus({ type: "error", message: "Please fix the highlighted fields and try again." });
      return;
    }
    setErrors({});
    setLoading(true);
    setStatus({ type: "idle" });
    try {
      const payload: Record<string, unknown> = {
        kind: form.kind || "idea",
        page: form.page,
        body: form.body,
        email: form.email,
        company: form.company,
      };
      if (form.rating) payload.rating = Number(form.rating);

      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setForm(initial);
        setStatus({
          type: "ok",
          message: "Thank you. Feedback like this is how the site actually gets better.",
        });
      } else if (res.status === 422) {
        setStatus({ type: "error", message: "Some details were missing or invalid. Please check and try again." });
      } else {
        setStatus({ type: "error", message: "Something went wrong. Please try again in a moment." });
      }
    } catch {
      setStatus({ type: "error", message: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-8 max-w-2xl">
      <Reveal y={16}>
        <div className="grid gap-8 sm:grid-cols-2">
          <Field label="What kind of feedback is this?" required>
            <Select id="feedback-kind" name="kind" value={form.kind} onChange={set("kind")}>
              <option value="idea">An idea</option>
              <option value="bug">Something is broken</option>
              <option value="praise">Something worked well</option>
              <option value="other">Something else</option>
            </Select>
          </Field>
          <Field label="Page or area" hint="Optional — where did you see it?">
            <TextInput
              id="feedback-page"
              name="page"
              value={form.page}
              onChange={set("page")}
              placeholder="e.g. /membership, the footer"
            />
          </Field>
        </div>
      </Reveal>

      <Reveal y={16} delay={80}>
        <div>
          <Field
            label="Your feedback"
            hint="What did you see, and what did you expect instead? Plain and specific beats polished."
            required
          >
            <TextArea
              id="feedback-body"
              name="body"
              value={form.body}
              onChange={set("body")}
              required
              className="min-h-[160px]"
              aria-invalid={errors.body ? true : undefined}
              aria-describedby={errors.body ? "feedback-body-error" : undefined}
            />
          </Field>
          <FieldError id="feedback-body-error" message={errors.body} />
        </div>
      </Reveal>

      <Reveal y={16} delay={160}>
        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <Field label="Email" hint="Optional — only if you'd like a reply.">
              <TextInput
                id="feedback-email"
                type="email"
                name="email"
                value={form.email}
                onChange={set("email")}
                autoComplete="email"
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={errors.email ? "feedback-email-error" : undefined}
              />
            </Field>
            <FieldError id="feedback-email-error" message={errors.email} />
          </div>
          <Field label="How is it going overall?" hint="Optional — 1 is rough, 5 is great.">
            <Select id="feedback-rating" name="rating" value={form.rating} onChange={set("rating")}>
              <option value="">No rating</option>
              <option value="1">1 — rough</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5 — great</option>
            </Select>
          </Field>
        </div>
      </Reveal>

      {/* Honeypot — hidden from people, catches bots. */}
      <input
        type="text"
        name="company"
        value={form.company}
        onChange={set("company")}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      <Reveal y={16} delay={220}>
        <div className="flex flex-wrap items-center gap-6 pt-2" aria-live="polite">
          <SubmitButton loading={loading}>Send feedback</SubmitButton>
          <FormStatus status={status} />
        </div>
      </Reveal>

      <Reveal y={16} delay={280}>
        <p className="text-sm text-muted-foreground max-w-xl">
          Bug reports and sharp criticism are welcome — they're how the site earns the
          trust of the people using it. We won't publish your feedback without asking.
        </p>
      </Reveal>
    </form>
  );
}
