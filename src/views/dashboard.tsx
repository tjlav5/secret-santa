import type { FC } from 'hono/jsx';
import { Layout } from './layout';
import {
  type EventRecord,
  type ParticipantRecord,
  type ExclusionRecord,
  parseWishlistLinks,
  formatExchangeDate,
} from '../db';

export interface DashboardProps {
  event: EventRecord;
  participants: ParticipantRecord[];
  exclusions: ExclusionRecord[];
  origin: string;
  /** Map of recipientId -> count of unanswered anonymous questions from their Santa */
  unansweredQaByRecipient?: Record<string, number>;
  /** Populated ONLY when event.allow_spoilers === 1: giverId -> receiverId */
  decryptedSpoilerMap?: Record<string, string>;
  flashError?: string;
  flashSuccess?: string;
}

export const OrganizerWorkspace: FC<DashboardProps> = ({
  event,
  participants,
  exclusions,
  origin,
  unansweredQaByRecipient = {},
  decryptedSpoilerMap = {},
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
  const joinUrl = event.join_code ? `${origin}/join/${event.join_code}` : '';
  const groupShareMessage = `🎄 Join "${event.title}" (hosted by ${event.organizer_name})! Tap this link to add your name and wishlist: ${joinUrl}`;
  const groupWhatsappHref = `https://wa.me/?text=${encodeURIComponent(groupShareMessage)}`;

  return (
    <div id="organizer-workspace" style="view-transition-name: organizer-workspace;">
      {flashError && (
        <div class="alert alert-error" role="alert">
          {flashError}
        </div>
      )}
      {flashSuccess && (
        <div class="alert alert-success" role="status" aria-live="polite">
          {flashSuccess}
        </div>
      )}

      <div class="dashboard-grid">
        {/* LEFT COLUMN: SELF-JOIN, PARTICIPANTS & SHARE LINKS */}
        <div class="surface-card">
          <div class="card-header-row">
            <div>
              <div class="section-kicker">
                {isDrawn ? 'Dispatch Manifest' : 'Participant Roster'}
              </div>
              <h2 style="font-size: 1.5rem; margin-bottom: 0.25rem;">
                {isDrawn ? 'Participant Links' : 'Participants'} ({participants.length})
              </h2>
              <p class="text-muted" style="font-size: 0.88rem;">
                {isDrawn
                  ? 'Send each guest their private wax-sealed link via iMessage, WhatsApp, Slack, or email.'
                  : 'Share the group join link or add everyone manually below.'}
              </p>
            </div>

            {isDrawn && participants.length > 0 && (
              <button
                type="button"
                class="btn btn-secondary btn-sm"
                id="copy-all-links-btn"
                onclick={`copyToClipboard(${JSON.stringify(bulkShareText)}, this, '✓ Copied All!')`}
              >
                Copy All Links
              </button>
            )}
          </div>

          {/* GROUP SELF-JOIN INVITE LINK PANEL (DRAFT MODE) */}
          {!isDrawn && joinUrl && (
            <div class="self-join-panel" id="self-join-panel">
              <div
                style="display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; flex-wrap: wrap;"
              >
                <div>
                  <div style="display: flex; align-items: center; gap: 0.45rem; flex-wrap: wrap;">
                    <strong style="font-size: 0.92rem; color: var(--ink-900);">
                      🔗 Group Self-Join Link
                    </strong>
                    <span class={`badge ${event.join_enabled ? 'badge-success' : 'badge-pending'}`}>
                      {event.join_enabled ? 'Open for Sign-Ups' : 'Paused'}
                    </span>
                  </div>
                  <p class="text-muted" style="font-size: 0.8rem; margin-top: 0.15rem;">
                    Drop one link into your group chat so guests can add themselves and their
                    wishlists.
                  </p>
                </div>

                <form
                  method="post"
                  action={`/events/${event.id}/join-toggle${keyQuery}`}
                  data-target="#organizer-workspace"
                >
                  <button
                    type="submit"
                    class="btn btn-ghost btn-xs"
                    style="border-color: var(--border-subtle);"
                    id="toggle-join-link-btn"
                  >
                    {event.join_enabled ? 'Pause Link' : 'Enable Link'}
                  </button>
                </form>
              </div>

              {Boolean(event.join_enabled) && (
                <div class="self-join-url-row">
                  <input
                    type="text"
                    readonly
                    value={joinUrl}
                    class="dispatch-url-input"
                    onclick="this.select()"
                    aria-label="Group Self-Join Invite Link"
                  />
                  <button
                    type="button"
                    class="btn btn-primary btn-sm"
                    id="copy-join-url-btn"
                    onclick={`copyToClipboard(${JSON.stringify(joinUrl)}, this, '✓ Link Copied!')`}
                  >
                    Copy Group Link
                  </button>
                  <a
                    href={groupWhatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="btn btn-secondary btn-sm"
                  >
                    WhatsApp ↗
                  </a>
                </div>
              )}
            </div>
          )}

          {!isDrawn && (
            <>
              <form
                method="post"
                action={`/events/${event.id}/participants${keyQuery}`}
                data-target="#organizer-workspace"
                class="inline-add-form"
                style="margin-bottom: 0.65rem;"
                id="add-participant-form"
              >
                <input
                  type="text"
                  name="name"
                  class="input-field"
                  placeholder="Enter name (or comma-separated: Alice, Bob, Charlie)"
                  required
                  data-autofocus="true"
                  id="new-participant-name-input"
                />
                <button type="submit" class="btn btn-pine" id="add-participant-btn">
                  + Add Person
                </button>
              </form>

              <details class="bulk-paste-drawer" id="bulk-paste-drawer">
                <summary>+ Paste a full list of names at once</summary>
                <form
                  method="post"
                  action={`/events/${event.id}/participants${keyQuery}`}
                  data-target="#organizer-workspace"
                  class="subform-panel"
                  style="margin-top: 0.6rem;"
                  id="bulk-add-participants-form"
                >
                  <label class="form-label" for="bulk-names-textarea">
                    Paste Names (one per line or comma-separated)
                  </label>
                  <textarea
                    id="bulk-names-textarea"
                    name="name"
                    class="textarea-field"
                    style="min-height: 84px; margin-bottom: 0.7rem;"
                    placeholder={'Alice\nBob\nAunt Clara\nUncle Dan'}
                    required
                  ></textarea>
                  <button type="submit" class="btn btn-secondary btn-sm" id="bulk-add-submit-btn">
                    + Add All Names
                  </button>
                </form>
              </details>
            </>
          )}

          {participants.length === 0 ? (
            <div class="empty-state-box">
              No participants yet. Share the Group Self-Join Link or add at least 2 people above!
            </div>
          ) : (
            <ul class="participant-list">
              {participants.map((p) => {
                const revealUrl = `${origin}/reveal/${p.token}`;
                const shareMessage = `🎁 Hi ${p.name}! Here is your private wax-sealed Secret Santa envelope for "${event.title}": ${revealUrl}`;
                const qaNudgeMessage = `💬 Hey ${p.name}! Your anonymous Secret Santa left you a question on your envelope card—tap here to reply: ${revealUrl}`;
                const whatsappHref = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
                const smsHref = `sms:?&body=${encodeURIComponent(shareMessage)}`;
                const hasWishlist =
                  (p.wishlist_notes && p.wishlist_notes.trim().length > 0) ||
                  parseWishlistLinks(p.wishlist_links).length > 0;
                const isUnwrapped = Boolean(p.unwrapped_at);
                const pendingQa = unansweredQaByRecipient[p.id] || 0;

                return (
                  <li
                    class={`participant-item ${isDrawn ? (isUnwrapped ? 'is-unwrapped' : 'is-sealed') : ''}`}
                    key={p.id}
                  >
                    <div class="participant-identity">
                      <span
                        class={`participant-avatar ${isDrawn ? (isUnwrapped ? 'avatar-pine' : 'avatar-crimson') : ''}`}
                        aria-hidden="true"
                      >
                        {p.name.trim().charAt(0).toUpperCase()}
                      </span>
                      <div class="participant-meta">
                        <div class="participant-title-row">
                          <span class="participant-name">{p.name}</span>
                          {isDrawn && (
                            <span class={`badge ${isUnwrapped ? 'badge-success' : 'badge-pending'}`}>
                              {isUnwrapped ? '✓ Unwrapped' : '● Sealed'}
                            </span>
                          )}
                          {hasWishlist && (
                            <span class="badge badge-success" title="Participant added gift ideas">
                              ★ Wishlist
                            </span>
                          )}
                          {pendingQa > 0 && (
                            <span
                              class="badge badge-qa"
                              title={`${p.name}'s anonymous Secret Santa asked a question awaiting reply`}
                            >
                              💬 {pendingQa} Q&amp;A Waiting
                            </span>
                          )}
                        </div>
                        {isDrawn && <div class="participant-url-preview">{revealUrl}</div>}
                      </div>
                    </div>

                    <div class="share-actions">
                      {isDrawn ? (
                        <>
                          <button
                            type="button"
                            class="btn btn-pine btn-sm"
                            id={`copy-link-${p.id}`}
                            onclick={`copyToClipboard(${JSON.stringify(revealUrl)}, this, '✓ Copied')`}
                          >
                            Copy Link
                          </button>
                          <button
                            type="button"
                            class="btn btn-secondary btn-sm"
                            title="Copy pre-written invite message with link"
                            onclick={`copyToClipboard(${JSON.stringify(shareMessage)}, this, '✓ Invite Copied')`}
                          >
                            Copy Invite
                          </button>

                          <details class="action-menu">
                            <summary
                              class="btn btn-ghost btn-sm"
                              aria-label={`More sharing and edit actions for ${p.name}`}
                            >
                              More ▾
                            </summary>
                            <div class="action-menu-popover">
                              {pendingQa > 0 && (
                                <button
                                  type="button"
                                  class="action-menu-item"
                                  onclick={`copyToClipboard(${JSON.stringify(qaNudgeMessage)}, this, '✓ Nudge Copied!'); setTimeout(() => this.closest('details')?.removeAttribute('open'), 650);`}
                                >
                                  <span>💬 Copy Q&amp;A Nudge</span>
                                </button>
                              )}
                              <a
                                href={whatsappHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                class="action-menu-item"
                                onclick="this.closest('details').removeAttribute('open')"
                              >
                                <span>Share via WhatsApp</span>
                                <span aria-hidden="true">↗</span>
                              </a>
                              <a
                                href={smsHref}
                                class="action-menu-item"
                                onclick="this.closest('details').removeAttribute('open')"
                              >
                                <span>Share via iMessage / SMS</span>
                                <span aria-hidden="true">↗</span>
                              </a>
                              <a
                                href={`/reveal/${p.token}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                class="action-menu-item"
                                id={`open-reveal-${p.id}`}
                                onclick="this.closest('details').removeAttribute('open')"
                              >
                                <span>Open Envelope Card</span>
                                <span aria-hidden="true">↗</span>
                              </a>
                              <div class="action-menu-divider"></div>
                              <form
                                method="post"
                                action={`/events/${event.id}/participants/${p.id}/rename${keyQuery}`}
                                data-target="#organizer-workspace"
                                class="rename-inline-box"
                              >
                                <label
                                  class="form-label"
                                  style="font-size: 0.68rem; margin-bottom: 0.2rem;"
                                  for={`rename-input-${p.id}`}
                                >
                                  Rename Guest
                                </label>
                                <div class="rename-inline-row">
                                  <input
                                    type="text"
                                    id={`rename-input-${p.id}`}
                                    name="name"
                                    value={p.name}
                                    class="input-field input-field--sm"
                                    required
                                  />
                                  <button type="submit" class="btn btn-secondary btn-sm">
                                    Save
                                  </button>
                                </div>
                              </form>
                            </div>
                          </details>
                        </>
                      ) : (
                        <>
                          <a
                            href={`/reveal/${p.token}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            class="btn btn-secondary btn-sm"
                            title="Share or preview wishlist link before drawing names"
                          >
                            Wishlist Link ↗
                          </a>

                          <details class="action-menu">
                            <summary
                              class="btn btn-ghost btn-sm"
                              aria-label={`Edit ${p.name}`}
                            >
                              Rename ▾
                            </summary>
                            <div class="action-menu-popover">
                              <form
                                method="post"
                                action={`/events/${event.id}/participants/${p.id}/rename${keyQuery}`}
                                data-target="#organizer-workspace"
                                class="rename-inline-box"
                              >
                                <label
                                  class="form-label"
                                  style="font-size: 0.68rem; margin-bottom: 0.2rem;"
                                  for={`rename-draft-${p.id}`}
                                >
                                  Update Name
                                </label>
                                <div class="rename-inline-row">
                                  <input
                                    type="text"
                                    id={`rename-draft-${p.id}`}
                                    name="name"
                                    value={p.name}
                                    class="input-field input-field--sm"
                                    required
                                  />
                                  <button type="submit" class="btn btn-secondary btn-sm">
                                    Save
                                  </button>
                                </div>
                              </form>
                            </div>
                          </details>

                          <form
                            method="post"
                            action={`/events/${event.id}/participants/${p.id}/delete${keyQuery}`}
                            data-target="#organizer-workspace"
                          >
                            <button
                              type="submit"
                              class="btn btn-ghost btn-sm"
                              id={`remove-participant-${p.id}`}
                              aria-label={`Remove ${p.name}`}
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

        {/* RIGHT COLUMN: DRAW CONTROLS, EXCLUSIONS & PRIVACY SEAL */}
        <div class="stack-col">
          {/* DRAW ACTION & TELEMETRY CARD */}
          <div class="surface-card">
            {!isDrawn ? (
              <>
                <span class="badge badge-pending" style="margin-bottom: 0.65rem;">
                  Step 2 • Matching Engine
                </span>
                <h3 style="font-size: 1.28rem; margin-bottom: 0.4rem;">Ready to Draw Names?</h3>
                <p class="text-muted" style="font-size: 0.88rem; margin-bottom: 1.3rem;">
                  Pairs everyone into a single unbroken gift cycle and encrypts each match with AES-256-GCM
                  using that guest’s private envelope link.
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
                  >
                    ✦ Seal Envelopes &amp; Draw Names
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
                <div class="card-header-row" style="margin-bottom: 0.45rem; align-items: center;">
                  <span class="badge badge-success">✓ Official Draw Complete</span>
                  <span
                    class="text-muted"
                    style="font-size: 0.73rem; font-weight: 600; font-family: var(--font-mono);"
                  >
                    {unwrappedCount}/{participants.length} UNWRAPPED • {wishlistCount} WISHLISTS
                  </span>
                </div>

                <div class="seal-progress-track" title={`${progressPct}% of envelopes unwrapped`}>
                  <div
                    class="seal-progress-fill"
                    style={`width: ${Math.max(progressPct, 6)}%;`}
                  ></div>
                </div>

                <h3 style="font-size: 1.25rem; margin-bottom: 0.35rem;">Envelopes Are Sealed</h3>
                <p class="text-muted" style="font-size: 0.86rem; margin-bottom: 1.2rem;">
                  Share each guest’s private link from the manifest. Need to add someone late or
                  change exclusions? Unlock and redraw below.
                </p>
                <form
                  method="post"
                  action={`/events/${event.id}/reset${keyQuery}`}
                  data-target="#organizer-workspace"
                  data-confirm="Reset the draw? Current assignments and any anonymous Q&A threads will be cleared so you can edit the roster or redraw."
                >
                  <button type="submit" class="btn btn-danger btn-sm btn-full" id="reset-draw-btn">
                    ↺ Reset Draw &amp; Unlock Roster
                  </button>
                </form>
              </>
            )}
          </div>

          {/* EXCLUSION RULES CARD */}
          <div class="surface-card">
            <h3 style="font-size: 1.18rem; margin-bottom: 0.3rem;">
              Household &amp; Couple Exclusions ({exclusions.length})
            </h3>
            <p class="text-muted" style="font-size: 0.85rem; margin-bottom: 1.1rem;">
              Prevent spouses, partners, or roommates from drawing each other.
            </p>

            {!isDrawn && participants.length >= 2 && (
              <form
                method="post"
                action={`/events/${event.id}/exclusions${keyQuery}`}
                data-target="#organizer-workspace"
                class="subform-panel"
                style="margin-bottom: 1.1rem;"
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
                      class="select-field select-field--sm"
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
                      class="select-field select-field--sm"
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
                  <label class="checkbox-row" style="margin-top: 0;">
                    <input
                      type="checkbox"
                      name="mutual"
                      value="1"
                      checked
                      class="checkbox-input"
                    />
                    <span>Mutual (neither draws the other)</span>
                  </label>
                  <button type="submit" class="btn btn-pine btn-sm" id="add-exclusion-btn">
                    + Add Rule
                  </button>
                </div>
              </form>
            )}

            {exclusions.length === 0 ? (
              <p class="text-subtle" style="font-size: 0.85rem; font-style: italic;">
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
                        >
                          <button
                            type="submit"
                            class="btn btn-ghost btn-xs"
                            aria-label={`Remove exclusion rule: ${giver.name} cannot draw ${excluded.name}`}
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

          {/* PRIVACY SEAL STATUS OR OPTIONAL EMERGENCY MASTER LIST */}
          {isDrawn && (
            <div class="surface-card-compact">
              {!event.allow_spoilers ? (
                <div id="strict-privacy-seal-card">
                  <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.35rem;">
                    <span class="badge badge-encrypted">🔒 Encrypted No-Peek Mode Active</span>
                  </div>
                  <p class="text-muted" style="font-size: 0.83rem; line-height: 1.5;">
                    Matches are encrypted with AES-256-GCM per guest token and hidden from the
                    organizer dashboard—so you can participate without spoilers.
                  </p>
                </div>
              ) : (
                <details id="emergency-spoilers-details" class="spoiler-details">
                  <summary>Emergency Organizer Master List (Spoilers)</summary>
                  <div class="spoiler-body">
                    <p class="spoiler-warning">
                      Warning: Expanding this reveals every Secret Santa match for this exchange.
                    </p>
                    <ul class="participant-list">
                      {participants.map((giver) => {
                        const receiverId =
                          decryptedSpoilerMap[giver.id] || giver.assigned_to_id || '';
                        const receiver = receiverId ? participantMap.get(receiverId) : null;
                        return (
                          <li
                            class="participant-item"
                            style="padding: 0.55rem 0.85rem;"
                            key={giver.id}
                          >
                            <span>
                              <strong>{giver.name}</strong> gives a gift to
                            </span>
                            <span class="spoiler-match-name">
                              {receiver ? receiver.name : 'Unassigned'}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </details>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const DashboardShell: FC<DashboardProps> = (props) => {
  const { event, origin } = props;
  const adminUrl = `${origin}/events/${event.id}?key=${encodeURIComponent(event.admin_key)}`;
  const keyQuery = `?key=${encodeURIComponent(event.admin_key)}`;
  const displayDate = formatExchangeDate(event.exchange_date);
  const isDrawn = event.status === 'drawn';

  return (
    <div id="dashboard-shell">
      <div class="pine-banner">
        <div class="banner-split">
          <div>
            <div style="display: flex; align-items: center; gap: 0.45rem; flex-wrap: wrap; margin-bottom: 0.65rem;">
              <span class="badge badge-gold">✦ Hosted by {event.organizer_name}</span>
              {!event.allow_spoilers && (
                <span
                  class="badge badge-encrypted"
                  title="Assignments are AES-256-GCM encrypted and hidden from the host"
                >
                  🔒 Encrypted No-Peek Mode
                </span>
              )}
            </div>
            <h1 class="banner-title">{event.title}</h1>
            {event.notes && <p class="banner-notes">“{event.notes}”</p>}
          </div>

          <div class="organizer-dispatch-bar">
            <div class="dispatch-bar-label">
              <span class="title">🔑 Organizer Secret Link</span>
              <span class="hint">Bookmark to manage</span>
            </div>
            <div class="dispatch-bar-controls">
              <input
                type="text"
                readonly
                value={adminUrl}
                class="dispatch-url-input"
                onclick="this.select()"
                aria-label="Organizer Private Link"
              />
              <button
                type="button"
                class="btn btn-secondary btn-sm"
                id="copy-admin-url-btn"
                onclick={`copyToClipboard(${JSON.stringify(adminUrl)}, this, '✓ Copied')`}
              >
                Copy Link
              </button>
            </div>
          </div>
        </div>

        <div class="meta-strip">
          <div>
            <strong class="meta-label">Spending Limit:</strong>
            <span>{event.budget || 'Flexible / Open'}</span>
          </div>
          <div>
            <strong class="meta-label">Exchange Date:</strong>
            <span>{displayDate || 'TBD'}</span>
          </div>
          <div>
            <strong class="meta-label">Exchange ID:</strong>
            <span style="font-family: var(--font-mono); font-size: 0.8rem;">{event.id}</span>
          </div>
        </div>

        {/* COLLAPSIBLE EXCHANGE SETTINGS EDITOR */}
        <details class="banner-edit-drawer" id="edit-exchange-details">
          <summary id="toggle-edit-exchange-btn">✎ Edit Exchange Details</summary>
          <form
            method="post"
            action={`/events/${event.id}/settings${keyQuery}`}
            data-target="#dashboard-shell"
            class="banner-edit-form"
            id="edit-exchange-form"
          >
            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label" for="edit-title-input">
                  Exchange Title *
                </label>
                <input
                  type="text"
                  id="edit-title-input"
                  name="title"
                  value={event.title}
                  class="input-field input-field--sm"
                  required
                />
              </div>
              <div class="form-group">
                <label class="form-label" for="edit-organizer-input">
                  Host Name *
                </label>
                <input
                  type="text"
                  id="edit-organizer-input"
                  name="organizer_name"
                  value={event.organizer_name}
                  class="input-field input-field--sm"
                  required
                />
              </div>
            </div>

            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label" for="edit-budget-input">
                  Spending Limit
                </label>
                <input
                  type="text"
                  id="edit-budget-input"
                  name="budget"
                  value={event.budget}
                  class="input-field input-field--sm"
                  placeholder="e.g., $50"
                />
              </div>
              <div class="form-group">
                <label class="form-label" for="edit-date-input">
                  Exchange Date
                </label>
                <input
                  type="date"
                  id="edit-date-input"
                  name="exchange_date"
                  value={event.exchange_date}
                  class="input-field input-field--sm"
                />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="edit-notes-input">
                Welcome Note &amp; House Rules
              </label>
              <textarea
                id="edit-notes-input"
                name="notes"
                class="textarea-field"
                style="min-height: 70px;"
              >
                {event.notes}
              </textarea>
            </div>

            {!isDrawn && (
              <div class="privacy-option-card">
                <input type="hidden" name="has_privacy_field" value="1" />
                <label class="checkbox-row" style="margin-top: 0;">
                  <input
                    type="checkbox"
                    name="strict_privacy"
                    value="1"
                    checked={!event.allow_spoilers}
                    class="checkbox-input"
                  />
                  <span>
                    <strong>Strict Encrypted No-Peek Mode</strong> (locks out organizer spoiler
                    list once drawn)
                  </span>
                </label>
              </div>
            )}

            <div class="share-actions">
              <button type="submit" class="btn btn-primary btn-sm" id="save-exchange-settings-btn">
                Save Changes
              </button>
              <button
                type="button"
                class="btn btn-ghost btn-sm"
                onclick="document.getElementById('edit-exchange-details').removeAttribute('open')"
              >
                Cancel
              </button>
            </div>
          </form>
        </details>
      </div>

      <OrganizerWorkspace {...props} />
    </div>
  );
};

export const DashboardPage: FC<DashboardProps> = (props) => {
  return (
    <Layout
      title={`${props.event.title} — Organizer Dispatch`}
      headerRight={
        <a href="/#create-event-card" class="nav-link">
          + New Exchange
        </a>
      }
    >
      <DashboardShell {...props} />
    </Layout>
  );
};
