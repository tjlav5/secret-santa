export const APP_CSS = `
:root {
  /* Editorial Alpine Press & Bespoke Holiday Stationery Palette */
  --bg-canvas: hsl(38, 40%, 94%);
  --bg-paper: hsl(40, 55%, 98.5%);
  --bg-vellum: hsl(37, 34%, 91%);
  --bg-vellum-hover: hsl(36, 30%, 86.5%);

  --forest-950: hsl(158, 50%, 7%);
  --forest-900: hsl(158, 45%, 11%);
  --forest-800: hsl(156, 40%, 16%);
  --forest-700: hsl(154, 34%, 23%);

  --crimson-900: hsl(356, 72%, 15%);
  --crimson-800: hsl(356, 70%, 20%);
  --crimson-700: hsl(356, 66%, 27%);
  --crimson-600: hsl(356, 63%, 34%);
  --crimson-500: hsl(356, 60%, 42%);
  --crimson-100: hsl(356, 55%, 95%);

  --gold-700: hsl(35, 70%, 27%);
  --gold-600: hsl(38, 66%, 37%);
  --gold-500: hsl(40, 74%, 49%);
  --gold-400: hsl(42, 84%, 66%);
  --gold-300: hsl(43, 88%, 76%);
  --gold-200: hsl(42, 70%, 86%);
  --gold-100: hsl(43, 75%, 94%);

  --ink-900: hsl(158, 36%, 10%);
  --ink-700: hsl(156, 18%, 26%);
  --ink-500: hsl(154, 12%, 42%);
  --ink-400: hsl(150, 8%, 55%);

  --border-hairline: hsla(36, 30%, 60%, 0.42);
  --border-strong: hsla(36, 28%, 48%, 0.65);
  --border-brass: hsla(40, 65%, 48%, 0.48);

  --shadow-paper:
    0 1px 2px rgba(12, 28, 21, 0.05),
    0 12px 32px -8px rgba(12, 28, 21, 0.09),
    inset 0 1px 0 rgba(255, 255, 255, 0.92);
  --shadow-lifted:
    0 8px 20px rgba(12, 28, 21, 0.09),
    0 28px 60px -14px rgba(12, 28, 21, 0.22),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  --shadow-wax:
    0 14px 28px -4px rgba(20, 5, 6, 0.65),
    0 4px 10px rgba(0, 0, 0, 0.45),
    inset 0 2px 4px rgba(255, 238, 185, 0.72),
    inset 0 -3px 6px rgba(92, 50, 6, 0.8);

  --radius-xs: 6px;
  --radius-sm: 10px;
  --radius-md: 16px;
  --radius-lg: 24px;

  --font-display: 'Iowan Old Style', 'Palatino Linotype', 'Book Antiqua', Palatino, 'Apple Garamond', Baskerville, Georgia, serif;
  --font-sans: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  --font-mono: 'SFMono-Regular', ui-monospace, Menlo, Monaco, Consolas, monospace;
}

/* ==========================================================================
   1. CSS VIEW TRANSITIONS (Cross-Document & Same-Document Morphs)
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
  animation: vtEnvelopeBreak 0.42s cubic-bezier(0.4, 0, 0.2, 1) both;
}
::view-transition-new(reveal-stage) {
  animation: vtLetterRise 0.52s cubic-bezier(0.16, 1, 0.3, 1) both;
}

::view-transition-group(pine-dispatch-banner),
::view-transition-group(organizer-workspace),
::view-transition-group(wishlist-editor) {
  animation-duration: 0.32s;
  animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes vtFadeOut {
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(-4px); }
}
@keyframes vtFadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes vtEnvelopeBreak {
  0% { opacity: 1; transform: scale(1); filter: brightness(1); }
  40% { opacity: 0.9; transform: scale(1.03); filter: brightness(1.18); }
  100% { opacity: 0; transform: scale(1.08) translateY(-18px); filter: brightness(1.3); }
}
@keyframes vtLetterRise {
  0% { opacity: 0; transform: scale(0.92) translateY(26px); }
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
    radial-gradient(ellipse 85% 50% at 50% -10%, hsla(40, 78%, 62%, 0.2), transparent 65%),
    radial-gradient(ellipse 60% 50% at 95% 95%, hsla(158, 42%, 15%, 0.08), transparent 60%),
    radial-gradient(ellipse 50% 40% at 5% 85%, hsla(356, 62%, 35%, 0.07), transparent 55%);
  color: var(--ink-900);
  font-family: var(--font-sans);
  font-size: 16px;
  line-height: 1.6;
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
  position: relative;
}

/* Subtle tactile cotton-paper grain overlay */
body::before {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9999;
  opacity: 0.025;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

a {
  color: var(--forest-800);
  text-decoration: none;
  transition: all 0.18s ease;
}

/* Air-Mail Festive Top Trim */
.airmail-trim {
  height: 7px;
  width: 100%;
  background: repeating-linear-gradient(
    -45deg,
    var(--crimson-600) 0px,
    var(--crimson-600) 14px,
    var(--bg-paper) 14px,
    var(--bg-paper) 22px,
    var(--forest-800) 22px,
    var(--forest-800) 36px,
    var(--bg-paper) 36px,
    var(--bg-paper) 44px
  );
  border-bottom: 1px solid var(--border-hairline);
}

/* Header & Navigation */
.site-header {
  border-bottom: 1px solid var(--border-hairline);
  background: hsla(38, 40%, 95%, 0.9);
  backdrop-filter: blur(12px);
  position: sticky;
  top: 0;
  z-index: 50;
}

.header-inner {
  max-width: 1140px;
  margin: 0 auto;
  padding: 0.85rem 1.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.brand-link {
  display: inline-flex;
  align-items: center;
  gap: 0.85rem;
  color: var(--forest-900);
}

.brand-crest {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: linear-gradient(145deg, var(--forest-800), var(--forest-950));
  color: var(--gold-400);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 4px 12px rgba(12, 29, 22, 0.25),
    inset 0 0 0 1.5px rgba(212, 168, 83, 0.48);
  position: relative;
}

.brand-title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.35rem;
  letter-spacing: -0.02em;
  line-height: 1.05;
  display: block;
}

.brand-sub {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: var(--ink-500);
  font-weight: 700;
  display: block;
  margin-top: 0.12rem;
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
  color: var(--forest-900);
  padding: 0.42rem 0.88rem;
  border-radius: var(--radius-xs);
  border: 1px solid var(--border-hairline);
  background: var(--bg-paper);
  box-shadow: 0 1px 2px rgba(12, 28, 21, 0.04);
  transition: all 0.16s ease;
  text-decoration: none;
  white-space: nowrap;
}

.nav-link:hover {
  background: #FFFFFF;
  border-color: var(--border-strong);
  color: var(--crimson-600);
  box-shadow: 0 2px 6px rgba(12, 28, 21, 0.08);
}

/* Layout Containers */
.main-container {
  max-width: 1140px;
  margin: 0 auto;
  padding: 2.5rem 1.75rem 5.5rem;
  position: relative;
  z-index: 2;
}

.narrow-container {
  max-width: 780px;
  margin: 0 auto;
}

/* Typography */
h1, h2, h3, h4 {
  font-family: var(--font-display);
  color: var(--ink-900);
  line-height: 1.13;
  letter-spacing: -0.02em;
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.13em;
  color: var(--crimson-600);
  background: hsla(356, 62%, 35%, 0.08);
  border: 1px solid hsla(356, 62%, 35%, 0.24);
  padding: 0.36rem 0.95rem;
  border-radius: 999px;
  margin-bottom: 1.15rem;
}

.hero-title {
  font-size: clamp(2.55rem, 4.9vw, 3.85rem);
  font-weight: 700;
  margin-bottom: 1.05rem;
  color: var(--forest-950);
  line-height: 1.05;
}

.hero-title em {
  font-style: italic;
  font-weight: 600;
  color: var(--crimson-600);
  position: relative;
  display: inline-block;
}

.hero-title em::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: 2px;
  height: 6px;
  background: hsla(40, 80%, 55%, 0.28);
  z-index: -1;
  border-radius: 4px;
}

.hero-subtitle {
  font-size: 1.08rem;
  color: var(--ink-700);
  max-width: 54ch;
  line-height: 1.65;
}

/* Bespoke Stationery Cards & Surfaces */
.surface-card {
  background: var(--bg-paper);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-lg);
  padding: 2.1rem;
  box-shadow: var(--shadow-paper);
  position: relative;
}

.stationery-frame {
  background: var(--bg-paper);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-lg);
  padding: 2.35rem;
  box-shadow: var(--shadow-lifted);
  position: relative;
}

.stationery-frame::after {
  content: "";
  position: absolute;
  inset: 7px;
  border: 1px solid hsla(38, 52%, 52%, 0.3);
  border-radius: calc(var(--radius-lg) - 6px);
  pointer-events: none;
}

/* Perforated Polar Express / Demo Ticket with Tear-Off Stub */
.postage-ticket {
  background:
    radial-gradient(circle at 0 50%, var(--bg-canvas) 10px, transparent 10.5px),
    radial-gradient(circle at 100% 50%, var(--bg-canvas) 10px, transparent 10.5px),
    radial-gradient(circle at 80% 20%, hsla(40, 82%, 62%, 0.18), transparent 50%),
    linear-gradient(135deg, var(--forest-900) 0%, var(--forest-950) 100%);
  border: 1px solid hsla(40, 68%, 55%, 0.45);
  border-radius: var(--radius-md);
  padding: 1.35rem 1.75rem;
  color: var(--bg-paper);
  box-shadow: var(--shadow-lifted);
  position: relative;
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 1.35rem;
}

.postage-ticket::before {
  content: "";
  position: absolute;
  inset: 5px;
  border: 1px dashed hsla(40, 68%, 62%, 0.24);
  border-radius: calc(var(--radius-md) - 4px);
  pointer-events: none;
}

.ticket-stub-divider {
  border-left: 1.5px dashed hsla(40, 68%, 62%, 0.35);
  padding-left: 1.35rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
}

@media (max-width: 640px) {
  .postage-ticket {
    grid-template-columns: 1fr;
  }
  .ticket-stub-divider {
    border-left: none;
    border-top: 1.5px dashed hsla(40, 68%, 62%, 0.35);
    padding-left: 0;
    padding-top: 1rem;
  }
}

/* Engraved Scalloped Postage Stamp */
.postage-stamp-box {
  width: 68px;
  height: 78px;
  background:
    radial-gradient(circle at 30% 25%, #FFFDF9, #F3E9D2);
  border: 2px solid hsla(38, 55%, 45%, 0.55);
  outline: 3px dotted var(--bg-paper);
  outline-offset: -3px;
  border-radius: 4px;
  box-shadow: 0 4px 10px rgba(12, 28, 21, 0.12);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 0.35rem 0.3rem;
  transform: rotate(3deg);
  flex-shrink: 0;
  user-select: none;
}

.surface-card-compact {
  background: var(--bg-paper);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-md);
  padding: 1.35rem 1.35rem 1.3rem;
  box-shadow: var(--shadow-paper);
  position: relative;
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.surface-card-compact:hover {
  transform: translateY(-3px);
  border-color: var(--gold-500);
  box-shadow: var(--shadow-lifted);
}

/* Deep Forest Velvet Header Banner with Subtle Starlight & Snow */
.pine-banner {
  view-transition-name: pine-dispatch-banner;
  background:
    radial-gradient(circle at 88% 18%, hsla(40, 82%, 62%, 0.22), transparent 45%),
    radial-gradient(circle at 12% 88%, hsla(156, 48%, 26%, 0.48), transparent 50%),
    radial-gradient(circle at 20% 25%, rgba(255, 255, 255, 0.12) 1px, transparent 1.5px),
    radial-gradient(circle at 75% 65%, rgba(255, 255, 255, 0.1) 1.5px, transparent 2px),
    radial-gradient(circle at 45% 40%, rgba(212, 168, 83, 0.15) 1px, transparent 2px),
    linear-gradient(135deg, var(--forest-900) 0%, var(--forest-950) 100%);
  background-size: 100% 100%, 100% 100%, 120px 120px, 160px 160px, 90px 90px, 100% 100%;
  color: var(--bg-paper);
  border-radius: var(--radius-lg);
  padding: 2.35rem 2.5rem;
  box-shadow: var(--shadow-lifted);
  border: 1px solid hsla(40, 68%, 52%, 0.42);
  position: relative;
  overflow: hidden;
}

.pine-banner::before {
  content: "";
  position: absolute;
  inset: 8px;
  border: 1px solid hsla(40, 68%, 62%, 0.22);
  border-radius: calc(var(--radius-lg) - 7px);
  pointer-events: none;
}

.pine-banner h1, .pine-banner h2, .pine-banner h3 {
  color: var(--bg-paper);
}

.banner-split {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 2rem;
  align-items: center;
}

@media (max-width: 860px) {
  .banner-split {
    grid-template-columns: 1fr;
  }
}

/* Grid Systems */
.split-grid {
  display: grid;
  grid-template-columns: 1.12fr 0.88fr;
  gap: 2.85rem;
  align-items: start;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1.35fr 0.85fr;
  gap: 1.85rem;
  align-items: start;
}

@media (max-width: 920px) {
  .split-grid,
  .dashboard-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
}

/* Forms & Inputs */
.form-group {
  margin-bottom: 1.15rem;
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
  font-weight: 700;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--ink-700);
  margin-bottom: 0.38rem;
}

.form-hint {
  display: block;
  font-size: 0.8rem;
  color: var(--ink-500);
  margin-top: 0.3rem;
}

.input-field,
.select-field,
.textarea-field {
  width: 100%;
  padding: 0.76rem 0.95rem;
  font-family: var(--font-sans);
  font-size: 0.95rem;
  color: var(--ink-900);
  background: #FFFFFF;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-sm);
  box-shadow: inset 0 1px 2px rgba(15, 32, 24, 0.04);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.input-field::placeholder,
.textarea-field::placeholder {
  color: var(--ink-400);
}

.input-field:focus,
.select-field:focus,
.textarea-field:focus {
  outline: none;
  border-color: var(--forest-700);
  box-shadow: 0 0 0 3px hsla(156, 36%, 17%, 0.15);
}

.textarea-field {
  min-height: 92px;
  resize: vertical;
}

/* Quick Budget Preset Chips */
.preset-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-top: 0.45rem;
}

.preset-chip {
  font-family: var(--font-sans);
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.18rem 0.55rem;
  border-radius: 999px;
  background: var(--bg-vellum);
  border: 1px solid var(--border-strong);
  color: var(--ink-700);
  cursor: pointer;
  transition: all 0.14s ease;
}

.preset-chip:hover {
  background: var(--forest-800);
  color: #FFFFFF;
  border-color: var(--forest-800);
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.48rem;
  font-family: var(--font-sans);
  font-weight: 600;
  font-size: 0.92rem;
  padding: 0.78rem 1.35rem;
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
  cursor: pointer;
  transition: transform 0.14s ease, background 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
  text-decoration: none;
  white-space: nowrap;
}

.btn:active {
  transform: translateY(1px);
}

.btn-primary {
  background: linear-gradient(180deg, var(--crimson-500) 0%, var(--crimson-600) 100%);
  color: #FFFFFF;
  border-color: var(--crimson-700);
  box-shadow:
    0 4px 14px hsla(356, 62%, 32%, 0.34),
    inset 0 1px 0 rgba(255, 255, 255, 0.24);
}

.btn-primary:hover {
  background: linear-gradient(180deg, var(--crimson-600) 0%, var(--crimson-700) 100%);
  color: #FFFFFF;
  transform: translateY(-1px);
  box-shadow:
    0 6px 18px hsla(356, 62%, 28%, 0.42),
    inset 0 1px 0 rgba(255, 255, 255, 0.25);
}

.btn-pine {
  background: linear-gradient(180deg, var(--forest-800) 0%, var(--forest-900) 100%);
  color: var(--bg-paper);
  border-color: var(--forest-950);
  box-shadow:
    0 3px 10px rgba(15, 36, 28, 0.24),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.btn-pine:hover {
  background: var(--forest-950);
  color: var(--bg-paper);
  transform: translateY(-1px);
}

.btn-gold {
  background: linear-gradient(180deg, var(--gold-300) 0%, var(--gold-500) 100%);
  color: hsl(28, 72%, 10%);
  border-color: var(--gold-600);
  font-weight: 700;
  box-shadow:
    0 10px 24px rgba(0, 0, 0, 0.34),
    inset 0 1px 0 rgba(255, 255, 255, 0.78);
}

.btn-gold:hover {
  background: linear-gradient(180deg, hsl(43, 92%, 82%) 0%, hsl(39, 78%, 55%) 100%);
  color: hsl(28, 72%, 8%);
  transform: translateY(-1px);
}

.btn-secondary {
  background: var(--bg-vellum);
  color: var(--ink-900);
  border-color: var(--border-strong);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.65);
}

.btn-secondary:hover {
  background: var(--bg-vellum-hover);
  color: var(--ink-900);
}

.btn-ghost {
  background: transparent;
  color: var(--ink-700);
  padding: 0.45rem 0.75rem;
}

.btn-ghost:hover {
  background: var(--bg-vellum);
  color: var(--crimson-600);
}

.btn-sm {
  padding: 0.42rem 0.82rem;
  font-size: 0.8rem;
  border-radius: var(--radius-xs);
}

.btn-full {
  width: 100%;
}

/* Badges & Status Seals */
.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.24rem 0.72rem;
  border-radius: 999px;
  font-size: 0.71rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.badge-success {
  background: hsl(152, 42%, 92%);
  color: hsl(156, 54%, 22%);
  border: 1px solid hsla(156, 45%, 35%, 0.25);
}

.badge-pending {
  background: var(--gold-100);
  color: hsl(34, 58%, 28%);
  border: 1px solid hsla(38, 55%, 45%, 0.3);
}

.badge-gold {
  background: hsla(40, 72%, 55%, 0.16);
  color: var(--gold-400);
  border: 1px solid hsla(40, 72%, 60%, 0.38);
}

/* Participant Parcel Slip Rows */
.participant-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.participant-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.9rem 1.05rem;
  background: linear-gradient(180deg, #FFFFFF 0%, var(--bg-paper) 100%);
  border: 1px solid var(--border-hairline);
  border-left: 3.5px solid var(--forest-800);
  border-radius: var(--radius-sm);
  box-shadow: 0 2px 6px rgba(12, 28, 21, 0.03);
  transition: border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
}

.participant-item.is-sealed {
  border-left-color: var(--crimson-600);
}

.participant-item.is-unwrapped {
  border-left-color: hsl(154, 55%, 30%);
}

.participant-item:hover {
  border-color: var(--border-strong);
  box-shadow: 0 5px 14px rgba(12, 28, 21, 0.06);
}

.participant-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, hsl(43, 82%, 82%), hsl(38, 52%, 62%));
  border: 1.5px solid var(--border-strong);
  color: var(--forest-950);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.08rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow:
    0 2px 6px rgba(12, 28, 21, 0.12),
    inset 0 1px 2px rgba(255, 255, 255, 0.85);
}

.participant-avatar.avatar-crimson {
  background: radial-gradient(circle at 35% 30%, var(--crimson-500), var(--crimson-800));
  color: var(--gold-200);
  border-color: hsla(40, 72%, 65%, 0.5);
}

.participant-avatar.avatar-pine {
  background: radial-gradient(circle at 35% 30%, var(--forest-700), var(--forest-950));
  color: var(--gold-300);
  border-color: hsla(40, 72%, 65%, 0.5);
}

.share-actions {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
}

/* Alerts */
.alert {
  padding: 0.95rem 1.2rem;
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 1.35rem;
  border: 1px solid transparent;
}

.alert-error {
  background: var(--crimson-100);
  color: var(--crimson-700);
  border-color: hsla(356, 62%, 35%, 0.25);
}

.alert-success {
  background: hsl(152, 42%, 92%);
  color: hsl(156, 54%, 22%);
  border-color: hsla(156, 45%, 35%, 0.28);
}

/* ==========================================================================
   2. 3D VELVET POSTAL ENVELOPE, CROSSED GOLD RIBBONS & WAX SEAL STAGE
   ========================================================================== */
.reveal-stage {
  view-transition-name: reveal-stage;
  margin: 1.85rem 0;
}

.gift-envelope {
  background:
    /* Soft crimson cushion behind central text for effortless legibility */
    radial-gradient(ellipse 52% 36% at 50% 64%, hsla(356, 70%, 22%, 0.88), transparent 75%),
    /* Top V-Flap Geometric Pocket Shadow & Highlights */
    linear-gradient(154deg, rgba(18, 4, 5, 0.34) 36%, hsla(42, 80%, 68%, 0.25) 36.3%, transparent 36.8%),
    linear-gradient(206deg, rgba(18, 4, 5, 0.34) 36%, hsla(42, 80%, 68%, 0.25) 36.3%, transparent 36.8%),
    /* Crossed Gold Satin Ribbons Behind Content */
    linear-gradient(90deg, transparent calc(50% - 16px), hsla(42, 78%, 62%, 0.24) calc(50% - 16px), hsla(43, 88%, 74%, 0.42) 50%, hsla(42, 78%, 62%, 0.24) calc(50% + 16px), transparent calc(50% + 16px)),
    linear-gradient(180deg, transparent 102px, hsla(42, 78%, 62%, 0.22) 102px, hsla(43, 88%, 74%, 0.38) 116px, hsla(42, 78%, 62%, 0.22) 130px, transparent 130px),
    radial-gradient(circle at 50% 32%, hsla(356, 78%, 48%, 0.42), transparent 65%),
    linear-gradient(165deg, var(--crimson-600) 0%, var(--crimson-900) 100%);
  color: #FFFDF9;
  border-radius: var(--radius-lg);
  padding: 3.4rem 2.25rem 3.1rem;
  text-align: center;
  box-shadow: var(--shadow-lifted);
  border: 1.5px solid hsla(40, 78%, 64%, 0.55);
  position: relative;
  overflow: hidden;
  transition: transform 0.32s cubic-bezier(0.22, 1, 0.36, 1), filter 0.32s ease;
}

.gift-envelope::before {
  content: "";
  position: absolute;
  inset: 10px;
  border: 1px dashed hsla(42, 82%, 72%, 0.42);
  border-radius: calc(var(--radius-lg) - 8px);
  pointer-events: none;
}

.gift-envelope.is-breaking {
  transform: scale(1.03) translateY(-4px);
  filter: brightness(1.15);
}

.gift-envelope.is-breaking .wax-seal {
  transform: scale(1.22) rotate(12deg);
  box-shadow: 0 0 38px hsla(43, 95%, 72%, 0.85), var(--shadow-wax);
}

.wax-seal {
  width: 92px;
  height: 92px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, hsl(44, 92%, 78%), hsl(38, 76%, 44%) 65%, hsl(34, 74%, 29%) 100%);
  color: hsl(28, 75%, 12%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.35rem;
  box-shadow: var(--shadow-wax);
  border: 2px solid hsla(45, 95%, 86%, 0.78);
  position: relative;
  z-index: 2;
  transition: transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.28s ease;
}

.gift-envelope:hover .wax-seal {
  transform: scale(1.07) rotate(-4deg);
}

.wax-seal::after {
  content: "";
  position: absolute;
  inset: 6px;
  border-radius: 50%;
  border: 1.5px dashed rgba(68, 38, 6, 0.48);
  pointer-events: none;
}

/* Unwrapped Certificate Card with Ornate Filigree & Postmark */
.unwrapped-card {
  background:
    radial-gradient(circle at 50% 28%, hsla(42, 85%, 72%, 0.22), transparent 55%),
    var(--bg-paper);
  border: 2px solid var(--gold-500);
  border-radius: var(--radius-lg);
  padding: 2.75rem 2.5rem 2.5rem;
  text-align: center;
  box-shadow: var(--shadow-lifted);
  position: relative;
  overflow: hidden;
}

.unwrapped-card::after {
  content: "";
  position: absolute;
  inset: 9px;
  border: 1px solid hsla(40, 68%, 50%, 0.42);
  border-radius: calc(var(--radius-lg) - 8px);
  pointer-events: none;
}

/* Corner Filigree Ornaments */
.corner-ornament {
  position: absolute;
  width: 28px;
  height: 28px;
  color: var(--gold-500);
  opacity: 0.75;
  pointer-events: none;
  z-index: 2;
}
.corner-tl { top: 14px; left: 14px; }
.corner-tr { top: 14px; right: 14px; transform: scaleX(-1); }
.corner-bl { bottom: 14px; left: 14px; transform: scaleY(-1); }
.corner-br { bottom: 14px; right: 14px; transform: scale(-1, -1); }

.recipient-name-lockup {
  position: relative;
  display: inline-block;
  margin: 0.35rem 0 0.85rem;
  padding: 0.25rem 1.75rem;
}

.recipient-name-display {
  font-family: var(--font-display);
  font-size: clamp(2.85rem, 6vw, 4.15rem);
  font-weight: 700;
  color: var(--crimson-600);
  letter-spacing: -0.02em;
  line-height: 1.08;
  text-shadow: 0 2px 14px hsla(356, 62%, 35%, 0.14);
}

.sparkle-star {
  position: absolute;
  color: var(--gold-500);
  font-size: 1.15rem;
  animation: twinklePulse 2.4s ease-in-out infinite;
  user-select: none;
}

@keyframes twinklePulse {
  0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.75; }
  50% { transform: scale(1.25) rotate(12deg); opacity: 1; }
}

/* Postmark Stamp Decoration */
.postmark-stamp {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.36rem 0.78rem;
  border: 1.5px dashed hsla(40, 72%, 65%, 0.55);
  border-radius: var(--radius-xs);
  font-family: var(--font-mono);
  font-size: 0.68rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.11em;
  color: var(--gold-400);
  background: rgba(0, 0, 0, 0.22);
  transform: rotate(-1.5deg);
}

/* Metadata Bar */
.meta-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-top: 1.35rem;
  padding-top: 1.2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.14);
  font-size: 0.88rem;
  color: rgba(249, 246, 240, 0.92);
}

/* Code / URL Copy Box */
.copy-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(5, 14, 10, 0.55);
  border: 1px solid hsla(40, 68%, 62%, 0.34);
  padding: 0.58rem 0.85rem;
  border-radius: var(--radius-xs);
  font-family: var(--font-mono);
  font-size: 0.78rem;
  color: var(--gold-200);
  overflow-x: auto;
}

/* Feature Luggage Tags */
.feature-steps {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-top: 2rem;
}

@media (max-width: 720px) {
  .feature-steps {
    grid-template-columns: 1fr;
  }
}

.step-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.65rem;
}

.step-number {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--forest-900);
  color: var(--gold-400);
  border: 1px solid var(--gold-500);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.84rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* Ornate Divider */
.ornate-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.85rem;
  margin: 1.1rem auto;
  max-width: 280px;
  color: var(--gold-600);
  font-size: 0.95rem;
}

.ornate-divider::before,
.ornate-divider::after {
  content: "";
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--border-brass), transparent);
}

/* Telemetry Progress Bar */
.seal-progress-track {
  width: 100%;
  height: 8px;
  background: var(--bg-vellum);
  border-radius: 999px;
  overflow: hidden;
  border: 1px solid var(--border-hairline);
  margin: 0.6rem 0 0.95rem;
}

.seal-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--forest-800), hsl(152, 52%, 34%));
  border-radius: 999px;
  transition: width 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

/* Optional Alpine Snowfall Layer */
.snow-canvas {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 90;
  overflow: hidden;
  opacity: 0;
  transition: opacity 0.4s ease;
}

body.snow-enabled .snow-canvas {
  opacity: 1;
}

.snowflake {
  position: absolute;
  top: -20px;
  color: hsla(40, 60%, 55%, 0.55);
  font-size: 1rem;
  animation: snowfallDrift linear infinite;
}

@keyframes snowfallDrift {
  0% { transform: translateY(-20px) translateX(0) rotate(0deg); opacity: 0; }
  15% { opacity: 0.85; }
  85% { opacity: 0.85; }
  100% { transform: translateY(105vh) translateX(35px) rotate(360deg); opacity: 0; }
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
  <defs>
    <linearGradient id="crest-grad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#184e36"/>
      <stop offset="100%" stop-color="#081810"/>
    </linearGradient>
  </defs>
  <rect width="32" height="32" rx="8" fill="url(#crest-grad)"/>
  <rect x="1" y="1" width="30" height="30" rx="7" fill="none" stroke="#D4A853" stroke-width="1.2" stroke-opacity="0.75"/>
  <g transform="translate(4, 4)" stroke="#F5CF75" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <path d="M12 2v20M17 5l-5 5-5-5M17 19l-5-5-5 5M2 12h20M5 7l5 5-5 5M19 7l-5 5 5 5" />
  </g>
</svg>`;

