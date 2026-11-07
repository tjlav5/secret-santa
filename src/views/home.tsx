import type { FC } from 'hono/jsx';
import { Layout } from './layout';

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
        <div>
          <div class="hero-vignette" data-tilt>
            <img
              src="/assets/hero.webp"
              alt="Midnight pine forest under glowing northern lights"
              width="1200"
              height="500"
              loading="eager"
            />
            <div class="hero-vignette-overlay">
              <div class="hero-vignette-badge">
                <span>✦</span>
                <span>Arctica Dispatch // Lat 90°N</span>
              </div>
              <span
                style="font-family: var(--font-display); font-size: 0.88rem; font-style: italic; color: var(--gold-200); text-shadow: 0 2px 4px rgba(0,0,0,0.8);"
              >
                Zero-Knowledge Derangement Protocol
              </span>
            </div>
          </div>

          <div class="eyebrow">
            <span>✦ Holiday Gift Dispatch</span>
            <span>•</span>
            <span>Zero Accounts Needed</span>
          </div>

          <h1 class="hero-title">
            Host your Secret Santa exchange in <em>under a minute.</em>
          </h1>

          <p class="hero-subtitle" style="margin-bottom: 2rem;">
            Gather your circle, set partner or household exclusion rules, and draw names. Every
            participant receives a private wax-sealed link they can open via iMessage, WhatsApp, or
            email—keeping every match a complete surprise, even from the organizer.
          </p>

          {/* SLEEK DEMO BANNER */}
          <div class="demo-ticket-card" style="margin-bottom: 2.25rem;">
            <div style="display: flex; align-items: center; gap: 1rem;">
              <div
                style="width: 44px; height: 44px; border-radius: 10px; background: rgba(216, 181, 111, 0.15); border: 1px solid rgba(216, 181, 111, 0.35); color: var(--gold-400); display: flex; align-items: center; justify-content: center; flex-shrink: 0;"
                aria-hidden="true"
              >
                <svg
                  width="22"
                  height="22"
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
                  style="font-family: var(--font-display); font-size: 1.15rem; font-weight: 700; color: #FAF8F5;"
                >
                  Test the draw &amp; break a wax seal first
                </div>
                <div style="font-size: 0.82rem; color: rgba(250, 248, 245, 0.75);">
                  Launches an instant pre-populated sandbox with 4 guests and exclusions.
                </div>
              </div>
            </div>

            <form action="/demo" method="post" style="margin: 0;">
              <button
                type="submit"
                class="btn btn-secondary btn-sm"
                id="seed-demo-event-btn"
              >
                Launch Sandbox Demo →
              </button>
            </form>
          </div>

          {/* 3 STEP EDITORIAL CARDS */}
          <div class="feature-steps" style="margin-top: 0;">
            <div class="surface-card-compact">
              <div class="step-number">01</div>
              <h3 style="font-size: 1.05rem; margin-bottom: 0.25rem;">Add Names &amp; Rules</h3>
              <p style="font-size: 0.84rem; color: var(--ink-700); line-height: 1.5;">
                Enter your participants and set exclusion rules so spouses or roommates never draw each
                other.
              </p>
            </div>

            <div class="surface-card-compact">
              <div class="step-number">02</div>
              <h3 style="font-size: 1.05rem; margin-bottom: 0.25rem;">Dispatch Links</h3>
              <p style="font-size: 0.84rem; color: var(--ink-700); line-height: 1.5;">
                Copy private envelope URLs or share via WhatsApp and iMessage in one tap. No accounts
                needed.
              </p>
            </div>

            <div class="surface-card-compact">
              <div class="step-number">03</div>
              <h3 style="font-size: 1.05rem; margin-bottom: 0.25rem;">Break the Seal</h3>
              <p style="font-size: 0.84rem; color: var(--ink-700); line-height: 1.5;">
                Guests open their assignment in private and post live wishlist notes for their Santa.
              </p>
            </div>
          </div>

          {recentEvents.length > 0 && (
            <div class="surface-card-compact" style="margin-top: 2rem;" id="recent-events-card">
              <div
                style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem;"
              >
                <div>
                  <h2 style="font-size: 1.08rem;">Your Exchanges on This Device</h2>
                  <span style="font-size: 0.74rem; color: var(--ink-500);">
                    Private keys saved locally so you don’t lose access
                  </span>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <span class="badge badge-pending">{recentEvents.length} Saved</span>
                  <form method="post" action="/recent-events/clear" style="margin: 0;">
                    <button
                      type="submit"
                      class="btn btn-ghost btn-sm"
                      style="font-size: 0.74rem; padding: 0.2rem 0.5rem; color: var(--ink-500); text-decoration: underline;"
                    >
                      Clear All
                    </button>
                  </form>
                </div>
              </div>
              <ul class="participant-list">
                {recentEvents.map((ev) => {
                  const isDemo = ev.title === 'Winter Chalet Gift Exchange 2026';
                  return (
                    <li
                      class="participant-item"
                      key={ev.id}
                      style="padding: 0.75rem 0.95rem; align-items: center;"
                    >
                      <div style="min-width: 0;">
                        <div style="display: flex; align-items: center; gap: 0.45rem; flex-wrap: wrap;">
                          <strong
                            style="font-weight: 700; font-family: var(--font-display); font-size: 1rem;"
                          >
                            {ev.title}
                          </strong>
                          {isDemo && (
                            <span class="badge badge-gold" style="font-size: 0.64rem;">
                              Sandbox Demo
                            </span>
                          )}
                        </div>
                        <span
                          style="display: block; font-size: 0.72rem; color: var(--ink-500); font-family: var(--font-mono); margin-top: 0.15rem;"
                        >
                          ID: {ev.id}
                        </span>
                      </div>
                      <div style="display: flex; align-items: center; gap: 0.35rem; flex-shrink: 0;">
                        <a
                          href={`/events/${ev.id}?key=${encodeURIComponent(ev.key)}`}
                          class="btn btn-secondary btn-sm"
                          id={`open-recent-${ev.id}`}
                        >
                          Open Dispatch →
                        </a>
                        <form
                          method="post"
                          action={`/recent-events/${ev.id}/delete`}
                          style="margin: 0;"
                        >
                          <button
                            type="submit"
                            class="btn btn-ghost btn-sm"
                            style="padding: 0.35rem 0.55rem; font-size: 0.78rem; color: var(--ink-400);"
                            title="Remove from device list"
                          >
                            ✕
                          </button>
                        </form>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: COMMISSION FORM CARD */}
        <div class="surface-card" id="create-event-card">
          <div style="margin-bottom: 1.5rem;">
            <h2 style="font-size: 1.65rem; margin-bottom: 0.35rem;">Commission an Exchange</h2>
            <p style="font-size: 0.88rem; color: var(--ink-700);">
              Fill in the details below to generate your private Organizer Link.
            </p>
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
                  style="accent-color: var(--forest-900); width: 15px; height: 15px;"
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
                style="min-height: 82px;"
                placeholder="e.g., Bring your wrapped gift to Grandma's house on Christmas Eve! Homemade gifts welcome."
              ></textarea>
            </div>

            <button
              type="submit"
              class="btn btn-primary btn-full"
              id="create-event-submit-btn"
              style="margin-top: 0.6rem; height: 46px;"
            >
              ✦ Create Secret Santa Exchange →
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};
