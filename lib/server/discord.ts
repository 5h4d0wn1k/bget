/**
 * Shared server-side helpers for form delivery.
 *
 * BGET forms never expose secrets to the browser. On Cloudflare Workers the
 * Discord webhooks live in environment bindings (server-side only); on local
 * dev they come from process.env. No webhook URL ever ships to the client.
 */

export type BgetFormKind = "apply" | "problems";

export interface DiscordWebhookPayload {
  username: string;
  embeds: {
    title: string;
    description?: string;
    color: number;
    fields: { name: string; value: string; inline?: boolean }[];
    timestamp: string;
    footer?: { text: string };
  }[];
  allowed_mentions: { parse: [] };
}

function discordEnv(kind: BgetFormKind): string | undefined {
  // Cloudflare Workers binding (OpenNext/vinext) — resolve from the context if present.
  try {
    const { getCloudflareContext } = require("@opennextjs/cloudflare");
    const ctx = getCloudflareContext({ async: false });
    const key = kind === "apply" ? "DISCORD_APPLY_WEBHOOK" : "DISCORD_PROBLEMS_WEBHOOK";
    const bound = ctx?.env?.[key];
    if (typeof bound === "string") return bound;
  } catch {
    /* not running on Cloudflare */
  }
  return kind === "apply"
    ? process.env.DISCORD_APPLY_WEBHOOK
    : process.env.DISCORD_PROBLEMS_WEBHOOK;
}

/**
 * Discord soft-caps a single embed at roughly 6000 combined characters
 * (title + field names/values + timestamp + footer); anything over that gets
 * a 400 from the webhook. A fully-answered apply form (12 essays + résumé)
 * can exceed it, so we budget to 5500 and shrink field values to fit rather
 * than let a legitimate submission bounce.
 */
const MAX_EMBED_CHARS = 5500;

/** Keep every field name (≤256); shrink field values so the embed fits. */
function fitEmbedWithinBudget(
  title: string,
  fields: { name: string; value: string }[],
  timestamp: string,
  footerText: string
): { name: string; value: string }[] {
  const fixed = title.length + timestamp.length + footerText.length;
  const total = fixed + fields.reduce((sum, f) => sum + f.name.length + f.value.length, 0);
  if (total <= MAX_EMBED_CHARS) return fields; // already within budget — send as-is.

  let used = fixed;
  return fields.map((f) => {
    const name = f.name.slice(0, 256);
    const valueBudget = Math.max(0, MAX_EMBED_CHARS - used - name.length);
    const value = f.value.slice(0, Math.min(f.value.length, 1024, valueBudget));
    used += name.length + value.length;
    return { name, value };
  });
}

/** POST a rendered embed to the right Discord webhook. Returns false if unconfigured. */
export async function deliverToDiscord(
  kind: BgetFormKind,
  title: string,
  fields: { name: string; value: string }[]
): Promise<boolean> {
  const webhook = discordEnv(kind);
  if (!webhook) return false;

  const timestamp = new Date().toISOString();

  const payload: DiscordWebhookPayload = {
    username: "BGET Formbot",
    embeds: [
      {
        title,
        color: kind === "apply" ? 0x1f7a4d : 0xe8b84b,
        fields: fitEmbedWithinBudget(title, fields, timestamp, "BGET"),
        timestamp,
        footer: { text: "BGET" },
      },
    ],
    allowed_mentions: { parse: [] },
  };

  try {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Truncate values so Discord's 1024-char field limit is never hit. */
export function field(name: string, value: string | undefined | null): { name: string; value: string } {
  return {
    name: name.slice(0, 256),
    value: (value ?? "").slice(0, 1024),
  };
}