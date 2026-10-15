/**
 * BGET Worker — entry point.
 *
 * Serves the static Next.js export (via the `ASSETS` binding), the public JSON
 * API used by the site's forms, the Cloudflare Access protected admin API, and
 * server-rendered public project pages. Data lives in D1 (binding `DB`).
 *
 * Routing lives in ./router.js; the individual route groups live in ./routes/.
 */

import { handleRequest } from "./router.js";
import { json } from "./lib/json.js";

export default {
  /**
   * @param {Request} request
   * @param {{DB: D1Database, ASSETS: Fetcher, ACCESS_TEAM_DOMAIN?: string, ACCESS_AUD?: string}} env
   * @param {ExecutionContext} ctx
   * @returns {Promise<Response>}
   */
  async fetch(request, env, ctx) {
    try {
      return await handleRequest(request, env, ctx);
    } catch (err) {
      console.error("worker: unhandled error", err);
      const url = new URL(request.url);
      if (url.pathname.startsWith("/api/")) {
        return json({ ok: false, error: "server_error" }, 500);
      }
      return new Response("Internal Server Error", {
        status: 500,
        headers: { "content-type": "text/plain; charset=utf-8" },
      });
    }
  },
};
