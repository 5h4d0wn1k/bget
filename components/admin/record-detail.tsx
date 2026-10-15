"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  fieldLabel,
  labelize,
  orderedKeys,
  type AdminRecord,
  type CollectionConfig,
} from "./config";
import { StatusBadge, Value } from "./record-values";

export function RecordDetail({
  record,
  config,
  busy,
  onPatch,
  onRequestDelete,
  onClose,
}: {
  record: AdminRecord;
  config: CollectionConfig;
  busy: boolean;
  onPatch: (id: AdminRecord["id"], body: Record<string, unknown>) => void;
  onRequestDelete: (record: AdminRecord) => void;
  onClose: () => void;
}) {
  const [notes, setNotes] = useState(
    typeof record.notes === "string" ? record.notes : "",
  );

  // Reset the local notes buffer whenever a different record is shown.
  useEffect(() => {
    setNotes(typeof record.notes === "string" ? record.notes : "");
  }, [record.id, record.notes]);

  const notesDirty = notes !== (typeof record.notes === "string" ? record.notes : "");
  const keys = orderedKeys(config, record);
  const publicUrl = config.publicPath ? config.publicPath(record) : null;

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {labelize(config.noun)} #{String(record.id)}
          </DialogTitle>
          <DialogDescription>
            Full record. Edits are saved to the database.
          </DialogDescription>
        </DialogHeader>

        {publicUrl ? (
          <a
            href={publicUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex w-fit items-center gap-2 rounded-md border border-[#eca8d6]/40 bg-[#eca8d6]/10 px-3 py-2 text-sm text-[#eca8d6] hover:bg-[#eca8d6]/20"
          >
            View public page
            <ExternalLink className="size-4" />
          </a>
        ) : null}

        <dl className="grid gap-px overflow-hidden rounded-lg border border-foreground/10 bg-foreground/10">
          {keys.map((key) => (
            <div
              key={key}
              className="grid gap-1 bg-background p-3 sm:grid-cols-[160px_1fr] sm:gap-4"
            >
              <dt className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                {fieldLabel(key)}
              </dt>
              <dd className="min-w-0 text-sm">
                {key === "status" ? (
                  <StatusBadge status={typeof record.status === "string" ? record.status : null} />
                ) : (
                  <Value value={record[key]} />
                )}
              </dd>
            </div>
          ))}
        </dl>

        <Separator className="my-1" />

        <div className="grid gap-3">
          <label
            htmlFor="admin-notes"
            className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground"
          >
            Internal notes
          </label>
          <Textarea
            id="admin-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes visible only to admins…"
            rows={4}
            disabled={busy}
          />
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              size="sm"
              disabled={busy || !notesDirty}
              onClick={() => onPatch(record.id, { notes })}
            >
              {notesDirty ? "Save notes" : "Saved"}
            </Button>
            {notesDirty ? (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={busy}
                onClick={() => setNotes(typeof record.notes === "string" ? record.notes : "")}
              >
                Discard
              </Button>
            ) : null}
          </div>
        </div>

        <DialogFooter className="flex-row justify-between gap-3 sm:justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-red-400/40 text-red-300 hover:bg-red-400/10"
            disabled={busy}
            onClick={() => onRequestDelete(record)}
          >
            <Trash2 className="size-4" />
            Delete
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
