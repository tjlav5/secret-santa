import type { FC } from 'hono/jsx';
import { Layout } from './layout';
import { type EventRecord, type ParticipantRecord, parseWishlistLinks } from '../db';

export interface RevealPageProps {
  event: EventRecord;
  participant: ParticipantRecord;
  assignedRecipient: ParticipantRecord | null;
  wishlistSaved?: boolean;
  wishlistError?: string;
}

export const UnwrappedMatchCard: FC<{
  event: EventRecord;
  participant: ParticipantRecord;
  assignedRecipient: ParticipantRecord | null;
}> = ({ event, participant, assignedRecipient }) => {
  if (!assignedRecipient) {
    return (
      <div class="surface-card" style="text-align: center;" id="reveal-card-container">
        <p style="color: var(--ink-700);">
          Names haven't been drawn yet! Check back on this link once {event.organizer_name} draws
          names.
        </p>
      </div>
    );
  }

  const recipientLinks = parseWishlistLinks(assignedRecipient.wishlist_links);
  const hasRecipientNotes =
    assignedRecipient.wishlist_notes && assignedRecipient.wishlist_notes.trim().length > 0;

  return (
    <div class="unwrapped-card" id="reveal-card-container">
      {/* Top Header */}
      <div
        style="display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap;"
      >
        <span class="badge badge-success">✦ Official Secret Santa Assignment</span>
        <button
          type="button"
          class="btn btn-ghost btn-sm"
          style="font-size: 0.74rem; border: 1px solid var(--border-subtle); padding: 0.25rem 0.65rem;"
          onclick="var el = document.getElementById('revealed-recipient-name'); var blurred = el.style.filter.includes('blur'); el.style.filter = blurred ? 'none' : 'blur(14px)'; this.textContent = blurred ? '🔒 Hide Name' : '👁️ Show Name';"
          title="Blur your match's name if someone is walking by"
        >
          🔒 Hide Name
        </button>
      </div>

      <p
        style="font-family: var(--font-display); font-style: italic; font-size: 1.25rem; color: var(--ink-700);"
      >
        {participant.name}, you are the Secret Santa for:
      </p>

      <div
        class="recipient-name-display"
        id="revealed-recipient-name"
        style="transition: filter 0.22s ease;"
      >
        {assignedRecipient.name}
      </div>

      <div class="ornate-divider">
        <span>✻</span>
      </div>

      <p style="font-size: 0.9rem; color: var(--ink-700); margin-bottom: 1.85rem;">
        Suggested Spending Limit: <strong>{event.budget || 'Flexible'}</strong>
        {event.exchange_date ? ` • Exchange Date: ${event.exchange_date}` : ''}
      </p>

      {/* RECIPIENT WISHLIST SECTION */}
      <div
        style="text-align: left; background: rgba(6, 17, 11, 0.75); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1.5rem 1.75rem;"
      >
        <div
          style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; margin-bottom: 0.85rem; flex-wrap: wrap;"
        >
          <h3 style="font-size: 1.2rem; color: #FAF8F5;">
            🎁 {assignedRecipient.name}’s Wishlist &amp; Preferences
          </h3>
          <span class="badge badge-pending" style="font-size: 0.65rem;">
            Live Synced
          </span>
        </div>

        {!hasRecipientNotes && recipientLinks.length === 0 ? (
          <p style="font-size: 0.92rem; color: var(--ink-500); font-style: italic;">
            {assignedRecipient.name} hasn't posted any wishlist notes or links yet. Whenever they
            update their wishlist on their private link, it will automatically appear right here!
          </p>
        ) : (
          <>
            {hasRecipientNotes && (
              <div
                style="white-space: pre-wrap; font-size: 0.96rem; font-family: var(--font-display); color: #FAF8F5; background: rgba(14, 29, 21, 0.9); padding: 1.15rem 1.35rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); margin-bottom: 1.1rem; box-shadow: var(--shadow-sm);"
              >
                “{assignedRecipient.wishlist_notes}”
              </div>
            )}

            {recipientLinks.length > 0 && (
              <div>
                <strong
                  style="display: block; font-size: 0.74rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--gold-400); margin-bottom: 0.55rem;"
                >
                  Requested Gift Links ({recipientLinks.length}):
                </strong>
                <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.5rem;">
                  {recipientLinks.map((link, idx) => (
                    <li key={idx}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        class="btn btn-secondary btn-sm"
                        style="justify-content: space-between; width: 100%; text-align: left; padding: 0.65rem 1rem;"
                      >
                        <span style="overflow: hidden; text-overflow: ellipsis; font-weight: 600;">
                          🔗 {link.title || link.url}
                        </span>
                        <span style="color: var(--gold-300); font-weight: 700;">
                          Open Link ↗
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export const ParticipantWishlistEditor: FC<{
  participant: ParticipantRecord;
  wishlistSaved?: boolean;
  wishlistError?: string;
}> = ({ participant, wishlistSaved, wishlistError }) => {
  const links = parseWishlistLinks(participant.wishlist_links);

  return (
    <div
      class="surface-card"
      id="participant-wishlist-section"
      style="view-transition-name: wishlist-editor; margin-top: 2rem;"
    >
      <div
        style="display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 0.45rem; flex-wrap: wrap;"
      >
        <div>
          <h2 style="font-size: 1.5rem;">Your Wishlist for Your Secret Santa</h2>
        </div>
        {wishlistSaved && <span class="badge badge-success">✓ Posted to Your Santa’s Card!</span>}
      </div>
      <p style="font-size: 0.9rem; color: var(--ink-700); margin-bottom: 1.45rem;">
        Help your anonymous Secret Santa choose something thoughtful! Share gift ideas, clothing
        sizes, favorite coffee or snacks, hobbies, or allergies.
      </p>

      {wishlistError && <div class="alert alert-error">{wishlistError}</div>}

      <form
        method="post"
        action={`/reveal/${participant.token}/wishlist`}
        data-target="#participant-wishlist-section"
        id="wishlist-notes-form"
      >
        <div class="form-group">
          <label class="form-label" for="wishlist-notes-textarea">
            Gift Notes, Sizes &amp; Preferences
          </label>
          <textarea
            id="wishlist-notes-textarea"
            name="wishlist_notes"
            class="textarea-field"
            placeholder="e.g., Shirt size M, love dark roast coffee beans, cozy wool socks, sci-fi books, or board games! Please no scented candles."
          >
            {participant.wishlist_notes || ''}
          </textarea>
        </div>

        <button type="submit" class="btn btn-pine" id="save-wishlist-notes-btn">
          Save Wishlist Notes
        </button>
      </form>

      {/* WISHLIST LINKS */}
      <div
        style="margin-top: 1.85rem; padding-top: 1.5rem; border-top: 1px solid var(--border-hairline);"
      >
        <h3 style="font-size: 1.15rem; margin-bottom: 0.3rem;">
          Specific Item Links ({links.length})
        </h3>
        <p style="font-size: 0.85rem; color: var(--ink-700); margin-bottom: 1.1rem;">
          Add direct links to items on Amazon, Etsy, Bookshop, or anywhere online.
        </p>

        {links.length > 0 && (
          <ul class="participant-list" style="margin-bottom: 1.15rem;">
            {links.map((item, idx) => (
              <li class="participant-item" style="padding: 0.75rem 0.95rem;" key={idx}>
                <div style="min-width: 0;">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style="font-weight: 700; font-family: var(--font-display); font-size: 1rem; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
                  >
                    🔗 {item.title} ↗
                  </a>
                  <span
                    style="font-family: var(--font-mono); font-size: 0.73rem; color: var(--ink-500); display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 420px;"
                  >
                    {item.url}
                  </span>
                </div>
                <form
                  method="post"
                  action={`/reveal/${participant.token}/links/${idx}/delete`}
                  data-target="#participant-wishlist-section"
                  style="display: inline;"
                >
                  <button type="submit" class="btn btn-ghost btn-sm">
                    Remove
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}

        <form
          method="post"
          action={`/reveal/${participant.token}/links`}
          data-target="#participant-wishlist-section"
          style="background: var(--bg-canvas); border: 1px solid var(--border-subtle); padding: 1.15rem; border-radius: var(--radius-sm);"
          id="add-wishlist-link-form"
        >
          <div class="form-row-2" style="margin-bottom: 0.85rem;">
            <div>
              <label class="form-label" style="font-size: 0.74rem;" for="link-title-input">
                Item Name
              </label>
              <input
                type="text"
                id="link-title-input"
                name="title"
                class="input-field"
                placeholder="e.g., AeroPress Coffee Maker"
                required
              />
            </div>
            <div>
              <label class="form-label" style="font-size: 0.74rem;" for="link-url-input">
                URL (https://...)
              </label>
              <input
                type="url"
                id="link-url-input"
                name="url"
                class="input-field"
                placeholder="https://example.com/item"
                required
              />
            </div>
          </div>
          <button type="submit" class="btn btn-secondary btn-sm" id="add-wishlist-link-btn">
            + Add Item Link
          </button>
        </form>
      </div>
    </div>
  );
};

export const RevealPage: FC<RevealPageProps> = ({
  event,
  participant,
  assignedRecipient,
  wishlistSaved,
  wishlistError,
}) => {
  const isDrawn = event.status === 'drawn' && Boolean(assignedRecipient);
  const isUnwrapped = Boolean(participant.unwrapped_at);

  return (
    <Layout
      title={`${participant.name}'s Secret Santa Envelope — ${event.title}`}
      headerRight={
        <a href="/" class="nav-link">
          + Host an Exchange
        </a>
      }
    >
      <div class="narrow-container">
        <div class="pine-banner" style="margin-bottom: 2rem; text-align: center;">
          <span class="badge badge-gold" style="margin-bottom: 0.75rem;">✦ Hosted by {event.organizer_name}</span>
          <h1 style="font-size: clamp(1.95rem, 4.2vw, 2.7rem); margin-bottom: 0.45rem;">
            {event.title}
          </h1>
          <p style="color: rgba(250, 248, 245, 0.92); font-size: 1.04rem;">
            Welcome, <strong>{participant.name}</strong>! Bookmark this private link to check your
            assignment or update your wishlist anytime.
          </p>
          {event.notes && (
            <p
              style="margin-top: 0.85rem; font-size: 0.96rem; font-family: var(--font-display); font-style: italic; color: var(--gold-300); max-width: 55ch; margin-left: auto; margin-right: auto;"
            >
              “{event.notes}”
            </p>
          )}
          <div class="meta-strip" style="justify-content: center;">
            <div>
              <strong style="color: var(--gold-400); text-transform: uppercase; font-size: 0.74rem; letter-spacing: 0.08em; margin-right: 0.35rem;">
                Spending Limit:
              </strong>
              <span>{event.budget || 'Flexible'}</span>
            </div>
            <div>
              <strong style="color: var(--gold-400); text-transform: uppercase; font-size: 0.74rem; letter-spacing: 0.08em; margin-right: 0.35rem;">
                Exchange Date:
              </strong>
              <span>{event.exchange_date || 'TBD'}</span>
            </div>
          </div>
        </div>

        {/* REVEAL STAGE */}
        <div class="reveal-stage">
          {!isDrawn ? (
            <div
              class="surface-card"
              style="text-align: center; padding: 3rem 2rem;"
              id="reveal-card-container"
            >
              <div class="wax-seal" style="margin-bottom: 1.25rem;">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <h2 style="font-size: 1.65rem; margin-bottom: 0.45rem;">
                Awaiting the Official Draw
              </h2>
              <p style="color: var(--ink-700); max-width: 46ch; margin: 0 auto;">
                {event.organizer_name} is still gathering participants. Fill out your wishlist below
                so it is ready the moment names are drawn!
              </p>
            </div>
          ) : !isUnwrapped ? (
            <div class="gift-envelope" id="reveal-card-container">
              <form
                method="post"
                action={`/reveal/${participant.token}/unwrap`}
                data-target="#reveal-card-container"
                data-unwrap="true"
              >
                <button
                  type="submit"
                  class="wax-seal-medallion"
                  aria-label="Break golden wax seal and unwrap match"
                  title="Click to break the wax seal"
                  style="background: none; border: none; padding: 0; outline: none;"
                >
                  <img
                    src="/assets/seal.webp"
                    alt="Authentic embossed antique gold wax seal"
                    width="116"
                    height="116"
                  />
                </button>
                <div
                  style="font-family: var(--font-mono); font-size: 0.72rem; letter-spacing: 0.16em; text-transform: uppercase; color: var(--gold-300); margin-bottom: 0.45rem;"
                >
                  CONFIDENTIAL DISPATCH • FOR {participant.name.toUpperCase()} ONLY
                </div>
                <h2
                  style="color: #FFFDF9; font-size: clamp(1.85rem, 4vw, 2.45rem); margin-bottom: 0.55rem;"
                >
                  Your Secret Santa Match is Sealed Inside
                </h2>
                <p
                  style="color: rgba(255, 253, 249, 0.88); max-width: 44ch; margin: 0 auto 2rem; font-size: 1rem;"
                >
                  Make sure nobody is peeking over your shoulder, then click the golden wax seal or
                  the button below to break the seal and reveal who you are gifting.
                </p>
                <button
                  type="submit"
                  class="btn btn-gold"
                  id="unwrap-match-btn"
                  style="font-size: 1.05rem; padding: 0.95rem 2.2rem;"
                >
                  ✦ Break Wax Seal &amp; Unwrap Match
                </button>
              </form>
            </div>
          ) : (
            <UnwrappedMatchCard
              event={event}
              participant={participant}
              assignedRecipient={assignedRecipient}
            />
          )}
        </div>

        {/* PARTICIPANT'S OWN WISHLIST EDITOR */}
        <ParticipantWishlistEditor
          participant={participant}
          wishlistSaved={wishlistSaved}
          wishlistError={wishlistError}
        />
      </div>
    </Layout>
  );
};
