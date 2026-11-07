export const APP_CSS = `
:root {
  /* Midnight Alpine Palette */
  --bg-canvas: #06110B;
  --bg-card: rgba(13, 28, 20, 0.82);
  --bg-card-solid: #0D1C14;
  --bg-elevated: #12261B;
  --bg-muted: rgba(255, 255, 255, 0.045);
  --bg-subtle: rgba(255, 255, 255, 0.08);

  --forest-950: #040A07;
  --forest-900: #08140D;
  --forest-800: #0E2217;
  --forest-700: #153524;
  --forest-600: #1E4F35;

  --crimson-700: #74161C;
  --crimson-600: #9E242E;
  --crimson-500: #C83845;
  --crimson-400: #E35B67;
  --danger-ink: #FFB4BC;

  --gold-500: #B88E39;
  --gold-400: #D6AB56;
  --gold-300: #E8C77E;
  --gold-200: #F4DF9E;
  --gold-100: #FBF3DC;

  --ink-900: #FAF8F5;
  --ink-700: #C9D5CD;
  --ink-500: #95A69B;
  --ink-400: #6F8276;
  --text-secondary: var(--ink-700);

  --border-hairline: rgba(214, 171, 86, 0.15);
  --border-subtle: rgba(214, 171, 86, 0.26);
  --border-strong: rgba(214, 171, 86, 0.48);

  --shadow-sm: 0 2px 6px rgba(0, 0, 0, 0.35);
  --shadow-card:
    0 4px 12px rgba(0, 0, 0, 0.4),
    0 24px 48px -12px rgba(0, 0, 0, 0.7),
    inset 0 1px 0 rgba(255, 255, 255, 0.07);
  --shadow-lifted:
    0 10px 28px rgba(0, 0, 0, 0.52),
    0 32px 68px -16px rgba(0, 0, 0, 0.85),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  --shadow-popover:
    0 14px 34px rgba(0, 0, 0, 0.75),
    0 0 0 1px rgba(214, 171, 86, 0.28);

  --radius-xs: 6px;
  --radius-sm: 10px;
  --radius-md: 16px;
  --radius-lg: 22px;

  --font-display: 'Cinzel', 'Iowan Old Style', 'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif;
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  --font-mono: 'SFMono-Regular', ui-monospace, Menlo, Monaco, Consolas, monospace;
}

/* ==========================================================================
   1. CSS VIEW TRANSITIONS
   ========================================================================== */
@view-transition {
  navigation: auto;
}

::view-transition-old(root) {
  animation: vtFadeOut 0.2s cubic-bezier(0.4, 0, 1, 1) both;
}
::view-transition-new(root) {
  animation: vtFadeIn 0.28s cubic-bezier(0.16, 1, 0.3, 1) both;
}

::view-transition-old(reveal-stage) {
  animation: vtEnvelopeBreak 0.38s cubic-bezier(0.4, 0, 0.2, 1) both;
}
::view-transition-new(reveal-stage) {
  animation: vtLetterRise 0.46s cubic-bezier(0.16, 1, 0.3, 1) both;
}

::view-transition-group(pine-dispatch-banner),
::view-transition-group(organizer-workspace),
::view-transition-group(wishlist-editor) {
  animation-duration: 0.3s;
  animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes vtFadeOut {
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(-5px); }
}
@keyframes vtFadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes vtEnvelopeBreak {
  0% { opacity: 1; transform: scale(1); filter: brightness(1); }
  100% { opacity: 0; transform: scale(1.06) translateY(-16px); filter: brightness(1.25); }
}
@keyframes vtLetterRise {
  0% { opacity: 0; transform: scale(0.94) translateY(24px); }
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
    radial-gradient(1100px 560px at 50% -90px, rgba(20, 82, 48, 0.42), transparent 74%),
    radial-gradient(820px 460px at 90% 260px, rgba(214, 171, 86, 0.11), transparent 70%),
    radial-gradient(680px 440px at 8% 520px, rgba(16, 72, 46, 0.28), transparent 65%);
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
  transition: color 0.16s ease, border-color 0.16s ease, background-color 0.16s ease;
}

a:hover {
  color: var(--gold-200);
}

/* ==========================================================================
   2. HEADER & FOOTER
   ========================================================================== */
.site-header {
  border-bottom: 1px solid var(--border-hairline);
  background: rgba(6, 17, 11, 0.86);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  position: sticky;
  top: 0;
  z-index: 50;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.38);
}

.header-inner {
  max-width: 1140px;
  margin: 0 auto;
  padding: 0.9rem 1.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.brand-link {
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  color: var(--ink-900);
}

.brand-link:hover {
  color: var(--ink-900);
}

.brand-crest {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: linear-gradient(135deg, #0F261A 0%, #07120C 100%);
  color: var(--gold-300);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(214, 171, 86, 0.3);
  border: 1px solid rgba(214, 171, 86, 0.28);
}

.brand-title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.22rem;
  letter-spacing: 0.01em;
  line-height: 1.05;
  display: block;
  color: var(--ink-900);
}

.brand-sub {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--gold-400);
  font-weight: 600;
  display: block;
  margin-top: 0.2rem;
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
  padding: 0.45rem 0.95rem;
  border-radius: var(--radius-xs);
  border: 1px solid var(--border-subtle);
  background: rgba(255, 255, 255, 0.045);
  box-shadow: var(--shadow-sm);
  transition: all 0.18s ease;
  white-space: nowrap;
}

.nav-link:hover {
  background: rgba(214, 171, 86, 0.14);
  border-color: var(--gold-400);
  color: var(--gold-200);
}

.site-footer {
  text-align: center;
  padding: 2.75rem 1.5rem 3.75rem;
  color: var(--ink-500);
  font-size: 0.82rem;
  border-top: 1px solid var(--border-hairline);
}

.footer-quote {
  font-family: var(--font-display);
  font-size: 0.94rem;
  color: var(--ink-700);
  margin-bottom: 0.35rem;
  letter-spacing: 0.01em;
}

/* ==========================================================================
   3. CONTAINERS & TYPOGRAPHY
   ========================================================================== */
.main-container {
  max-width: 1140px;
  margin: 0 auto;
  padding: 2.75rem 1.75rem 5.5rem;
}

.narrow-container {
  max-width: 760px;
  margin: 0 auto;
}

@media (max-width: 640px) {
  .header-inner {
    padding: 0.8rem 1.1rem;
  }
  .main-container {
    padding: 1.75rem 1.1rem 4rem;
  }
}

h1, h2 {
  font-family: var(--font-display);
  color: var(--ink-900);
  line-height: 1.16;
  letter-spacing: -0.01em;
}

h3, h4 {
  font-family: var(--font-sans);
  color: var(--ink-900);
  font-weight: 600;
  line-height: 1.28;
  letter-spacing: -0.015em;
}

.eyebrow,
.section-kicker {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--gold-300);
}

.eyebrow {
  margin-bottom: 0.95rem;
}

.section-kicker {
  margin-bottom: 0.3rem;
}

.hero-title {
  font-size: clamp(2.35rem, 4.6vw, 3.55rem);
  font-weight: 700;
  margin-bottom: 1.05rem;
  color: var(--ink-900);
  line-height: 1.1;
}

.hero-title em {
  font-style: italic;
  font-weight: 600;
  color: var(--gold-200);
}

.hero-subtitle {
  font-size: 1.05rem;
  color: var(--ink-700);
  max-width: 54ch;
  line-height: 1.65;
  margin-bottom: 1.85rem;
}

.text-muted {
  color: var(--ink-700);
}

.text-subtle {
  color: var(--ink-500);
}

/* ==========================================================================
   4. EDITORIAL SURFACES & CARDS
   ========================================================================== */
.surface-card {
  background: var(--bg-card);
  backdrop-filter: blur(22px);
  -webkit-backdrop-filter: blur(22px);
  border: 1px solid var(--border-hairline);
  border-radius: var(--radius-lg);
  padding: 2rem;
  box-shadow: var(--shadow-card);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

@media (max-width: 640px) {
  .surface-card {
    padding: 1.4rem 1.25rem;
    border-radius: var(--radius-md);
  }
}

.surface-card-compact {
  background: var(--bg-card);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border: 1px solid var(--border-hairline);
  border-radius: var(--radius-md);
  padding: 1.25rem 1.35rem;
  box-shadow: var(--shadow-sm);
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

.surface-card-compact.is-interactive:hover {
  border-color: var(--border-subtle);
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.38);
  transform: translateY(-2px);
}

.status-card-centered {
  text-align: center;
  padding: 2.75rem 2rem;
}

.status-card-centered h1,
.status-card-centered h2 {
  margin-bottom: 0.55rem;
}

.status-card-centered p {
  color: var(--ink-700);
  max-width: 46ch;
  margin: 0 auto 1.5rem;
}

/* Hero Panoramic Vignette */
.hero-vignette {
  position: relative;
  width: 100%;
  height: 220px;
  border-radius: var(--radius-md);
  overflow: hidden;
  margin-bottom: 1.75rem;
  border: 1px solid var(--border-subtle);
  box-shadow: 0 16px 38px -12px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.hero-vignette img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0.9) contrast(1.06);
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.hero-vignette:hover img {
  transform: scale(1.025);
}

.hero-vignette-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(6, 17, 11, 0.05) 0%, rgba(6, 17, 11, 0.88) 100%);
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
  padding: 1.1rem 1.35rem;
}

.hero-vignette-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--gold-200);
  background: rgba(6, 17, 11, 0.76);
  backdrop-filter: blur(8px);
  padding: 0.3rem 0.7rem;
  border-radius: 999px;
  border: 1px solid var(--border-subtle);
}

.hero-vignette-caption {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--ink-700);
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.85);
}

/* Demo Ticket Card */
.demo-ticket-card {
  background: linear-gradient(135deg, rgba(16, 42, 28, 0.88) 0%, rgba(8, 20, 13, 0.94) 100%);
  border: 1px solid var(--border-subtle);
  color: var(--ink-900);
  border-radius: var(--radius-md);
  padding: 1.2rem 1.4rem;
  margin-bottom: 2rem;
  box-shadow: var(--shadow-card);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.15rem;
  flex-wrap: wrap;
}

.demo-ticket-lead {
  display: flex;
  align-items: center;
  gap: 0.95rem;
  min-width: 0;
  flex: 1 1 240px;
}

.demo-ticket-icon {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: rgba(214, 171, 86, 0.14);
  border: 1px solid rgba(214, 171, 86, 0.34);
  color: var(--gold-300);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.demo-ticket-title {
  font-weight: 600;
  font-size: 0.98rem;
  color: var(--ink-900);
  line-height: 1.3;
}

.demo-ticket-sub {
  font-size: 0.82rem;
  color: var(--ink-700);
  margin-top: 0.15rem;
}

/* Deep Midnight Pine Dispatch Banner */
.pine-banner {
  view-transition-name: pine-dispatch-banner;
  background: linear-gradient(155deg, rgba(14, 34, 23, 0.88) 0%, rgba(6, 17, 11, 0.95) 100%);
  backdrop-filter: blur(22px);
  color: var(--ink-900);
  border-radius: var(--radius-lg);
  padding: 2.15rem 2.35rem;
  margin-bottom: 2rem;
  box-shadow: var(--shadow-lifted);
  border: 1px solid var(--border-subtle);
  position: relative;
}

@media (max-width: 640px) {
  .pine-banner {
    padding: 1.5rem 1.3rem;
    border-radius: var(--radius-md);
  }
}

.pine-banner--centered {
  text-align: center;
}

.banner-title {
  font-size: clamp(1.85rem, 3.6vw, 2.65rem);
  margin-bottom: 0.45rem;
}

.banner-notes {
  color: var(--ink-700);
  max-width: 58ch;
  font-size: 0.96rem;
  font-style: italic;
  line-height: 1.55;
}

.pine-banner--centered .banner-notes {
  margin: 0.75rem auto 0;
  color: var(--gold-200);
}

.banner-split {
  display: grid;
  grid-template-columns: 1.25fr 0.75fr;
  gap: 2rem;
  align-items: start;
}

@media (max-width: 880px) {
  .banner-split {
    grid-template-columns: 1fr;
    gap: 1.35rem;
  }
}

/* Collapsible Event Settings Drawer inside Banner */
.banner-edit-drawer {
  margin-top: 1.15rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.banner-edit-drawer > summary {
  list-style: none;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--gold-300);
  cursor: pointer;
  user-select: none;
  padding: 0.25rem 0.65rem;
  border-radius: var(--radius-xs);
  border: 1px solid var(--border-hairline);
  background: rgba(255, 255, 255, 0.04);
  transition: all 0.16s ease;
}

.banner-edit-drawer > summary::-webkit-details-marker {
  display: none;
}

.banner-edit-drawer > summary:hover {
  background: rgba(214, 171, 86, 0.14);
  border-color: var(--border-subtle);
  color: var(--gold-200);
}

.banner-edit-form {
  margin-top: 1rem;
  padding: 1.25rem;
  background: rgba(6, 17, 11, 0.78);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  text-align: left;
}

/* Grid Systems */
.split-grid {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 3rem;
  align-items: start;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1.32fr 0.88fr;
  gap: 1.85rem;
  align-items: start;
}

.stack-col {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

@media (max-width: 940px) {
  .split-grid,
  .dashboard-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
}

/* ==========================================================================
   5. FORMS, INPUTS & BUTTONS
   ========================================================================== */
.form-group {
  margin-bottom: 1.15rem;
}

.form-row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.95rem;
}

@media (max-width: 560px) {
  .form-row-2 {
    grid-template-columns: 1fr;
  }
}

.form-label {
  display: block;
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  color: var(--gold-300);
  margin-bottom: 0.4rem;
}

.form-hint {
  display: block;
  font-size: 0.82rem;
  color: var(--ink-500);
  margin-top: 0.4rem;
}

.input-field,
.select-field,
.textarea-field {
  width: 100%;
  padding: 0.72rem 0.9rem;
  font-family: var(--font-sans);
  font-size: 0.94rem;
  color: var(--ink-900);
  background: rgba(5, 14, 9, 0.82);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xs);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.35);
  transition: border-color 0.16s ease, box-shadow 0.16s ease;
}

.input-field--sm,
.select-field--sm {
  height: 36px;
  padding: 0 0.75rem;
  font-size: 0.88rem;
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
  box-shadow: 0 0 0 3px rgba(214, 171, 86, 0.22);
}

.textarea-field {
  min-height: 92px;
  resize: vertical;
  line-height: 1.55;
}

.checkbox-row {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  margin-top: 0.55rem;
  font-size: 0.84rem;
  color: var(--ink-700);
  cursor: pointer;
  user-select: none;
}

.checkbox-input {
  accent-color: var(--gold-400);
  width: 16px;
  height: 16px;
  cursor: pointer;
  flex-shrink: 0;
}

.inline-add-form {
  display: flex;
  gap: 0.6rem;
  margin-bottom: 1.4rem;
}

@media (max-width: 520px) {
  .inline-add-form {
    flex-direction: column;
  }
}

.subform-panel {
  background: rgba(6, 17, 11, 0.65);
  border: 1px solid var(--border-hairline);
  padding: 1.05rem;
  border-radius: var(--radius-sm);
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
  padding: 0.22rem 0.65rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-hairline);
  color: var(--ink-700);
  cursor: pointer;
  transition: all 0.16s ease;
}

.preset-chip:hover {
  background: rgba(214, 171, 86, 0.18);
  color: var(--gold-200);
  border-color: var(--gold-400);
}

/* Buttons */
.btn {
  box-sizing: border-box;
  font-family: var(--font-sans);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  height: 44px;
  padding: 0 1.35rem;
  font-weight: 600;
  font-size: 0.92rem;
  line-height: 1;
  border-radius: var(--radius-xs);
  border: 1px solid transparent;
  cursor: pointer;
  text-decoration: none;
  white-space: nowrap;
  user-select: none;
  transition: all 0.16s ease;
}

.btn:active:not(:disabled) {
  transform: translateY(1px);
}

.btn:disabled {
  opacity: 0.52;
  cursor: not-allowed;
}

.btn-lg {
  height: 48px;
  padding: 0 1.9rem;
  font-size: 1rem;
}

.btn-md {
  height: 38px;
  padding: 0 1.1rem;
  font-size: 0.86rem;
}

.btn-sm {
  height: 32px;
  padding: 0 0.8rem;
  font-size: 0.8rem;
  border-radius: 6px;
}

.btn-xs {
  height: 26px;
  padding: 0 0.55rem;
  font-size: 0.74rem;
  border-radius: 5px;
}

.btn-full {
  width: 100%;
}

/* Primary: Champagne Gold */
.btn-primary,
.btn-gold {
  background: linear-gradient(135deg, #F2D89C 0%, #D6AB56 65%, #BA8C38 100%);
  color: #06110B;
  font-weight: 700;
  border: 1px solid rgba(255, 255, 255, 0.42);
  box-shadow: 0 4px 16px rgba(214, 171, 86, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.48);
}

.btn-primary:hover:not(:disabled),
.btn-gold:hover:not(:disabled) {
  background: linear-gradient(135deg, #FBF0CE 0%, #E5BE6C 65%, #C99B44 100%);
  color: #040A07;
  transform: translateY(-1px);
  box-shadow: 0 6px 22px rgba(214, 171, 86, 0.45);
}

/* Secondary: Deep Alpine Pine */
.btn-secondary,
.btn-pine {
  background: linear-gradient(135deg, rgba(24, 62, 42, 0.9) 0%, rgba(12, 33, 22, 0.96) 100%);
  color: var(--ink-900);
  border: 1px solid var(--border-subtle);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.32), inset 0 1px 0 rgba(255, 255, 255, 0.07);
}

.btn-secondary:hover:not(:disabled),
.btn-pine:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(32, 82, 56, 0.96) 0%, rgba(17, 47, 32, 0.98) 100%);
  border-color: var(--gold-400);
  color: #FFFFFF;
}

/* Ghost */
.btn-ghost {
  background: transparent;
  color: var(--ink-700);
  border: 1px solid transparent;
}

.btn-ghost:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.06);
  border-color: var(--border-subtle);
  color: var(--gold-200);
}

/* Danger (strictly destructive actions) */
.btn-danger {
  background: rgba(158, 36, 46, 0.24);
  color: var(--danger-ink);
  border: 1px solid rgba(227, 91, 103, 0.45);
}

.btn-danger:hover:not(:disabled) {
  background: linear-gradient(135deg, #C83845 0%, #9E242E 100%);
  color: #FFFFFF;
  border-color: var(--crimson-400);
}

/* ==========================================================================
   6. ORGANIZER DISPATCH BAR, ROSTER & POPOVER MENUS
   ========================================================================== */
.organizer-dispatch-bar {
  background: rgba(6, 17, 11, 0.82);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  padding: 0.8rem 0.95rem;
  width: 100%;
  max-width: 440px;
  justify-self: end;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.42);
}

@media (max-width: 880px) {
  .organizer-dispatch-bar {
    max-width: 100%;
    justify-self: stretch;
  }
}

.dispatch-bar-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.45rem;
  font-size: 0.7rem;
  font-family: var(--font-mono);
  letter-spacing: 0.07em;
  text-transform: uppercase;
}

.dispatch-bar-label .title {
  color: var(--gold-300);
  font-weight: 700;
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
  min-width: 0;
  height: 32px;
  padding: 0 0.7rem;
  background: rgba(0, 0, 0, 0.45);
  border: 1px solid rgba(214, 171, 86, 0.22);
  border-radius: 6px;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--gold-200);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  outline: none;
}

.dispatch-url-input:focus {
  border-color: var(--gold-400);
  box-shadow: 0 0 0 2px rgba(214, 171, 86, 0.2);
}

/* Badges */
.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.32rem;
  padding: 0.22rem 0.65rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  white-space: nowrap;
}

.badge-success {
  background: rgba(22, 92, 54, 0.42);
  color: #AEF0C3;
  border: 1px solid rgba(52, 211, 123, 0.36);
}

.badge-pending,
.badge-gold {
  background: rgba(214, 171, 86, 0.16);
  color: var(--gold-200);
  border: 1px solid rgba(214, 171, 86, 0.34);
}

/* Card Header Row */
.card-header-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.3rem;
  flex-wrap: wrap;
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
  gap: 0.9rem;
  padding: 0.85rem 1rem;
  background: rgba(12, 26, 18, 0.72);
  border: 1px solid var(--border-hairline);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-sm);
  transition: border-color 0.16s ease, background-color 0.16s ease;
  position: relative;
}

.participant-item:hover {
  border-color: var(--border-subtle);
  background: rgba(16, 35, 25, 0.86);
}

.participant-item.is-unwrapped {
  border-color: rgba(52, 211, 123, 0.26);
}

.participant-item.is-sealed {
  border-color: rgba(214, 171, 86, 0.22);
}

.participant-item:has(details[open]) {
  z-index: 25;
  border-color: var(--gold-400);
}

@media (max-width: 640px) {
  .participant-item {
    flex-direction: column;
    align-items: stretch;
  }
  .share-actions {
    justify-content: flex-start;
    padding-top: 0.2rem;
  }
}

.participant-identity {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  min-width: 0;
  flex: 1;
}

.participant-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #163826 0%, #0B1E14 100%);
  border: 1px solid var(--border-subtle);
  color: var(--gold-200);
  font-family: var(--font-sans);
  font-weight: 700;
  font-size: 0.92rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.participant-avatar.avatar-pine {
  background: linear-gradient(135deg, #1E5438 0%, #0F2D1E 100%);
  border-color: rgba(52, 211, 123, 0.45);
  color: #C2F7D3;
}

.participant-avatar.avatar-crimson {
  background: linear-gradient(135deg, #3A2914 0%, #1C140A 100%);
  border-color: rgba(214, 171, 86, 0.42);
  color: var(--gold-200);
}

.participant-meta {
  min-width: 0;
  flex: 1;
}

.participant-title-row {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  flex-wrap: wrap;
}

.participant-name {
  font-weight: 600;
  font-size: 0.98rem;
  color: var(--ink-900);
}

.participant-url-preview {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  color: var(--ink-500);
  margin-top: 0.16rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 320px;
}

.share-actions {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
  flex-shrink: 0;
}

/* Compact Popover Menu (<details class="action-menu">) */
.action-menu {
  position: relative;
  display: inline-block;
}

.action-menu > summary {
  list-style: none;
}

.action-menu > summary::-webkit-details-marker {
  display: none;
}

.action-menu-popover {
  position: absolute;
  right: 0;
  top: calc(100% + 6px);
  min-width: 215px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  padding: 0.4rem;
  box-shadow: var(--shadow-popover);
  z-index: 40;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

@media (max-width: 640px) {
  .action-menu-popover {
    right: auto;
    left: 0;
  }
}

.action-menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  width: 100%;
  padding: 0.5rem 0.65rem;
  border-radius: 6px;
  font-family: var(--font-sans);
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--ink-900);
  background: transparent;
  border: none;
  text-align: left;
  cursor: pointer;
  text-decoration: none;
  transition: background-color 0.14s ease, color 0.14s ease;
}

.action-menu-item:hover {
  background: rgba(214, 171, 86, 0.15);
  color: var(--gold-200);
}

.action-menu-item--danger {
  color: var(--danger-ink);
}

.action-menu-item--danger:hover {
  background: rgba(200, 56, 69, 0.22);
  color: #FFFFFF;
}

.action-menu-divider {
  height: 1px;
  background: var(--border-hairline);
  margin: 0.25rem 0.35rem;
}

.rename-inline-box {
  padding: 0.45rem 0.5rem;
}

.rename-inline-row {
  display: flex;
  gap: 0.35rem;
  margin-top: 0.3rem;
}

.empty-state-box {
  text-align: center;
  padding: 2.5rem 1.25rem;
  background: var(--bg-muted);
  border: 1px dashed var(--border-subtle);
  border-radius: var(--radius-md);
  color: var(--ink-700);
  font-size: 0.92rem;
}

/* Emergency Spoilers Master List */
.spoiler-details > summary {
  cursor: pointer;
  font-weight: 600;
  font-size: 0.85rem;
  color: var(--ink-700);
  user-select: none;
}

.spoiler-details > summary:hover {
  color: var(--gold-200);
}

.spoiler-body {
  margin-top: 0.85rem;
  padding-top: 0.85rem;
  border-top: 1px dashed var(--border-subtle);
  font-size: 0.88rem;
}

.spoiler-warning {
  color: var(--danger-ink);
  margin-bottom: 0.7rem;
  font-size: 0.8rem;
}

.spoiler-match-name {
  color: var(--gold-200);
  font-weight: 700;
  font-size: 0.96rem;
}

/* Alerts */
.alert {
  padding: 0.85rem 1.1rem;
  border-radius: var(--radius-xs);
  font-size: 0.88rem;
  font-weight: 500;
  margin-bottom: 1.25rem;
  border: 1px solid transparent;
}

.alert-error {
  background: rgba(158, 36, 46, 0.28);
  color: var(--danger-ink);
  border-color: rgba(227, 91, 103, 0.45);
}

.alert-success {
  background: rgba(20, 88, 52, 0.38);
  color: #B4F2C8;
  border-color: rgba(52, 211, 123, 0.4);
}

/* ==========================================================================
   7. STATIONERY ENVELOPE, POSTMARK & UNWRAPPED CERTIFICATE
   ========================================================================== */
.reveal-stage {
  view-transition-name: reveal-stage;
  margin: 1.75rem 0;
}

.gift-envelope {
  background:
    radial-gradient(520px 240px at 50% 24%, rgba(214, 171, 86, 0.11), transparent 72%),
    linear-gradient(162deg, #271116 0%, #15080B 58%, #0D0507 100%);
  color: #FFFDF9;
  border-radius: var(--radius-lg);
  padding: 3.6rem 2.25rem 3.15rem;
  text-align: center;
  box-shadow: var(--shadow-lifted);
  border: 1px solid rgba(214, 171, 86, 0.38);
  position: relative;
  overflow: hidden;
  transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1), filter 0.28s ease;
}

/* Engraved inner stationery frame */
.gift-envelope::before {
  content: "";
  position: absolute;
  inset: 10px;
  border: 1px solid rgba(214, 171, 86, 0.18);
  border-radius: calc(var(--radius-lg) - 6px);
  pointer-events: none;
}

/* Subtle diagonal envelope V-flap geometry */
.envelope-flap-svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 175px;
  pointer-events: none;
  opacity: 0.55;
  transition: transform 0.36s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.28s ease;
  transform-origin: top center;
}

.envelope-postmark {
  position: absolute;
  top: 22px;
  right: 24px;
  font-family: var(--font-mono);
  font-size: 0.62rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(232, 199, 126, 0.62);
  border: 1px dashed rgba(232, 199, 126, 0.34);
  padding: 0.28rem 0.55rem;
  border-radius: 4px;
  transform: rotate(3deg);
  pointer-events: none;
}

@media (max-width: 600px) {
  .envelope-postmark {
    display: none;
  }
}

.gift-envelope.is-breaking {
  transform: scale(1.025) translateY(-4px);
  filter: brightness(1.18);
}

.gift-envelope.is-breaking .envelope-flap-svg {
  transform: scaleY(0.78);
  opacity: 0.85;
}

.gift-envelope.is-breaking .wax-seal-medallion {
  transform: scale(1.18) rotate(8deg);
  filter: drop-shadow(0 0 36px rgba(214, 171, 86, 0.9)) drop-shadow(0 18px 36px rgba(0, 0, 0, 0.9));
}

.wax-seal-medallion {
  width: 116px;
  height: 116px;
  margin: 0 auto 1.45rem;
  position: relative;
  z-index: 2;
  border-radius: 50%;
  display: block;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  transition: transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.28s ease;
  filter: drop-shadow(0 14px 26px rgba(0, 0, 0, 0.85)) drop-shadow(0 0 18px rgba(214, 171, 86, 0.42));
}

.wax-seal-medallion:focus-visible {
  outline: 2px solid var(--gold-300);
  outline-offset: 6px;
}

.wax-seal-medallion img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  display: block;
  border: 2px solid rgba(255, 230, 160, 0.48);
}

.gift-envelope:hover .wax-seal-medallion {
  transform: scale(1.07) rotate(-3deg) translateY(-3px);
  filter: drop-shadow(0 18px 34px rgba(0, 0, 0, 0.92)) drop-shadow(0 0 26px rgba(214, 171, 86, 0.65));
}

.wax-seal-waiting {
  width: 62px;
  height: 62px;
  border-radius: 50%;
  margin: 0 auto 1.15rem;
  background: rgba(214, 171, 86, 0.12);
  border: 1px solid var(--border-subtle);
  color: var(--gold-300);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Unwrapped Assignment Certificate */
.unwrapped-card {
  background: linear-gradient(165deg, rgba(16, 36, 26, 0.92) 0%, rgba(8, 20, 14, 0.96) 100%);
  backdrop-filter: blur(22px);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 2.75rem 2.35rem 2.4rem;
  text-align: center;
  box-shadow: var(--shadow-lifted);
  position: relative;
}

.unwrapped-card::before {
  content: "";
  position: absolute;
  inset: 9px;
  border: 1px solid rgba(214, 171, 86, 0.13);
  border-radius: calc(var(--radius-lg) - 6px);
  pointer-events: none;
}

@media (max-width: 640px) {
  .unwrapped-card {
    padding: 2rem 1.35rem 1.75rem;
  }
}

.unwrapped-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1.4rem;
  flex-wrap: wrap;
}

.recipient-intro {
  font-family: var(--font-display);
  font-style: italic;
  font-size: 1.18rem;
  color: var(--ink-700);
}

.recipient-name-display {
  font-family: var(--font-display);
  font-size: clamp(2.65rem, 6.2vw, 4.2rem);
  font-weight: 700;
  color: var(--gold-200);
  letter-spacing: -0.015em;
  line-height: 1.08;
  margin: 0.45rem 0 1.15rem;
  text-shadow: 0 4px 22px rgba(0, 0, 0, 0.55);
  transition: filter 0.22s ease;
}

.ornate-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.85rem;
  margin: 1.1rem auto;
  max-width: 220px;
  color: var(--gold-400);
  font-size: 0.9rem;
}

.ornate-divider::before,
.ornate-divider::after {
  content: "";
  flex: 1;
  height: 1px;
  background: var(--border-subtle);
}

.wishlist-box {
  text-align: left;
  background: rgba(6, 17, 11, 0.78);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 1.4rem 1.55rem;
}

.wishlist-quote {
  white-space: pre-wrap;
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--ink-900);
  background: rgba(14, 29, 21, 0.9);
  padding: 1rem 1.2rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-hairline);
  margin-bottom: 1.05rem;
}

.wishlist-link-btn {
  justify-content: space-between;
  width: 100%;
  text-align: left;
  height: auto;
  min-height: 38px;
  padding: 0.55rem 0.95rem;
}

.wishlist-item-title {
  font-weight: 600;
  font-size: 0.94rem;
  color: var(--gold-200);
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.wishlist-item-url {
  font-family: var(--font-mono);
  font-size: 0.73rem;
  color: var(--ink-500);
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 420px;
}

/* ==========================================================================
   8. SELF-JOIN GROUP LINK, BULK PASTE, PRIVACY MODE & ANONYMOUS Q&A
   ========================================================================== */
.self-join-panel {
  background: linear-gradient(145deg, rgba(18, 46, 31, 0.65) 0%, rgba(8, 22, 14, 0.85) 100%);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 1.15rem 1.25rem;
  margin-bottom: 1.35rem;
}

.self-join-url-row {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin-top: 0.75rem;
  flex-wrap: wrap;
}

.bulk-paste-drawer {
  margin-bottom: 1.35rem;
}

.bulk-paste-drawer > summary {
  list-style: none;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--gold-300);
  cursor: pointer;
  user-select: none;
}

.bulk-paste-drawer > summary::-webkit-details-marker {
  display: none;
}

.bulk-paste-drawer > summary:hover {
  color: var(--gold-200);
  text-decoration: underline;
}

.privacy-option-card {
  background: rgba(6, 17, 11, 0.6);
  border: 1px solid var(--border-hairline);
  border-radius: var(--radius-sm);
  padding: 0.85rem 1rem;
  margin-bottom: 1.15rem;
}

.badge-encrypted {
  background: rgba(20, 74, 52, 0.5);
  color: #C2F7D3;
  border: 1px solid rgba(82, 224, 146, 0.38);
}

.badge-qa {
  background: rgba(214, 171, 86, 0.22);
  color: var(--gold-100);
  border: 1px solid var(--gold-400);
}

/* Anonymous Santa <-> Recipient Q&A Thread */
.qa-panel {
  text-align: left;
  background: rgba(8, 20, 14, 0.82);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 1.35rem 1.5rem;
  margin-top: 1.25rem;
}

.qa-thread {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  margin-bottom: 1.1rem;
}

.qa-item {
  background: rgba(14, 31, 22, 0.78);
  border: 1px solid var(--border-hairline);
  border-radius: var(--radius-sm);
  padding: 0.9rem 1.05rem;
}

.qa-speaker {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--gold-300);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.3rem;
}

.qa-question-text {
  color: var(--ink-900);
  font-size: 0.93rem;
  line-height: 1.5;
}

.qa-answer-box {
  margin-top: 0.7rem;
  padding: 0.7rem 0.9rem;
  border-left: 2px solid var(--gold-400);
  background: rgba(6, 17, 11, 0.65);
  border-radius: 0 var(--radius-xs) var(--radius-xs) 0;
}

.qa-answer-speaker {
  font-family: var(--font-mono);
  font-size: 0.66rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #AEF0C3;
  margin-bottom: 0.2rem;
}

.qa-answer-text {
  color: var(--ink-900);
  font-size: 0.9rem;
  line-height: 1.5;
}

.qa-pending-note {
  margin-top: 0.55rem;
  font-size: 0.8rem;
  color: var(--ink-500);
  font-style: italic;
}

/* Self-Join Guest Roster Pills */
.joined-pill-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  list-style: none;
  margin-top: 0.65rem;
}

.joined-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.7rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-hairline);
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--ink-900);
}

.returning-guest-banner {
  background: linear-gradient(135deg, rgba(22, 62, 40, 0.92) 0%, rgba(11, 31, 20, 0.96) 100%);
  border: 1px solid rgba(82, 224, 146, 0.4);
  border-radius: var(--radius-md);
  padding: 1.25rem 1.4rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

/* Metadata Bar */
.meta-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 1.35rem;
  margin-top: 1.3rem;
  padding-top: 1.1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.86rem;
  color: var(--ink-700);
}

.meta-strip--centered {
  justify-content: center;
}

.meta-label {
  color: var(--gold-300);
  text-transform: uppercase;
  font-size: 0.72rem;
  letter-spacing: 0.06em;
  margin-right: 0.35rem;
}

/* Step Cards */
.feature-steps {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

@media (max-width: 720px) {
  .feature-steps {
    grid-template-columns: 1fr;
  }
}

.step-number {
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 0.78rem;
  letter-spacing: 0.1em;
  color: var(--gold-400);
  margin-bottom: 0.35rem;
}

/* Telemetry Progress Bar */
.seal-progress-track {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 999px;
  overflow: hidden;
  margin: 0.55rem 0 0.95rem;
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
