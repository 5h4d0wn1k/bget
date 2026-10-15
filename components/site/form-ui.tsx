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
    <label className="group block">
      <span className="flex items-baseline gap-2 font-mono text-[11px] tracking-[0.15em] uppercase text-muted-foreground transition-colors group-focus-within:text-foreground">
        {label}
        {required ? <span className="text-[#eca8d6]">*</span> : null}
      </span>
      {hint ? <span className="mt-1 block text-sm text-muted-foreground/70">{hint}</span> : null}
      <span className="mt-3 block">{children}</span>
    </label>
  );
}

const baseInput =
  "w-full rounded-md border border-foreground/15 bg-foreground/[0.02] px-4 py-3 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 hover:border-foreground/25 focus:border-foreground/40 focus:bg-foreground/[0.04]";

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
      className="hover-lift inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-8 h-14 text-base font-medium text-background hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:hover:transform-none"
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
      className={`animate-in fade-in slide-in-from-bottom-1 duration-300 text-sm ${status.type === "ok" ? "text-[#eca8d6]" : "text-red-400"}`}
    >
      {status.message}
    </p>
  );
}
