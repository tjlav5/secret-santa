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
          <span
            class="badge badge-pending"
            style="margin-bottom: 1rem; border: 1px solid var(--border-strong);"
          >
            ✦ No Passwords • No App Downloads • Instant Share Links
          </span>
          <h1 class="hero-title">
            Host your Secret Santa exchange in under a minute.
          </h1>
          <p class="hero-subtitle" style="margin-bottom: 1.75rem;">
            Add your group, set partner or roommate exclusion rules, and draw names. Every
            participant gets a private envelope link they can open via iMessage, WhatsApp, Slack,
            or email—without spoiling the surprise for anyone, even the organizer.
          </p>

          <div class="feature-steps">
            <div class="surface-card-compact">
              <div class="step-number">1</div>
              <h3 style="font-size: 1.05rem; margin-bottom: 0.35rem;">Add Names &amp; Rules</h3>
              <p style="font-size: 0.875rem; color: var(--text-secondary);">
                Enter participants and set exclusions so couples or households don’t draw each
                other.
              </p>
            </div>
            <div class="surface-card-compact">
              <div class="step-number">2</div>
              <h3 style="font-size: 1.05rem; margin-bottom: 0.35rem;">Share Private Links</h3>
              <p style="font-size: 0.875rem; color: var(--text-secondary);">
                Copy individual links or send via WhatsApp/SMS in one tap. No email API setup
                required.
              </p>
            </div>
            <div class="surface-card-compact">
              <div class="step-number">3</div>
              <h3 style="font-size: 1.05rem; margin-bottom: 0.35rem;">Unwrap &amp; Wishlists</h3>
              <p style="font-size: 0.875rem; color: var(--text-secondary);">
                Everyone unwraps their match in secret and adds gift hints that update live.
              </p>
            </div>
          </div>

          {recentEvents.length > 0 && (
            <div class="surface-card-compact" style="margin-top: 2rem;">
              <h2 style="font-size: 1.15rem; margin-bottom: 0.75rem;">
                Your Recent Exchanges on This Device
              </h2>
              <ul class="participant-list">
                {recentEvents.map((ev) => (
                  <li class="participant-item" key={ev.id}>
                    <div>
                      <strong style="font-weight: 600;">{ev.title}</strong>
                      <span
                        style="display: block; font-size: 0.78rem; color: var(--text-muted); font-family: var(--font-mono);"
                      >
                        ID: {ev.id}
                      </span>
                    </div>
                    <a
                      href={`/events/${ev.id}?key=${encodeURIComponent(ev.key)}`}
                      class="btn btn-secondary btn-sm"
                      id={`open-recent-${ev.id}`}
                    >
                      Open Dashboard →
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div class="surface-card" id="create-event-card">
          <h2 style="font-size: 1.5rem; margin-bottom: 0.35rem;">Start a New Exchange</h2>
          <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 1.5rem;">
            Create your event to get your private Organizer Dashboard link.
          </p>

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
                Your Name (Organizer) *
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
                style="display: flex; align-items: center; gap: 0.5rem; margin-top: 0.55rem; font-size: 0.85rem; color: var(--text-secondary); cursor: pointer;"
              >
                <input
                  type="checkbox"
                  name="include_organizer"
                  value="1"
                  checked
                  id="include-organizer-checkbox"
                />
                Include me as a participant in the gift draw
              </label>
            </div>

            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label" for="event-budget-input">
                  Spending Limit / Budget
                </label>
                <input
                  type="text"
                  id="event-budget-input"
                  name="budget"
                  class="input-field"
                  placeholder="e.g., $50"
                />
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
                Welcome Note / Rules for Participants
              </label>
              <textarea
                id="event-notes-input"
                name="notes"
                class="textarea-field"
                style="min-height: 80px;"
                placeholder="e.g., Bring your wrapped gift to Grandma's house on Christmas Eve! Homemade gifts welcome."
              ></textarea>
            </div>

            <button type="submit" class="btn btn-primary btn-full" id="create-event-submit-btn">
              Create Secret Santa Exchange →
            </button>
          </form>

          <div
            style="margin-top: 1.35rem; padding-top: 1.1rem; border-top: 1px solid var(--border-warm); text-align: center;"
          >
            <form action="/demo" method="post">
              <button
                type="submit"
                class="btn btn-ghost btn-sm"
                id="seed-demo-event-btn"
                style="font-size: 0.82rem;"
              >
                ✨ Or try an instant pre-populated Demo Exchange
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};
