import { Hono, type Context } from 'hono';
import { getCookie, setCookie } from 'hono/cookie';
import {
  ensureSchema,
  parseWishlistLinks,
  type EventRecord,
  type ExclusionRecord,
  type ParticipantRecord,
} from './db';
import { computeSecretSantaDraw, generateId, generateToken } from './algorithm';
import { HomePage, type RecentEventCookieItem } from './views/home';
import { DashboardPage, OrganizerWorkspace } from './views/dashboard';
import {
  ParticipantWishlistEditor,
  RevealPage,
  UnwrappedMatchCard,
} from './views/reveal';
import { Layout } from './views/layout';
import { APP_CSS, FAVICON_SVG } from './styles';

export interface Bindings {
  DB: D1Database;
}

const app = new Hono<{ Bindings: Bindings }>();

// 0. STATIC ASSETS: FAVICON & CACHED STYLESHEET
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

// Automatically ensure D1 schema tables exist on first request
app.use('*', async (c, next) => {
  await ensureSchema(c.env.DB);
  await next();
});

const RECENT_EVENTS_COOKIE = 'ss_recent_events';

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
    // Replace previous demo sandboxes so testing the demo does not stack duplicate rows
    if (isDemo && e.title === 'Winter Chalet Gift Exchange 2026') return false;
    return true;
  });
  const updated = [item, ...existing].slice(0, 6);
  setCookie(c, RECENT_EVENTS_COOKIE, JSON.stringify(updated), {
    path: '/',
    httpOnly: true,
    sameSite: 'Lax',
    maxAge: 60 * 60 * 24 * 90,
  });
}

function removeRecentEvent(c: Context, eventId: string): void {
  const updated = getRecentEvents(c).filter((e) => e.id !== eventId);
  setCookie(c, RECENT_EVENTS_COOKIE, JSON.stringify(updated), {
    path: '/',
    httpOnly: true,
    sameSite: 'Lax',
    maxAge: 60 * 60 * 24 * 90,
  });
}

function verifyAdminKey(c: Context, event: EventRecord): boolean {
  const queryKey = c.req.query('key');
  const cookieKey = getCookie(c, `ss_admin_${event.id}`);
  if (queryKey && queryKey === event.admin_key) {
    setCookie(c, `ss_admin_${event.id}`, event.admin_key, {
      path: '/',
      httpOnly: true,
      sameSite: 'Lax',
      maxAge: 60 * 60 * 24 * 90,
    });
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

  const { results: participants } = await db
    .prepare('SELECT * FROM participants WHERE event_id = ? ORDER BY created_at ASC, rowid ASC')
    .bind(eventId)
    .all<ParticipantRecord>();

  const { results: exclusions } = await db
    .prepare('SELECT * FROM exclusions WHERE event_id = ? ORDER BY created_at ASC, rowid ASC')
    .bind(eventId)
    .all<ExclusionRecord>();

  return {
    event,
    participants: participants || [],
    exclusions: exclusions || [],
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
  setCookie(c, RECENT_EVENTS_COOKIE, '[]', {
    path: '/',
    httpOnly: true,
    sameSite: 'Lax',
    maxAge: 0,
  });
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

  await c.env.DB.prepare(
    `INSERT INTO events (id, title, organizer_name, budget, exchange_date, notes, admin_key, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'draft')`
  )
    .bind(eventId, title, organizerName, budget, exchangeDate, notes, adminKey)
    .run();

  if (includeOrganizer) {
    const pId = generateId('pt', 8);
    const pToken = generateToken(16);
    await c.env.DB.prepare(
      `INSERT INTO participants (id, event_id, name, token) VALUES (?, ?, ?, ?)`
    )
      .bind(pId, eventId, organizerName, pToken)
      .run();
  }

  setCookie(c, `ss_admin_${eventId}`, adminKey, {
    path: '/',
    httpOnly: true,
    sameSite: 'Lax',
    maxAge: 60 * 60 * 24 * 90,
  });
  saveRecentEvent(c, { id: eventId, title, key: adminKey });

  return c.redirect(`/events/${eventId}?key=${encodeURIComponent(adminKey)}`);
});

// 3. SEED INSTANT DEMO EXCHANGE
app.post('/demo', async (c) => {
  const eventId = generateId('ev', 8);
  const adminKey = generateToken(20);
  const title = 'Winter Chalet Gift Exchange 2026';

  await c.env.DB.prepare(
    `INSERT INTO events (id, title, organizer_name, budget, exchange_date, notes, admin_key, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'draft')`
  )
    .bind(
      eventId,
      title,
      'TJ',
      '$45',
      '2026-12-24',
      'Bring your wrapped gift to the fireplace gathering! Handmade or local gifts encouraged.',
      adminKey
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
      .bind(person.id, eventId, person.name, generateToken(16), person.notes, person.links)
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

  setCookie(c, `ss_admin_${eventId}`, adminKey, {
    path: '/',
    httpOnly: true,
    sameSite: 'Lax',
    maxAge: 60 * 60 * 24 * 90,
  });
  saveRecentEvent(c, { id: eventId, title, key: adminKey });

  return c.redirect(`/events/${eventId}?key=${encodeURIComponent(adminKey)}`);
});

// 4. VIEW ORGANIZER DASHBOARD
app.get('/events/:id', async (c) => {
  const eventId = c.req.param('id');
  const bundle = await loadEventBundle(c.env.DB, eventId);

  if (!bundle) {
    return c.html(
      <Layout title="Exchange Not Found">
        <div class="surface-card narrow-container" style="text-align: center;">
          <h1 style="margin-bottom: 0.5rem;">Exchange Not Found</h1>
          <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">
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
        <div class="surface-card narrow-container" style="text-align: center;">
          <h1 style="margin-bottom: 0.5rem;">🔒 Private Organizer Dashboard</h1>
          <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">
            To manage <strong>{bundle.event.title}</strong>, please use your bookmarked Organizer
            Link containing your secret <code>?key=...</code> parameter.
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
      origin={origin}
    />
  );
});

// Helper to render OrganizerWorkspace (Inline partial if X-Inline-Target header is present, or full page fallback)
async function renderWorkspaceResponse(
  c: Context<{ Bindings: Bindings }>,
  eventId: string,
  flash?: { error?: string; success?: string }
) {
  const bundle = await loadEventBundle(c.env.DB, eventId);
  if (!bundle) return c.text('Not found', 404);
  const origin = new URL(c.req.url).origin;
  const isInlineFetch = Boolean(c.req.header('X-Inline-Target'));

  const props = {
    event: bundle.event,
    participants: bundle.participants,
    exclusions: bundle.exclusions,
    origin,
    flashError: flash?.error,
    flashSuccess: flash?.success,
  };

  if (isInlineFetch) {
    return c.html(<OrganizerWorkspace {...props} />);
  }
  return c.html(<DashboardPage {...props} />);
}

// 5. ADD PARTICIPANT
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
  const name = String(body.name || '').trim();
  if (!name) {
    return renderWorkspaceResponse(c, eventId, { error: 'Please enter a participant name.' });
  }

  const duplicate = bundle.participants.some(
    (p) => p.name.toLowerCase() === name.toLowerCase()
  );
  if (duplicate) {
    return renderWorkspaceResponse(c, eventId, {
      error: `"${name}" is already in the participant list. Add a last initial if two people share a name!`,
    });
  }

  const pId = generateId('pt', 8);
  const pToken = generateToken(16);
  await c.env.DB.prepare(
    `INSERT INTO participants (id, event_id, name, token) VALUES (?, ?, ?, ?)`
  )
    .bind(pId, eventId, name, pToken)
    .run();

  return renderWorkspaceResponse(c, eventId, {
    success: `Added ${name} to the exchange.`,
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

// 9. EXECUTE SECRET SANTA DRAW
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

  const statements = Object.entries(result.assignments).map(([giverId, receiverId]) =>
    c.env.DB.prepare(
      `UPDATE participants SET assigned_to_id = ?, unwrapped_at = NULL WHERE id = ? AND event_id = ?`
    ).bind(receiverId, giverId, eventId)
  );

  statements.push(
    c.env.DB.prepare(
      `UPDATE events SET status = 'drawn', drawn_at = datetime('now') WHERE id = ?`
    ).bind(eventId)
  );

  await c.env.DB.batch(statements);

  return renderWorkspaceResponse(c, eventId, {
    success:
      '🎁 Names have been drawn! Share each person’s private invite link below.',
  });
});

// 10. RESET DRAW
app.post('/events/:id/reset', async (c) => {
  const eventId = c.req.param('id');
  const bundle = await loadEventBundle(c.env.DB, eventId);
  if (!bundle || !verifyAdminKey(c, bundle.event)) return c.text('Unauthorized', 403);

  await c.env.DB.batch([
    c.env.DB.prepare(
      `UPDATE participants SET assigned_to_id = NULL, unwrapped_at = NULL WHERE event_id = ?`
    ).bind(eventId),
    c.env.DB.prepare(`UPDATE events SET status = 'draft', drawn_at = NULL WHERE id = ?`).bind(
      eventId
    ),
  ]);

  return renderWorkspaceResponse(c, eventId, {
    success: 'Draw reset. You can now add/remove participants or adjust exclusions.',
  });
});

// 11. PARTICIPANT PRIVATE REVEAL PAGE
app.get('/reveal/:token', async (c) => {
  const token = c.req.param('token');
  const participant = await c.env.DB.prepare('SELECT * FROM participants WHERE token = ?')
    .bind(token)
    .first<ParticipantRecord>();

  if (!participant) {
    return c.html(
      <Layout title="Invite Link Not Found">
        <div class="surface-card narrow-container" style="text-align: center;">
          <h1 style="margin-bottom: 0.5rem;">Invite Link Not Found</h1>
          <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">
            This Secret Santa invite link doesn't exist or may have been reset by the organizer.
          </p>
          <a href="/" class="btn btn-primary">
            Go to Home
          </a>
        </div>
      </Layout>,
      404
    );
  }

  const event = await c.env.DB.prepare('SELECT * FROM events WHERE id = ?')
    .bind(participant.event_id)
    .first<EventRecord>();

  if (!event) return c.text('Event not found', 404);

  let assignedRecipient: ParticipantRecord | null = null;
  if (participant.assigned_to_id) {
    assignedRecipient = await c.env.DB.prepare('SELECT * FROM participants WHERE id = ?')
      .bind(participant.assigned_to_id)
      .first<ParticipantRecord>();
  }

  return c.html(
    <RevealPage
      event={event}
      participant={participant}
      assignedRecipient={assignedRecipient}
    />
  );
});

// Helper for Reveal page inline vs full-page responses
async function renderRevealResponse(
  c: Context<{ Bindings: Bindings }>,
  token: string,
  partialType: 'unwrap' | 'wishlist',
  options?: { wishlistSaved?: boolean; wishlistError?: string }
) {
  const participant = await c.env.DB.prepare('SELECT * FROM participants WHERE token = ?')
    .bind(token)
    .first<ParticipantRecord>();
  if (!participant) return c.text('Not found', 404);

  const event = await c.env.DB.prepare('SELECT * FROM events WHERE id = ?')
    .bind(participant.event_id)
    .first<EventRecord>();
  if (!event) return c.text('Event not found', 404);

  let assignedRecipient: ParticipantRecord | null = null;
  if (participant.assigned_to_id) {
    assignedRecipient = await c.env.DB.prepare('SELECT * FROM participants WHERE id = ?')
      .bind(participant.assigned_to_id)
      .first<ParticipantRecord>();
  }

  const isInlineFetch = Boolean(c.req.header('X-Inline-Target'));
  if (isInlineFetch) {
    if (partialType === 'unwrap') {
      return c.html(
        <UnwrappedMatchCard
          event={event}
          participant={participant}
          assignedRecipient={assignedRecipient}
        />
      );
    }
    return c.html(
      <ParticipantWishlistEditor
        participant={participant}
        wishlistSaved={options?.wishlistSaved}
        wishlistError={options?.wishlistError}
      />
    );
  }

  return c.html(
    <RevealPage
      event={event}
      participant={participant}
      assignedRecipient={assignedRecipient}
      wishlistSaved={options?.wishlistSaved}
      wishlistError={options?.wishlistError}
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
  const url = String(body.url || '').trim();

  if (!title || !url) {
    return renderRevealResponse(c, token, 'wishlist', {
      wishlistError: 'Please provide both an item name and a valid URL.',
    });
  }

  const existingLinks = parseWishlistLinks(participant.wishlist_links);
  existingLinks.push({ title, url });

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

export default app;
