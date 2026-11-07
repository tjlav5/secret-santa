export const APP_CSS = `
:root {
  /* Midnight Alpine & Ethereal Aurora Palette (Awwwards Festive Luxury) */
  --bg-canvas: #06110B;
  --bg-card: rgba(14, 29, 21, 0.78);
  --bg-card-solid: #0E1D15;
  --bg-muted: rgba(255, 255, 255, 0.05);
  --bg-subtle: rgba(255, 255, 255, 0.08);

  --forest-950: #040A07;
  --forest-900: #08140D;
  --forest-800: #0E2217;
  --forest-700: #143524;
  --forest-600: #1C4D34;

  --crimson-700: #74161C;
  --crimson-600: #9E242E;
  --crimson-500: #C83845;
  --crimson-400: #E05461;

  --gold-500: #B88E39;
  --gold-400: #D4A853;
  --gold-300: #E6C37A;
  --gold-200: #F3DC9B;
  --gold-100: #FBF3DC;

  --ink-900: #FAF8F5;
  --ink-700: #C5D1C9;
  --ink-500: #8E9F94;
  --ink-400: #64756A;

  --border-hairline: rgba(212, 168, 83, 0.14);
  --border-subtle: rgba(212, 168, 83, 0.24);
  --border-strong: rgba(212, 168, 83, 0.48);

  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.35);
  --shadow-card:
    0 4px 12px rgba(0, 0, 0, 0.4),
    0 24px 50px -10px rgba(0, 0, 0, 0.7),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
  --shadow-lifted:
    0 8px 24px rgba(0, 0, 0, 0.5),
    0 32px 70px -15px rgba(0, 0, 0, 0.85),
    inset 0 1px 0 rgba(255, 255, 255, 0.12);
  --shadow-wax:
    0 16px 36px -4px rgba(0, 0, 0, 0.8),
    0 0 24px rgba(212, 168, 83, 0.35);

  --radius-xs: 6px;
  --radius-sm: 10px;
  --radius-md: 16px;
  --radius-lg: 24px;

  --font-display: 'Cinzel', 'Iowan Old Style', 'Palatino Linotype', 'Book Antiqua', Palatino, Baskerville, Georgia, serif;
  --font-sans: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  --font-mono: 'SFMono-Regular', ui-monospace, Menlo, Monaco, Consolas, monospace;
}

/* ==========================================================================
   1. CSS VIEW TRANSITIONS
   ========================================================================== */
@view-transition {
  navigation: auto;
}

::view-transition-old(root) {
  animation: vtFadeOut 0.22s cubic-bezier(0.4, 0, 1, 1) both;
}
::view-transition-new(root) {
  animation: vtFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;
}

::view-transition-old(reveal-stage) {
  animation: vtEnvelopeBreak 0.4s cubic-bezier(0.4, 0, 0.2, 1) both;
}
::view-transition-new(reveal-stage) {
  animation: vtLetterRise 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
}

::view-transition-group(pine-dispatch-banner),
::view-transition-group(organizer-workspace),
::view-transition-group(wishlist-editor) {
  animation-duration: 0.32s;
  animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes vtFadeOut {
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(-6px); }
}
@keyframes vtFadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes vtEnvelopeBreak {
  0% { opacity: 1; transform: scale(1); filter: brightness(1); }
  100% { opacity: 0; transform: scale(1.08) translateY(-18px); filter: brightness(1.3); }
}
@keyframes vtLetterRise {
  0% { opacity: 0; transform: scale(0.92) translateY(30px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  background-color: var(--bg-canvas);
  background-image:
    radial-gradient(1100px 580px at 50% -90px, rgba(20, 85, 50, 0.45), transparent 75%),
    radial-gradient(850px 480px at 90% 280px, rgba(212, 168, 83, 0.14), transparent 70%),
    radial-gradient(700px 450px at 8% 520px, rgba(16, 75, 48, 0.3), transparent 65%);
  background-attachment: fixed;
  color: var(--ink-900);
  font-family: var(--font-sans);
  font-size: 16px;
  line-height: 1.6;
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
}

a {
  color: var(--gold-300);
  text-decoration: none;
  transition: all 0.16s ease;
}

/* Atmospheric Sticky Header */
.site-header {
  border-bottom: 1px solid var(--border-hairline);
  background: rgba(6, 17, 11, 0.82);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  position: sticky;
  top: 0;
  z-index: 50;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

.header-inner {
  max-width: 1140px;
  margin: 0 auto;
  padding: 0.95rem 1.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.brand-link {
  display: inline-flex;
  align-items: center;
  gap: 0.85rem;
  color: var(--ink-900);
}

.brand-crest {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #0E2419 0%, #06110B 100%);
  color: var(--gold-400);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(212, 168, 83, 0.35);
  border: 1px solid rgba(212, 168, 83, 0.3);
}

.brand-title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.28rem;
  letter-spacing: -0.01em;
  line-height: 1;
  display: block;
  background: linear-gradient(135deg, #FFFFFF 0%, #E6C37A 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.brand-sub {
  font-size: 0.66rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--gold-400);
  opacity: 0.85;
  font-weight: 600;
  display: block;
  margin-top: 0.22rem;
}

.header-nav {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.nav-link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-family: var(--font-sans);
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--ink-900);
  padding: 0.45rem 1rem;
  border-radius: var(--radius-xs);
  border: 1px solid var(--border-subtle);
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  box-shadow: var(--shadow-sm);
  transition: all 0.2s ease;
  text-decoration: none;
  white-space: nowrap;
}

.nav-link:hover {
  background: rgba(212, 168, 83, 0.15);
  border-color: var(--gold-400);
  color: var(--gold-300);
  box-shadow: 0 0 15px rgba(212, 168, 83, 0.2);
}

/* Layout Containers */
.main-container {
  max-width: 1140px;
  margin: 0 auto;
  padding: 3rem 1.75rem 6rem;
}

.narrow-container {
  max-width: 760px;
  margin: 0 auto;
}

/* Typography */
h1, h2, h3, h4 {
  font-family: var(--font-display);
  color: var(--ink-900);
  line-height: 1.15;
  letter-spacing: -0.015em;
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.74rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--gold-400);
  margin-bottom: 1.1rem;
}

.hero-title {
  font-size: clamp(2.6rem, 5.2vw, 3.9rem);
  font-weight: 700;
  margin-bottom: 1.15rem;
  color: #FFFFFF;
  line-height: 1.08;
}

.hero-title em {
  font-style: italic;
  font-weight: 500;
  background: linear-gradient(135deg, #F3DC9B 0%, #D4A853 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-subtitle {
  font-size: 1.1rem;
  color: var(--ink-700);
  max-width: 52ch;
  line-height: 1.68;
}

/* Editorial Surfaces */
.surface-card {
  background: var(--bg-card);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid var(--border-hairline);
  border-radius: var(--radius-lg);
  padding: 2.25rem;
  box-shadow: var(--shadow-card);
  transition: border-color 0.25s ease, box-shadow 0.25s ease;
}

.surface-card-compact {
  background: var(--bg-card);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--border-hairline);
  border-radius: var(--radius-md);
  padding: 1.35rem 1.45rem;
  box-shadow: var(--shadow-sm);
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

.surface-card-compact:hover {
  border-color: var(--border-subtle);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4), 0 0 20px rgba(212, 168, 83, 0.1);
  transform: translateY(-2px);
}

/* Awwwards Hero Panoramic Vignette */
.hero-vignette {
  position: relative;
  width: 100%;
  height: 240px;
  border-radius: var(--radius-md);
  overflow: hidden;
  margin-bottom: 2rem;
  border: 1px solid rgba(212, 168, 83, 0.28);
  box-shadow: 0 16px 40px -10px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.12);
}

.hero-vignette img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0.9) contrast(1.1);
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.hero-vignette:hover img {
  transform: scale(1.03);
}

.hero-vignette-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(6, 17, 11, 0.05) 0%, rgba(6, 17, 11, 0.88) 100%);
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
}

.hero-vignette-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--gold-300);
  background: rgba(6, 17, 11, 0.75);
  backdrop-filter: blur(8px);
  padding: 0.32rem 0.75rem;
  border-radius: 999px;
  border: 1px solid rgba(212, 168, 83, 0.3);
}

/* Modern Minimalist Demo Ticket */
.demo-ticket-card {
  background: linear-gradient(135deg, rgba(14, 38, 25, 0.88) 0%, rgba(8, 20, 13, 0.92) 100%);
  backdrop-filter: blur(20px);
  border: 1px solid var(--border-subtle);
  color: #FFFDF9;
  border-radius: var(--radius-md);
  padding: 1.35rem 1.65rem;
  box-shadow: var(--shadow-card);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.25rem;
  flex-wrap: wrap;
}

/* Deep Midnight Pine Dispatch Banner */
.pine-banner {
  view-transition-name: pine-dispatch-banner;
  background: linear-gradient(155deg, rgba(14, 34, 23, 0.85) 0%, rgba(6, 17, 11, 0.92) 100%);
  backdrop-filter: blur(24px);
  color: #FAF8F5;
  border-radius: var(--radius-lg);
  padding: 2.5rem 2.65rem;
  box-shadow: var(--shadow-lifted);
  border: 1px solid rgba(212, 168, 83, 0.28);
  position: relative;
}

.pine-banner h1, .pine-banner h2, .pine-banner h3 {
  color: #FAF8F5;
}

.banner-split {
  display: grid;
  grid-template-columns: 1.25fr 0.75fr;
  gap: 2.25rem;
  align-items: center;
}

@media (max-width: 880px) {
  .banner-split {
    grid-template-columns: 1fr;
  }
}

/* Grid Systems */
.split-grid {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 3.5rem;
  align-items: start;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1.35fr 0.85fr;
  gap: 2rem;
  align-items: start;
}

@media (max-width: 920px) {
  .split-grid,
  .dashboard-grid {
    grid-template-columns: 1fr;
    gap: 2.25rem;
  }
}

/* Forms & Inputs */
.form-group {
  margin-bottom: 1.2rem;
}

.form-row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

@media (max-width: 560px) {
  .form-row-2 {
    grid-template-columns: 1fr;
  }
}

.form-label {
  display: block;
  font-weight: 600;
  font-size: 0.76rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--gold-300);
  margin-bottom: 0.4rem;
}

.form-hint {
  display: block;
  font-size: 0.82rem;
  color: var(--ink-500);
  margin-top: 0.35rem;
}

.input-field,
.select-field,
.textarea-field {
  width: 100%;
  padding: 0.78rem 0.95rem;
  font-family: var(--font-sans);
  font-size: 0.95rem;
  color: var(--ink-900);
  background: rgba(6, 17, 11, 0.75);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xs);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.4);
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}

.input-field::placeholder,
.textarea-field::placeholder {
  color: var(--ink-400);
}

.input-field:focus,
.select-field:focus,
.textarea-field:focus {
  outline: none;
  border-color: var(--gold-400);
  box-shadow: 0 0 0 3px rgba(212, 168, 83, 0.22);
}

.textarea-field {
  min-height: 94px;
  resize: vertical;
}

/* Quick Budget Preset Chips */
.preset-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.45rem;
}

.preset-chip {
  font-family: var(--font-sans);
  font-size: 0.74rem;
  font-weight: 600;
  padding: 0.2rem 0.65rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-hairline);
  color: var(--ink-700);
  cursor: pointer;
  transition: all 0.18s ease;
}

.preset-chip:hover {
  background: rgba(212, 168, 83, 0.18);
  color: var(--gold-300);
  border-color: var(--gold-400);
}

/* ==========================================================================
   BUTTON & INPUT COMPONENT SYSTEM (STRICT HEIGHT ALIGNMENT)
   ========================================================================== */
.btn,
.input-field,
.select-field {
  box-sizing: border-box;
  font-family: var(--font-sans);
  border-radius: var(--radius-xs);
  transition: all 0.18s ease;
}

/* Base interactive button: Standard 44px height */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  height: 44px;
  padding: 0 1.4rem;
  font-weight: 600;
  font-size: 0.92rem;
  line-height: 1;
  border: 1px solid transparent;
  cursor: pointer;
  text-decoration: none;
  white-space: nowrap;
  user-select: none;
}

.btn:active {
  transform: translateY(1px);
}

/* Medium button: 38px height */
.btn-md {
  height: 38px;
  padding: 0 1.15rem;
  font-size: 0.86rem;
}

/* Small button (used in tables, toolbars, copy widgets): 32px height */
.btn-sm {
  height: 32px;
  padding: 0 0.85rem;
  font-size: 0.8rem;
  border-radius: 6px;
}

/* Extra small button: 26px height */
.btn-xs {
  height: 26px;
  padding: 0 0.55rem;
  font-size: 0.74rem;
  border-radius: 5px;
}

.btn-full {
  width: 100%;
}

/* 1. Primary Action: Radiant Champagne Gold (High contrast, magnetic CTA on dark canvas) */
.btn-primary,
.btn-gold {
  background: linear-gradient(135deg, #F0D597 0%, #D8AF58 60%, #B88936 100%);
  color: #06110B;
  font-weight: 700;
  border: 1px solid rgba(255, 255, 255, 0.45);
  box-shadow: 0 4px 18px rgba(212, 168, 83, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.5);
}

.btn-primary:hover,
.btn-gold:hover {
  background: linear-gradient(135deg, #FFF0C4 0%, #E6C16E 60%, #C99A44 100%);
  color: #040A07;
  transform: translateY(-1px);
  box-shadow: 0 6px 26px rgba(212, 168, 83, 0.55), 0 0 16px rgba(212, 168, 83, 0.3);
}

/* 2. Secondary Action: Deep Tonal Alpine Green */
.btn-secondary,
.btn-pine {
  background: linear-gradient(135deg, rgba(22, 58, 39, 0.88) 0%, rgba(12, 32, 22, 0.94) 100%);
  color: #FAF8F5;
  border: 1px solid rgba(212, 168, 83, 0.28);
  backdrop-filter: blur(14px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.btn-secondary:hover,
.btn-pine:hover {
  background: linear-gradient(135deg, rgba(30, 80, 54, 0.95) 0%, rgba(16, 46, 31, 0.98) 100%);
  border-color: var(--gold-400);
  color: #FFFFFF;
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(20, 85, 50, 0.4), 0 0 12px rgba(212, 168, 83, 0.2);
}

/* 5. Ghost Action */
.btn-ghost {
  background: transparent;
  color: var(--ink-700);
  border: 1px solid transparent;
}

.btn-ghost:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: var(--border-subtle);
  color: var(--gold-300);
}

/* 6. Destructive Actions (STRICTLY RESERVED FOR RED) */
.btn-danger {
  background: rgba(158, 36, 46, 0.25);
  color: #FFA5AC;
  border: 1px solid rgba(224, 84, 97, 0.45);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.btn-danger:hover {
  background: linear-gradient(135deg, #C83845 0%, #9E242E 100%);
  color: #FFFFFF;
  border-color: #E05461;
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(200, 56, 69, 0.45);
}

/* Sleek Compact Organizer Dispatch Bar */
.organizer-dispatch-bar {
  background: rgba(6, 17, 11, 0.78);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(212, 168, 83, 0.3);
  border-radius: var(--radius-sm);
  padding: 0.75rem 0.95rem;
  max-width: 440px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
}

.dispatch-bar-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.45rem;
  font-size: 0.72rem;
  font-family: var(--font-mono);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.dispatch-bar-label .title {
  color: var(--gold-400);
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.dispatch-bar-label .hint {
  color: var(--ink-500);
}

.dispatch-bar-controls {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.dispatch-url-input {
  flex: 1;
  height: 32px;
  box-sizing: border-box;
  padding: 0 0.75rem;
  background: rgba(0, 0, 0, 0.45);
  border: 1px solid rgba(212, 168, 83, 0.22);
  border-radius: 6px;
  font-family: var(--font-mono);
  font-size: 0.76rem;
  color: var(--gold-300);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  outline: none;
}

.dispatch-url-input:focus {
  border-color: var(--gold-400);
  box-shadow: 0 0 0 2px rgba(212, 168, 83, 0.2);
}

/* Badges */
.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.7rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.badge-success {
  background: rgba(20, 85, 50, 0.35);
  color: #A3E6B8;
  border: 1px solid rgba(34, 197, 94, 0.35);
}

.badge-pending {
  background: rgba(212, 168, 83, 0.18);
  color: var(--gold-300);
  border: 1px solid rgba(212, 168, 83, 0.35);
}

.badge-gold {
  background: rgba(212, 168, 83, 0.18);
  color: var(--gold-300);
  border: 1px solid rgba(212, 168, 83, 0.35);
}

/* Participant Ledger Rows */
.participant-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.participant-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.85rem 1.05rem;
  background: rgba(14, 29, 21, 0.65);
  border: 1px solid var(--border-hairline);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-sm);
  transition: border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
}

.participant-item:hover {
  border-color: var(--border-subtle);
  background: rgba(18, 38, 28, 0.8);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
}

.participant-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: linear-gradient(135deg, #143524 0%, #0B1E14 100%);
  border: 1px solid var(--border-subtle);
  color: var(--gold-300);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.02rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.share-actions {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
}

/* Alerts */
.alert {
  padding: 0.9rem 1.15rem;
  border-radius: var(--radius-xs);
  font-size: 0.88rem;
  font-weight: 500;
  margin-bottom: 1.25rem;
  border: 1px solid transparent;
}

.alert-error {
  background: rgba(158, 36, 46, 0.25);
  color: #FFA5AC;
  border-color: rgba(224, 84, 97, 0.4);
}

.alert-success {
  background: rgba(20, 85, 50, 0.35);
  color: #A3E6B8;
  border-color: rgba(34, 197, 94, 0.4);
}

/* ==========================================================================
   2. 3D LUXURY ENVELOPE & TACTILE WAX SEAL
   ========================================================================== */
.reveal-stage {
  view-transition-name: reveal-stage;
  margin: 1.85rem 0;
}

.gift-envelope {
  background: linear-gradient(160deg, rgba(32, 14, 18, 0.92) 0%, rgba(12, 6, 8, 0.96) 100%);
  color: #FFFDF9;
  border-radius: var(--radius-lg);
  padding: 3.5rem 2.25rem 3.25rem;
  text-align: center;
  box-shadow: var(--shadow-lifted);
  border: 1px solid rgba(212, 168, 83, 0.35);
  position: relative;
  overflow: hidden;
  transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1), filter 0.28s ease;
}

.gift-envelope.is-breaking {
  transform: scale(1.03) translateY(-4px);
  filter: brightness(1.2);
}

.gift-envelope.is-breaking .wax-seal-medallion {
  transform: scale(1.2) rotate(10deg);
  filter: drop-shadow(0 0 40px rgba(212, 168, 83, 0.95)) drop-shadow(0 20px 40px rgba(0, 0, 0, 0.9));
}

.wax-seal-medallion {
  width: 116px;
  height: 116px;
  margin: 0 auto 1.5rem;
  position: relative;
  border-radius: 50%;
  display: block;
  cursor: pointer;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.3s ease;
  filter: drop-shadow(0 14px 28px rgba(0, 0, 0, 0.85)) drop-shadow(0 0 16px rgba(212, 168, 83, 0.4));
}

.wax-seal-medallion img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  display: block;
  border: 2px solid rgba(255, 230, 160, 0.45);
}

.gift-envelope:hover .wax-seal-medallion {
  transform: scale(1.08) rotate(-3deg) translateY(-3px);
  filter: drop-shadow(0 18px 36px rgba(0, 0, 0, 0.95)) drop-shadow(0 0 28px rgba(212, 168, 83, 0.65));
}

/* Unwrapped Assignment Certificate */
.unwrapped-card {
  background: linear-gradient(165deg, rgba(16, 36, 26, 0.88) 0%, rgba(8, 20, 14, 0.94) 100%);
  backdrop-filter: blur(24px);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 3.25rem 2.5rem 2.75rem;
  text-align: center;
  box-shadow: var(--shadow-lifted);
  position: relative;
}

.recipient-name-display {
  font-family: var(--font-display);
  font-size: clamp(3rem, 6.8vw, 4.6rem);
  font-weight: 700;
  background: linear-gradient(135deg, #FFFFFF 0%, #F3DC9B 50%, #D4A853 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.02em;
  line-height: 1.05;
  margin: 0.4rem 0 1.25rem;
}

/* Ornate Understated Divider */
.ornate-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.85rem;
  margin: 1.15rem auto;
  max-width: 240px;
  color: var(--gold-400);
  font-size: 0.95rem;
}

.ornate-divider::before,
.ornate-divider::after {
  content: "";
  flex: 1;
  height: 1px;
  background: var(--border-subtle);
}

/* Metadata Bar */
.meta-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-top: 1.35rem;
  padding-top: 1.2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  font-size: 0.88rem;
  color: rgba(250, 248, 245, 0.88);
}

/* Copy Box */
.copy-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(6, 17, 11, 0.85);
  border: 1px solid var(--border-subtle);
  padding: 0.58rem 0.85rem;
  border-radius: var(--radius-xs);
  font-family: var(--font-mono);
  font-size: 0.78rem;
  color: var(--gold-300);
  overflow-x: auto;
}

/* Step Cards */
.feature-steps {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.15rem;
  margin-top: 2.25rem;
}

@media (max-width: 720px) {
  .feature-steps {
    grid-template-columns: 1fr;
  }
}

.step-number {
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 0.85rem;
  letter-spacing: 0.1em;
  color: var(--gold-400);
  margin-bottom: 0.45rem;
}

/* Telemetry Progress Bar */
.seal-progress-track {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 999px;
  overflow: hidden;
  margin: 0.6rem 0 0.95rem;
}

.seal-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--gold-500) 0%, var(--gold-300) 100%);
  border-radius: 999px;
  transition: width 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

@media (prefers-reduced-motion: reduce) {
  *, ::before, ::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
`;

export const FAVICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="8" fill="#06110B"/>
  <rect x="1" y="1" width="30" height="30" rx="7" fill="none" stroke="#D4A853" stroke-width="1.2" stroke-opacity="0.5"/>
  <g transform="translate(4, 4)" stroke="#E6C37A" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <path d="M12 2v20M17 5l-5 5-5-5M17 19l-5-5-5 5M2 12h20M5 7l5 5-5 5M19 7l-5 5 5 5" />
  </g>
</svg>`;
