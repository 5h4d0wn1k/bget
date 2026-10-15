-- Build For Good — inbox: contact, suggestions, feedback (D1)
-- Applied with:  npx wrangler d1 execute buildforgood-forms --remote --file=migrations/0003_inbox.sql

CREATE TABLE IF NOT EXISTS contact_messages (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  subject     TEXT,
  message     TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'new',   -- new | read | replied | archived
  notes       TEXT,
  user_agent  TEXT
);

CREATE TABLE IF NOT EXISTS suggestions (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  topic       TEXT NOT NULL,
  body        TEXT NOT NULL,
  name        TEXT,
  email       TEXT,
  status      TEXT NOT NULL DEFAULT 'new',   -- new | considering | planned | done | declined
  notes       TEXT,
  user_agent  TEXT
);

CREATE TABLE IF NOT EXISTS feedback (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  kind        TEXT NOT NULL DEFAULT 'idea',  -- praise | bug | idea | other
  page        TEXT,
  body        TEXT NOT NULL,
  email       TEXT,
  rating      INTEGER,                       -- optional 1..5
  status      TEXT NOT NULL DEFAULT 'new',   -- new | read | actioned | archived
  notes       TEXT,
  user_agent  TEXT
);

CREATE INDEX IF NOT EXISTS idx_contact_created_at ON contact_messages (created_at);
CREATE INDEX IF NOT EXISTS idx_suggestions_created_at ON suggestions (created_at);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback (created_at);
