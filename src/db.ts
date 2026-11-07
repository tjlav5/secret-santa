import { decryptAssignment } from './crypto';

export interface EventRecord {
  id: string;
  title: string;
  organizer_name: string;
  budget: string;
  exchange_date: string;
  notes: string;
  admin_key: string;
  join_code: string | null;
  join_enabled: number; // 1 | 0
  allow_spoilers: number; // 0 = Strict Encrypted No-Peek Mode, 1 = Emergency Host Master List allowed
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
  encrypted_assignment: string;
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

export interface QaMessageRecord {
  id: string;
  event_id: string;
  recipient_id: string;
  question: string;
  answer: string;
  created_at: string;
  answered_at: string | null;
}

const initializedDbs = new WeakSet<object>();

async function ensureColumn(
  db: D1Database,
  table: string,
  column: string,
  definition: string
): Promise<void> {
  const { results } = await db.prepare(`PRAGMA table_info(${table})`).all<{ name: string }>();
  const exists = (results || []).some((col) => col.name === column);
  if (!exists) {
    await db.prepare(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`).run();
  }
}

/**
 * Ensures the SQLite tables and any newly introduced columns exist in the D1 database.
 * Tracks initialized database bindings via WeakSet so both production Workers and isolated
 * in-memory test DBs initialize cleanly.
 */
export async function ensureSchema(db: D1Database): Promise<void> {
  if (initializedDbs.has(db)) return;

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
        join_code TEXT,
        join_enabled INTEGER NOT NULL DEFAULT 1,
        allow_spoilers INTEGER NOT NULL DEFAULT 0,
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
        encrypted_assignment TEXT DEFAULT '',
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
    db.prepare(`
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
      )
    `),
    db.prepare(`CREATE INDEX IF NOT EXISTS idx_participants_event ON participants(event_id)`),
    db.prepare(`CREATE INDEX IF NOT EXISTS idx_participants_token ON participants(token)`),
    db.prepare(`CREATE INDEX IF NOT EXISTS idx_exclusions_event ON exclusions(event_id)`),
    db.prepare(`CREATE INDEX IF NOT EXISTS idx_qa_recipient ON qa_messages(event_id, recipient_id)`),
  ]);

  // Auto-migrate existing tables from earlier schema versions
  await ensureColumn(db, 'events', 'join_code', 'TEXT');
  await ensureColumn(db, 'events', 'join_enabled', 'INTEGER NOT NULL DEFAULT 1');
  await ensureColumn(db, 'events', 'allow_spoilers', 'INTEGER NOT NULL DEFAULT 0');
  await ensureColumn(db, 'participants', 'encrypted_assignment', "TEXT DEFAULT ''");
  await db
    .prepare(`CREATE INDEX IF NOT EXISTS idx_events_join_code ON events(join_code)`)
    .run();

  initializedDbs.add(db);
}

/**
 * Resolves a participant's assigned recipient ID by decrypting `encrypted_assignment`
 * with their private token, or falling back to legacy plaintext `assigned_to_id`.
 */
export async function resolveRecipientId(
  eventId: string,
  giver: ParticipantRecord
): Promise<string | null> {
  if (giver.encrypted_assignment) {
    const decrypted = await decryptAssignment(eventId, giver.token, giver.encrypted_assignment);
    if (decrypted) return decrypted;
  }
  return giver.assigned_to_id || null;
}

/**
 * Parses single or bulk-pasted participant names (separated by newlines, commas, or semicolons),
 * stripping common list bullets like "1. ", "- ", or "• ".
 */
export function parseBatchNames(raw: string): string[] {
  if (!raw) return [];
  return raw
    .split(/[\r\n,;]+/)
    .map((entry) => entry.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, '').trim())
    .filter((entry) => entry.length > 0);
}

/**
 * Validates and normalizes a user-supplied wishlist URL.
 * Strictly allows only http: and https: protocols to prevent javascript:/data: XSS.
 * Automatically prepends https:// if the user omits a scheme (e.g. "amazon.com/dp/...").
 */
export function sanitizeHttpUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const hasScheme = /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmed);
  const candidate = hasScheme ? trimmed : `https://${trimmed}`;

  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }
    if (!parsed.hostname || !parsed.hostname.includes('.')) {
      if (parsed.hostname !== 'localhost') {
        return null;
      }
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

export function parseWishlistLinks(raw: string | null | undefined): WishlistLink[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const safe: WishlistLink[] = [];
    for (const item of parsed) {
      if (item && typeof item.title === 'string' && typeof item.url === 'string') {
        const cleanUrl = sanitizeHttpUrl(item.url);
        if (cleanUrl) {
          safe.push({ title: item.title.trim() || cleanUrl, url: cleanUrl });
        }
      }
    }
    return safe;
  } catch {
    return [];
  }
}

/**
 * Formats an ISO YYYY-MM-DD date string into a friendly display date (e.g., "Dec 24, 2026"),
 * falling back gracefully if a freeform string was stored.
 */
export function formatExchangeDate(raw: string | null | undefined): string {
  if (!raw) return '';
  const trimmed = raw.trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (!match) return trimmed;
  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, monthIndex, day));
  if (Number.isNaN(date.getTime())) return trimmed;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}
