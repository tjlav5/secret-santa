# North Pole Post — Secret Santa on Cloudflare Workers

A fast, passwordless Secret Santa gift exchange organizer built for **Cloudflare Workers**, **Hono (`hono/jsx`)**, and **Cloudflare D1 (SQLite)** with progressive-enhancement native HTML `<form>` mutations (~600B inline JS, zero external client libraries).

## Features

- **Zero Passwords / Zero Friction:**
  - Organizers create an exchange and receive a private **Organizer Dashboard URL** (`/events/:id?key=...`) automatically saved to their browser cookies.
  - Each participant gets a unique, unguessable **Private Envelope Link** (`/reveal/:token`) that can be shared in one click via Copy Link, WhatsApp, or SMS/iMessage.
- **Constrained Matching Solver (`src/algorithm.ts`):**
  - Guarantees no self-draws, respects mutual or one-way exclusion rules (e.g. couples/partners/roommates), and avoids reciprocal 2-person sub-loops when $N \ge 3$.
- **Interactive Seal Break & Live Wishlists:**
  - Participants break the seal on their digital envelope to reveal their match, view their recipient's gift hints/links, and save their own wishlist notes and item URLs.
- **Progressive Native Forms (~600B Inline JS):**
  - Every action is a standard `<form method="post">` that works with 0 JS, progressively enhanced with a ~600-byte inline `fetch()` + `document.startViewTransition()` swapper for instant, no-reload updates.

## Local Development

```bash
# Install dependencies
npm install

# Run unit tests
npm test

# Start local Cloudflare Worker + D1 SQLite server
npm run dev
```

## Deploying to Cloudflare Workers

```bash
# 1. Create a production D1 database
npx wrangler d1 create secret-santa-db

# 2. Update database_id in wrangler.toml with the ID printed above

# 3. Initialize remote D1 schema (optional; the worker also auto-initializes tables)
npm run db:init:remote

# 4. Deploy Worker
npm run deploy
```