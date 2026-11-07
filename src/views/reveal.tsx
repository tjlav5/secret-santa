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
        <p style="color: var(--text-secondary);">
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
      <span class="badge badge-success" style="margin-bottom: 0.75rem;">
        🎁 Official Secret Santa Assignment
      </span>
      <p style="font-size: 1rem; color: var(--text-secondary);">
        {participant.name}, you are the Secret Santa for:
      </p>
      <div class="recipient-name-display" id="revealed-recipient-name">
        {assignedRecipient.name}
      </div>

      {event.budget && (
        <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 1.5rem;">
          Suggested Spending Limit: <strong>{event.budget}</strong>
          {event.exchange_date ? ` • Exchange Date: ${event.exchange_date}` : ''}
        </p>
      )}

      {/* RECIPIENT WISHLIST SECTION */}
      <div
        style="text-align: left; background: var(--bg-subtle); border: 1px solid var(--border-warm); border-radius: var(--radius-md); padding: 1.35rem 1.5rem; margin-top: 1rem;"
      >
        <h3 style="font-size: 1.1rem; margin-bottom: 0.5rem;">
          ✨ {assignedRecipient.name}’s Wishlist &amp; Gift Hints
        </h3>

        {!hasRecipientNotes && recipientLinks.length === 0 ? (
          <p style="font-size: 0.9rem; color: var(--text-muted); font-style: italic;">
            {assignedRecipient.name} hasn't added any wishlist notes or links yet. When they update
            their wishlist on their secret link, it will automatically appear right here!
          </p>
        ) : (
          <>
            {hasRecipientNotes && (
              <div
                style="white-space: pre-wrap; font-size: 0.95rem; color: var(--text-primary); background: #FFFFFF; padding: 0.9rem 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-warm); margin-bottom: 0.85rem;"
              >
                {assignedRecipient.wishlist_notes}
              </div>
            )}

            {recipientLinks.length > 0 && (
              <div>
                <strong style="display: block; font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 0.4rem;">
                  Wishlist Links:
                </strong>
                <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.4rem;">
                  {recipientLinks.map((link, idx) => (
                    <li key={idx}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        class="btn btn-secondary btn-sm"
                        style="justify-content: flex-start; width: 100%; text-align: left; overflow: hidden; text-overflow: ellipsis;"
                      >
                        🔗 {link.title || link.url} ↗
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
    <div class="surface-card" id="participant-wishlist-section">
      <div
        style="display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 0.5rem; flex-wrap: wrap;"
      >
        <h2 style="font-size: 1.35rem;">Your Wishlist for Your Secret Santa</h2>
        {wishlistSaved && <span class="badge badge-success">✓ Saved to your Santa’s card!</span>}
      </div>
      <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 1.25rem;">
        Help your anonymous Secret Santa pick something you'll love! Share gift ideas, sizes,
        favorite treats, hobbies, or allergies.
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
        style="margin-top: 1.75rem; padding-top: 1.5rem; border-top: 1px solid var(--border-warm);"
      >
        <h3 style="font-size: 1.05rem; margin-bottom: 0.35rem;">
          Specific Item Links ({links.length})
        </h3>
        <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1rem;">
          Add links to specific items on Amazon, Etsy, Bookshop, or anywhere online.
        </p>

        {links.length > 0 && (
          <ul class="participant-list" style="margin-bottom: 1rem;">
            {links.map((item, idx) => (
              <li class="participant-item" style="padding: 0.6rem 0;" key={idx}>
                <div style="min-width: 0;">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style="font-weight: 600; font-size: 0.92rem; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
                  >
                    🔗 {item.title} ↗
                  </a>
                  <span
                    style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-muted); display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 420px;"
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
          style="background: var(--bg-subtle); padding: 1rem; border-radius: var(--radius-sm);"
          id="add-wishlist-link-form"
        >
          <div class="form-row-2" style="margin-bottom: 0.75rem;">
            <div>
              <label class="form-label" style="font-size: 0.8rem;" for="link-title-input">
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
              <label class="form-label" style="font-size: 0.8rem;" for="link-url-input">
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
        <span class="badge badge-pending">Private Invite for {participant.name}</span>
      }
    >
      <div class="narrow-container">
        <div class="pine-banner" style="margin-bottom: 1.75rem; text-align: center;">
          <span class="badge badge-gold" style="margin-bottom: 0.5rem;">
            ✦ Hosted by {event.organizer_name}
          </span>
          <h1 style="font-size: clamp(1.75rem, 4vw, 2.4rem); margin-bottom: 0.35rem;">
            {event.title}
          </h1>
          <p style="color: rgba(249, 246, 240, 0.9); font-size: 1.05rem;">
            Welcome, <strong>{participant.name}</strong>! Bookmark this private link to check your
            assignment or update your wishlist anytime.
          </p>
          {event.notes && (
            <p
              style="margin-top: 0.75rem; font-size: 0.9rem; color: rgba(249, 246, 240, 0.8); max-width: 55ch; margin-left: auto; margin-right: auto;"
            >
              “{event.notes}”
            </p>
          )}
          <div class="meta-strip" style="justify-content: center;">
            <div>
              <strong>Budget:</strong> {event.budget || 'Flexible'}
            </div>
            <div>
              <strong>Exchange Date:</strong> {event.exchange_date || 'TBD'}
            </div>
          </div>
        </div>

        {/* REVEAL STAGE */}
        <div class="reveal-stage">
          {!isDrawn ? (
            <div
              class="surface-card"
              style="text-align: center; padding: 2.5rem 2rem;"
              id="reveal-card-container"
            >
              <div class="wax-seal" style="margin-bottom: 1rem;">
                ⏳
              </div>
              <h2 style="font-size: 1.5rem; margin-bottom: 0.4rem;">
                Names Haven't Been Drawn Yet
              </h2>
              <p style="color: var(--text-secondary); max-width: 48ch; margin: 0 auto;">
                {event.organizer_name} is still gathering everyone. Fill out your wishlist below so
                it’s ready as soon as names are drawn!
              </p>
            </div>
          ) : !isUnwrapped ? (
            <div class="gift-envelope" id="reveal-card-container">
              <div class="wax-seal" aria-hidden="true">
                🎁
              </div>
              <h2
                style="color: #FFFDF9; font-size: clamp(1.6rem, 3.5vw, 2.15rem); margin-bottom: 0.5rem;"
              >
                Your Secret Santa Match is Ready!
              </h2>
              <p
                style="color: rgba(255, 253, 249, 0.86); max-width: 44ch; margin: 0 auto 1.75rem; font-size: 0.98rem;"
              >
                Make sure nobody is peeking over your shoulder, then break the seal to reveal who
                you are buying a gift for.
              </p>
              <form
                method="post"
                action={`/reveal/${participant.token}/unwrap`}
                data-target="#reveal-card-container"
              >
                <button
                  type="submit"
                  class="btn"
                  id="unwrap-match-btn"
                  style="background: #F4D28E; color: #2B1B04; font-size: 1.05rem; padding: 0.85rem 1.85rem; box-shadow: 0 8px 20px rgba(0, 0, 0, 0.28);"
                >
                  ✨ Break Seal &amp; Unwrap Match
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
