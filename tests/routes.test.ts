import { describe, expect, it } from 'vitest';
import app from '../src/index';
import { decryptAssignment, encryptAssignment } from '../src/crypto';
import { parseBatchNames } from '../src/db';

interface SqliteStatement {
  get(...args: unknown[]): Record<string, unknown> | undefined;
  all(...args: unknown[]): unknown[];
  run(...args: unknown[]): unknown;
}

interface SqliteDatabase {
  prepare(sql: string): SqliteStatement;
  exec(sql: string): void;
}

function createMemoryD1(): D1Database {
  const { DatabaseSync } = (
    globalThis as unknown as {
      process: {
        getBuiltinModule(id: string): { DatabaseSync: new (path: string) => SqliteDatabase };
      };
    }
  ).process.getBuiltinModule('node:sqlite');
  const sqlite = new DatabaseSync(':memory:');

  function createStmt(sql: string, boundArgs: unknown[] = []): D1PreparedStatement {
    return {
      bind(...values: unknown[]) {
        return createStmt(sql, values);
      },
      async first<T = Record<string, unknown>>(colName?: string): Promise<T | null> {
        const stmt = sqlite.prepare(sql);
        const row = stmt.get(...(boundArgs as never[])) as Record<string, unknown> | undefined;
        if (!row) return null;
        if (colName) return (row[colName] as T) ?? null;
        return row as T;
      },
      async all<T = Record<string, unknown>>(): Promise<D1Result<T>> {
        const stmt = sqlite.prepare(sql);
        const results = stmt.all(...(boundArgs as never[])) as T[];
        return {
          results,
          success: true,
          meta: {} as D1Result<T>['meta'],
        };
      },
      async run<T = Record<string, unknown>>(): Promise<D1Result<T>> {
        const stmt = sqlite.prepare(sql);
        stmt.run(...(boundArgs as never[]));
        return {
          results: [],
          success: true,
          meta: {} as D1Result<T>['meta'],
        };
      },
      async raw<T = unknown[]>(): Promise<T[]> {
        return [];
      },
    } as unknown as D1PreparedStatement;
  }

  return {
    prepare(query: string) {
      return createStmt(query);
    },
    async batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]> {
      const out: D1Result<T>[] = [];
      for (const s of statements) {
        out.push(await s.run<T>());
      }
      return out;
    },
    async exec(query: string): Promise<D1ExecResult> {
      sqlite.exec(query);
      return { count: 1, duration: 0 };
    },
    async dump(): Promise<ArrayBuffer> {
      return new ArrayBuffer(0);
    },
  } as unknown as D1Database;
}

describe('Batch Name Parser & AES-256-GCM Assignment Crypto', () => {
  it('parses bulleted, numbered, newline, and comma-separated lists cleanly', () => {
    const raw = '1. Alice\n2) Bob, - Charlie; • Aunt Clara\n\n';
    expect(parseBatchNames(raw)).toEqual(['Alice', 'Bob', 'Charlie', 'Aunt Clara']);
  });

  it('encrypts assignments so only the matching event + giver token can decrypt', async () => {
    const cipher = await encryptAssignment('ev_123', 'tok_secret_alice', 'pt_bob');
    expect(cipher).not.toContain('pt_bob');
    expect(await decryptAssignment('ev_123', 'tok_secret_alice', cipher)).toBe('pt_bob');
    // Wrong token or wrong event fails AES-GCM authentication
    expect(await decryptAssignment('ev_123', 'tok_someone_else', cipher)).toBeNull();
    expect(await decryptAssignment('ev_other', 'tok_secret_alice', cipher)).toBeNull();
  });
});

describe('HTTP Routes: Self-Join, Bulk Paste, Encrypted No-Peek Draw & Anonymous Q&A', () => {
  it('supports full lifecycle with encrypted assignments, self-join, bulk paste, and anonymous Q&A', async () => {
    const DB = createMemoryD1();

    // 1. Create exchange in Strict Encrypted No-Peek Mode
    const createRes = await app.request(
      'https://santa.example.com/events',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          title: 'Cabin Exchange',
          organizer_name: 'TJ',
          budget: '$40',
          exchange_date: '2026-12-24',
          notes: 'Warm socks welcome',
          include_organizer: '1',
          has_privacy_field: '1',
          strict_privacy: '1',
        }).toString(),
      },
      { DB }
    );

    expect(createRes.status).toBe(302);
    expect(createRes.headers.get('Referrer-Policy')).toBe('no-referrer');
    expect(createRes.headers.get('Set-Cookie')).toContain('Secure');

    const location = createRes.headers.get('Location')!;
    const parsedUrl = new URL(`https://santa.example.com${location}`);
    const eventId = parsedUrl.pathname.split('/')[2];
    const key = parsedUrl.searchParams.get('key')!;

    // 2. Load event record to inspect join_code
    const eventRow = await DB.prepare('SELECT * FROM events WHERE id = ?')
      .bind(eventId)
      .first<{ join_code: string; allow_spoilers: number }>();
    expect(eventRow?.join_code).toBeTruthy();
    expect(eventRow?.allow_spoilers).toBe(0);
    const joinCode = eventRow!.join_code;

    // 3. Guest Elena joins via Group Self-Join Link (/join/:code)
    const joinPageRes = await app.request(`https://santa.example.com/join/${joinCode}`, {}, { DB });
    expect(joinPageRes.status).toBe(200);
    expect(await joinPageRes.text()).toContain('Claim Your Spot');

    const joinSubmitRes = await app.request(
      `https://santa.example.com/join/${joinCode}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          name: 'Elena',
          wishlist_notes: 'Botanical illustration books and matcha!',
        }).toString(),
      },
      { DB }
    );
    expect(joinSubmitRes.status).toBe(302);
    const elenaRedirect = joinSubmitRes.headers.get('Location')!;
    expect(elenaRedirect).toMatch(/^\/reveal\/[A-Za-z0-9]+\?joined=1$/);

    // Duplicate self-join name is rejected with helpful hint
    const dupJoinRes = await app.request(
      `https://santa.example.com/join/${joinCode}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ name: 'elena' }).toString(),
      },
      { DB }
    );
    expect(dupJoinRes.status).toBe(400);
    expect(await dupJoinRes.text()).toContain('has already joined');

    // 4. Bulk paste multiple participants (with one duplicate skipped)
    const bulkRes = await app.request(
      `https://santa.example.com/events/${eventId}/participants?key=${encodeURIComponent(key)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-Inline-Target': '#organizer-workspace',
        },
        body: new URLSearchParams({
          name: '1. Marcus\n2. Chloe, Elena',
        }).toString(),
      },
      { DB }
    );
    expect(bulkRes.status).toBe(200);
    expect(await bulkRes.text()).toContain('Added 2 participants to the exchange (1 duplicate skipped).');

    // 5. Pause self-join link -> blocks further joins
    await app.request(
      `https://santa.example.com/events/${eventId}/join-toggle?key=${encodeURIComponent(key)}`,
      { method: 'POST' },
      { DB }
    );
    const pausedJoinRes = await app.request(
      `https://santa.example.com/join/${joinCode}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ name: 'Latecomer' }).toString(),
      },
      { DB }
    );
    expect(pausedJoinRes.status).toBe(400);

    // 6. Execute Draw -> verify DB stores ONLY AES-GCM encrypted assignments (no plaintext assigned_to_id)
    const drawRes = await app.request(
      `https://santa.example.com/events/${eventId}/draw?key=${encodeURIComponent(key)}`,
      { method: 'POST' },
      { DB }
    );
    expect(drawRes.status).toBe(200);
    const drawHtml = await drawRes.text();
    // Strict Encrypted No-Peek Mode must NOT expose emergency spoiler master list!
    expect(drawHtml).toContain('Encrypted No-Peek Mode Active');
    expect(drawHtml).not.toContain('emergency-spoilers-details');

    const { results: drawnPeople } = await DB.prepare(
      'SELECT * FROM participants WHERE event_id = ?'
    )
      .bind(eventId)
      .all<{
        id: string;
        name: string;
        token: string;
        assigned_to_id: string | null;
        encrypted_assignment: string;
      }>();
    expect(drawnPeople.length).toBe(4);
    for (const p of drawnPeople) {
      expect(p.assigned_to_id).toBeNull();
      expect(p.encrypted_assignment).toContain('.');
    }

    // Attempting to disable Strict No-Peek Mode via settings AFTER draw must be ignored
    await app.request(
      `https://santa.example.com/events/${eventId}/settings?key=${encodeURIComponent(key)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          title: 'Alpine Chalet 2026',
          organizer_name: 'TJ',
          budget: '$60',
          exchange_date: '2026-12-25',
          notes: 'Updated note',
          has_privacy_field: '1',
          // strict_privacy intentionally omitted to try unlocking spoilers post-draw
        }).toString(),
      },
      { DB }
    );
    const afterSettingsEvent = await DB.prepare('SELECT allow_spoilers FROM events WHERE id = ?')
      .bind(eventId)
      .first<{ allow_spoilers: number }>();
    expect(afterSettingsEvent?.allow_spoilers).toBe(0);

    // 7. Unwrap TJ's envelope, ask an anonymous question to TJ's assigned recipient, and verify recipient reply!
    const tj = drawnPeople.find((p) => p.name === 'TJ')!;
    const tjRecipientId = await decryptAssignment(eventId, tj.token, tj.encrypted_assignment);
    expect(tjRecipientId).toBeTruthy();
    const tjRecipient = drawnPeople.find((p) => p.id === tjRecipientId)!;

    const unwrapRes = await app.request(
      `https://santa.example.com/reveal/${tj.token}/unwrap`,
      {
        method: 'POST',
        headers: { 'X-Inline-Target': '#reveal-card-container' },
      },
      { DB }
    );
    expect(await unwrapRes.text()).toContain(tjRecipient.name);

    // TJ (as Santa) asks an anonymous question
    const askRes = await app.request(
      `https://santa.example.com/reveal/${tj.token}/questions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-Inline-Target': '#santa-qa-section',
        },
        body: new URLSearchParams({
          question: 'Do you prefer whole bean or ground coffee?',
        }).toString(),
      },
      { DB }
    );
    expect(askRes.status).toBe(200);
    expect(await askRes.text()).toContain('Do you prefer whole bean or ground coffee?');

    // Verify DB qa_messages row stores NO giver/santa ID
    const qaRow = await DB.prepare('SELECT * FROM qa_messages WHERE event_id = ?')
      .bind(eventId)
      .first<Record<string, unknown>>();
    expect(qaRow).toBeTruthy();
    expect(Object.keys(qaRow!)).not.toContain('giver_id');
    expect(Object.keys(qaRow!)).not.toContain('santa_id');
    expect(qaRow!.recipient_id).toBe(tjRecipient.id);

    // Organizer dashboard shows "1 Q&A Waiting" badge on recipient without leaking Santa
    const dashAfterQa = await (
      await app.request(
        `https://santa.example.com/events/${eventId}?key=${encodeURIComponent(key)}`,
        {},
        { DB }
      )
    ).text();
    expect(dashAfterQa).toContain('1 Q&amp;A Waiting');

    // Recipient opens their envelope, sees the anonymous question, and answers it
    const recipientPageHtml = await (
      await app.request(`https://santa.example.com/reveal/${tjRecipient.token}`, {}, { DB })
    ).text();
    expect(recipientPageHtml).toContain('Questions from Your Secret Santa');
    expect(recipientPageHtml).toContain('Do you prefer whole bean or ground coffee?');

    const answerRes = await app.request(
      `https://santa.example.com/reveal/${tjRecipient.token}/questions/${qaRow!.id}/answer`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-Inline-Target': '#recipient-qa-section',
        },
        body: new URLSearchParams({
          answer: 'Whole bean please! Medium-light roast.',
        }).toString(),
      },
      { DB }
    );
    expect(answerRes.status).toBe(200);
    expect(await answerRes.text()).toContain('Reply Saved');

    // Santa reloads reveal page and sees Recipient's answer!
    const santaPageAfterReply = await (
      await app.request(`https://santa.example.com/reveal/${tj.token}`, {}, { DB })
    ).text();
    expect(santaPageAfterReply).toContain('Whole bean please! Medium-light roast.');

    // 8. Stored XSS attempt on wishlist links is still strictly blocked
    const xssRes = await app.request(
      `https://santa.example.com/reveal/${tjRecipient.token}/links`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-Inline-Target': '#participant-wishlist-section',
        },
        body: new URLSearchParams({
          title: 'Bad Link',
          url: 'javascript:alert(1)',
        }).toString(),
      },
      { DB }
    );
    expect(await xssRes.text()).toContain('valid http:// or https:// URL');
  });
});
