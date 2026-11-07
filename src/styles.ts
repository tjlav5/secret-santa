export const APP_CSS = `
:root {
  --bg-parchment: #FAF7F2;
  --bg-card: #FFFFFF;
  --bg-subtle: #F3EFE6;
  --bg-pine: #163329;
  --bg-pine-deep: #0F241C;
  --bg-crimson: #9E2A2B;
  --bg-crimson-hover: #822021;
  --bg-gold-soft: #FDF8EC;

  --text-primary: #18241E;
  --text-secondary: #4E5D55;
  --text-muted: #78867E;
  --text-on-dark: #F9F6F0;

  --border-warm: #E5DEC9;
  --border-strong: #CEC3A8;
  --accent-gold: #C8963E;
  --accent-pine: #1E4638;
  --accent-crimson: #9E2A2B;
  --status-success-bg: #E7F3EE;
  --status-success-text: #18543C;
  --status-pending-bg: #F5EFE2;
  --status-pending-text: #6B5730;
  --status-error-bg: #FCECEB;
  --status-error-text: #8F2424;

  --radius-sm: 8px;
  --radius-md: 14px;
  --radius-lg: 20px;
  --shadow-card: 0 8px 28px -6px rgba(22, 51, 41, 0.08), 0 2px 6px -1px rgba(22, 51, 41, 0.04);
  --shadow-elevated: 0 20px 44px -12px rgba(22, 51, 41, 0.16), 0 4px 12px -2px rgba(22, 51, 41, 0.06);

  --font-serif: 'Fraunces', Georgia, serif;
  --font-sans: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  background-color: var(--bg-parchment);
  background-image: radial-gradient(circle at 15% 10%, rgba(200, 150, 62, 0.07) 0%, transparent 45%),
                    radial-gradient(circle at 85% 90%, rgba(22, 51, 41, 0.06) 0%, transparent 45%);
  color: var(--text-primary);
  font-family: var(--font-sans);
  font-size: 16px;
  line-height: 1.6;
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
}

a {
  color: var(--accent-pine);
  text-decoration: none;
  transition: color 0.15s ease;
}

a:hover {
  color: var(--accent-crimson);
}

/* Header & Navigation */
.site-header {
  border-bottom: 1px solid var(--border-warm);
  background: rgba(250, 247, 242, 0.88);
  backdrop-filter: blur(8px);
  position: sticky;
  top: 0;
  z-index: 40;
}

.header-inner {
  max-width: 1080px;
  margin: 0 auto;
  padding: 0.9rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.brand-link {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  font-family: var(--font-serif);
  font-weight: 700;
  font-size: 1.25rem;
  color: var(--bg-pine);
  letter-spacing: -0.02em;
}

.brand-mark {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: var(--bg-pine);
  color: var(--bg-gold-soft);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.05rem;
  box-shadow: 0 2px 6px rgba(22, 51, 41, 0.2);
}

/* Layout Containers */
.main-container {
  max-width: 1080px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem 5rem;
}

.narrow-container {
  max-width: 720px;
  margin: 0 auto;
}

/* Typography */
h1, h2, h3, h4 {
  font-family: var(--font-serif);
  color: var(--text-primary);
  line-height: 1.2;
  letter-spacing: -0.02em;
}

.hero-title {
  font-size: clamp(2.1rem, 4.5vw, 3.25rem);
  font-weight: 700;
  margin-bottom: 0.85rem;
  color: var(--bg-pine-deep);
}

.hero-subtitle {
  font-size: 1.125rem;
  color: var(--text-secondary);
  max-width: 58ch;
}

/* Cards & Surfaces */
.surface-card {
  background: var(--bg-card);
  border: 1px solid var(--border-warm);
  border-radius: var(--radius-lg);
  padding: 2rem;
  box-shadow: var(--shadow-card);
}

.surface-card-compact {
  background: var(--bg-card);
  border: 1px solid var(--border-warm);
  border-radius: var(--radius-md);
  padding: 1.35rem 1.5rem;
  box-shadow: var(--shadow-card);
}

.pine-banner {
  background: linear-gradient(135deg, var(--bg-pine) 0%, var(--bg-pine-deep) 100%);
  color: var(--text-on-dark);
  border-radius: var(--radius-lg);
  padding: 2.25rem;
  box-shadow: var(--shadow-elevated);
  position: relative;
  overflow: hidden;
}

.pine-banner h1, .pine-banner h2, .pine-banner h3 {
  color: var(--text-on-dark);
}

/* Grid Systems */
.split-grid {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 2.5rem;
  align-items: start;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1.35fr 0.85fr;
  gap: 1.75rem;
  align-items: start;
}

@media (max-width: 860px) {
  .split-grid,
  .dashboard-grid {
    grid-template-columns: 1fr;
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
  font-size: 0.875rem;
  color: var(--text-primary);
  margin-bottom: 0.4rem;
}

.form-hint {
  display: block;
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-top: 0.25rem;
}

.input-field,
.select-field,
.textarea-field {
  width: 100%;
  padding: 0.72rem 0.95rem;
  font-family: var(--font-sans);
  font-size: 0.95rem;
  color: var(--text-primary);
  background: #FFFFFF;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-sm);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.input-field:focus,
.select-field:focus,
.textarea-field:focus {
  outline: none;
  border-color: var(--accent-pine);
  box-shadow: 0 0 0 3px rgba(30, 70, 56, 0.14);
}

.textarea-field {
  min-height: 105px;
  resize: vertical;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-family: var(--font-sans);
  font-weight: 600;
  font-size: 0.925rem;
  padding: 0.72rem 1.25rem;
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
  cursor: pointer;
  transition: transform 0.12s ease, background-color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
  text-decoration: none;
  white-space: nowrap;
}

.btn:active {
  transform: translateY(1px);
}

.btn-primary {
  background: var(--bg-crimson);
  color: #FFFFFF;
  box-shadow: 0 2px 8px rgba(158, 42, 43, 0.28);
}

.btn-primary:hover {
  background: var(--bg-crimson-hover);
  color: #FFFFFF;
}

.btn-pine {
  background: var(--bg-pine);
  color: var(--text-on-dark);
  box-shadow: 0 2px 8px rgba(22, 51, 41, 0.22);
}

.btn-pine:hover {
  background: var(--bg-pine-deep);
  color: var(--text-on-dark);
}

.btn-secondary {
  background: var(--bg-subtle);
  color: var(--text-primary);
  border-color: var(--border-strong);
}

.btn-secondary:hover {
  background: #EAE3D5;
  color: var(--text-primary);
}

.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
  padding: 0.45rem 0.75rem;
}

.btn-ghost:hover {
  background: var(--bg-subtle);
  color: var(--accent-crimson);
}

.btn-sm {
  padding: 0.42rem 0.8rem;
  font-size: 0.82rem;
}

.btn-full {
  width: 100%;
}

/* Badges & Pills */
.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.22rem 0.65rem;
  border-radius: 999px;
  font-size: 0.76rem;
  font-weight: 600;
  letter-spacing: 0.01em;
}

.badge-success {
  background: var(--status-success-bg);
  color: var(--status-success-text);
}

.badge-pending {
  background: var(--status-pending-bg);
  color: var(--status-pending-text);
}

.badge-gold {
  background: rgba(200, 150, 62, 0.2);
  color: #F4D28E;
  border: 1px solid rgba(200, 150, 62, 0.35);
}

/* Participant Rows */
.participant-list {
  list-style: none;
  divide-y: 1px solid var(--border-warm);
}

.participant-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.9rem 0;
  border-bottom: 1px solid var(--border-warm);
}

.participant-item:last-child {
  border-bottom: none;
}

.participant-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--bg-subtle);
  border: 1px solid var(--border-strong);
  color: var(--bg-pine);
  font-family: var(--font-serif);
  font-weight: 700;
  font-size: 0.95rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.share-actions {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  flex-wrap: wrap;
}

/* Alert boxes */
.alert {
  padding: 0.95rem 1.15rem;
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  margin-bottom: 1.25rem;
  border: 1px solid transparent;
}

.alert-error {
  background: var(--status-error-bg);
  color: var(--status-error-text);
  border-color: #F3C4C2;
}

.alert-success {
  background: var(--status-success-bg);
  color: var(--status-success-text);
  border-color: #B8DFCE;
}

.alert-gold {
  background: var(--bg-gold-soft);
  color: #5C4418;
  border-color: #E8D39E;
}

/* Envelope & Gift Reveal Card */
.reveal-stage {
  perspective: 1000px;
  margin: 1.75rem 0;
}

.gift-envelope {
  background: linear-gradient(145deg, #9E2A2B 0%, #771C1D 100%);
  color: #FFFDF9;
  border-radius: var(--radius-lg);
  padding: 3rem 2rem;
  text-align: center;
  box-shadow: var(--shadow-elevated);
  border: 2px solid rgba(244, 210, 142, 0.35);
  position: relative;
  overflow: hidden;
}

.wax-seal {
  width: 74px;
  height: 74px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #E5B85B, #B37D24);
  color: #2B1B04;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.85rem;
  margin-bottom: 1.25rem;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.28), inset 0 2px 4px rgba(255, 255, 255, 0.4);
  border: 2px dashed rgba(66, 43, 8, 0.35);
}

.unwrapped-card {
  background: #FFFFFF;
  border: 2px solid var(--accent-gold);
  border-radius: var(--radius-lg);
  padding: 2.5rem 2rem;
  text-align: center;
  box-shadow: var(--shadow-elevated);
  animation: popReveal 0.45s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes popReveal {
  0% {
    opacity: 0;
    transform: scale(0.94) translateY(10px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.recipient-name-display {
  font-family: var(--font-serif);
  font-size: clamp(2.2rem, 5vw, 3.2rem);
  font-weight: 700;
  color: var(--bg-crimson);
  margin: 0.5rem 0 1.25rem;
  letter-spacing: -0.02em;
}

/* Metadata Bar */
.meta-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 1.25rem;
  margin-top: 1.15rem;
  padding-top: 1.15rem;
  border-top: 1px solid rgba(255, 255, 255, 0.16);
  font-size: 0.9rem;
  color: rgba(249, 246, 240, 0.9);
}

/* HTMX Loading Indicators */
.htmx-indicator {
  display: none;
}
.htmx-request .htmx-indicator,
.htmx-request.htmx-indicator {
  display: inline-block;
}

/* Code / URL Copy Box */
.copy-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(0, 0, 0, 0.22);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0.55rem 0.85rem;
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: 0.82rem;
  color: #F4EFE6;
  overflow-x: auto;
}

.feature-steps {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
  margin-top: 2.5rem;
}

@media (max-width: 760px) {
  .feature-steps {
    grid-template-columns: 1fr;
  }
}

.step-number {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--bg-pine);
  color: var(--bg-gold-soft);
  font-family: var(--font-serif);
  font-weight: 700;
  font-size: 0.85rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.65rem;
}
`;
