-- ============================================================================
-- BGET D1 schema — submissions (apply + problems) + subscribers (newsletter)
--
-- Create the database (one-time, from the repo root):
--
--   npx wrangler d1 create bget-db
--   # → copy the printed database_id, then un-comment the [[d1_databases]]
--   #   block in wrangler.toml and paste the id in.
--
-- Apply this schema (idempotent — safe to re-run, IF NOT EXISTS):
--
--   npx wrangler d1 execute bget-db --file=drizzle/schema.sql --remote   # prod
--   npx wrangler d1 execute bget-db --file=drizzle/schema.sql --local    # local dev
--
-- The deploy workflow (.github/workflows/deploy.yml) re-applies it on every
-- push to main, so a fresh environment converges automatically.
-- ============================================================================

CREATE TABLE IF NOT EXISTS submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kind TEXT NOT NULL,                 -- 'apply' | 'problems'
  ref TEXT NOT NULL,                  -- public receipt ref, e.g. BGET-A-K3XZ1
  fields_json TEXT NOT NULL,          -- JSON of the submitted fields, verbatim
  status TEXT NOT NULL DEFAULT 'new', -- new | reviewing | accepted | declined | archived
  created_at INTEGER NOT NULL         -- unix epoch milliseconds
);

CREATE INDEX IF NOT EXISTS idx_submissions_kind ON submissions(kind);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);

-- Mailing-list signups (see app/api/newsletter/route.ts). UNIQUE email makes
-- duplicate signups a safe no-op via INSERT OR IGNORE.

CREATE TABLE IF NOT EXISTS subscribers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,         -- lowercased and validated by the route
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);