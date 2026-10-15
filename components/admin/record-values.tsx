"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatValue, isUrl, labelize, statusDot, statusTone } from "./config";

/** A status pill with a tone-coloured dot. Renders a dash when status is empty. */
export function StatusBadge({
  status,
  className,
}: {
  status?: string | null;
  className?: string;
}) {
  if (!status) {
    return <span className="text-muted-foreground/40">—</span>;
  }
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 rounded-full px-2.5 py-0.5 font-medium",
        statusTone(status),
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn("size-1.5 shrink-0 rounded-full", statusDot(status))}
      />
      {labelize(status)}
    </Badge>
  );
}

/**
 * Render an arbitrary admin value safely:
 * empty -> em dash, URLs -> links, arrays -> chips, objects -> pretty JSON,
 * everything else -> plain text (multi-line preserved).
 */
export function Value({
  value,
  className,
}: {
  value: unknown;
  className?: string;
}) {
  if (value === null || value === undefined || value === "") {
    return <span className="text-muted-foreground/40">—</span>;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span className="text-muted-foreground/40">—</span>;
    }
    return (
      <span className="flex flex-wrap gap-1.5">
        {value.map((item, i) => (
          <span
            key={i}
            className="rounded-md border border-foreground/10 bg-foreground/[0.04] px-2 py-0.5 text-xs text-foreground/90"
          >
            {formatValue(item) || "—"}
          </span>
        ))}
      </span>
    );
  }

  if (typeof value === "object") {
    return (
      <pre
        className={cn(
          "max-w-full overflow-x-auto whitespace-pre-wrap break-words rounded-lg border border-foreground/10 bg-foreground/[0.03] p-3 font-mono text-xs leading-relaxed text-muted-foreground",
          className,
        )}
      >
        {formatValue(value)}
      </pre>
    );
  }

  const text = String(value);

  if (isUrl(text)) {
    return (
      <a
        href={text}
        target="_blank"
        rel="noreferrer noopener"
        className={cn("link-underline break-all text-[#eca8d6]", className)}
      >
        {text}
      </a>
    );
  }

  return (
    <span className={cn("whitespace-pre-wrap break-words", className)}>{text}</span>
  );
}
