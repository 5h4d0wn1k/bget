"use client";

import { useState } from "react";
import { Reveal } from "@/components/motion/reveal";
import {
  Field,
  TextInput,
  TextArea,
  Select,
  SubmitButton,
  FormStatus,
} from "@/components/site/form-ui";

type Status = { type: "idle" | "ok" | "error"; message?: string };
type Errors = Record<string, string>;

const STAGES = ["idea", "prototype", "pilot", "live", "scaled"] as const;

const initial = {
  title: "",
  one_liner: "",
  description: "",
  lead_name: "",
  lead_email: "",
  disciplines: "",
  stage: "",
  url: "",
  repo: "",
  demo: "",
  cover_image: "",
  location: "",
  team: "",
  tags: "",
  company: "", // honeypot — real people never see or fill this
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(form: typeof initial): Errors {
  const errors: Errors = {};
  if (!form.title.trim()) errors.title = "Give the project a title.";
  if (!form.one_liner.trim()) errors.one_liner = "Add a one-line summary.";
  if (!form.description.trim()) errors.description = "Describe what it is and why it matters.";
  if (!form.lead_name.trim()) errors.lead_name = "Tell us who leads this.";
  if (!form.lead_email.trim()) errors.lead_email = "An email is required.";
  else if (!EMAIL_RE.test(form.lead_email.trim())) errors.lead_email = "Enter a valid email address.";
  return errors;
}

/** Turn a 422 body into per-field messages when the Worker provides them. */
function mapServerErrors(data: unknown): Errors {
  const errors: Errors = {};
  if (data && typeof data === "object") {
    const body = data as Record<string, unknown>;
    if (body.errors && typeof body.errors === "object") {
      for (const [key, value] of Object.entries(body.errors as Record<string, unknown>)) {
        if (typeof value === "string" && value.trim()) errors[key] = value;
      }
    }
    if (body.error === "invalid_email") {
      errors.lead_email = errors.lead_email ?? "Enter a valid email address.";
    }
  }
  return errors;
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <span id={id} className="mt-2 block text-xs text-red-400">
      {message}
    </span>
  );
}

export function ProjectForm() {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>({ type: "idle" });
  const [loading, setLoading] = useState(false);

  const set =
    (key: keyof typeof initial) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const found = validate(form);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      setStatus({ type: "error", message: "Please fix the highlighted fields and try again." });
      return;
    }

    setErrors({});
    setLoading(true);
    setStatus({ type: "idle" });

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && (data as { ok?: boolean }).ok) {
        setForm(initial);
        setErrors({});
        setStatus({
          type: "ok",
          message:
            "Received. Your project is queued for review — once a human approves it, it will appear in the showcase above.",
        });
      } else if (res.status === 422) {
        const fieldErrors = mapServerErrors(data);
        setErrors(fieldErrors);
        setStatus({
          type: "error",
          message:
            Object.keys(fieldErrors).length > 0
              ? "Some details need fixing — see the highlighted fields."
              : "Some required details are missing. Please review the form and try again.",
        });
      } else {
        setStatus({
          type: "error",
          message: "Something went wrong. Please try again in a moment.",
        });
      }
    } catch {
      setStatus({ type: "error", message: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  const err = (key: string) => (errors[key] ? `${key}-error` : undefined);

  return (
    <form onSubmit={onSubmit} noValidate className="grid max-w-2xl gap-8">
      <Reveal y={16}>
        <Field label="Project title" required>
          <TextInput
            id="title"
            name="title"
            value={form.title}
            onChange={set("title")}
            required
            aria-invalid={Boolean(errors.title)}
            aria-describedby={err("title")}
          />
          <FieldError id="title-error" message={errors.title} />
        </Field>
      </Reveal>

      <Reveal y={16} delay={50}>
        <Field label="One-line summary" hint="What it is, in a sentence — the card blurb." required>
          <TextInput
            id="one_liner"
            name="one_liner"
            value={form.one_liner}
            onChange={set("one_liner")}
            required
            aria-invalid={Boolean(errors.one_liner)}
            aria-describedby={err("one_liner")}
          />
          <FieldError id="one_liner-error" message={errors.one_liner} />
        </Field>
      </Reveal>

      <Reveal y={16} delay={100}>
        <Field
          label="Description"
          hint="What it does, who it is for, and what stage the work has reached."
          required
        >
          <TextArea
            id="description"
            name="description"
            value={form.description}
            onChange={set("description")}
            required
            aria-invalid={Boolean(errors.description)}
            aria-describedby={err("description")}
          />
          <FieldError id="description-error" message={errors.description} />
        </Field>
      </Reveal>

      <Reveal y={16} delay={150}>
        <div className="grid gap-8 sm:grid-cols-2">
          <Field label="Lead name" required>
            <TextInput
              id="lead_name"
              name="lead_name"
              value={form.lead_name}
              onChange={set("lead_name")}
              required
              autoComplete="name"
              aria-invalid={Boolean(errors.lead_name)}
              aria-describedby={err("lead_name")}
            />
            <FieldError id="lead_name-error" message={errors.lead_name} />
          </Field>
          <Field label="Lead email" required>
            <TextInput
              id="lead_email"
              type="email"
              name="lead_email"
              value={form.lead_email}
              onChange={set("lead_email")}
              required
              autoComplete="email"
              aria-invalid={Boolean(errors.lead_email)}
              aria-describedby={err("lead_email")}
            />
            <FieldError id="lead_email-error" message={errors.lead_email} />
          </Field>
        </div>
      </Reveal>

      <Reveal y={16} delay={200}>
        <div className="grid gap-8 sm:grid-cols-2">
          <Field label="Disciplines" hint="e.g. software, hardware, medicine, design">
            <TextInput
              id="disciplines"
              name="disciplines"
              value={form.disciplines}
              onChange={set("disciplines")}
            />
          </Field>
          <Field label="Stage">
            <Select id="stage" name="stage" value={form.stage} onChange={set("stage")}>
              <option value="">Select a stage</option>
              {STAGES.map((stage) => (
                <option key={stage} value={stage}>
                  {stage.charAt(0).toUpperCase() + stage.slice(1)}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </Reveal>

      <Reveal y={16} delay={250}>
        <div className="grid gap-8 sm:grid-cols-2">
          <Field label="Tags" hint="Comma separated — e.g. climate, open source, water">
            <TextInput id="tags" name="tags" value={form.tags} onChange={set("tags")} />
          </Field>
          <Field label="Location">
            <TextInput
              id="location"
              name="location"
              value={form.location}
              onChange={set("location")}
              placeholder="City, country"
            />
          </Field>
        </div>
      </Reveal>

      <Reveal y={16} delay={300}>
        <Field label="Team" hint="Names or roles of collaborators, if any.">
          <TextInput id="team" name="team" value={form.team} onChange={set("team")} />
        </Field>
      </Reveal>

      <Reveal y={16} delay={350}>
        <div className="grid gap-8 sm:grid-cols-2">
          <Field label="Website" hint="Optional.">
            <TextInput
              id="url"
              name="url"
              value={form.url}
              onChange={set("url")}
              placeholder="https://"
            />
          </Field>
          <Field label="Repository" hint="Optional.">
            <TextInput
              id="repo"
              name="repo"
              value={form.repo}
              onChange={set("repo")}
              placeholder="https://github.com/…"
            />
          </Field>
        </div>
      </Reveal>

      <Reveal y={16} delay={400}>
        <div className="grid gap-8 sm:grid-cols-2">
          <Field label="Live demo" hint="Optional.">
            <TextInput
              id="demo"
              name="demo"
              value={form.demo}
              onChange={set("demo")}
              placeholder="https://"
            />
          </Field>
          <Field label="Cover image" hint="Optional — a direct image URL.">
            <TextInput
              id="cover_image"
              name="cover_image"
              value={form.cover_image}
              onChange={set("cover_image")}
              placeholder="https://…/cover.jpg"
            />
          </Field>
        </div>
      </Reveal>

      {/* Honeypot — hidden from people, catches bots. */}
      <input
        type="text"
        id="company"
        name="company"
        value={form.company}
        onChange={set("company")}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      <Reveal y={16} delay={450}>
        <div className="flex flex-wrap items-center gap-6 pt-2">
          <SubmitButton loading={loading}>Submit a project</SubmitButton>
          <span aria-live="polite">
            <FormStatus status={status} />
          </span>
        </div>
      </Reveal>

      <Reveal y={16} delay={500}>
        <p className="max-w-xl text-sm text-muted-foreground">
          Every submission is reviewed by a person before it is published. Approved projects appear
          in the showcase above with their current stage; you can ask us to update or remove yours
          at any time.
        </p>
      </Reveal>
    </form>
  );
}
