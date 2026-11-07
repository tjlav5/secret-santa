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
                <span aria-hidden="true">✦</span>
                <span>North Pole Dispatch</span>
              </div>
              <span class="hero-vignette-caption">
                AES-GCM Encrypted Draws • Anonymous Q&amp;A
              </span>
            </div>
          </div>

          <div class="eyebrow">
            <span>Holiday Gift Exchange</span>
            <span aria-hidden="true">•</span>
            <span>No Sign-Ups Required</span>
          </div>

          <h1 class="hero-title">
            Host your Secret Santa exchange in <em>under a minute.</em>
          </h1>

          <p class="hero-subtitle">
            Share one group invite link—or paste your guest list—set household exclusions, and draw
            names into a single unbroken gift loop. Assignments are encrypted per envelope so even
            the host stays surprised.
          </p>

          {/* SANDBOX DEMO TICKET */}
          <div class="demo-ticket-card">
            <div class="demo-ticket-lead">
              <div class="demo-ticket-icon" aria-hidden="true">
                <svg
                  width="20"
                  height="20"
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
                <div class="demo-ticket-title">Test the draw &amp; break a wax seal first</div>
                <div class="demo-ticket-sub">
                  Opens an instant sandbox exchange with 4 guests, wishlists, and couple rules.
                </div>
              </div>
            </div>

            <form action="/demo" method="post">
              <button type="submit" class="btn btn-secondary btn-sm" id="seed-demo-event-btn">
                Try Sandbox Demo →
              </button>
            </form>
          </div>

          {/* 3-STEP OVERVIEW */}
          <div class="feature-steps">
            <div class="surface-card-compact is-interactive">
              <div class="step-number">01</div>
              <h3>Share Group Join Link</h3>
              <p class="text-muted" style="font-size: 0.84rem; margin-top: 0.25rem;">
                Drop one self-join link into your group chat—or bulk-paste names—and set partner
                exclusions.
              </p>
            </div>

            <div class="surface-card-compact is-interactive">
              <div class="step-number">02</div>
              <h3>Encrypted No-Peek Draw</h3>
              <p class="text-muted" style="font-size: 0.84rem; margin-top: 0.25rem;">
                Matches lock into a single loop encrypted with each guest’s private link—no spoilers
                for the host.
              </p>
            </div>

            <div class="surface-card-compact is-interactive">
              <div class="step-number">03</div>
              <h3>Wishlists &amp; Secret Q&amp;A</h3>
              <p class="text-muted" style="font-size: 0.84rem; margin-top: 0.25rem;">
                Guests unwrap their match, post gift links, and ask their recipient anonymous
                questions.
              </p>
            </div>
          </div>

          {recentEvents.length > 0 && (
            <div class="surface-card-compact" style="margin-top: 1.85rem;" id="recent-events-card">
              <div class="card-header-row" style="margin-bottom: 0.8rem; align-items: center;">
                <div>
                  <h2 style="font-size: 1.08rem;">Saved Exchanges on This Device</h2>
                  <span class="text-subtle" style="font-size: 0.76rem;">
                    Organizer keys stored locally in this browser
                  </span>
                </div>
                <div class="share-actions">
                  <span class="badge badge-pending">{recentEvents.length} Saved</span>
                  <form method="post" action="/recent-events/clear">
                    <button type="submit" class="btn btn-ghost btn-xs">
                      Clear All
                    </button>
                  </form>
                </div>
              </div>
              <ul class="participant-list">
                {recentEvents.map((ev) => {
                  const isDemo = ev.title === 'Winter Chalet Gift Exchange 2026';
                  return (
                    <li class="participant-item" key={ev.id}>
                      <div class="participant-meta">
                        <div class="participant-title-row">
                          <span class="participant-name">{ev.title}</span>
                          {isDemo && <span class="badge badge-gold">Sandbox</span>}
                        </div>
                        <span class="participant-url-preview">ID: {ev.id}</span>
                      </div>
                      <div class="share-actions">
                        <a
                          href={`/events/${ev.id}?key=${encodeURIComponent(ev.key)}`}
                          class="btn btn-secondary btn-sm"
                          id={`open-recent-${ev.id}`}
                        >
                          Open →
                        </a>
                        <form method="post" action={`/recent-events/${ev.id}/delete`}>
                          <button
                            type="submit"
                            class="btn btn-ghost btn-sm"
                            aria-label={`Remove ${ev.title} from saved list`}
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
          <div style="margin-bottom: 1.4rem;">
            <div class="section-kicker">Host Setup</div>
            <h2 style="font-size: 1.6rem; margin-bottom: 0.3rem;">Create an Exchange</h2>
            <p class="text-muted" style="font-size: 0.88rem;">
              Set up your event details below to generate your Organizer Dashboard and Group Invite
              Link.
            </p>
          </div>

          {error && (
            <div class="alert alert-error" role="alert">
              {error}
            </div>
          )}

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
              <label class="checkbox-row" for="include-organizer-checkbox">
                <input
                  type="checkbox"
                  name="include_organizer"
                  value="1"
                  checked
                  id="include-organizer-checkbox"
                  class="checkbox-input"
                />
                <span>Include me as a participant in the gift draw</span>
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
                <div class="preset-chips" role="group" aria-label="Spending limit presets">
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

            <div class="privacy-option-card">
              <input type="hidden" name="has_privacy_field" value="1" />
              <label class="checkbox-row" style="margin-top: 0; align-items: flex-start;" for="strict-privacy-checkbox">
                <input
                  type="checkbox"
                  name="strict_privacy"
                  value="1"
                  checked
                  id="strict-privacy-checkbox"
                  class="checkbox-input"
                  style="margin-top: 0.2rem;"
                />
                <span>
                  <strong style="color: var(--ink-900); display: block; font-size: 0.86rem;">
                    🔒 Strict Encrypted No-Peek Mode (Recommended)
                  </strong>
                  <span class="text-subtle" style="font-size: 0.78rem; display: block; margin-top: 0.1rem;">
                    Encrypts matches with AES-256-GCM per envelope and disables the organizer
                    spoiler list so you can play too.
                  </span>
                </span>
              </label>
            </div>

            <button
              type="submit"
              class="btn btn-primary btn-lg btn-full"
              id="create-event-submit-btn"
            >
              ✦ Create Secret Santa Exchange →
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};
