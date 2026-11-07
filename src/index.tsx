import { Hono, type Context } from 'hono';
import { getCookie, setCookie } from 'hono/cookie';
import {
  ensureSchema,
  parseBatchNames,
  parseWishlistLinks,
  resolveRecipientId,
  sanitizeHttpUrl,
  type EventRecord,
  type ExclusionRecord,
  type ParticipantRecord,
  type QaMessageRecord,
} from './db';
import { encryptAssignment } from './crypto';
import { computeSecretSantaDraw, generateId, generateToken } from './algorithm';
import { HomePage, type RecentEventCookieItem } from './views/home';
import { DashboardPage, DashboardShell, OrganizerWorkspace } from './views/dashboard';
import { JoinPage } from './views/join';
import {
  ParticipantWishlistEditor,
  RecipientQaInbox,
  RevealPage,
  SantaQaPanel,
  UnwrappedMatchCard,
} from './views/reveal';
import { Layout } from './views/layout';
import { APP_CSS, FAVICON_SVG } from './styles';
import { HERO_IMAGE_B64, SEAL_IMAGE_B64 } from './assets';

export interface Bindings {
  DB: D1Database;
}

const app = new Hono<{ Bindings: Bindings }>();

// Pre-decode binary WebP assets for zero-latency streaming
const heroWebpBytes = Uint8Array.from(atob(HERO_IMAGE_B64), (c) => c.charCodeAt(0));
const sealWebpBytes = Uint8Array.from(atob(SEAL_IMAGE_B64), (c) => c.charCodeAt(0));

// Security headers across all routes (prevents capability URL leakage via Referer)
app.use('*', async (c, next) => {
  c.header('Referrer-Policy', 'no-referrer');
  c.header('X-Content-Type-Options', 'nosniff');
  await next();
});

// 0. STATIC ASSETS: FAVICON, CACHED STYLESHEET & OPTIMIZED WEBP IMAGES
app.get('/styles.css', (c) => {
  c.header('Content-Type', 'text/css; charset=UTF-8');
  c.header('Cache-Control', 'public, max-age=31536000, immutable');
  return c.body(APP_CSS);
});

app.get('/favicon.svg', (c) => {
  c.header('Content-Type', 'image/svg+xml');
  c.header('Cache-Control', 'public, max-age=604800, immutable');
  return c.body(FAVICON_SVG);
});

app.get('/favicon.ico', (c) => {
  c.header('Content-Type', 'image/svg+xml');
  c.header('Cache-Control', 'public, max-age=604800, immutable');
  return c.body(FAVICON_SVG);
});

app.get('/assets/hero.webp', (c) => {
  c.header('Content-Type', 'image/webp');
  c.header('Cache-Control', 'public, max-age=31536000, immutable');
  return c.body(heroWebpBytes);
});

app.get('/assets/seal.webp', (c) => {
  c.header('Content-Type', 'image/webp');
  c.header('Cache-Control', 'public, max-age=31536000, immutable');
  return c.body(sealWebpBytes);
});

// Automatically ensure D1 schema tables & migrations exist on first DB route request
app.use('*', async (c, next) => {
  await ensureSchema(c.env.DB);
  await next();
});

const RECENT_EVENTS_COOKIE = 'ss_recent_events';
const NINETY_DAYS_SEC = 60 * 60 * 24 * 90;

function buildCookieOpts(c: Context, maxAge = NINETY_DAYS_SEC) {
  const isHttps = new URL(c.req.url).protocol === 'https:';
  return {
    path: '/',
    httpOnly: true,
    sameSite: 'Lax' as const,
    secure: isHttps,
    maxAge,
  };
}

function getRecentEvents(c: Context): RecentEventCookieItem[] {
  const raw = getCookie(c, RECENT_EVENTS_COOKIE);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (item) =>
          item &&
          typeof item.id === 'string' &&
          typeof item.title === 'string' &&
          typeof item.key === 'string'
      );
    }
    return [];
  } catch {
    return [];
  }
}

function saveRecentEvent(c: Context, item: RecentEventCookieItem): void {
  const isDemo = item.title === 'Winter Chalet Gift Exchange 2026';
  const existing = getRecentEvents(c).filter((e) => {
    if (e.id === item.id) return false;
    if (isDemo && e.title === 'Winter Chalet Gift Exchange 2026') return false;
    return true;
  });
  const updated = [item, ...existing].slice(0, 6);
  setCookie(c, RECENT_EVENTS_COOKIE, JSON.stringify(updated), buildCookieOpts(c));
}

function removeRecentEvent(c: Context, eventId: string): void {
  const updated = getRecentEvents(c).filter((e) => e.id !== eventId);
  setCookie(c, RECENT_EVENTS_COOKIE, JSON.stringify(updated), buildCookieOpts(c));
}

function verifyAdminKey(c: Context, event: EventRecord): boolean {
  const queryKey = c.req.query('key');
  const cookieKey = getCookie(c, `ss_admin_${event.id}`);
  if (queryKey && queryKey === event.admin_key) {
    setCookie(c, `ss_admin_${event.id}`, event.admin_key, buildCookieOpts(c));
    saveRecentEvent(c, { id: event.id, title: event.title, key: event.admin_key });
    return true;
  }
  if (cookieKey && cookieKey === event.admin_key) {
    return true;
  }
  return false;
}

async function loadEventBundle(db: D1Database, eventId: string) {
  const event = await db
    .prepare('SELECT * FROM events WHERE id = ?')
    .bind(eventId)
    .first<EventRecord>();
  if (!event) return null;

  // Backfill join_code transparently for any pre-migration events
  if (!event.join_code) {
    const generatedJoinCode = generateToken(12);
    await db
      .prepare('UPDATE events SET join_code = ? WHERE id = ?')
      .bind(generatedJoinCode, eventId)
      .run();
    event.join_code = generatedJoinCode;
  }

  const { results: participantsRaw } = await db
    .prepare('SELECT * FROM participants WHERE event_id = ? ORDER BY created_at ASC, rowid ASC')
    .bind(eventId)
    .all<ParticipantRecord>();
  const participants = participantsRaw || [];

  const { results: exclusionsRaw } = await db
    .prepare('SELECT * FROM exclusions WHERE event_id = ? ORDER BY created_at ASC, rowid ASC')
    .bind(eventId)
    .all<ExclusionRecord>();

  const { results: qaCounts } = await db
    .prepare(
      `SELECT recipient_id, COUNT(*) as cnt
       FROM qa_messages
       WHERE event_id = ? AND (answer IS NULL OR TRIM(answer) = '')
       GROUP BY recipient_id`
    )
    .bind(eventId)
    .all<{ recipient_id: string; cnt: number }>();

  const unansweredQaByRecipient: Record<string, number> = {};
  for (const row of qaCounts || []) {
    unansweredQaByRecipient[row.recipient_id] = Number(row.cnt) || 0;
  }

  // Only decrypt matches for organizer spoiler list if host explicitly opted out of Strict No-Peek Mode
  const decryptedSpoilerMap: Record<string, string> = {};
  if (event.status === 'drawn' && Boolean(event.allow_spoilers)) {
    for (const p of participants) {
      const recId = await resolveRecipientId(event.id, p);
      if (recId) decryptedSpoilerMap[p.id] = recId;
    }
  }

  return {
    event,
    participants,
    exclusions: exclusionsRaw || [],
    unansweredQaByRecipient,
    decryptedSpoilerMap,
  };
}

// 1. HOME PAGE
app.get('/', (c) => {
  const recentEvents = getRecentEvents(c);
  return c.html(<HomePage recentEvents={recentEvents} />);
});

// 1b. REMOVE SAVED EVENT FROM DEVICE HISTORY
app.post('/recent-events/:id/delete', (c) => {
  const eventId = c.req.param('id');
  removeRecentEvent(c, eventId);
  return c.redirect('/');
});

// 1c. CLEAR ALL SAVED EVENTS FROM DEVICE HISTORY
app.post('/recent-events/clear', (c) => {
  setCookie(c, RECENT_EVENTS_COOKIE, '[]', buildCookieOpts(c, 0));
  return c.redirect('/');
});

// 2. CREATE NEW EVENT
app.post('/events', async (c) => {
  const body = await c.req.parseBody();
  const title = String(body.title || '').trim();
  const organizerName = String(body.organizer_name || '').trim();
  const budget = String(body.budget || '').trim();
  const exchangeDate = String(body.exchange_date || '').trim();
  const notes = String(body.notes || '').trim();
  const includeOrganizer = body.include_organizer === '1';
  const allowSpoilers =
    body.has_privacy_field === '1' ? (body.strict_privacy === '1' ? 0 : 1) : 0;

  if (!title || !organizerName) {
    const recentEvents = getRecentEvents(c);
    return c.html(
      <HomePage
        recentEvents={recentEvents}
        error="Please provide both an Exchange Title and Your Name."
      />,
      400
    );
  }

  const eventId = generateId('ev', 8);
  const adminKey = generateToken(20);
  const joinCode = generateToken(12);

  await c.env.DB.prepare(
    `INSERT INTO events (id, title, organizer_name, budget, exchange_date, notes, admin_key, join_code, join_enabled, allow_spoilers, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, 'draft')`
  )
    .bind(eventId, title, organizerName, budget, exchangeDate, notes, adminKey, joinCode, allowSpoilers)
    .run();

  if (includeOrganizer) {
    const pId = generateId('pt', 8);
    const pToken = generateToken(18);
    await c.env.DB.prepare(
      `INSERT INTO participants (id, event_id, name, token) VALUES (?, ?, ?, ?)`
    )
      .bind(pId, eventId, organizerName, pToken)
      .run();
    setCookie(c, `ss_guest_${eventId}`, pToken, buildCookieOpts(c));
  }

  setCookie(c, `ss_admin_${eventId}`, adminKey, buildCookieOpts(c));
  saveRecentEvent(c, { id: eventId, title, key: adminKey });

  return c.redirect(`/events/${eventId}?key=${encodeURIComponent(adminKey)}`);
});

// 3. SEED INSTANT DEMO EXCHANGE
app.post('/demo', async (c) => {
  const eventId = generateId('ev', 8);
  const adminKey = generateToken(20);
  const joinCode = generateToken(12);
  const title = 'Winter Chalet Gift Exchange 2026';

  await c.env.DB.prepare(
    `INSERT INTO events (id, title, organizer_name, budget, exchange_date, notes, admin_key, join_code, join_enabled, allow_spoilers, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 0, 'draft')`
  )
    .bind(
      eventId,
      title,
      'TJ',
      '$45',
      '2026-12-24',
      'Bring your wrapped gift to the fireplace gathering! Handmade or local gifts encouraged.',
      adminKey,
      joinCode
    )
    .run();

  const samplePeople = [
    {
      id: generateId('pt', 8),
      name: 'TJ',
      notes: 'Love pour-over coffee gear, wool hiking socks (size L), and sci-fi paperbacks.',
      links: JSON.stringify([
        { title: 'Hario V60 Ceramic Dripper', url: 'https://example.com/v60-dripper' },
      ]),
    },
    {
      id: generateId('pt', 8),
      name: 'Elena',
      notes: 'Watercolors, botanical illustration books, or matcha green tea tins!',
      links: '[]',
    },
    {
      id: generateId('pt', 8),
      name: 'Marcus',
      notes: 'Cast iron cooking accessories, hot sauces, or vinyl jazz records.',
      links: '[]',
    },
    {
      id: generateId('pt', 8),
      name: 'Chloe',
      notes: 'Cozy throw blankets, board games, or dark chocolate sea salt bars.',
      links: '[]',
    },
  ];

  for (const person of samplePeople) {
    await c.env.DB.prepare(
      `INSERT INTO participants (id, event_id, name, token, wishlist_notes, wishlist_links)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
      .bind(person.id, eventId, person.name, generateToken(18), person.notes, person.links)
      .run();
  }

  await c.env.DB.batch([
    c.env.DB.prepare(
      `INSERT INTO exclusions (id, event_id, participant_id, excluded_participant_id) VALUES (?, ?, ?, ?)`
    ).bind(generateId('ex', 8), eventId, samplePeople[0].id, samplePeople[1].id),
    c.env.DB.prepare(
      `INSERT INTO exclusions (id, event_id, participant_id, excluded_participant_id) VALUES (?, ?, ?, ?)`
    ).bind(generateId('ex', 8), eventId, samplePeople[1].id, samplePeople[0].id),
  ]);

  setCookie(c, `ss_admin_${eventId}`, adminKey, buildCookieOpts(c));
  saveRecentEvent(c, { id: eventId, title, key: adminKey });

  return c.redirect(`/events/${eventId}?key=${encodeURIComponent(adminKey)}`);
});

// 3b. GROUP SELF-JOIN INVITE PAGE
app.get('/join/:code', async (c) => {
  const code = c.req.param('code');
  const event = await c.env.DB.prepare('SELECT * FROM events WHERE join_code = ?')
    .bind(code)
    .first<EventRecord>();

  if (!event) {
    return c.html(
      <Layout title="Invite Link Not Found">
        <div class="surface-card narrow-container status-card-centered">
          <h1>Group Invite Link Not Found</h1>
          <p>This Secret Santa group invite link doesn’t exist or may have expired.</p>
          <a href="/" class="btn btn-primary">
            Host an Exchange
          </a>
        </div>
      </Layout>,
      404
    );
  }

  const { results: participants } = await c.env.DB.prepare(
    'SELECT * FROM participants WHERE event_id = ? ORDER BY created_at ASC, rowid ASC'
  )
    .bind(event.id)
    .all<ParticipantRecord>();
  const list = participants || [];

  const guestToken = getCookie(c, `ss_guest_${event.id}`);
  const existingGuest = guestToken ? list.find((p) => p.token === guestToken) || null : null;

  return c.html(
    <JoinPage event={event} participants={list} existingGuest={existingGuest} />
  );
});

app.post('/join/:code', async (c) => {
  const code = c.req.param('code');
  const event = await c.env.DB.prepare('SELECT * FROM events WHERE join_code = ?')
    .bind(code)
    .first<EventRecord>();

  if (!event) return c.text('Not found', 404);

  const { results: participants } = await c.env.DB.prepare(
    'SELECT * FROM participants WHERE event_id = ? ORDER BY created_at ASC, rowid ASC'
  )
    .bind(event.id)
    .all<ParticipantRecord>();
  const list = participants || [];
  const guestToken = getCookie(c, `ss_guest_${event.id}`);
  const existingGuest = guestToken ? list.find((p) => p.token === guestToken) || null : null;

  if (event.status === 'drawn' || !event.join_enabled) {
    return c.html(
      <JoinPage
        event={event}
        participants={list}
        existingGuest={existingGuest}
        error="This exchange is no longer accepting new sign-ups."
      />,
      400
    );
  }

  const body = await c.req.parseBody();
  const name = String(body.name || '').trim();
  const wishlistNotes = String(body.wishlist_notes || '').trim();

  if (!name) {
    return c.html(
      <JoinPage
        event={event}
        participants={list}
        existingGuest={existingGuest}
        error="Please enter your name to join."
      />,
      400
    );
  }

  const duplicate = list.some((p) => p.name.toLowerCase() === name.toLowerCase());
  if (duplicate) {
    return c.html(
      <JoinPage
        event={event}
        participants={list}
        existingGuest={existingGuest}
        error={`"${name}" has already joined! If someone shares your first name, add your last initial (e.g., "${name} M.").`}
      />,
      400
    );
  }

  const pId = generateId('pt', 8);
  const pToken = generateToken(18);

  await c.env.DB.prepare(
    `INSERT INTO participants (id, event_id, name, token, wishlist_notes)
     VALUES (?, ?, ?, ?, ?)`
  )
    .bind(pId, event.id, name, pToken, wishlistNotes)
    .run();

  setCookie(c, `ss_guest_${event.id}`, pToken, buildCookieOpts(c));

  return c.redirect(`/reveal/${pToken}?joined=1`);
});

// 4. VIEW ORGANIZER DASHBOARD
app.get('/events/:id', async (c) => {
  const eventId = c.req.param('id');
  const bundle = await loadEventBundle(c.env.DB, eventId);

  if (!bundle) {
    return c.html(
      <Layout title="Exchange Not Found">
        <div class="surface-card narrow-container status-card-centered">
          <h1>Exchange Not Found</h1>
          <p>
            We couldn't find an exchange with ID <code>{eventId}</code>.
          </p>
          <a href="/" class="btn btn-primary">
            Back to Home
          </a>
        </div>
      </Layout>,
      404
    );
  }

  if (!verifyAdminKey(c, bundle.event)) {
    return c.html(
      <Layout title="Organizer Key Required">
        <div class="surface-card narrow-container status-card-centered">
          <h1>🔒 Private Organizer Dashboard</h1>
          <p>
            To manage <strong>{bundle.event.title}</strong>, open your bookmarked Organizer Secret
            Link containing your <code>?key=...</code> parameter.
          </p>
          <a href="/" class="btn btn-secondary">
            Return Home
          </a>
        </div>
      </Layout>,
      403
    );
  }

  const origin = new URL(c.req.url).origin;
  return c.html(
    <DashboardPage
      event={bundle.event}
      participants={bundle.participants}
      exclusions={bundle.exclusions}
      unansweredQaByRecipient={bundle.unansweredQaByRecipient}
      decryptedSpoilerMap={bundle.decryptedSpoilerMap}
      origin={origin}
    />
  );
});

// Helper to render OrganizerWorkspace or DashboardShell (Inline partial if X-Inline-Target header is present, or full page fallback)
async function renderWorkspaceResponse(
  c: Context<{ Bindings: Bindings }>,
  eventId: string,
  flash?: { error?: string; success?: string }
) {
  const bundle = await loadEventBundle(c.env.DB, eventId);
  if (!bundle) return c.text('Not found', 404);
  const origin = new URL(c.req.url).origin;
  const inlineTarget = c.req.header('X-Inline-Target');

  const props = {
    event: bundle.event,
    participants: bundle.participants,
    exclusions: bundle.exclusions,
    unansweredQaByRecipient: bundle.unansweredQaByRecipient,
    decryptedSpoilerMap: bundle.decryptedSpoilerMap,
    origin,
    flashError: flash?.error,
    flashSuccess: flash?.success,
  };

  if (inlineTarget === '#dashboard-shell') {
    return c.html(<DashboardShell {...props} />);
  }
  if (inlineTarget) {
    return c.html(<OrganizerWorkspace {...props} />);
  }
  return c.html(<DashboardPage {...props} />);
}

// 4b. UPDATE EXCHANGE SETTINGS
app.post('/events/:id/settings', async (c) => {
  const eventId = c.req.param('id');
  const bundle = await loadEventBundle(c.env.DB, eventId);
  if (!bundle || !verifyAdminKey(c, bundle.event)) return c.text('Unauthorized', 403);

  const body = await c.req.parseBody();
  const title = String(body.title || '').trim();
  const organizerName = String(body.organizer_name || '').trim();
  const budget = String(body.budget || '').trim();
  const exchangeDate = String(body.exchange_date || '').trim();
  const notes = String(body.notes || '').trim();

  // Privacy mode can only be changed while in draft (cannot disable No-Peek Mode after drawing!)
  let allowSpoilers = bundle.event.allow_spoilers;
  if (bundle.event.status !== 'drawn' && body.has_privacy_field === '1') {
    allowSpoilers = body.strict_privacy === '1' ? 0 : 1;
  }

  if (!title || !organizerName) {
    return renderWorkspaceResponse(c, eventId, {
      error: 'Exchange Title and Host Name cannot be empty.',
    });
  }

  await c.env.DB.prepare(
    `UPDATE events
     SET title = ?, organizer_name = ?, budget = ?, exchange_date = ?, notes = ?, allow_spoilers = ?
     WHERE id = ?`
  )
    .bind(title, organizerName, budget, exchangeDate, notes, allowSpoilers, eventId)
    .run();

  saveRecentEvent(c, { id: eventId, title, key: bundle.event.admin_key });

  return renderWorkspaceResponse(c, eventId, {
    success: 'Exchange details updated.',
  });
});

// 4c. TOGGLE SELF-JOIN INVITE LINK
app.post('/events/:id/join-toggle', async (c) => {
  const eventId = c.req.param('id');
  const bundle = await loadEventBundle(c.env.DB, eventId);
  if (!bundle || !verifyAdminKey(c, bundle.event)) return c.text('Unauthorized', 403);

  const nextState = bundle.event.join_enabled ? 0 : 1;
  await c.env.DB.prepare('UPDATE events SET join_enabled = ? WHERE id = ?')
    .bind(nextState, eventId)
    .run();

  return renderWorkspaceResponse(c, eventId, {
    success: nextState
      ? 'Group Self-Join Link is now open for sign-ups.'
      : 'Group Self-Join Link paused.',
  });
});

// 5. ADD PARTICIPANT(S) — Supports single name OR bulk-pasted comma/newline lists
app.post('/events/:id/participants', async (c) => {
  const eventId = c.req.param('id');
  const bundle = await loadEventBundle(c.env.DB, eventId);
  if (!bundle || !verifyAdminKey(c, bundle.event)) return c.text('Unauthorized', 403);

  if (bundle.event.status === 'drawn') {
    return renderWorkspaceResponse(c, eventId, {
      error: 'Names have already been drawn. Reset the draw first to add new participants.',
    });
  }

  const body = await c.req.parseBody();
  const parsedNames = parseBatchNames(String(body.name || ''));
  if (parsedNames.length === 0) {
    return renderWorkspaceResponse(c, eventId, { error: 'Please enter at least one name.' });
  }

  const existingLower = new Set(bundle.participants.map((p) => p.name.toLowerCase()));
  const toInsert: string[] = [];
  let skippedDuplicates = 0;

  for (const candidate of parsedNames) {
    const key = candidate.toLowerCase();
    if (existingLower.has(key)) {
      skippedDuplicates++;
    } else {
      existingLower.add(key);
      toInsert.push(candidate);
    }
  }

  if (toInsert.length === 0) {
    return renderWorkspaceResponse(c, eventId, {
      error: `"${parsedNames[0]}" is already in the participant list. Add a last initial if two people share a name!`,
    });
  }

  const statements = toInsert.map((personName) =>
    c.env.DB.prepare(
      `INSERT INTO participants (id, event_id, name, token) VALUES (?, ?, ?, ?)`
    ).bind(generateId('pt', 8), eventId, personName, generateToken(18))
  );
  await c.env.DB.batch(statements);

  const summary =
    toInsert.length === 1
      ? `Added ${toInsert[0]} to the exchange.`
      : `Added ${toInsert.length} participants to the exchange${
          skippedDuplicates > 0 ? ` (${skippedDuplicates} duplicate skipped)` : ''
        }.`;

  return renderWorkspaceResponse(c, eventId, { success: summary });
});

// 5b. RENAME PARTICIPANT
app.post('/events/:id/participants/:pid/rename', async (c) => {
  const eventId = c.req.param('id');
  const pid = c.req.param('pid');
  const bundle = await loadEventBundle(c.env.DB, eventId);
  if (!bundle || !verifyAdminKey(c, bundle.event)) return c.text('Unauthorized', 403);

  const body = await c.req.parseBody();
  const newName = String(body.name || '').trim();
  if (!newName) {
    return renderWorkspaceResponse(c, eventId, { error: 'Participant name cannot be empty.' });
  }

  const duplicate = bundle.participants.some(
    (p) => p.id !== pid && p.name.toLowerCase() === newName.toLowerCase()
  );
  if (duplicate) {
    return renderWorkspaceResponse(c, eventId, {
      error: `"${newName}" is already in the participant list.`,
    });
  }

  await c.env.DB.prepare(`UPDATE participants SET name = ? WHERE id = ? AND event_id = ?`)
    .bind(newName, pid, eventId)
    .run();

  return renderWorkspaceResponse(c, eventId, {
    success: `Updated participant name to ${newName}.`,
  });
});

// 6. REMOVE PARTICIPANT (Supports both native POST /delete and DELETE)
const removeParticipantHandler = async (c: Context<{ Bindings: Bindings }>) => {
  const eventId = c.req.param('id') || '';
  const pid = c.req.param('pid') || '';
  const bundle = await loadEventBundle(c.env.DB, eventId);
  if (!bundle || !verifyAdminKey(c, bundle.event)) return c.text('Unauthorized', 403);

  if (bundle.event.status === 'drawn') {
    return renderWorkspaceResponse(c, eventId, {
      error: 'Cannot remove participants after names are drawn. Reset the draw first.',
    });
  }

  await c.env.DB.batch([
    c.env.DB.prepare(
      `DELETE FROM exclusions WHERE event_id = ? AND (participant_id = ? OR excluded_participant_id = ?)`
    ).bind(eventId, pid, pid),
    c.env.DB.prepare(`DELETE FROM participants WHERE id = ? AND event_id = ?`).bind(
      pid,
      eventId
    ),
  ]);

  return renderWorkspaceResponse(c, eventId);
};
app.post('/events/:id/participants/:pid/delete', removeParticipantHandler);
app.delete('/events/:id/participants/:pid', removeParticipantHandler);

// 7. ADD EXCLUSION RULE
app.post('/events/:id/exclusions', async (c) => {
  const eventId = c.req.param('id');
  const bundle = await loadEventBundle(c.env.DB, eventId);
  if (!bundle || !verifyAdminKey(c, bundle.event)) return c.text('Unauthorized', 403);

  const body = await c.req.parseBody();
  const personA = String(body.participant_id || '').trim();
  const personB = String(body.excluded_participant_id || '').trim();
  const mutual = body.mutual === '1';

  if (!personA || !personB || personA === personB) {
    return renderWorkspaceResponse(c, eventId, {
      error: 'Please select two different participants for an exclusion rule.',
    });
  }

  await c.env.DB.prepare(
    `INSERT OR IGNORE INTO exclusions (id, event_id, participant_id, excluded_participant_id)
     VALUES (?, ?, ?, ?)`
  )
    .bind(generateId('ex', 8), eventId, personA, personB)
    .run();

  if (mutual) {
    await c.env.DB.prepare(
      `INSERT OR IGNORE INTO exclusions (id, event_id, participant_id, excluded_participant_id)
       VALUES (?, ?, ?, ?)`
    )
      .bind(generateId('ex', 8), eventId, personB, personA)
      .run();
  }

  return renderWorkspaceResponse(c, eventId, {
    success: 'Exclusion rule added.',
  });
});

// 8. REMOVE EXCLUSION RULE
const removeExclusionHandler = async (c: Context<{ Bindings: Bindings }>) => {
  const eventId = c.req.param('id') || '';
  const exid = c.req.param('exid') || '';
  const bundle = await loadEventBundle(c.env.DB, eventId);
  if (!bundle || !verifyAdminKey(c, bundle.event)) return c.text('Unauthorized', 403);

  await c.env.DB.prepare(`DELETE FROM exclusions WHERE id = ? AND event_id = ?`)
    .bind(exid, eventId)
    .run();

  return renderWorkspaceResponse(c, eventId);
};
app.post('/events/:id/exclusions/:exid/delete', removeExclusionHandler);
app.delete('/events/:id/exclusions/:exid', removeExclusionHandler);

// 9. EXECUTE SECRET SANTA DRAW (AES-256-GCM ENCRYPTED PER PARTICIPANT TOKEN)
app.post('/events/:id/draw', async (c) => {
  const eventId = c.req.param('id');
  const bundle = await loadEventBundle(c.env.DB, eventId);
  if (!bundle || !verifyAdminKey(c, bundle.event)) return c.text('Unauthorized', 403);

  const result = computeSecretSantaDraw(
    bundle.participants.map((p) => ({ id: p.id, name: p.name })),
    bundle.exclusions.map((e) => ({
      participant_id: e.participant_id,
      excluded_participant_id: e.excluded_participant_id,
    }))
  );

  if (!result.ok) {
    return renderWorkspaceResponse(c, eventId, { error: result.error });
  }

  const participantById = new Map(bundle.participants.map((p) => [p.id, p]));
  const statements: D1PreparedStatement[] = [
    c.env.DB.prepare(`DELETE FROM qa_messages WHERE event_id = ?`).bind(eventId),
  ];

  for (const [giverId, receiverId] of Object.entries(result.assignments)) {
    const giver = participantById.get(giverId)!;
    const encrypted = await encryptAssignment(eventId, giver.token, receiverId);
    statements.push(
      c.env.DB.prepare(
        `UPDATE participants
         SET assigned_to_id = NULL, encrypted_assignment = ?, unwrapped_at = NULL
         WHERE id = ? AND event_id = ?`
      ).bind(encrypted, giverId, eventId)
    );
  }

  statements.push(
    c.env.DB.prepare(
      `UPDATE events SET status = 'drawn', drawn_at = datetime('now') WHERE id = ?`
    ).bind(eventId)
  );

  await c.env.DB.batch(statements);

  return renderWorkspaceResponse(c, eventId, {
    success:
      '🎁 Envelopes sealed & encrypted! Share each guest’s private link below.',
  });
});

// 10. RESET DRAW
app.post('/events/:id/reset', async (c) => {
  const eventId = c.req.param('id');
  const bundle = await loadEventBundle(c.env.DB, eventId);
  if (!bundle || !verifyAdminKey(c, bundle.event)) return c.text('Unauthorized', 403);

  await c.env.DB.batch([
    c.env.DB.prepare(`DELETE FROM qa_messages WHERE event_id = ?`).bind(eventId),
    c.env.DB.prepare(
      `UPDATE participants
       SET assigned_to_id = NULL, encrypted_assignment = '', unwrapped_at = NULL
       WHERE event_id = ?`
    ).bind(eventId),
    c.env.DB.prepare(`UPDATE events SET status = 'draft', drawn_at = NULL WHERE id = ?`).bind(
      eventId
    ),
  ]);

  return renderWorkspaceResponse(c, eventId, {
    success: 'Draw reset. You can now add/remove participants or adjust exclusions.',
  });
});

async function loadRevealBundle(db: D1Database, token: string) {
  const participant = await db
    .prepare('SELECT * FROM participants WHERE token = ?')
    .bind(token)
    .first<ParticipantRecord>();
  if (!participant) return null;

  const event = await db
    .prepare('SELECT * FROM events WHERE id = ?')
    .bind(participant.event_id)
    .first<EventRecord>();
  if (!event) return null;

  let assignedRecipient: ParticipantRecord | null = null;
  let outgoingQuestions: QaMessageRecord[] = [];

  if (event.status === 'drawn') {
    const recipientId = await resolveRecipientId(event.id, participant);
    if (recipientId) {
      assignedRecipient = await db
        .prepare('SELECT * FROM participants WHERE id = ?')
        .bind(recipientId)
        .first<ParticipantRecord>();

      if (assignedRecipient) {
        const { results: outRows } = await db
          .prepare(
            'SELECT * FROM qa_messages WHERE event_id = ? AND recipient_id = ? ORDER BY created_at ASC, rowid ASC'
          )
          .bind(event.id, assignedRecipient.id)
          .all<QaMessageRecord>();
        outgoingQuestions = outRows || [];
      }
    }
  }

  const { results: inRows } = await db
    .prepare(
      'SELECT * FROM qa_messages WHERE event_id = ? AND recipient_id = ? ORDER BY created_at ASC, rowid ASC'
    )
    .bind(event.id, participant.id)
    .all<QaMessageRecord>();

  return {
    event,
    participant,
    assignedRecipient,
    outgoingQuestions,
    incomingQuestions: inRows || [],
  };
}

// 11. PARTICIPANT PRIVATE REVEAL PAGE
app.get('/reveal/:token', async (c) => {
  const token = c.req.param('token');
  const bundle = await loadRevealBundle(c.env.DB, token);

  if (!bundle) {
    return c.html(
      <Layout title="Invite Link Not Found">
        <div class="surface-card narrow-container status-card-centered">
          <h1>Invite Link Not Found</h1>
          <p>
            This Secret Santa invite link doesn't exist or may have been removed by the organizer.
          </p>
          <a href="/" class="btn btn-primary">
            Go to Home
          </a>
        </div>
      </Layout>,
      404
    );
  }

  // Remember this participant's envelope on this device for seamless /join/:code resumption
  setCookie(c, `ss_guest_${bundle.event.id}`, bundle.participant.token, buildCookieOpts(c));

  const origin = new URL(c.req.url).origin;
  const joinedJustNow = c.req.query('joined') === '1';

  return c.html(
    <RevealPage
      event={bundle.event}
      participant={bundle.participant}
      assignedRecipient={bundle.assignedRecipient}
      outgoingQuestions={bundle.outgoingQuestions}
      incomingQuestions={bundle.incomingQuestions}
      origin={origin}
      joinedJustNow={joinedJustNow}
    />
  );
});

// Helper for Reveal page inline vs full-page responses
async function renderRevealResponse(
  c: Context<{ Bindings: Bindings }>,
  token: string,
  partialType: 'unwrap' | 'wishlist' | 'santa-qa' | 'recipient-qa',
  options?: {
    wishlistSaved?: boolean;
    wishlistError?: string;
    qaFeedback?: string;
    qaError?: string;
  }
) {
  const bundle = await loadRevealBundle(c.env.DB, token);
  if (!bundle) return c.text('Not found', 404);

  const origin = new URL(c.req.url).origin;
  const isInlineFetch = Boolean(c.req.header('X-Inline-Target'));

  if (isInlineFetch) {
    if (partialType === 'unwrap') {
      return c.html(
        <UnwrappedMatchCard
          event={bundle.event}
          participant={bundle.participant}
          assignedRecipient={bundle.assignedRecipient}
          outgoingQuestions={bundle.outgoingQuestions}
        />
      );
    }
    if (partialType === 'santa-qa' && bundle.assignedRecipient) {
      return c.html(
        <SantaQaPanel
          participant={bundle.participant}
          assignedRecipient={bundle.assignedRecipient}
          questions={bundle.outgoingQuestions}
          qaFeedback={options?.qaFeedback}
          qaError={options?.qaError}
        />
      );
    }
    if (partialType === 'recipient-qa') {
      return c.html(
        <RecipientQaInbox
          participant={bundle.participant}
          questions={bundle.incomingQuestions}
          qaFeedback={options?.qaFeedback}
          qaError={options?.qaError}
        />
      );
    }
    return c.html(
      <ParticipantWishlistEditor
        participant={bundle.participant}
        wishlistSaved={options?.wishlistSaved}
        wishlistError={options?.wishlistError}
      />
    );
  }

  return c.html(
    <RevealPage
      event={bundle.event}
      participant={bundle.participant}
      assignedRecipient={bundle.assignedRecipient}
      outgoingQuestions={bundle.outgoingQuestions}
      incomingQuestions={bundle.incomingQuestions}
      origin={origin}
      wishlistSaved={options?.wishlistSaved}
      wishlistError={options?.wishlistError}
      qaFeedback={options?.qaFeedback}
      qaError={options?.qaError}
    />
  );
}

// 12. UNWRAP ENVELOPE ACTION
app.post('/reveal/:token/unwrap', async (c) => {
  const token = c.req.param('token');
  const participant = await c.env.DB.prepare('SELECT * FROM participants WHERE token = ?')
    .bind(token)
    .first<ParticipantRecord>();

  if (!participant) return c.text('Not found', 404);

  await c.env.DB.prepare(
    `UPDATE participants SET unwrapped_at = COALESCE(unwrapped_at, datetime('now')) WHERE id = ?`
  )
    .bind(participant.id)
    .run();

  return renderRevealResponse(c, token, 'unwrap');
});

// 13. SAVE PARTICIPANT WISHLIST NOTES
app.post('/reveal/:token/wishlist', async (c) => {
  const token = c.req.param('token');
  const participant = await c.env.DB.prepare('SELECT * FROM participants WHERE token = ?')
    .bind(token)
    .first<ParticipantRecord>();

  if (!participant) return c.text('Not found', 404);

  const body = await c.req.parseBody();
  const wishlistNotes = String(body.wishlist_notes || '').trim();

  await c.env.DB.prepare(`UPDATE participants SET wishlist_notes = ? WHERE id = ?`)
    .bind(wishlistNotes, participant.id)
    .run();

  return renderRevealResponse(c, token, 'wishlist', { wishlistSaved: true });
});

// 14. ADD PARTICIPANT WISHLIST LINK
app.post('/reveal/:token/links', async (c) => {
  const token = c.req.param('token');
  const participant = await c.env.DB.prepare('SELECT * FROM participants WHERE token = ?')
    .bind(token)
    .first<ParticipantRecord>();

  if (!participant) return c.text('Not found', 404);

  const body = await c.req.parseBody();
  const title = String(body.title || '').trim();
  const rawUrl = String(body.url || '').trim();
  const safeUrl = sanitizeHttpUrl(rawUrl);

  if (!title || !safeUrl) {
    return renderRevealResponse(c, token, 'wishlist', {
      wishlistError: 'Please provide an item name and a valid http:// or https:// URL.',
    });
  }

  const existingLinks = parseWishlistLinks(participant.wishlist_links);
  existingLinks.push({ title, url: safeUrl });

  await c.env.DB.prepare(`UPDATE participants SET wishlist_links = ? WHERE id = ?`)
    .bind(JSON.stringify(existingLinks), participant.id)
    .run();

  return renderRevealResponse(c, token, 'wishlist', { wishlistSaved: true });
});

// 15. REMOVE PARTICIPANT WISHLIST LINK
const removeWishlistLinkHandler = async (c: Context<{ Bindings: Bindings }>) => {
  const token = c.req.param('token') || '';
  const idx = Number.parseInt(c.req.param('idx') || '', 10);
  const participant = await c.env.DB.prepare('SELECT * FROM participants WHERE token = ?')
    .bind(token)
    .first<ParticipantRecord>();

  if (!participant) return c.text('Not found', 404);

  const existingLinks = parseWishlistLinks(participant.wishlist_links);
  if (!Number.isNaN(idx) && idx >= 0 && idx < existingLinks.length) {
    existingLinks.splice(idx, 1);
  }

  await c.env.DB.prepare(`UPDATE participants SET wishlist_links = ? WHERE id = ?`)
    .bind(JSON.stringify(existingLinks), participant.id)
    .run();

  return renderRevealResponse(c, token, 'wishlist', { wishlistSaved: true });
};
app.post('/reveal/:token/links/:idx/delete', removeWishlistLinkHandler);
app.delete('/reveal/:token/links/:idx', removeWishlistLinkHandler);

// 16. ANONYMOUS SANTA -> RECIPIENT QUESTION (Stores zero giver_id in DB!)
app.post('/reveal/:token/questions', async (c) => {
  const token = c.req.param('token');
  const participant = await c.env.DB.prepare('SELECT * FROM participants WHERE token = ?')
    .bind(token)
    .first<ParticipantRecord>();
  if (!participant) return c.text('Not found', 404);

  const recipientId = await resolveRecipientId(participant.event_id, participant);
  if (!recipientId) {
    return renderRevealResponse(c, token, 'santa-qa', {
      qaError: 'Names have not been drawn yet.',
    });
  }

  const body = await c.req.parseBody();
  const question = String(body.question || '').trim().slice(0, 280);
  if (!question) {
    return renderRevealResponse(c, token, 'santa-qa', {
      qaError: 'Please type a question before sending.',
    });
  }

  await c.env.DB.prepare(
    `INSERT INTO qa_messages (id, event_id, recipient_id, question) VALUES (?, ?, ?, ?)`
  )
    .bind(generateId('qa', 8), participant.event_id, recipientId, question)
    .run();

  return renderRevealResponse(c, token, 'santa-qa', { qaFeedback: 'Sent Anonymously' });
});

// 17. RECIPIENT ANSWERS ANONYMOUS SANTA QUESTION
app.post('/reveal/:token/questions/:qid/answer', async (c) => {
  const token = c.req.param('token');
  const qid = c.req.param('qid');
  const participant = await c.env.DB.prepare('SELECT * FROM participants WHERE token = ?')
    .bind(token)
    .first<ParticipantRecord>();
  if (!participant) return c.text('Not found', 404);

  const body = await c.req.parseBody();
  const answer = String(body.answer || '').trim().slice(0, 400);
  if (!answer) {
    return renderRevealResponse(c, token, 'recipient-qa', {
      qaError: 'Reply cannot be empty.',
    });
  }

  await c.env.DB.prepare(
    `UPDATE qa_messages
     SET answer = ?, answered_at = datetime('now')
     WHERE id = ? AND event_id = ? AND recipient_id = ?`
  )
    .bind(answer, qid, participant.event_id, participant.id)
    .run();

  return renderRevealResponse(c, token, 'recipient-qa', { qaFeedback: 'Reply Saved' });
});

export default app;
