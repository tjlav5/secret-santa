import type { FC } from 'hono/jsx';
import { Layout } from './layout';
import { type EventRecord, type ParticipantRecord, formatExchangeDate } from '../db';

export interface JoinPageProps {
  event: EventRecord;
  participants: ParticipantRecord[];
  existingGuest?: ParticipantRecord | null;
  error?: string;
}

export const JoinPage: FC<JoinPageProps> = ({
  event,
  participants,
  existingGuest,
  error,
}) => {
  const isDrawn = event.status === 'drawn';
  const isOpen = !isDrawn && Boolean(event.join_enabled);
  const displayDate = formatExchangeDate(event.exchange_date);
  const joinAction = `/join/${encodeURIComponent(event.join_code || '')}`;

  const renderJoinForm = () => (
    <form action={joinAction} method="post" id="self-join-form">
      <div class="form-group">
        <label class="form-label" for="join-name-input">
          Your Name *
        </label>
        <input
          type="text"
          id="join-name-input"
          name="name"
          class="input-field"
          placeholder="e.g., Marcus, Aunt Clara..."
          required
          autofocus={!existingGuest}
        />
        <span class="form-hint">
          Use your first name (plus a last initial if someone else in the group shares it).
        </span>
      </div>

      <div class="form-group">
        <label class="form-label" for="join-wishlist-input">
          Gift Hints, Sizes &amp; Preferences (Optional)
        </label>
        <textarea
          id="join-wishlist-input"
          name="wishlist_notes"
          class="textarea-field"
          placeholder="e.g., Shirt size L, love dark roast coffee, mysteries, or board games! You can also add item links right after joining."
        ></textarea>
      </div>

      <button type="submit" class="btn btn-primary btn-lg btn-full" id="join-submit-btn">
        ✦ Join Exchange &amp; Get Private Envelope →
      </button>
    </form>
  );

  return (
    <Layout
      title={`Join ${event.title} — Secret Santa Invite`}
      headerRight={
        <a href="/" class="nav-link">
          + Host Your Own
        </a>
      }
    >
      <div class="narrow-container">
        {/* EVENT INVITE BANNER */}
        <div class="pine-banner pine-banner--centered">
          <div style="display: flex; justify-content: center; gap: 0.45rem; flex-wrap: wrap; margin-bottom: 0.7rem;">
            <span class="badge badge-gold">✦ Group Invite • Hosted by {event.organizer_name}</span>
            {!event.allow_spoilers && (
              <span class="badge badge-encrypted" title="Assignments are encrypted with each guest's private link">
                🔒 Encrypted No-Peek Draw
              </span>
            )}
          </div>
          <h1 class="banner-title">{event.title}</h1>
          <p class="text-muted" style="font-size: 1rem;">
            {isOpen
              ? `${event.organizer_name} invited you to join this Secret Santa gift exchange.`
              : isDrawn
                ? 'Names have already been drawn for this exchange.'
                : 'Self-registration is currently paused by the host.'}
          </p>
          {event.notes && <p class="banner-notes">“{event.notes}”</p>}

          <div class="meta-strip meta-strip--centered">
            <div>
              <strong class="meta-label">Spending Limit:</strong>
              <span>{event.budget || 'Flexible'}</span>
            </div>
            <div>
              <strong class="meta-label">Exchange Date:</strong>
              <span>{displayDate || 'TBD'}</span>
            </div>
            <div>
              <strong class="meta-label">Joined So Far:</strong>
              <span>
                {participants.length} {participants.length === 1 ? 'person' : 'people'}
              </span>
            </div>
          </div>
        </div>

        {/* RETURNING GUEST SHORTCUT */}
        {existingGuest && (
          <div class="returning-guest-banner" id="returning-guest-banner">
            <div>
              <span class="badge badge-success" style="margin-bottom: 0.35rem;">
                ✓ Already Joined on This Device
              </span>
              <h2 style="font-size: 1.25rem;">Welcome back, {existingGuest.name}!</h2>
              <p class="text-muted" style="font-size: 0.86rem;">
                Your private envelope and wishlist are ready whenever you need them.
              </p>
            </div>
            <a
              href={`/reveal/${existingGuest.token}`}
              class="btn btn-primary"
              id="resume-envelope-btn"
            >
              Open Your Envelope →
            </a>
          </div>
        )}

        {/* MAIN JOIN CARD OR CLOSED NOTICE */}
        {!isOpen ? (
          <div class="surface-card status-card-centered" id="join-closed-card">
            <h2 style="font-size: 1.5rem;">
              {isDrawn ? 'Roster Locked — Envelopes Sealed' : 'Group Link Paused'}
            </h2>
            <p>
              {isDrawn
                ? `Names have already been drawn! Check with ${event.organizer_name} if you need your private envelope link.`
                : `${event.organizer_name} has paused new sign-ups on this group link.`}
            </p>
            {existingGuest ? (
              <a href={`/reveal/${existingGuest.token}`} class="btn btn-primary">
                Go to {existingGuest.name}’s Envelope →
              </a>
            ) : (
              <a href="/" class="btn btn-secondary">
                Host Your Own Exchange
              </a>
            )}
          </div>
        ) : (
          <div class="surface-card" id="join-card">
            {error && (
              <div class="alert alert-error" role="alert">
                {error}
              </div>
            )}

            {existingGuest ? (
              <details>
                <summary
                  style="cursor: pointer; font-weight: 600; color: var(--gold-300); font-size: 0.92rem;"
                >
                  + Sharing this device? Add another family member or guest
                </summary>
                <div style="margin-top: 1.25rem;">{renderJoinForm()}</div>
              </details>
            ) : (
              <>
                <div style="margin-bottom: 1.35rem;">
                  <div class="section-kicker">Step Inside</div>
                  <h2 style="font-size: 1.5rem; margin-bottom: 0.25rem;">Claim Your Spot</h2>
                  <p class="text-muted" style="font-size: 0.88rem;">
                    Add your name below—no email or password required. You’ll get a private
                    bookmarkable envelope link right away.
                  </p>
                </div>
                {renderJoinForm()}
              </>
            )}

            {participants.length > 0 && (
              <div
                style="margin-top: 1.75rem; padding-top: 1.35rem; border-top: 1px solid var(--border-hairline);"
              >
                <span class="form-label">Who’s In So Far ({participants.length})</span>
                <ul class="joined-pill-list">
                  {participants.map((p) => (
                    <li class="joined-pill" key={p.id}>
                      <span
                        aria-hidden="true"
                        style="color: var(--gold-300); font-weight: 700; font-size: 0.75rem;"
                      >
                        ✦
                      </span>
                      <span>{p.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};
