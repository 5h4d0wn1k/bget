-- Build For Good — project showcase (D1)
-- Applied with:  npx wrangler d1 execute buildforgood-forms --remote --file=migrations/0002_projects.sql

CREATE TABLE IF NOT EXISTS projects (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT,
  slug          TEXT NOT NULL UNIQUE,
  title         TEXT NOT NULL,
  one_liner     TEXT NOT NULL,
  description   TEXT NOT NULL,
  disciplines   TEXT,
  stage         TEXT,                 -- idea | prototype | pilot | live | scaled
  url           TEXT,
  repo          TEXT,
  demo          TEXT,
  cover_image   TEXT,
  lead_name     TEXT NOT NULL,
  lead_email    TEXT,
  location      TEXT,
  team          TEXT,
  tags          TEXT,
  status        TEXT NOT NULL DEFAULT 'pending',  -- pending | approved | rejected | archived
  featured      INTEGER NOT NULL DEFAULT 0,
  notes         TEXT,
  reviewed_at   TEXT,
  user_agent    TEXT
);

CREATE INDEX IF NOT EXISTS idx_projects_status ON projects (status);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects (slug);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects (created_at);
