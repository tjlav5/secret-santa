import type { FC } from 'hono/jsx';
import { Layout } from './layout';
import {
  type EventRecord,
  type ParticipantRecord,
  type QaMessageRecord,
  parseWishlistLinks,
  formatExchangeDate,
} from '../db';

export interface RevealPageProps {
  event: EventRecord;
  participant: ParticipantRecord;
  assignedRecipient: ParticipantRecord | null;
  /** Questions this participant (as Santa) asked their assigned recipient */
  outgoingQuestions?: QaMessageRecord[];
  /** Questions this participant's anonymous Secret Santa asked them */
  incomingQuestions?: QaMessageRecord[];
  origin?: string;
  joinedJustNow?: boolean;
  wishlistSaved?: boolean;
  wishlistError?: string;
  qaFeedback?: string;
  qaError?: string;
}

export const SantaQaPanel: FC<{
  participant: ParticipantRecord;
  assignedRecipient: ParticipantRecord;
  questions: QaMessageRecord[];
  qaFeedback?: string;
  qaError?: string;
}> = ({ participant, assignedRecipient, questions, qaFeedback, qaError }) => {
  return (
    <div class="qa-panel" id="santa-qa-section">
      <div class="card-header-row" style="margin-bottom: 0.55rem; align-items: center;">
        <div>
          <h3 style="font-size: 1.08rem;">
            💬 Ask {assignedRecipient.name} an Anonymous Question
          </h3>
          <p class="text-subtle" style="font-size: 0.82rem; margin-top: 0.15rem;">
            Your identity is never stored or shown—questions appear from “Your Secret Santa”.
          </p>
        </div>
        {qaFeedback && (
          <span class="badge badge-success" role="status" aria-live="polite">
            ✓ {qaFeedback}
          </span>
        )}
      </div>

      {qaError && (
        <div class="alert alert-error" role="alert">
          {qaError}
        </div>
      )}

      {questions.length > 0 && (
        <ul class="qa-thread">
          {questions.map((q) => {
            const hasAnswer = Boolean(q.answer && q.answer.trim().length > 0);
            return (
              <li class="qa-item" key={q.id}>
                <div class="qa-speaker">
                  <span>You (Anonymous Santa)</span>
                  <span class={`badge ${hasAnswer ? 'badge-success' : 'badge-pending'}`}>
                    {hasAnswer ? '✓ Answered' : 'Awaiting Reply'}
                  </span>
                </div>
                <p class="qa-question-text">“{q.question}”</p>
                {hasAnswer ? (
                  <div class="qa-answer-box">
                    <div class="qa-answer-speaker">{assignedRecipient.name}’s Reply</div>
                    <p class="qa-answer-text">{q.answer}</p>
                  </div>
                ) : (
                  <p class="qa-pending-note">
                    Waiting for {assignedRecipient.name} to reply on their envelope page.
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <form
        method="post"
        action={`/reveal/${participant.token}/questions`}
        data-target="#santa-qa-section"
        id="ask-recipient-form"
      >
        <div class="inline-add-form" style="margin-bottom: 0;">
          <input
            type="text"
            name="question"
            class="input-field input-field--sm"
            style="height: 38px;"
            placeholder={`Ask ${assignedRecipient.name} about sizes, colors, books they already own...`}
            maxlength={280}
            required
            id="santa-question-input"
          />
          <button type="submit" class="btn btn-secondary btn-md" id="send-santa-question-btn">
            Send Anonymously
          </button>
        </div>
      </form>
    </div>
  );
};

export const RecipientQaInbox: FC<{
  participant: ParticipantRecord;
  questions: QaMessageRecord[];
  qaFeedback?: string;
  qaError?: string;
}> = ({ participant, questions, qaFeedback, qaError }) => {
  if (questions.length === 0) return null;

  const unansweredCount = questions.filter((q) => !q.answer || !q.answer.trim()).length;

  return (
    <div class="surface-card" id="recipient-qa-section" style="margin-top: 2rem;">
      <div class="card-header-row" style="margin-bottom: 0.5rem; align-items: center;">
        <div>
          <div class="section-kicker">Secret Santa Whisper</div>
          <h2 style="font-size: 1.4rem;">Questions from Your Secret Santa</h2>
        </div>
        <div class="share-actions">
          {unansweredCount > 0 && (
            <span class="badge badge-qa">
              {unansweredCount} Needs Reply
            </span>
          )}
          {qaFeedback && (
            <span class="badge badge-success" role="status" aria-live="polite">
              ✓ {qaFeedback}
            </span>
          )}
        </div>
      </div>

      <p class="text-muted" style="font-size: 0.88rem; margin-bottom: 1.2rem;">
        Your anonymous Secret Santa sent you {questions.length === 1 ? 'a question' : 'questions'}{' '}
        to help pick the right gift! Reply below and it will appear directly on their card.
      </p>

      {qaError && (
        <div class="alert alert-error" role="alert">
          {qaError}
        </div>
      )}

      <ul class="qa-thread" style="margin-bottom: 0;">
        {questions.map((q) => {
          const hasAnswer = Boolean(q.answer && q.answer.trim().length > 0);
          return (
            <li class="qa-item" key={q.id}>
              <div class="qa-speaker">
                <span>✦ Your Anonymous Secret Santa asks:</span>
                <span class={`badge ${hasAnswer ? 'badge-success' : 'badge-qa'}`}>
                  {hasAnswer ? '✓ Replied' : 'Unanswered'}
                </span>
              </div>
              <p class="qa-question-text" style="margin-bottom: 0.8rem;">
                “{q.question}”
              </p>

              <form
                method="post"
                action={`/reveal/${participant.token}/questions/${q.id}/answer`}
                data-target="#recipient-qa-section"
              >
                <div class="inline-add-form" style="margin-bottom: 0;">
                  <input
                    type="text"
                    name="answer"
                    value={q.answer || ''}
                    class="input-field input-field--sm"
                    style="height: 38px;"
                    placeholder="Type your helpful reply..."
                    maxlength={400}
                    required
                    aria-label={`Reply to question: ${q.question}`}
                  />
                  <button type="submit" class="btn btn-pine btn-md">
                    {hasAnswer ? 'Update Reply' : 'Post Reply'}
                  </button>
                </div>
              </form>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export const UnwrappedMatchCard: FC<{
  event: EventRecord;
  participant: ParticipantRecord;
  assignedRecipient: ParticipantRecord | null;
  outgoingQuestions?: QaMessageRecord[];
  qaFeedback?: string;
  qaError?: string;
}> = ({
  event,
  participant,
  assignedRecipient,
  outgoingQuestions = [],
  qaFeedback,
  qaError,
}) => {
  if (!assignedRecipient) {
    return (
      <div class="surface-card status-card-centered" id="reveal-card-container">
        <p>
          Names haven't been drawn yet! Check back on this link once {event.organizer_name} draws
          names.
        </p>
      </div>
    );
  }

  const recipientLinks = parseWishlistLinks(assignedRecipient.wishlist_links);
  const hasRecipientNotes =
    assignedRecipient.wishlist_notes && assignedRecipient.wishlist_notes.trim().length > 0;
  const displayDate = formatExchangeDate(event.exchange_date);

  return (
    <div class="unwrapped-card" id="reveal-card-container">
      {/* Top Header */}
      <div class="unwrapped-topbar">
        <div class="share-actions">
          <span class="badge badge-success">✦ Official Secret Santa Assignment</span>
          {!event.allow_spoilers && (
            <span class="badge badge-encrypted" title="Decrypted solely via your private envelope link">
              🔒 Encrypted Match
            </span>
          )}
        </div>
        <button
          type="button"
          class="btn btn-ghost btn-xs"
          style="border-color: var(--border-subtle);"
          aria-pressed="false"
          onclick="var el = document.getElementById('revealed-recipient-name'); var blurred = el.style.filter.includes('blur'); el.style.filter = blurred ? 'none' : 'blur(14px)'; this.setAttribute('aria-pressed', blurred ? 'false' : 'true'); this.textContent = blurred ? '🔒 Hide Name' : '👁 Show Name';"
          title="Blur your match's name if someone is walking by"
        >
          🔒 Hide Name
        </button>
      </div>

      <p class="recipient-intro">{participant.name}, you are the Secret Santa for:</p>

      <div class="recipient-name-display" id="revealed-recipient-name">
        {assignedRecipient.name}
      </div>

      <div class="ornate-divider" aria-hidden="true">
        <span>✻</span>
      </div>

      <p class="text-muted" style="font-size: 0.9rem; margin-bottom: 1.75rem;">
        Suggested Spending Limit: <strong>{event.budget || 'Flexible'}</strong>
        {displayDate ? ` • Exchange Date: ${displayDate}` : ''}
      </p>

      {/* RECIPIENT WISHLIST SECTION */}
      <div class="wishlist-box">
        <div class="card-header-row" style="margin-bottom: 0.8rem; align-items: center;">
          <h3 style="font-size: 1.12rem;">🎁 {assignedRecipient.name}’s Wishlist &amp; Notes</h3>
          <span class="badge badge-pending">Live Synced</span>
        </div>

        {!hasRecipientNotes && recipientLinks.length === 0 ? (
          <p class="text-subtle" style="font-size: 0.9rem; font-style: italic;">
            {assignedRecipient.name} hasn't posted any wishlist notes or links yet. You can ask them
            an anonymous question right below!
          </p>
        ) : (
          <>
            {hasRecipientNotes && (
              <div class="wishlist-quote">“{assignedRecipient.wishlist_notes}”</div>
            )}

            {recipientLinks.length > 0 && (
              <div>
                <span class="form-label" style="margin-bottom: 0.5rem;">
                  Requested Gift Links ({recipientLinks.length})
                </span>
                <ul class="participant-list">
                  {recipientLinks.map((link, idx) => (
                    <li key={idx}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        class="btn btn-secondary btn-sm wishlist-link-btn"
                      >
                        <span style="overflow: hidden; text-overflow: ellipsis; font-weight: 600;">
                          {link.title || link.url}
                        </span>
                        <span style="color: var(--gold-200); font-weight: 600; flex-shrink: 0;">
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

      {/* ANONYMOUS SANTA -> RECIPIENT Q&A */}
      <SantaQaPanel
        participant={participant}
        assignedRecipient={assignedRecipient}
        questions={outgoingQuestions}
        qaFeedback={qaFeedback}
        qaError={qaError}
      />
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
      <div class="card-header-row" style="margin-bottom: 0.45rem; align-items: center;">
        <div>
          <div class="section-kicker">Anonymous Gift Hints</div>
          <h2 style="font-size: 1.45rem;">Your Wishlist for Your Secret Santa</h2>
        </div>
        {wishlistSaved && (
          <span class="badge badge-success" role="status" aria-live="polite">
            ✓ Saved to Your Santa’s Card
          </span>
        )}
      </div>
      <p class="text-muted" style="font-size: 0.9rem; margin-bottom: 1.35rem;">
        Help your anonymous Secret Santa pick something you’ll love—share sizes, favorite coffee or
        treats, hobbies, or anything to avoid.
      </p>

      {wishlistError && (
        <div class="alert alert-error" role="alert">
          {wishlistError}
        </div>
      )}

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
        style="margin-top: 1.8rem; padding-top: 1.5rem; border-top: 1px solid var(--border-hairline);"
      >
        <h3 style="font-size: 1.1rem; margin-bottom: 0.25rem;">
          Specific Item Links ({links.length})
        </h3>
        <p class="text-muted" style="font-size: 0.85rem; margin-bottom: 1.05rem;">
          Add direct links to items on Amazon, Etsy, Bookshop, or any online shop.
        </p>

        {links.length > 0 && (
          <ul class="participant-list" style="margin-bottom: 1.1rem;">
            {links.map((item, idx) => (
              <li class="participant-item" key={idx}>
                <div class="participant-meta">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="wishlist-item-title"
                  >
                    {item.title} ↗
                  </a>
                  <span class="wishlist-item-url">{item.url}</span>
                </div>
                <form
                  method="post"
                  action={`/reveal/${participant.token}/links/${idx}/delete`}
                  data-target="#participant-wishlist-section"
                >
                  <button
                    type="submit"
                    class="btn btn-ghost btn-sm"
                    aria-label={`Remove link ${item.title}`}
                  >
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
          class="subform-panel"
          id="add-wishlist-link-form"
        >
          <div class="form-row-2" style="margin-bottom: 0.85rem;">
            <div>
              <label class="form-label" style="font-size: 0.72rem;" for="link-title-input">
                Item Name
              </label>
              <input
                type="text"
                id="link-title-input"
                name="title"
                class="input-field input-field--sm"
                placeholder="e.g., AeroPress Coffee Maker"
                required
              />
            </div>
            <div>
              <label class="form-label" style="font-size: 0.72rem;" for="link-url-input">
                Item URL
              </label>
              <input
                type="text"
                inputmode="url"
                id="link-url-input"
                name="url"
                class="input-field input-field--sm"
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
  outgoingQuestions = [],
  incomingQuestions = [],
  origin = '',
  joinedJustNow,
  wishlistSaved,
  wishlistError,
  qaFeedback,
  qaError,
}) => {
  const isDrawn = event.status === 'drawn' && Boolean(assignedRecipient);
  const isUnwrapped = Boolean(participant.unwrapped_at);
  const displayDate = formatExchangeDate(event.exchange_date);
  const selfUrl = origin ? `${origin}/reveal/${participant.token}` : `/reveal/${participant.token}`;

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
        {joinedJustNow && (
          <div class="returning-guest-banner" role="status" aria-live="polite">
            <div>
              <span class="badge badge-success" style="margin-bottom: 0.3rem;">
                ✓ Spot Claimed!
              </span>
              <h2 style="font-size: 1.2rem;">You’re in, {participant.name}!</h2>
              <p class="text-muted" style="font-size: 0.85rem;">
                Save or copy your private envelope link below so you can return when names are
                drawn.
              </p>
            </div>
            <button
              type="button"
              class="btn btn-secondary btn-sm"
              onclick={`copyToClipboard(${JSON.stringify(selfUrl)}, this, '✓ Saved Link!')`}
            >
              Copy My Private Link
            </button>
          </div>
        )}

        <div class="pine-banner pine-banner--centered">
          <div style="display: flex; justify-content: center; gap: 0.45rem; flex-wrap: wrap; margin-bottom: 0.7rem;">
            <span class="badge badge-gold">✦ Hosted by {event.organizer_name}</span>
            {!event.allow_spoilers && (
              <span class="badge badge-encrypted">🔒 Encrypted No-Peek Mode</span>
            )}
          </div>
          <h1 class="banner-title">{event.title}</h1>
          <p class="text-muted" style="font-size: 1rem;">
            Welcome, <strong style="color: var(--ink-900);">{participant.name}</strong>! Bookmark
            this private link to check your match or update your wishlist anytime.
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
          </div>
        </div>

        {/* REVEAL STAGE */}
        <div class="reveal-stage">
          {!isDrawn ? (
            <div class="surface-card status-card-centered" id="reveal-card-container">
              <div class="wax-seal-waiting" aria-hidden="true">
                <svg
                  width="28"
                  height="28"
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
              <h2 style="font-size: 1.55rem;">Awaiting the Official Draw</h2>
              <p>
                {event.organizer_name} is still gathering participants. Fill out your wishlist below
                so it is ready the moment names are drawn!
              </p>
            </div>
          ) : !isUnwrapped ? (
            <div class="gift-envelope" id="reveal-card-container">
              {/* Decorative Envelope V-Flap Geometry */}
              <svg
                class="envelope-flap-svg"
                viewBox="0 0 800 175"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  d="M0,0 L400,152 L800,0"
                  fill="rgba(0,0,0,0.22)"
                  stroke="rgba(214,171,86,0.36)"
                  stroke-width="1.5"
                />
                <path
                  d="M18,0 L400,142 L782,0"
                  fill="none"
                  stroke="rgba(214,171,86,0.14)"
                  stroke-width="1"
                  stroke-dasharray="4 4"
                />
              </svg>

              <div class="envelope-postmark" aria-hidden="true">
                North Pole Post • Sealed
              </div>

              <form
                method="post"
                action={`/reveal/${participant.token}/unwrap`}
                data-target="#reveal-card-container"
                data-unwrap="true"
                style="position: relative; z-index: 2;"
              >
                <button
                  type="submit"
                  class="wax-seal-medallion"
                  aria-label="Break golden wax seal and unwrap match"
                  title="Click to break the wax seal"
                >
                  <img
                    src="/assets/seal.webp"
                    alt="Embossed antique gold wax seal"
                    width="116"
                    height="116"
                  />
                </button>
                <div class="section-kicker" style="justify-content: center; margin-bottom: 0.45rem;">
                  Confidential Dispatch • For {participant.name} Only
                </div>
                <h2
                  style="color: #FFFDF9; font-size: clamp(1.8rem, 3.8vw, 2.35rem); margin-bottom: 0.55rem;"
                >
                  Your Secret Santa Match is Sealed Inside
                </h2>
                <p
                  class="text-muted"
                  style="max-width: 44ch; margin: 0 auto 1.85rem; font-size: 0.98rem;"
                >
                  Make sure nobody is peeking over your shoulder, then click the golden wax seal or
                  button below to reveal who you are gifting.
                </p>
                <button type="submit" class="btn btn-gold btn-lg" id="unwrap-match-btn">
                  ✦ Break Wax Seal &amp; Unwrap Match
                </button>
              </form>
            </div>
          ) : (
            <UnwrappedMatchCard
              event={event}
              participant={participant}
              assignedRecipient={assignedRecipient}
              outgoingQuestions={outgoingQuestions}
            />
          )}
        </div>

        {/* ANONYMOUS QUESTIONS FROM THIS PARTICIPANT'S SECRET SANTA */}
        <RecipientQaInbox
          participant={participant}
          questions={incomingQuestions}
          qaFeedback={qaFeedback}
          qaError={qaError}
        />

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
