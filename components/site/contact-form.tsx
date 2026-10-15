"use client";

import { useState } from "react";
import { Reveal } from "@/components/motion/reveal";
import { Field, TextInput, TextArea, SubmitButton, FormStatus } from "@/components/site/form-ui";

type Status = { type: "idle" | "ok" | "error"; message?: string };
type Errors = Partial<Record<"name" | "email" | "message", string>>;

const initial = {
  name: "",
  email: "",
  subject: "",
  message: "",
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

export function ContactForm() {
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
    if (!form.name.trim()) next.name = "Please tell us your name.";
    if (!form.email.trim()) next.email = "Please add an email so we can reply.";
    else if (!EMAIL_RE.test(form.email.trim())) next.email = "That doesn't look like a valid email address.";
    if (!form.message.trim()) next.message = "Please write a message.";
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
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setForm(initial);
        setStatus({
          type: "ok",
          message: "Message received. A human will read it — expect a reply within 72 hours.",
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
          <div>
            <Field label="Name" required>
              <TextInput
                id="contact-name"
                name="name"
                value={form.name}
                onChange={set("name")}
                required
                autoComplete="name"
                aria-invalid={errors.name ? true : undefined}
                aria-describedby={errors.name ? "contact-name-error" : undefined}
              />
            </Field>
            <FieldError id="contact-name-error" message={errors.name} />
          </div>
          <div>
            <Field label="Email" required>
              <TextInput
                id="contact-email"
                type="email"
                name="email"
                value={form.email}
                onChange={set("email")}
                required
                autoComplete="email"
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={errors.email ? "contact-email-error" : undefined}
              />
            </Field>
            <FieldError id="contact-email-error" message={errors.email} />
          </div>
        </div>
      </Reveal>

      <Reveal y={16} delay={80}>
        <Field label="Subject" hint="Optional — a few words on what this is about.">
          <TextInput id="contact-subject" name="subject" value={form.subject} onChange={set("subject")} />
        </Field>
      </Reveal>

      <Reveal y={16} delay={160}>
        <div>
          <Field label="Message" required>
            <TextArea
              id="contact-message"
              name="message"
              value={form.message}
              onChange={set("message")}
              required
              aria-invalid={errors.message ? true : undefined}
              aria-describedby={errors.message ? "contact-message-error" : undefined}
            />
          </Field>
          <FieldError id="contact-message-error" message={errors.message} />
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
          <SubmitButton loading={loading}>Send message</SubmitButton>
          <FormStatus status={status} />
        </div>
      </Reveal>

      <Reveal y={16} delay={280}>
        <p className="text-sm text-muted-foreground max-w-xl">
          We read every message ourselves and never pass your details to anyone else.
          If it belongs with someone specific, we'll say so when we reply.
        </p>
      </Reveal>
    </form>
  );
}
