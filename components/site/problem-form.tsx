"use client";

import { useState } from "react";
import { Reveal } from "@/components/motion/reveal";
import { Field, TextInput, TextArea, Select, SubmitButton, FormStatus } from "@/components/site/form-ui";

type Status = { type: "idle" | "ok" | "error"; message?: string };

const initial = {
  title: "",
  description: "",
  submitter_name: "",
  email: "",
  location: "",
  affected: "",
  tried: "",
  success_looks_like: "",
  why_bget: "",
  contribution: "",
  visibility: "bget",
  website: "", // honeypot
};

export function ProblemForm() {
  const [form, setForm] = useState(initial);
  const [status, setStatus] = useState<Status>({ type: "idle" });
  const [loading, setLoading] = useState(false);

  const set = (key: keyof typeof initial) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "idle" });
    try {
      const res = await fetch("/api/problems", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setForm(initial);
        setStatus({
          type: "ok",
          message: "Received. A human will answer within 72 hours — framed, parked, or declined with a reason.",
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
      <Reveal y={16}>
        <Field label="The problem, in one line" required>
          <TextInput name="title" value={form.title} onChange={set("title")} required />
        </Field>
      </Reveal>

      <Reveal y={16} delay={50}>
        <Field label="What is actually happening?" hint="Describe it plainly. Who lives with it? What does it cost them?" required>
          <TextArea name="description" value={form.description} onChange={set("description")} required />
        </Field>
      </Reveal>

      <Reveal y={16} delay={100}>
        <Field label="What would success look like?" hint='Make it concrete — "fewer families boiling unsafe water", not "fix the water".'>
          <TextArea name="success_looks_like" value={form.success_looks_like} onChange={set("success_looks_like")} />
        </Field>
      </Reveal>

      <Reveal y={16} delay={150}>
        <Field label="Who is affected?">
          <TextArea name="affected" value={form.affected} onChange={set("affected")} />
        </Field>
      </Reveal>

      <Reveal y={16} delay={200}>
        <Field label="What has already been tried, and why did it fall short?">
          <TextArea name="tried" value={form.tried} onChange={set("tried")} />
        </Field>
      </Reveal>

      <Reveal y={16} delay={250}>
        <Field label="Why might Build For Good be useful here?" hint="The interdisciplinary angle, a neglected corner, a research gap.">
          <TextArea name="why_bget" value={form.why_bget} onChange={set("why_bget")} />
        </Field>
      </Reveal>

      <Reveal y={16} delay={300}>
        <Field label="What can you contribute?" hint="Local knowledge counts as expertise. You may be the most valuable person on the team.">
          <TextArea name="contribution" value={form.contribution} onChange={set("contribution")} />
        </Field>
      </Reveal>

      <Reveal y={16} delay={350}>
        <div className="grid gap-8 sm:grid-cols-2">
          <Field label="Your name">
            <TextInput name="submitter_name" value={form.submitter_name} onChange={set("submitter_name")} autoComplete="name" />
          </Field>
          <Field label="Email">
            <TextInput type="email" name="email" value={form.email} onChange={set("email")} autoComplete="email" />
          </Field>
        </div>
      </Reveal>

      <Reveal y={16} delay={400}>
        <div className="grid gap-8 sm:grid-cols-2">
          <Field label="Where is the problem?">
            <TextInput name="location" value={form.location} onChange={set("location")} placeholder="Place, region, country" />
          </Field>
          <Field label="Visibility">
            <Select name="visibility" value={form.visibility} onChange={set("visibility")}>
              <option value="public">Public — Build For Good may publish it</option>
              <option value="bget">Build For Good review only</option>
              <option value="private">Private — my eyes only</option>
            </Select>
          </Field>
        </div>
      </Reveal>

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

      <Reveal y={16} delay={450}>
        <div className="flex flex-wrap items-center gap-6 pt-2">
          <SubmitButton loading={loading}>Submit the problem</SubmitButton>
          <FormStatus status={status} />
        </div>
      </Reveal>

      <Reveal y={16} delay={500}>
        <p className="text-sm text-muted-foreground max-w-xl">
          Nothing marked private is published, quoted, or shared. Every submission
          gets a human answer — framing it, parking it, or a warm decline with a reason.
        </p>
      </Reveal>
    </form>
  );
}
