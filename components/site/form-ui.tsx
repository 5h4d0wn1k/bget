"use client";

import * as React from "react";

export function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="flex items-baseline gap-2 font-mono text-[11px] tracking-[0.15em] uppercase text-muted-foreground">
        {label}
        {required ? <span className="text-[#eca8d6]">*</span> : null}
      </span>
      {hint ? <span className="mt-1 block text-sm text-muted-foreground/70">{hint}</span> : null}
      <span className="mt-3 block">{children}</span>
    </label>
  );
}

const baseInput =
  "w-full rounded-md border border-foreground/15 bg-foreground/[0.02] px-4 py-3 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-foreground/40";

export function TextInput(props: React.ComponentProps<"input">) {
  return <input {...props} className={`${baseInput} ${props.className ?? ""}`} />;
}

export function TextArea(props: React.ComponentProps<"textarea">) {
  return <textarea {...props} className={`${baseInput} min-h-[120px] resize-y ${props.className ?? ""}`} />;
}

export function Select(props: React.ComponentProps<"select">) {
  return <select {...props} className={`${baseInput} appearance-none ${props.className ?? ""}`} />;
}

export function SubmitButton({
  loading,
  children,
}: {
  loading: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-8 h-14 text-base font-medium text-background transition-all hover:bg-foreground/90 disabled:opacity-50"
    >
      {loading ? "Sending…" : children}
    </button>
  );
}

export function FormStatus({
  status,
}: {
  status: { type: "idle" | "ok" | "error"; message?: string };
}) {
  if (status.type === "idle") return null;
  return (
    <p
      role="status"
      className={`text-sm ${status.type === "ok" ? "text-[#eca8d6]" : "text-red-400"}`}
    >
      {status.message}
    </p>
  );
}
