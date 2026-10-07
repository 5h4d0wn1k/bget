// Form → Discord relay for the BGET site. Deploy on Cloudflare Workers.
//
// The static site cannot POST to Discord directly without leaking the webhook
// token into public JavaScript. This Worker holds the webhooks server-side,
// validates that the request comes from the site (Origin allowlist + honeypot +
// shared token), and forwards each submission into Discord as an embed.
//
// The site keeps FormSubmit (email) as the primary delivery path; this relay
// is a best-effort second hop that makes submissions appear in Discord.
//
// Deploy + secrets: see workers/bget-forms/README.md

const HONEYPOT = ["website", "company", "fax"]; // hidden inputs; bots fill them, humans don't
const WEBHOOKS = { apply: "DISCORD_APPLY", world: "DISCORD_WORLD" }; // ?form=<key>

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || request.headers.get("Referer") || "";
    const allowed = (env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);

    // CORS preflight + method guard
    if (request.method === "OPTIONS") return cors(new Response(null, { status: 204 }), origin, allowed);
    if (request.method !== "POST")
      return cors(json({ ok: false, error: "method" }, 405), origin, allowed);

    // 1) Origin allowlist (browsers set Origin on cross-origin fetch; scripts can't fake it)
    if (!allowed.some((a) => origin.startsWith(a)))
      return cors(json({ ok: false, error: "origin" }, 403), origin, allowed);

    // 2) Parse JSON
    let data;
    try { data = await request.json(); }
    catch { return cors(json({ ok: false, error: "json" }, 400), origin, allowed); }

    // 3) Honeypot — silently swallow bots (reply ok:true, send nothing)
    if (HONEYPOT.some((f) => data[f])) return cors(json({ ok: true }), origin, allowed);

    // 4) Shared token (deterrent for direct curl spam; origin check is the real gate)
    if (env.FORM_TOKEN && data.token !== env.FORM_TOKEN)
      return cors(json({ ok: false, error: "token" }, 403), origin, allowed);

    // 5) Build the Discord embed — keep every value inside Discord's limits
    const formKey = url.searchParams.get("form") || "apply";
    const webhookSecret = WEBHOOKS[formKey];
    if (!webhookSecret || !env[webhookSecret])
      return cors(json({ ok: false, error: "unknown form" }, 400), origin, allowed);

    const fields = [];
    for (const [k, v] of Object.entries(data)) {
      if (k === "token" || k.startsWith("_")) continue;              // reserved
      if (v === "" || v == null) continue;
      fields.push({ name: k.slice(0, 256), value: String(v).slice(0, 1024), inline: false });
    }
    const embed = {
      title: formKey === "world" ? "🌍 New world-problems submission" : "📋 New application",
      color: 0x5865F2, // Discord blurple
      timestamp: new Date().toISOString(),
      fields: fields.slice(0, 25),
      footer: { text: new URL(request.url).hostname },
    };

    // 6) Post to Discord (server-to-server; no browser CORS involved here)
    try {
      const res = await fetch(env[webhookSecret], {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ embeds: [embed], allowed_mentions: { parse: [] } }),
      });
      if (!res.ok) console.error("discord error", res.status, await res.text());
    } catch (err) {
      console.error("discord fetch failed", err);
    }

    return cors(json({ ok: true }), origin, allowed); // don't fail UX on Discord hiccup
  },
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}
function cors(res, origin, allowed) {
  if (origin && allowed.some((a) => origin.startsWith(a))) {
    res.headers.set("Access-Control-Allow-Origin", origin);
    res.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.headers.set("Access-Control-Allow-Headers", "Content-Type");
    res.headers.set("Vary", "Origin");
  }
  return res;
}