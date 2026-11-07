import type { FC } from 'hono/jsx';
import { Layout, PostmarkSeal, CornerFiligrees } from './layout';
import {
  type EventRecord,
  type ParticipantRecord,
  type ExclusionRecord,
  parseWishlistLinks,
} from '../db';

export interface DashboardProps {
  event: EventRecord;
  participants: ParticipantRecord[];
  exclusions: ExclusionRecord[];
  origin: string;
  flashError?: string;
  flashSuccess?: string;
}

export const OrganizerWorkspace: FC<DashboardProps> = ({
  event,
  participants,
  exclusions,
  origin,
  flashError,
  flashSuccess,
}) => {
  const isDrawn = event.status === 'drawn';
  const participantMap = new Map<string, ParticipantRecord>();
  for (const p of participants) {
    participantMap.set(p.id, p);
  }

  const unwrappedCount = participants.filter((p) => Boolean(p.unwrapped_at)).length;
  const wishlistCount = participants.filter(
    (p) =>
      (p.wishlist_notes && p.wishlist_notes.trim().length > 0) ||
      parseWishlistLinks(p.wishlist_links).length > 0
  ).length;
  const progressPct =
    participants.length > 0 ? Math.round((unwrappedCount / participants.length) * 100) : 0;

  const bulkShareText = participants
    .map((p) => `${p.name}: ${origin}/reveal/${p.token}`)
    .join('\n');

  const keyQuery = `?key=${encodeURIComponent(event.admin_key)}`;

  return (
    <div id="organizer-workspace" style="view-transition-name: organizer-workspace;">
      {flashError && <div class="alert alert-error">{flashError}</div>}
      {flashSuccess && <div class="alert alert-success">{flashSuccess}</div>}

      <div class="dashboard-grid">
        {/* LEFT COLUMN: PARTICIPANTS & SHARE LINKS */}
        <div class="stationery-frame">
          <CornerFiligrees />
          <div
            style="display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; margin-bottom: 1.35rem; flex-wrap: wrap;"
          >
            <div>
              <div
                style="font-family: var(--font-mono); font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.12em; color: var(--crimson-600); font-weight: 700; margin-bottom: 0.2rem;"
              >
                {isDrawn ? 'SEALED PARCEL MANIFEST' : 'EXCHANGE ROSTER LEDGER'}
              </div>
              <h2 style="font-size: 1.55rem; margin-bottom: 0.25rem;">
                {isDrawn ? 'Participant Dispatch Links' : 'Participant Roster'} (
                {participants.length})
              </h2>
              <p style="font-size: 0.88rem; color: var(--ink-700);">
                {isDrawn
                  ? 'Send each person their private wax-sealed link via iMessage, WhatsApp, Slack, or email.'
                  : 'Add everyone taking part in this Secret Santa gift exchange.'}
              </p>
            </div>

            {isDrawn && participants.length > 0 && (
              <button
                type="button"
                class="btn btn-secondary btn-sm"
                id="copy-all-links-btn"
                onclick={`copyToClipboard(${JSON.stringify(bulkShareText)}, this, '✓ Copied All Links!')`}
              >
                📋 Copy All Links
              </button>
            )}
          </div>

          {!isDrawn && (
            <form
              method="post"
              action={`/events/${event.id}/participants${keyQuery}`}
              data-target="#organizer-workspace"
              style="display: flex; gap: 0.65rem; margin-bottom: 1.5rem;"
              id="add-participant-form"
            >
              <input
                type="text"
                name="name"
                class="input-field"
                placeholder="Enter participant name (e.g., Alice, Uncle Bob...)"
                required
                data-autofocus="true"
                id="new-participant-name-input"
              />
              <button type="submit" class="btn btn-pine" id="add-participant-btn">
                + Add Person
              </button>
            </form>
          )}

          {participants.length === 0 ? (
            <div
              style="text-align: center; padding: 2.75rem 1.25rem; background: var(--bg-vellum); border: 1px dashed var(--border-strong); border-radius: var(--radius-md); color: var(--ink-700);"
            >
              No participants yet. Add at least 2 people above to begin!
            </div>
          ) : (
            <ul class="participant-list">
              {participants.map((p) => {
                const revealUrl = `${origin}/reveal/${p.token}`;
                const shareMessage = `🎁 Hi ${p.name}! Here is your private wax-sealed Secret Santa envelope for "${event.title}": ${revealUrl}`;
                const whatsappHref = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
                const smsHref = `sms:?&body=${encodeURIComponent(shareMessage)}`;
                const hasWishlist =
                  (p.wishlist_notes && p.wishlist_notes.trim().length > 0) ||
                  parseWishlistLinks(p.wishlist_links).length > 0;
                const isUnwrapped = Boolean(p.unwrapped_at);

                return (
                  <li
                    class={`participant-item ${isDrawn ? (isUnwrapped ? 'is-unwrapped' : 'is-sealed') : ''}`}
                    key={p.id}
                  >
                    <div style="display: flex; align-items: center; gap: 0.85rem; min-width: 0;">
                      <span
                        class={`participant-avatar ${isDrawn ? (isUnwrapped ? 'avatar-pine' : 'avatar-crimson') : ''}`}
                      >
                        {p.name.trim().charAt(0).toUpperCase()}
                      </span>
                      <div style="min-width: 0;">
                        <div style="display: flex; align-items: center; gap: 0.45rem; flex-wrap: wrap;">
                          <strong style="font-size: 1.06rem; font-family: var(--font-display);">
                            {p.name}
                          </strong>
                          {isDrawn && (
                            <span class={`badge ${isUnwrapped ? 'badge-success' : 'badge-pending'}`}>
                              {isUnwrapped ? '✓ Seal Broken' : '● Wax Sealed'}
                            </span>
                          )}
                          {hasWishlist && (
                            <span class="badge badge-success" title="Participant added gift ideas">
                              ★ Wishlist Ready
                            </span>
                          )}
                        </div>
                        {isDrawn && (
                          <div
                            style="font-family: var(--font-mono); font-size: 0.73rem; color: var(--ink-500); margin-top: 0.2rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 310px;"
                          >
                            {revealUrl}
                          </div>
                        )}
                      </div>
                    </div>

                    <div class="share-actions">
                      {isDrawn ? (
                        <>
                          <button
                            type="button"
                            class="btn btn-pine btn-sm"
                            id={`copy-link-${p.id}`}
                            onclick={`copyToClipboard(${JSON.stringify(revealUrl)}, this, '✓ Link Copied')`}
                          >
                            Copy Link
                          </button>
                          <button
                            type="button"
                            class="btn btn-secondary btn-sm"
                            title="Copy formatted invite message with link"
                            onclick={`copyToClipboard(${JSON.stringify(shareMessage)}, this, '✓ Invite Copied')`}
                          >
                            Invite Note
                          </button>
                          <a
                            href={whatsappHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            class="btn btn-secondary btn-sm"
                            title="Share via WhatsApp"
                          >
                            WhatsApp
                          </a>
                          <a
                            href={smsHref}
                            class="btn btn-secondary btn-sm"
                            title="Share via SMS / iMessage"
                          >
                            iMessage
                          </a>
                          <a
                            href={`/reveal/${p.token}`}
                            target="_blank"
                            class="btn btn-ghost btn-sm"
                            title="Open participant card in new tab"
                            id={`open-reveal-${p.id}`}
                          >
                            Open ↗
                          </a>
                        </>
                      ) : (
                        <>
                          <a
                            href={`/reveal/${p.token}`}
                            target="_blank"
                            class="btn btn-secondary btn-sm"
                            title="Preview wishlist link before draw"
                          >
                            Wishlist Link ↗
                          </a>
                          <form
                            method="post"
                            action={`/events/${event.id}/participants/${p.id}/delete${keyQuery}`}
                            data-target="#organizer-workspace"
                            style="display: inline;"
                          >
                            <button
                              type="submit"
                              class="btn btn-ghost btn-sm"
                              id={`remove-participant-${p.id}`}
                            >
                              Remove
                            </button>
                          </form>
                        </>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* RIGHT COLUMN: DRAW CONTROLS & EXCLUSION RULES */}
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
          {/* DRAW ACTION & TELEMETRY CARD */}
          <div class="surface-card">
            {!isDrawn ? (
              <>
                <span class="badge badge-pending" style="margin-bottom: 0.65rem;">
                  Step 2 • Matching Engine
                </span>
                <h3 style="font-size: 1.38rem; margin-bottom: 0.4rem;">Ready to Draw Names?</h3>
                <p style="font-size: 0.88rem; color: var(--ink-700); margin-bottom: 1.35rem;">
                  Our constrained derangement solver pairs everyone into a single gift cycle so
                  nobody draws themselves or anyone on their exclusion list.
                </p>
                <form
                  method="post"
                  action={`/events/${event.id}/draw${keyQuery}`}
                  data-target="#organizer-workspace"
                >
                  <button
                    type="submit"
                    class="btn btn-primary btn-full"
                    id="draw-names-btn"
                    disabled={participants.length < 2}
                    style={
                      participants.length < 2
                        ? 'opacity: 0.55; cursor: not-allowed;'
                        : 'padding: 0.9rem 1.35rem; font-size: 0.96rem;'
                    }
                  >
                    🎁 Seal Envelopes &amp; Draw Names
                  </button>
                </form>
                {participants.length < 2 && (
                  <span class="form-hint" style="text-align: center; margin-top: 0.55rem;">
                    Add at least {2 - participants.length} more participant(s) to enable the draw.
                  </span>
                )}
              </>
            ) : (
              <>
                <div
                  style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.55rem; flex-wrap: wrap; gap: 0.5rem;"
                >
                  <span class="badge badge-success">✓ Official Draw Complete</span>
                  <span
                    style="font-size: 0.74rem; font-weight: 700; color: var(--ink-700); font-family: var(--font-mono);"
                  >
                    {unwrappedCount}/{participants.length} UNWRAPPED • {wishlistCount} WISHLISTS
                  </span>
                </div>

                <div class="seal-progress-track" title={`${progressPct}% of envelopes unwrapped`}>
                  <div class="seal-progress-fill" style={`width: ${Math.max(progressPct, 6)}%;`}></div>
                </div>

                <h3 style="font-size: 1.35rem; margin-bottom: 0.35rem;">Envelopes Are Sealed!</h3>
                <p style="font-size: 0.86rem; color: var(--ink-700); margin-bottom: 1.25rem;">
                  Dispatch each participant’s private link from the manifest. Need to add someone
                  late or adjust exclusions? You can unlock and redraw below.
                </p>
                <form
                  method="post"
                  action={`/events/${event.id}/reset${keyQuery}`}
                  data-target="#organizer-workspace"
                  data-confirm="Are you sure you want to reset the draw? Existing assignments will be cleared so you can edit participants or redraw."
                >
                  <button type="submit" class="btn btn-secondary btn-full" id="reset-draw-btn">
                    ↺ Reset Draw &amp; Unlock Roster
                  </button>
                </form>
              </>
            )}
          </div>

          {/* EXCLUSION RULES CARD */}
          <div class="surface-card">
            <h3 style="font-size: 1.25rem; margin-bottom: 0.3rem;">
              Household &amp; Couple Exclusions ({exclusions.length})
            </h3>
            <p style="font-size: 0.85rem; color: var(--ink-700); margin-bottom: 1.15rem;">
              Prevent spouses, partners, or roommates from drawing each other.
            </p>

            {!isDrawn && participants.length >= 2 && (
              <form
                method="post"
                action={`/events/${event.id}/exclusions${keyQuery}`}
                data-target="#organizer-workspace"
                style="background: var(--bg-vellum); border: 1px solid var(--border-hairline); padding: 1.1rem; border-radius: var(--radius-sm); margin-bottom: 1.1rem;"
                id="add-exclusion-form"
              >
                <div class="form-row-2" style="margin-bottom: 0.85rem;">
                  <div>
                    <label class="form-label" style="font-size: 0.72rem;" for="ex-person-a">
                      Person A
                    </label>
                    <select
                      name="participant_id"
                      id="ex-person-a"
                      class="select-field"
                      style="padding: 0.55rem 0.75rem; font-size: 0.88rem;"
                      required
                    >
                      <option value="">Select person...</option>
                      {participants.map((p) => (
                        <option value={p.id} key={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label class="form-label" style="font-size: 0.72rem;" for="ex-person-b">
                      Cannot Draw B
                    </label>
                    <select
                      name="excluded_participant_id"
                      id="ex-person-b"
                      class="select-field"
                      style="padding: 0.55rem 0.75rem; font-size: 0.88rem;"
                      required
                    >
                      <option value="">Select person...</option>
                      {participants.map((p) => (
                        <option value={p.id} key={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div
                  style="display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; flex-wrap: wrap;"
                >
                  <label
                    style="display: flex; align-items: center; gap: 0.45rem; font-size: 0.8rem; color: var(--ink-700); cursor: pointer;"
                  >
                    <input
                      type="checkbox"
                      name="mutual"
                      value="1"
                      checked
                      style="accent-color: var(--forest-800);"
                    />
                    Mutual (neither draws the other)
                  </label>
                  <button type="submit" class="btn btn-pine btn-sm" id="add-exclusion-btn">
                    + Add Rule
                  </button>
                </div>
              </form>
            )}

            {exclusions.length === 0 ? (
              <p style="font-size: 0.85rem; color: var(--ink-500); font-style: italic;">
                No exclusion rules set. Anyone can draw anyone else (except themselves).
              </p>
            ) : (
              <ul class="participant-list">
                {exclusions.map((ex) => {
                  const giver = participantMap.get(ex.participant_id);
                  const excluded = participantMap.get(ex.excluded_participant_id);
                  if (!giver || !excluded) return null;
                  return (
                    <li
                      class="participant-item"
                      style="padding: 0.65rem 0.9rem; font-size: 0.86rem;"
                      key={ex.id}
                    >
                      <span>
                        <strong>{giver.name}</strong> cannot draw <strong>{excluded.name}</strong>
                      </span>
                      {!isDrawn && (
                        <form
                          method="post"
                          action={`/events/${event.id}/exclusions/${ex.id}/delete${keyQuery}`}
                          data-target="#organizer-workspace"
                          style="display: inline;"
                        >
                          <button
                            type="submit"
                            class="btn btn-ghost btn-sm"
                            style="padding: 0.2rem 0.5rem; font-size: 0.75rem;"
                          >
                            ✕
                          </button>
                        </form>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* EMERGENCY SPOILER MASTER LIST (COLLAPSED BY DEFAULT) */}
          {isDrawn && (
            <div class="surface-card-compact">
              <details id="emergency-spoilers-details">
                <summary
                  style="cursor: pointer; font-weight: 600; font-size: 0.85rem; color: var(--ink-700); user-select: none;"
                >
                  👁️ Emergency Organizer Master List (Warning: Spoilers!)
                </summary>
                <div
                  style="margin-top: 0.85rem; padding-top: 0.85rem; border-top: 1px dashed var(--border-strong); font-size: 0.88rem;"
                >
                  <p style="color: var(--crimson-600); margin-bottom: 0.65rem; font-size: 0.8rem;">
                    Only expand if you need to manually check who someone was assigned!
                  </p>
                  <ul class="participant-list">
                    {participants.map((giver) => {
                      const receiver = giver.assigned_to_id
                        ? participantMap.get(giver.assigned_to_id)
                        : null;
                      return (
                        <li
                          class="participant-item"
                          style="padding: 0.55rem 0.85rem;"
                          key={giver.id}
                        >
                          <span>
                            <strong>{giver.name}</strong> is Secret Santa for:
                          </span>
                          <strong style="color: var(--crimson-600); font-family: var(--font-display); font-size: 1rem;">
                            {receiver ? receiver.name : 'Unassigned'}
                          </strong>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </details>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const DashboardPage: FC<DashboardProps> = (props) => {
  const { event, origin } = props;
  const adminUrl = `${origin}/events/${event.id}?key=${encodeURIComponent(event.admin_key)}`;

  return (
    <Layout
      title={`${event.title} — Organizer Dispatch`}
      headerRight={
        <div style="display: flex; align-items: center; gap: 0.6rem;">
          <span class="badge badge-pending">Organizer Dispatch</span>
          <a href="/" class="btn btn-secondary btn-sm">
            + New Exchange
          </a>
        </div>
      }
    >
      <div class="pine-banner" style="margin-bottom: 2.15rem;">
        <div class="banner-split">
          <div>
            <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.65rem; flex-wrap: wrap;">
              <span class="badge badge-gold">✦ Hosted by {event.organizer_name}</span>
              <div style="color: var(--gold-400);">
                <PostmarkSeal text="DISPATCH HQ" />
              </div>
            </div>
            <h1 style="font-size: clamp(1.95rem, 3.8vw, 2.75rem); margin-bottom: 0.45rem;">
              {event.title}
            </h1>
            {event.notes && (
              <p
                style="color: rgba(249, 246, 240, 0.88); max-width: 58ch; font-size: 0.98rem; font-style: italic; font-family: var(--font-display);"
              >
                “{event.notes}”
              </p>
            )}
          </div>

          <div
            style="background: rgba(6, 16, 12, 0.62); border: 1px solid hsla(40, 72%, 62%, 0.38); padding: 1.15rem 1.35rem; border-radius: var(--radius-md); box-shadow: inset 0 1px 0 rgba(255,255,255,0.08);"
          >
            <div
              style="display: flex; align-items: center; justify-content: space-between; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700; color: var(--gold-400); margin-bottom: 0.45rem;"
            >
              <span>🔑 Master Organizer Key</span>
              <span style="color: rgba(249, 246, 240, 0.65); font-family: var(--font-mono);">
                BOOKMARK THIS URL
              </span>
            </div>
            <div class="copy-box" style="margin-bottom: 0.7rem;">
              <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                {adminUrl}
              </span>
            </div>
            <button
              type="button"
              class="btn btn-gold btn-sm btn-full"
              id="copy-admin-url-btn"
              onclick={`copyToClipboard(${JSON.stringify(adminUrl)}, this, '✓ Organizer Link Copied!')`}
            >
              📋 Copy Organizer Dispatch Link
            </button>
          </div>
        </div>

        <div class="meta-strip">
          <div>
            <strong style="color: var(--gold-400); text-transform: uppercase; font-size: 0.74rem; letter-spacing: 0.06em; margin-right: 0.35rem;">
              Spending Limit:
            </strong>
            <span>{event.budget || 'Flexible / Open'}</span>
          </div>
          <div>
            <strong style="color: var(--gold-400); text-transform: uppercase; font-size: 0.74rem; letter-spacing: 0.06em; margin-right: 0.35rem;">
              Exchange Date:
            </strong>
            <span>{event.exchange_date || 'TBD'}</span>
          </div>
          <div>
            <strong style="color: var(--gold-400); text-transform: uppercase; font-size: 0.74rem; letter-spacing: 0.06em; margin-right: 0.35rem;">
              Dispatch No:
            </strong>
            <span style="font-family: var(--font-mono); font-size: 0.82rem;">{event.id}</span>
          </div>
        </div>
      </div>

      <OrganizerWorkspace {...props} />
    </Layout>
  );
};
