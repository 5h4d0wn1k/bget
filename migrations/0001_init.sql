-- BGET forms schema (D1)
-- Applied with:  npx wrangler d1 execute bget-forms --remote --file=migrations/0001_init.sql

CREATE TABLE IF NOT EXISTS applications (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  name          TEXT NOT NULL,
  email         TEXT NOT NULL,
  location      TEXT,
  disciplines   TEXT,
  links         TEXT,
  building      TEXT NOT NULL,
  struggling    TEXT,
  why_bget      TEXT,
  referral      TEXT,
  user_agent    TEXT
);

CREATE TABLE IF NOT EXISTS problems (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at         TEXT NOT NULL DEFAULT (datetime('now')),
  title              TEXT NOT NULL,
  description        TEXT NOT NULL,
  submitter_name     TEXT,
  email              TEXT,
  location           TEXT,
  affected           TEXT,
  tried              TEXT,
  success_looks_like TEXT,
  why_bget           TEXT,
  contribution       TEXT,
  visibility         TEXT NOT NULL DEFAULT 'bget',
  user_agent         TEXT
);

CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications (created_at);
CREATE INDEX IF NOT EXISTS idx_problems_created_at ON problems (created_at);
