import type { FC } from 'hono/jsx';
import { Layout, PostageStamp, PostmarkSeal, CornerFiligrees } from './layout';

export interface RecentEventCookieItem {
  id: string;
  title: string;
  key: string;
}

interface HomePageProps {
  recentEvents?: RecentEventCookieItem[];
  error?: string;
}

export const HomePage: FC<HomePageProps> = ({ recentEvents = [], error }) => {
  return (
    <Layout title="Secret Santa Gift Exchange Organizer">
      <div class="split-grid">
        <div style="padding-top: 0.35rem;">
          <div class="eyebrow">
            <span>✦ Bespoke Holiday Dispatch</span>
            <span>•</span>
            <span>Zero Passwords or Accounts</span>
          </div>

          <h1 class="hero-title">
            Host your Secret Santa exchange in <em>under a minute.</em>
          </h1>

          <p class="hero-subtitle" style="margin-bottom: 1.85rem;">
            Gather your circle, set partner or household exclusion rules, and draw names. Every
            participant receives a wax-sealed private link they can open via iMessage, WhatsApp,
            Slack, or email—keeping every match a complete surprise, even from the organizer.
          </p>

          {/* PERFORATED POLAR DISPATCH TICKET WITH TEAR-OFF STUB */}
          <div class="postage-ticket" style="margin-bottom: 1.85rem;">
            <div style="display: flex; align-items: center; gap: 1rem;">
              <div
                class="wax-seal"
                style="width: 56px; height: 56px; margin-bottom: 0; flex-shrink: 0;"
                aria-hidden="true"
              >
                <svg
                  width="25"
                  height="25"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <polyline points="20 12 20 22 4 22 4 12" />
                  <rect x="2" y="7" width="20" height="5" />
                  <line x1="12" y1="22" x2="12" y2="7" />
                  <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
                  <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
                </svg>
              </div>
              <div>
                <div
                  style="font-family: var(--font-mono); font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.12em; color: var(--gold-400); font-weight: 700; margin-bottom: 0.15rem;"
                >
                  ✦ Express Demo Pass • 4 Guests + Exclusions
                </div>
                <div
                  style="font-family: var(--font-display); font-size: 1.18rem; font-weight: 700; line-height: 1.25; color: #FFFDF9;"
                >
                  Want to test the draw &amp; break a wax seal first?
                </div>
                <div style="font-size: 0.8rem; color: rgba(249, 246, 240, 0.76); margin-top: 0.2rem;">
                  Spawns a live sandbox exchange with pre-filled wishlists.
                </div>
              </div>
            </div>

            <div class="ticket-stub-divider">
              <span
                style="font-family: var(--font-mono); font-size: 0.62rem; letter-spacing: 0.14em; color: var(--gold-300); text-transform: uppercase;"
              >
                ADMIT ONE • NO. 25
              </span>
              <form action="/demo" method="post" style="margin: 0;">
                <button
                  type="submit"
                  class="btn btn-gold btn-sm"
                  id="seed-demo-event-btn"
                  style="padding: 0.58rem 1.05rem; font-size: 0.84rem;"
                >
                  ✨ Launch Demo →
                </button>
              </form>
            </div>
          </div>

          {/* 3 STEP DISPATCH CARDS */}
          <div class="feature-steps" style="margin-top: 0;">
            <div class="surface-card-compact">
              <div class="step-header">
                <div class="step-number">I</div>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--crimson-600)"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3 style="font-size: 1.06rem; margin-bottom: 0.3rem;">Add Names &amp; Rules</h3>
              <p style="font-size: 0.84rem; color: var(--ink-700); line-height: 1.5;">
                Enter your roster and set mutual exclusions so spouses or roommates never draw each
                other.
              </p>
            </div>

            <div class="surface-card-compact">
              <div class="step-header">
                <div class="step-number">II</div>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--forest-800)"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <h3 style="font-size: 1.06rem; margin-bottom: 0.3rem;">Dispatch Links</h3>
              <p style="font-size: 0.84rem; color: var(--ink-700); line-height: 1.5;">
                Copy private envelopes or send via WhatsApp or iMessage in one tap. Zero API setup.
              </p>
            </div>

            <div class="surface-card-compact">
              <div class="step-header">
                <div class="step-number">III</div>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--gold-600)"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
              <h3 style="font-size: 1.06rem; margin-bottom: 0.3rem;">Break the Seal</h3>
              <p style="font-size: 0.84rem; color: var(--ink-700); line-height: 1.5;">
                Guests crack their golden wax seal in private and post live gift hints for their
                Santa.
              </p>
            </div>
          </div>

          {recentEvents.length > 0 && (
            <div class="surface-card-compact" style="margin-top: 1.5rem;">
              <div
                style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.65rem;"
              >
                <h2 style="font-size: 1.12rem;">Your Exchanges on This Device</h2>
                <span class="badge badge-pending">{recentEvents.length} Saved</span>
              </div>
              <ul class="participant-list">
                {recentEvents.map((ev) => (
                  <li class="participant-item" key={ev.id} style="padding: 0.7rem 0.95rem;">
                    <div>
                      <strong
                        style="font-weight: 700; font-family: var(--font-display); font-size: 1.02rem;"
                      >
                        {ev.title}
                      </strong>
                      <span
                        style="display: block; font-size: 0.72rem; color: var(--ink-500); font-family: var(--font-mono);"
                      >
                        DISPATCH ID: {ev.id}
                      </span>
                    </div>
                    <a
                      href={`/events/${ev.id}?key=${encodeURIComponent(ev.key)}`}
                      class="btn btn-secondary btn-sm"
                      id={`open-recent-${ev.id}`}
                    >
                      Open Dispatch →
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: BESPOKE STATIONERY CREATION CARD WITH POSTMARK & STAMP */}
        <div class="stationery-frame" id="create-event-card">
          <CornerFiligrees />

          <div
            style="display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; margin-bottom: 1.15rem;"
          >
            <div>
              <div
                style="font-family: var(--font-mono); font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.12em; color: var(--crimson-600); font-weight: 700; margin-bottom: 0.25rem;"
              >
                OFFICIAL COMMISSION • FORM NO. 2026
              </div>
              <h2 style="font-size: 1.7rem; margin-bottom: 0.3rem;">Commission an Exchange</h2>
              <p style="font-size: 0.88rem; color: var(--ink-700);">
                Generate your private Organizer Dispatch Link in seconds.
              </p>
            </div>

            <div style="display: flex; align-items: center; gap: 0.35rem; flex-shrink: 0;">
              <div style="color: var(--gold-600); margin-right: -0.35rem;">
                <PostmarkSeal text="ARCTIC POST" />
              </div>
              <PostageStamp label="AIR MAIL" cents="25¢" />
            </div>
          </div>

          {error && <div class="alert alert-error">{error}</div>}

          <form action="/events" method="post" id="create-event-form">
            <div class="form-group">
              <label class="form-label" for="event-title-input">
                Exchange Title *
              </label>
              <input
                type="text"
                id="event-title-input"
                name="title"
                class="input-field"
                placeholder="e.g., Lavelle Family Holiday 2026"
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label" for="organizer-name-input">
                Your Name (Host / Organizer) *
              </label>
              <input
                type="text"
                id="organizer-name-input"
                name="organizer_name"
                class="input-field"
                placeholder="e.g., TJ"
                required
              />
              <label
                style="display: flex; align-items: center; gap: 0.55rem; margin-top: 0.55rem; font-size: 0.84rem; color: var(--ink-700); cursor: pointer;"
              >
                <input
                  type="checkbox"
                  name="include_organizer"
                  value="1"
                  checked
                  id="include-organizer-checkbox"
                  style="accent-color: var(--forest-800); width: 15px; height: 15px;"
                />
                Include me as a participant in the gift draw
              </label>
            </div>

            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label" for="event-budget-input">
                  Spending Limit
                </label>
                <input
                  type="text"
                  id="event-budget-input"
                  name="budget"
                  class="input-field"
                  placeholder="e.g., $50"
                />
                <div class="preset-chips">
                  {['$25', '$50', '$100', 'Handmade'].map((preset) => (
                    <button
                      type="button"
                      class="preset-chip"
                      key={preset}
                      onclick={`document.getElementById('event-budget-input').value = '${preset}'`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="event-date-input">
                  Exchange Date
                </label>
                <input
                  type="date"
                  id="event-date-input"
                  name="exchange_date"
                  class="input-field"
                />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="event-notes-input">
                Welcome Note &amp; House Rules
              </label>
              <textarea
                id="event-notes-input"
                name="notes"
                class="textarea-field"
                style="min-height: 78px;"
                placeholder="e.g., Bring your wrapped gift to Grandma's house on Christmas Eve! Homemade gifts welcome."
              ></textarea>
            </div>

            <button
              type="submit"
              class="btn btn-primary btn-full"
              id="create-event-submit-btn"
              style="padding: 0.9rem 1.4rem; font-size: 0.98rem;"
            >
              ✦ Seal &amp; Create Secret Santa Exchange →
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};
