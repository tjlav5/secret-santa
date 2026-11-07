-- Secret Santa Cloudflare D1 Schema

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  organizer_name TEXT NOT NULL,
  budget TEXT DEFAULT '',
  exchange_date TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  admin_key TEXT NOT NULL,
  join_code TEXT,
  join_enabled INTEGER NOT NULL DEFAULT 1,
  allow_spoilers INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft' | 'drawn'
  drawn_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS participants (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  name TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  wishlist_notes TEXT DEFAULT '',
  wishlist_links TEXT DEFAULT '[]', -- JSON array of { title, url }
  assigned_to_id TEXT,
  encrypted_assignment TEXT DEFAULT '',
  unwrapped_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_to_id) REFERENCES participants(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS exclusions (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  participant_id TEXT NOT NULL,
  excluded_participant_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(event_id, participant_id, excluded_participant_id),
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE,
  FOREIGN KEY (excluded_participant_id) REFERENCES participants(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS qa_messages (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  recipient_id TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  answered_at TEXT,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (recipient_id) REFERENCES participants(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_events_join_code ON events(join_code);
CREATE INDEX IF NOT EXISTS idx_participants_event ON participants(event_id);
CREATE INDEX IF NOT EXISTS idx_participants_token ON participants(token);
CREATE INDEX IF NOT EXISTS idx_exclusions_event ON exclusions(event_id);
CREATE INDEX IF NOT EXISTS idx_qa_recipient ON qa_messages(event_id, recipient_id);
