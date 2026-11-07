# North Pole Post — Secret Santa on Cloudflare Workers

A fast, passwordless Secret Santa gift exchange organizer built for **Cloudflare Workers**, **Hono (`hono/jsx`)**, and **Cloudflare D1 (SQLite)** with progressive-enhancement native HTML `<form>` mutations (~600B inline JS, zero external client libraries).

## Features

- **Zero Passwords / Crowdsourced Roster:**
  - Organizers create an exchange and receive a private **Organizer Dashboard URL** (`/events/:id?key=...`) saved locally to their device cookies, plus a shareable **Group Self-Join Link** (`/join/:code`) so guests can add themselves and their wishlists directly from a group chat (or hosts can bulk-paste a list of names at once).
  - Each participant gets a private **Envelope Link** (`/reveal/:token`) shareable in one tap via Copy Link, WhatsApp, or SMS/iMessage.
- **Single-Cycle Matching Solver (`src/algorithm.ts`):**
  - Guarantees no self-draws, respects mutual or one-way exclusion rules (couples, partners, roommates), and solves for a single unbroken Hamiltonian gift cycle across all $N$ participants using unbiased CSPRNG shuffling (falling back to multi-cycle derangements only when exclusions mathematically force them).
- **AES-256-GCM Encrypted No-Peek Mode (`src/crypto.ts`):**
  - Assignments are encrypted at rest with WebCrypto AES-256-GCM using a key derived from each participant's private token. In **Strict Encrypted No-Peek Mode** (default), not even the host can view a master spoiler list after drawing.
- **Tactile Envelope Reveal, Live Wishlists & Anonymous Q&A:**
  - Participants break the wax seal on their stationery envelope to reveal their match, browse live-synced gift notes and validated `http(s)` item links, and exchange **anonymous questions & replies** with their match (storing zero `santa_id` in the database).
- **Progressive Native Forms + View Transitions:**
  - Every mutation is a standard `<form method="post">` that works without JavaScript and upgrades via `fetch()` + `document.startViewTransition()` partial swaps.


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