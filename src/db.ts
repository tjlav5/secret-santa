export interface EventRecord {
  id: string;
  title: string;
  organizer_name: string;
  budget: string;
  exchange_date: string;
  notes: string;
  admin_key: string;
  status: 'draft' | 'drawn';
  drawn_at: string | null;
  created_at: string;
}

export interface WishlistLink {
  title: string;
  url: string;
}

export interface ParticipantRecord {
  id: string;
  event_id: string;
  name: string;
  token: string;
  wishlist_notes: string;
  wishlist_links: string; // JSON string
  assigned_to_id: string | null;
  unwrapped_at: string | null;
  created_at: string;
}

export interface ExclusionRecord {
  id: string;
  event_id: string;
  participant_id: string;
  excluded_participant_id: string;
  created_at: string;
}

let schemaInitialized = false;

/**
 * Ensures the SQLite tables exist in the D1 database automatically.
 * This guarantees the app works out-of-the-box in local dev and tests.
 */
export async function ensureSchema(db: D1Database): Promise<void> {
  if (schemaInitialized) return;
  await db.batch([
    db.prepare(`
      CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        organizer_name TEXT NOT NULL,
        budget TEXT DEFAULT '',
        exchange_date TEXT DEFAULT '',
        notes TEXT DEFAULT '',
        admin_key TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'draft',
        drawn_at TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `),
    db.prepare(`
      CREATE TABLE IF NOT EXISTS participants (
        id TEXT PRIMARY KEY,
        event_id TEXT NOT NULL,
        name TEXT NOT NULL,
        token TEXT NOT NULL UNIQUE,
        wishlist_notes TEXT DEFAULT '',
        wishlist_links TEXT DEFAULT '[]',
        assigned_to_id TEXT,
        unwrapped_at TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
        FOREIGN KEY (assigned_to_id) REFERENCES participants(id) ON DELETE SET NULL
      )
    `),
    db.prepare(`
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
      )
    `),
    db.prepare(`CREATE INDEX IF NOT EXISTS idx_participants_event ON participants(event_id)`),
    db.prepare(`CREATE INDEX IF NOT EXISTS idx_participants_token ON participants(token)`),
    db.prepare(`CREATE INDEX IF NOT EXISTS idx_exclusions_event ON exclusions(event_id)`),
  ]);
  schemaInitialized = true;
}

export function parseWishlistLinks(raw: string | null | undefined): WishlistLink[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (item) => item && typeof item.title === 'string' && typeof item.url === 'string'
      );
    }
    return [];
  } catch {
    return [];
  }
}
