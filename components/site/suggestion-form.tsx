"use client";

import { useState } from "react";
import { Reveal } from "@/components/motion/reveal";
import { Field, TextInput, TextArea, SubmitButton, FormStatus } from "@/components/site/form-ui";

type Status = { type: "idle" | "ok" | "error"; message?: string };
type Errors = Partial<Record<"topic" | "body" | "email", string>>;

const initial = {
  topic: "",
  body: "",
  name: "",
  email: "",
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

export function SuggestionForm() {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>({ type: "idle" });
  const [loading, setLoading] = useState(false);

  const set = (key: keyof typeof initial) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
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
    if (!form.topic.trim()) next.topic = "Give your idea a short title.";
    if (!form.body.trim()) next.body = "Tell us the idea itself.";
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
      const res = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setForm(initial);
        setStatus({
          type: "ok",
          message: "Idea received. If it fits what we're building, we'll come back to you.",
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
        <div>
          <Field label="Topic" hint="The idea in a few words." required>
            <TextInput
              id="suggestion-topic"
              name="topic"
              value={form.topic}
              onChange={set("topic")}
              required
              aria-invalid={errors.topic ? true : undefined}
              aria-describedby={errors.topic ? "suggestion-topic-error" : undefined}
            />
          </Field>
          <FieldError id="suggestion-topic-error" message={errors.topic} />
        </div>
      </Reveal>

      <Reveal y={16} delay={80}>
        <div>
          <Field
            label="Your idea"
            hint="A new activity, a partner, a way to run the community, something we're missing. Rough is fine — we're after the thought, not a proposal."
            required
          >
            <TextArea
              id="suggestion-body"
              name="body"
              value={form.body}
              onChange={set("body")}
              required
              className="min-h-[160px]"
              aria-invalid={errors.body ? true : undefined}
              aria-describedby={errors.body ? "suggestion-body-error" : undefined}
            />
          </Field>
          <FieldError id="suggestion-body-error" message={errors.body} />
        </div>
      </Reveal>

      <Reveal y={16} delay={160}>
        <div className="grid gap-8 sm:grid-cols-2">
          <Field label="Name" hint="Optional.">
            <TextInput id="suggestion-name" name="name" value={form.name} onChange={set("name")} autoComplete="name" />
          </Field>
          <div>
            <Field label="Email" hint="Optional — only if you'd like a reply.">
              <TextInput
                id="suggestion-email"
                type="email"
                name="email"
                value={form.email}
                onChange={set("email")}
                autoComplete="email"
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={errors.email ? "suggestion-email-error" : undefined}
              />
            </Field>
            <FieldError id="suggestion-email-error" message={errors.email} />
          </div>
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
          <SubmitButton loading={loading}>Send suggestion</SubmitButton>
          <FormStatus status={status} />
        </div>
      </Reveal>

      <Reveal y={16} delay={280}>
        <p className="text-sm text-muted-foreground max-w-xl">
          Suggestions are read by a human, not a queue. We'd rather hear a rough idea
          early than a polished one once it's too late to shape it.
        </p>
      </Reveal>
    </form>
  );
}
