"use client";

import { useState } from "react";
import { Field, TextInput, TextArea, SubmitButton, FormStatus } from "@/components/site/form-ui";

type Status = { type: "idle" | "ok" | "error"; message?: string };

const initial = {
  name: "",
  email: "",
  location: "",
  disciplines: "",
  links: "",
  building: "",
  struggling: "",
  why_bget: "",
  referral: "",
  website: "", // honeypot
};

export function ApplyForm() {
  const [form, setForm] = useState(initial);
  const [status, setStatus] = useState<Status>({ type: "idle" });
  const [loading, setLoading] = useState(false);

  const set = (key: keyof typeof initial) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "idle" });
    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setForm(initial);
        setStatus({
          type: "ok",
          message: "Thank you. A human will read this — you'll hear back within 72 hours.",
        });
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
    <form onSubmit={onSubmit} className="grid gap-8 max-w-2xl">
      <div className="grid gap-8 sm:grid-cols-2">
        <Field label="Name" required>
          <TextInput name="name" value={form.name} onChange={set("name")} required autoComplete="name" />
        </Field>
        <Field label="Email" required>
          <TextInput type="email" name="email" value={form.email} onChange={set("email")} required autoComplete="email" />
        </Field>
      </div>

      <div className="grid gap-8 sm:grid-cols-2">
        <Field label="Where you are">
          <TextInput name="location" value={form.location} onChange={set("location")} placeholder="City, country" autoComplete="address-level2" />
        </Field>
        <Field label="Disciplines">
          <TextInput name="disciplines" value={form.disciplines} onChange={set("disciplines")} placeholder="e.g. medicine, ML, design" />
        </Field>
      </div>

      <Field label="One thing you have made" hint="A link, a repo, a lab result, a business, a drawing — small and honest beats impressive-sounding." required>
        <TextArea name="building" value={form.building} onChange={set("building")} required />
      </Field>

      <Field label="Something you're genuinely struggling with">
        <TextArea name="struggling" value={form.struggling} onChange={set("struggling")} />
      </Field>

      <Field label="Why BGET, and what you want to become">
        <TextArea name="why_bget" value={form.why_bget} onChange={set("why_bget")} />
      </Field>

      <div className="grid gap-8 sm:grid-cols-2">
        <Field label="Links" hint="GitHub, portfolio, writing — optional.">
          <TextInput name="links" value={form.links} onChange={set("links")} />
        </Field>
        <Field label="Referred by" hint="A member's name, if any.">
          <TextInput name="referral" value={form.referral} onChange={set("referral")} />
        </Field>
      </div>

      {/* Honeypot — hidden from people, catches bots. */}
      <input
        type="text"
        name="website"
        value={form.website}
        onChange={set("website")}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      <div className="flex flex-wrap items-center gap-6 pt-2">
        <SubmitButton loading={loading}>Apply to join</SubmitButton>
        <FormStatus status={status} />
      </div>

      <p className="text-sm text-muted-foreground max-w-xl">
        We keep applications private, use them only to decide membership, and never
        publish or share them. You can ask us to delete yours at any time.
      </p>
    </form>
  );
}
