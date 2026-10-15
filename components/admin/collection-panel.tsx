"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, ExternalLink, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  apiFetch,
  COLLECTIONS_BY_KEY,
  fieldLabel,
  formatDate,
  isUnauthorized,
  labelize,
  PAGE_SIZE,
  preview,
  quickActionClass,
  type AdminRecord,
  type CollectionConfig,
  type CollectionKey,
} from "./config";
import { RecordDetail } from "./record-detail";
import { StatusBadge } from "./record-values";

type Props = {
  collection: CollectionKey;
  onMutated: () => void;
  onUnauthorized: () => void;
};

export function CollectionPanel({ collection, onMutated, onUnauthorized }: Props) {
  const config = COLLECTIONS_BY_KEY[collection];

  const [items, setItems] = useState<AdminRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("all");
  const [offset, setOffset] = useState(0);
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());
  const [detailId, setDetailId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (status !== "all") params.set("status", status);
    params.set("limit", String(PAGE_SIZE));
    params.set("offset", String(offset));

    const { res, data } = await apiFetch(`/api/admin/${collection}?${params.toString()}`);
    if (isUnauthorized(res)) {
      onUnauthorized();
      return;
    }
    if (!res.ok || !data || data.ok !== true) {
      setError("Could not load this collection.");
      setItems([]);
      setTotal(0);
      setLoading(false);
      return;
    }
    setItems(Array.isArray(data.items) ? (data.items as AdminRecord[]) : []);
    setTotal(typeof data.total === "number" ? data.total : 0);
    setLoading(false);
  }, [collection, status, offset, onUnauthorized]);

  useEffect(() => {
    void load();
  }, [load]);

  const setBusy = useCallback((id: AdminRecord["id"], busy: boolean) => {
    setBusyIds((prev) => {
      const next = new Set(prev);
      const key = String(id);
      if (busy) next.add(key);
      else next.delete(key);
      return next;
    });
  }, []);

  const patch = useCallback(
    async (id: AdminRecord["id"], body: Record<string, unknown>) => {
      const key = String(id);
      const previous = items;
      setBusy(id, true);
      // Optimistic update.
      setItems((prev) =>
        prev.map((it) => (String(it.id) === key ? { ...it, ...body } : it)),
      );
      try {
        const { res } = await apiFetch(
          `/api/admin/${collection}/${encodeURIComponent(key)}`,
          {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(body),
          },
        );
        if (isUnauthorized(res)) {
          onUnauthorized();
          return;
        }
        if (!res.ok) throw new Error("patch_failed");
        toast.success("Saved");
        onMutated();
        // When a status filter is active, a status change may move the row out
        // of the current view — refetch so the list stays honest.
        if (status !== "all" && "status" in body) void load();
      } catch {
        setItems(previous);
        toast.error("Could not save. Change reverted.");
      } finally {
        setBusy(id, false);
      }
    },
    [collection, items, load, onMutated, onUnauthorized, setBusy, status],
  );

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    setDeleting(true);
    try {
      const { res } = await apiFetch(
        `/api/admin/${collection}/${encodeURIComponent(String(id))}`,
        { method: "DELETE" },
      );
      if (isUnauthorized(res)) {
        onUnauthorized();
        return;
      }
      if (!res.ok) throw new Error("delete_failed");
      toast.success("Deleted");
      setDeleteTarget(null);
      setDetailId(null);
      onMutated();
      // Step back a page if we just removed the last row on it.
      if (items.length === 1 && offset >= PAGE_SIZE) {
        setOffset((o) => Math.max(0, o - PAGE_SIZE));
      } else {
        void load();
      }
    } catch {
      toast.error("Could not delete. Nothing was removed.");
    } finally {
      setDeleting(false);
    }
  }, [collection, deleteTarget, items.length, load, offset, onMutated, onUnauthorized]);

  const detailRecord = useMemo(
    () => items.find((it) => String(it.id) === detailId) ?? null,
    [items, detailId],
  );

  const start = total === 0 ? 0 : offset + 1;
  const end = Math.min(offset + PAGE_SIZE, total);
  const hasPrev = offset > 0;
  const hasNext = offset + PAGE_SIZE < total;

  const goStatus = (next: string) => {
    setStatus(next);
    setOffset(0);
  };

  return (
    <div className="grid gap-5">
      {/* Filter + count */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div
          className="flex flex-nowrap items-center gap-1 overflow-x-auto pb-1"
          role="group"
          aria-label="Filter by status"
        >
          <FilterChip active={status === "all"} onClick={() => goStatus("all")}>
            All
          </FilterChip>
          {config.statuses.map((s) => (
            <FilterChip key={s} active={status === s} onClick={() => goStatus(s)}>
              {labelize(s)}
            </FilterChip>
          ))}
        </div>
        <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
          {loading ? "Loading…" : `${total} ${total === 1 ? config.noun : config.label.toLowerCase()}`}
        </p>
      </div>

      {/* Content */}
      {loading ? (
        <ListSkeleton />
      ) : error ? (
        <EmptyState
          title="Couldn't load this collection"
          body={error}
          action={
            <Button size="sm" variant="outline" onClick={() => void load()}>
              Try again
            </Button>
          }
        />
      ) : items.length === 0 ? (
        <EmptyState
          title={status === "all" ? `No ${config.label.toLowerCase()} yet` : `Nothing ${status}`}
          body={
            status === "all"
              ? `New ${config.label.toLowerCase()} will appear here.`
              : "Try a different status filter."
          }
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-14">#</TableHead>
                  <TableHead>{labelFor(config, config.primaryKey)}</TableHead>
                  {config.columns.map((c) => (
                    <TableHead key={c.key}>{c.label}</TableHead>
                  ))}
                  <TableHead>Created</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((record) => (
                  <TableRow key={String(record.id)}>
                    <TableCell className="align-top font-mono text-xs text-muted-foreground">
                      {String(record.id)}
                    </TableCell>
                    <TableCell className="max-w-[280px] align-top">
                      <button
                        type="button"
                        onClick={() => setDetailId(String(record.id))}
                        className="block max-w-full truncate text-left font-medium hover:text-[#eca8d6] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        title={preview(record[config.primaryKey], 200)}
                      >
                        {preview(record[config.primaryKey], 90) || "(no title)"}
                      </button>
                      {config.publicPath?.(record) ? (
                        <PublicLink url={config.publicPath(record)!} className="mt-1" />
                      ) : null}
                    </TableCell>
                    {config.columns.map((c) => (
                      <TableCell
                        key={c.key}
                        className="max-w-[220px] truncate align-top text-muted-foreground"
                        title={preview(record[c.key], 200)}
                      >
                        {preview(record[c.key], 60) || "—"}
                      </TableCell>
                    ))}
                    <TableCell className="whitespace-nowrap align-top text-xs text-muted-foreground">
                      {formatDate(record.created_at) || "—"}
                    </TableCell>
                    <TableCell className="align-top">
                      <StatusBadge status={typeof record.status === "string" ? record.status : null} />
                    </TableCell>
                    <TableCell className="align-top">
                      <RowActions
                        record={record}
                        config={config}
                        busy={busyIds.has(String(record.id))}
                        onPatch={patch}
                        onOpen={() => setDetailId(String(record.id))}
                        onDelete={() => setDeleteTarget(record)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile cards */}
          <ul className="grid gap-3 md:hidden">
            {items.map((record) => (
              <li key={String(record.id)}>
                <Card className="gap-4 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <button
                        type="button"
                        onClick={() => setDetailId(String(record.id))}
                        className="block max-w-full truncate text-left font-medium hover:text-[#eca8d6]"
                      >
                        {preview(record[config.primaryKey], 80) || "(no title)"}
                      </button>
                      <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                        #{String(record.id)} · {formatDate(record.created_at) || "—"}
                      </p>
                    </div>
                    <StatusBadge status={typeof record.status === "string" ? record.status : null} />
                  </div>

                  <dl className="grid gap-1.5 text-sm">
                    {config.columns.map((c) => (
                      <div key={c.key} className="flex gap-3">
                        <dt className="w-24 shrink-0 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                          {c.label}
                        </dt>
                        <dd className="min-w-0 flex-1 truncate text-muted-foreground">
                          {preview(record[c.key], 80) || "—"}
                        </dd>
                      </div>
                    ))}
                  </dl>

                  {config.publicPath?.(record) ? (
                    <PublicLink url={config.publicPath(record)!} />
                  ) : null}

                  <RowActions
                    record={record}
                    config={config}
                    busy={busyIds.has(String(record.id))}
                    onPatch={patch}
                    onOpen={() => setDetailId(String(record.id))}
                    onDelete={() => setDeleteTarget(record)}
                  />
                </Card>
              </li>
            ))}
          </ul>

          {/* Pagination */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-foreground/10 pt-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
              Showing {start}–{end} of {total}
            </p>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={!hasPrev}
                onClick={() => setOffset((o) => Math.max(0, o - PAGE_SIZE))}
              >
                <ChevronLeft className="size-4" />
                Prev
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={!hasNext}
                onClick={() => setOffset((o) => o + PAGE_SIZE)}
              >
                Next
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </>
      )}

      {detailRecord ? (
        <RecordDetail
          record={detailRecord}
          config={config}
          busy={busyIds.has(String(detailRecord.id))}
          onPatch={patch}
          onRequestDelete={(r) => setDeleteTarget(r)}
          onClose={() => setDetailId(null)}
        />
      ) : null}

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open && !deleting) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this {config.noun}?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes #{deleteTarget ? String(deleteTarget.id) : ""} from{" "}
              {config.label}. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              onClick={(e) => {
                e.preventDefault();
                void confirmDelete();
              }}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function labelFor(config: CollectionConfig, key: string): string {
  const col = config.columns.find((c) => c.key === key);
  return col ? col.label : fieldLabel(key);
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "shrink-0 whitespace-nowrap rounded-full border px-3 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        active
          ? "border-[#eca8d6]/50 bg-[#eca8d6]/10 text-[#eca8d6]"
          : "border-foreground/15 text-muted-foreground hover:border-foreground/30 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function PublicLink({ url, className }: { url: string; className?: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer noopener"
      className={cn(
        "inline-flex w-fit items-center gap-1 text-xs text-[#eca8d6] underline-offset-4 hover:underline",
        className,
      )}
    >
      View public page
      <ExternalLink className="size-3" />
    </a>
  );
}

function RowActions({
  record,
  config,
  busy,
  onPatch,
  onOpen,
  onDelete,
}: {
  record: AdminRecord;
  config: CollectionConfig;
  busy: boolean;
  onPatch: (id: AdminRecord["id"], body: Record<string, unknown>) => void;
  onOpen: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {config.quickActions.map((action) => (
        <Button
          key={action.status}
          type="button"
          size="sm"
          variant="outline"
          disabled={busy || record.status === action.status}
          className={quickActionClass(action.tone)}
          onClick={() => onPatch(record.id, { status: action.status })}
        >
          {action.label}
        </Button>
      ))}

      <Select
        value={typeof record.status === "string" ? record.status : ""}
        onValueChange={(value) => onPatch(record.id, { status: value })}
        disabled={busy}
      >
        <SelectTrigger size="sm" aria-label="Set status" className="w-[130px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {config.statuses.map((s) => (
            <SelectItem key={s} value={s}>
              {labelize(s)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button type="button" size="sm" variant="ghost" onClick={onOpen} disabled={busy}>
        Details
      </Button>
      <Button
        type="button"
        size="icon-sm"
        variant="ghost"
        aria-label={`Delete ${config.noun} ${String(record.id)}`}
        className="text-red-300 hover:bg-red-400/10 hover:text-red-200"
        onClick={onDelete}
        disabled={busy}
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="grid gap-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full" />
      ))}
    </div>
  );
}

function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body?: string;
  action?: React.ReactNode;
}) {
  return (
    <Card className="items-center gap-3 border-dashed px-6 py-14 text-center">
      <p className="font-display text-2xl">{title}</p>
      {body ? <p className="max-w-md text-sm text-muted-foreground">{body}</p> : null}
      {action}
    </Card>
  );
}
