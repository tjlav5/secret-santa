import type { FC } from 'hono/jsx';
import { Layout } from './layout';
import { type EventRecord, type ParticipantRecord, type ExclusionRecord, parseWishlistLinks } from '../db';

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

  const bulkShareText = participants
    .map((p) => `${p.name}: ${origin}/reveal/${p.token}`)
    .join('\n');

  const keyQuery = `?key=${encodeURIComponent(event.admin_key)}`;

  return (
    <div id="organizer-workspace">
      {flashError && <div class="alert alert-error">{flashError}</div>}
      {flashSuccess && <div class="alert alert-success">{flashSuccess}</div>}

      <div class="dashboard-grid">
        {/* LEFT COLUMN: PARTICIPANTS & SHARE LINKS */}
        <div class="surface-card">
          <div
            style="display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 1.25rem; flex-wrap: wrap;"
          >
            <div>
              <h2 style="font-size: 1.4rem;">
                {isDrawn ? 'Participant Invite Links' : 'Participants'} ({participants.length})
              </h2>
              <p style="font-size: 0.875rem; color: var(--text-secondary);">
                {isDrawn
                  ? 'Send each person their private link via iMessage, WhatsApp, Slack, or email. Matches stay hidden!'
                  : 'Add everyone taking part in this Secret Santa exchange.'}
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
              style="text-align: center; padding: 2.5rem 1rem; background: var(--bg-subtle); border-radius: var(--radius-md); color: var(--text-secondary);"
            >
              No participants yet. Add at least 2 people above to get started!
            </div>
          ) : (
            <ul class="participant-list">
              {participants.map((p) => {
                const revealUrl = `${origin}/reveal/${p.token}`;
                const shareMessage = `🎁 Hi ${p.name}! Here is your private Secret Santa link for "${event.title}": ${revealUrl}`;
                const whatsappHref = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
                const smsHref = `sms:?&body=${encodeURIComponent(shareMessage)}`;
                const hasWishlist =
                  (p.wishlist_notes && p.wishlist_notes.trim().length > 0) ||
                  parseWishlistLinks(p.wishlist_links).length > 0;

                return (
                  <li class="participant-item" key={p.id}>
                    <div style="display: flex; align-items: center; gap: 0.85rem; min-width: 0;">
                      <span class="participant-avatar">
                        {p.name.trim().charAt(0).toUpperCase()}
                      </span>
                      <div style="min-width: 0;">
                        <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                          <strong style="font-size: 1rem;">{p.name}</strong>
                          {isDrawn && (
                            <span
                              class={`badge ${p.unwrapped_at ? 'badge-success' : 'badge-pending'}`}
                            >
                              {p.unwrapped_at ? '✓ Unwrapped' : 'Sealed Envelope'}
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
                            style="font-family: var(--font-mono); font-size: 0.76rem; color: var(--text-muted); margin-top: 0.2rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 340px;"
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
                            📋 Copy Link
                          </button>
                          <a
                            href={whatsappHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            class="btn btn-secondary btn-sm"
                            title="Share via WhatsApp"
                          >
                            💬 WhatsApp
                          </a>
                          <a
                            href={smsHref}
                            class="btn btn-secondary btn-sm"
                            title="Share via SMS / iMessage"
                          >
                            📱 SMS
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
          {/* DRAW ACTION CARD */}
          <div class="surface-card">
            {!isDrawn ? (
              <>
                <h3 style="font-size: 1.25rem; margin-bottom: 0.4rem;">Ready to Draw Names?</h3>
                <p style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 1.25rem;">
                  Our constrained matching solver pairs every participant fairly so nobody draws
                  themselves or anyone on their exclusion list.
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
                    style={participants.length < 2 ? 'opacity: 0.55; cursor: not-allowed;' : ''}
                  >
                    🎁 Draw Secret Santa Names Now
                  </button>
                </form>
                {participants.length < 2 && (
                  <span class="form-hint" style="text-align: center; margin-top: 0.5rem;">
                    Add at least {2 - participants.length} more participant(s) to enable the draw.
                  </span>
                )}
              </>
            ) : (
              <>
                <div
                  style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem;"
                >
                  <span class="badge badge-success">✓ Names Drawn</span>
                  <span style="font-size: 0.8rem; color: var(--text-muted);">
                    {unwrappedCount} of {participants.length} unwrapped • {wishlistCount} wishlists
                  </span>
                </div>
                <h3 style="font-size: 1.25rem; margin-bottom: 0.4rem;">Exchange is Live!</h3>
                <p style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 1.25rem;">
                  Share each participant's private link from the list. Need to add someone or
                  change rules? You can reset the draw below.
                </p>
                <form
                  method="post"
                  action={`/events/${event.id}/reset${keyQuery}`}
                  data-target="#organizer-workspace"
                  data-confirm="Are you sure you want to reset the draw? Existing assignments will be cleared so you can edit participants or redraw."
                >
                  <button
                    type="submit"
                    class="btn btn-secondary btn-full"
                    id="reset-draw-btn"
                  >
                    ↺ Reset &amp; Unlock Participant List
                  </button>
                </form>
              </>
            )}
          </div>

          {/* EXCLUSION RULES CARD */}
          <div class="surface-card">
            <h3 style="font-size: 1.2rem; margin-bottom: 0.35rem;">
              Exclusion Rules ({exclusions.length})
            </h3>
            <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1.1rem;">
              Prevent couples, partners, or roommates from drawing each other.
            </p>

            {!isDrawn && participants.length >= 2 && (
              <form
                method="post"
                action={`/events/${event.id}/exclusions${keyQuery}`}
                data-target="#organizer-workspace"
                style="background: var(--bg-subtle); padding: 1rem; border-radius: var(--radius-sm); margin-bottom: 1rem;"
                id="add-exclusion-form"
              >
                <div class="form-row-2" style="margin-bottom: 0.75rem;">
                  <div>
                    <label class="form-label" style="font-size: 0.78rem;" for="ex-person-a">
                      Person A
                    </label>
                    <select
                      name="participant_id"
                      id="ex-person-a"
                      class="select-field"
                      style="padding: 0.5rem;"
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
                    <label class="form-label" style="font-size: 0.78rem;" for="ex-person-b">
                      Cannot Draw Person B
                    </label>
                    <select
                      name="excluded_participant_id"
                      id="ex-person-b"
                      class="select-field"
                      style="padding: 0.5rem;"
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
                    style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.8rem; color: var(--text-secondary); cursor: pointer;"
                  >
                    <input type="checkbox" name="mutual" value="1" checked />
                    Mutual (neither can draw the other)
                  </label>
                  <button type="submit" class="btn btn-secondary btn-sm" id="add-exclusion-btn">
                    + Add Rule
                  </button>
                </div>
              </form>
            )}

            {exclusions.length === 0 ? (
              <p style="font-size: 0.85rem; color: var(--text-muted); font-style: italic;">
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
                      style="padding: 0.55rem 0; font-size: 0.875rem;"
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
                  style="cursor: pointer; font-weight: 600; font-size: 0.875rem; color: var(--text-secondary); user-select: none;"
                >
                  👁️ Emergency Organizer Master List (Warning: Spoilers!)
                </summary>
                <div
                  style="margin-top: 0.85rem; padding-top: 0.85rem; border-top: 1px solid var(--border-warm); font-size: 0.875rem;"
                >
                  <p style="color: var(--status-error-text); margin-bottom: 0.65rem; font-size: 0.8rem;">
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
                          style="padding: 0.45rem 0;"
                          key={giver.id}
                        >
                          <span>
                            <strong>{giver.name}</strong> is Secret Santa for:
                          </span>
                          <strong style="color: var(--bg-crimson);">
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
      title={`${event.title} — Organizer Dashboard`}
      headerRight={
        <div style="display: flex; align-items: center; gap: 0.65rem;">
          <span class="badge badge-pending">Organizer View</span>
          <a href="/" class="btn btn-secondary btn-sm">
            + New Exchange
          </a>
        </div>
      }
    >
      <div class="pine-banner" style="margin-bottom: 2rem;">
        <div
          style="display: flex; align-items: flex-start; justify-content: space-between; gap: 1.5rem; flex-wrap: wrap;"
        >
          <div>
            <span class="badge badge-gold" style="margin-bottom: 0.65rem;">
              ✦ Organized by {event.organizer_name}
            </span>
            <h1 style="font-size: clamp(1.75rem, 3.5vw, 2.5rem); margin-bottom: 0.35rem;">
              {event.title}
            </h1>
            {event.notes && (
              <p style="color: rgba(249, 246, 240, 0.85); max-width: 65ch; font-size: 0.95rem;">
                {event.notes}
              </p>
            )}
          </div>

          <div
            style="background: rgba(0, 0, 0, 0.22); border: 1px solid rgba(255, 255, 255, 0.16); padding: 0.9rem 1.1rem; border-radius: var(--radius-md); max-width: 420px; width: 100%;"
          >
            <div
              style="font-size: 0.78rem; font-weight: 600; color: #F4D28E; margin-bottom: 0.35rem; display: flex; justify-content: space-between; align-items: center;"
            >
              <span>🔑 Your Private Organizer Link (Bookmark this!)</span>
            </div>
            <div class="copy-box" style="margin-bottom: 0.5rem;">
              <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                {adminUrl}
              </span>
            </div>
            <button
              type="button"
              class="btn btn-secondary btn-sm btn-full"
              id="copy-admin-url-btn"
              onclick={`copyToClipboard(${JSON.stringify(adminUrl)}, this, '✓ Organizer Link Copied!')`}
            >
              📋 Copy Organizer Dashboard Link
            </button>
          </div>
        </div>

        <div class="meta-strip">
          <div>
            <strong>Spending Limit:</strong> {event.budget || 'Flexible / Not specified'}
          </div>
          <div>
            <strong>Exchange Date:</strong> {event.exchange_date || 'TBD'}
          </div>
          <div>
            <strong>Event ID:</strong>{' '}
            <span style="font-family: var(--font-mono); font-size: 0.82rem;">{event.id}</span>
          </div>
        </div>
      </div>

      <OrganizerWorkspace {...props} />
    </Layout>
  );
};
