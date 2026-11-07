import type { Child, FC } from 'hono/jsx';
import { raw } from 'hono/html';
import { APP_CSS } from '../styles';

export const PostageStamp: FC<{ label?: string; cents?: string }> = ({
  label = 'NORTH POLE',
  cents = '25¢',
}) => (
  <div class="postage-stamp-box" aria-hidden="true">
    <span
      style="font-family: var(--font-mono); font-size: 0.52rem; font-weight: 700; letter-spacing: 0.08em; color: var(--crimson-600); text-transform: uppercase;"
    >
      {label}
    </span>
    <svg
      width="30"
      height="30"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--forest-800)"
      stroke-width="1.75"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M12 2L7 10h3l-3 6h4v6h2v-6h4l-3-6h3L12 2z" />
    </svg>
    <span
      style="font-family: var(--font-display); font-weight: 700; font-size: 0.78rem; color: var(--ink-900); line-height: 1;"
    >
      {cents}
    </span>
  </div>
);

export const PostmarkSeal: FC<{ text?: string }> = ({ text = 'NORTH POLE DISPATCH' }) => (
  <div
    style="display: inline-flex; align-items: center; gap: 0.5rem; opacity: 0.85; user-select: none;"
    aria-hidden="true"
  >
    <svg width="112" height="44" viewBox="0 0 112 44" fill="none">
      <circle
        cx="22"
        cy="22"
        r="19"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-dasharray="3 2"
      />
      <circle cx="22" cy="22" r="14" stroke="currentColor" stroke-width="1" />
      <text
        x="22"
        y="20"
        text-anchor="middle"
        fill="currentColor"
        font-size="5.5"
        font-family="monospace"
        font-weight="bold"
      >
        DEC 25
      </text>
      <text
        x="22"
        y="27"
        text-anchor="middle"
        fill="currentColor"
        font-size="4.8"
        font-family="monospace"
      >
        {text.slice(0, 10)}
      </text>
      <path
        d="M45 13 C55 9, 63 17, 73 13 C83 9, 91 17, 108 13"
        stroke="currentColor"
        stroke-width="1.4"
        stroke-linecap="round"
      />
      <path
        d="M45 22 C55 18, 63 26, 73 22 C83 18, 91 26, 108 22"
        stroke="currentColor"
        stroke-width="1.4"
        stroke-linecap="round"
      />
      <path
        d="M45 31 C55 27, 63 35, 73 31 C83 27, 91 35, 108 31"
        stroke="currentColor"
        stroke-width="1.4"
        stroke-linecap="round"
      />
    </svg>
  </div>
);

export const CornerFiligrees: FC = () => {
  const cornerSvg = (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.75">
      <path d="M2 30V8C2 4.686 4.686 2 8 2h22" />
      <path d="M2 16h6a6 6 0 0 0 6-6V2" />
      <circle cx="7" cy="7" r="1.5" fill="currentColor" />
    </svg>
  );
  return (
    <>
      <span class="corner-ornament corner-tl" aria-hidden="true">
        {cornerSvg}
      </span>
      <span class="corner-ornament corner-tr" aria-hidden="true">
        {cornerSvg}
      </span>
      <span class="corner-ornament corner-bl" aria-hidden="true">
        {cornerSvg}
      </span>
      <span class="corner-ornament corner-br" aria-hidden="true">
        {cornerSvg}
      </span>
    </>
  );
};

interface LayoutProps {
  title: string;
  description?: string;
  children: Child;
  headerRight?: Child;
}

export const Layout: FC<LayoutProps> = ({
  title,
  description = 'Organize a joyful, frictionless Secret Santa gift exchange with instant private links, exclusion rules, and live wishlists.',
  children,
  headerRight,
}) => {
  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title} — North Pole Post</title>
        <meta name="description" content={description} />
        <style>{raw(APP_CSS)}</style>
      </head>
      <body>
        <div class="airmail-trim" aria-hidden="true"></div>

        {/* Ambient Alpine Snowfall Layer (toggled via navbar button) */}
        <div class="snow-canvas" aria-hidden="true">
          <span class="snowflake" style="left: 7%; animation-duration: 11s; animation-delay: 0s;">
            ❄
          </span>
          <span class="snowflake" style="left: 19%; animation-duration: 14s; animation-delay: 2s;">
            ✦
          </span>
          <span class="snowflake" style="left: 34%; animation-duration: 10s; animation-delay: 4s;">
            ❅
          </span>
          <span class="snowflake" style="left: 51%; animation-duration: 13s; animation-delay: 1s;">
            ✦
          </span>
          <span class="snowflake" style="left: 68%; animation-duration: 12s; animation-delay: 3s;">
            ❄
          </span>
          <span class="snowflake" style="left: 83%; animation-duration: 15s; animation-delay: 2.5s;">
            ❅
          </span>
          <span class="snowflake" style="left: 93%; animation-duration: 11.5s; animation-delay: 0.7s;">
            ✦
          </span>
        </div>

        <header class="site-header">
          <div class="header-inner">
            <a href="/" class="brand-link" id="nav-home-link">
              <span class="brand-crest" aria-hidden="true">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M12 2v20M17 5l-5 5-5-5M17 19l-5-5-5 5M2 12h20M5 7l5 5-5 5M19 7l-5 5 5 5" />
                </svg>
              </span>
              <span>
                <span class="brand-title">North Pole Post</span>
                <span class="brand-sub">Official Gift Dispatch • Est. 2026</span>
              </span>
            </a>

            <div style="display: flex; align-items: center; gap: 0.55rem;">
              <button
                type="button"
                class="btn btn-ghost btn-sm"
                id="snow-toggle-btn"
                onclick="toggleSnowfall()"
                title="Toggle gentle alpine snowfall"
                style="font-size: 0.76rem; border: 1px solid var(--border-hairline);"
              >
                ❄️ Atmosphere
              </button>
              {headerRight || (
                <a
                  href="/#create-event-card"
                  class="btn btn-secondary btn-sm"
                  id="nav-new-event-btn"
                >
                  + New Exchange
                </a>
              )}
            </div>
          </div>
        </header>

        <main class="main-container">{children}</main>

        <footer
          style="text-align: center; padding: 2.25rem 1.5rem 3.25rem; color: var(--ink-500); font-size: 0.82rem; border-top: 1px solid var(--border-hairline);"
        >
          <p
            style="font-family: var(--font-display); font-style: italic; font-size: 0.98rem; color: var(--ink-700); margin-bottom: 0.25rem;"
          >
            “Sealed with secrecy, delivered with cheer.”
          </p>
          <p>
            North Pole Post • Powered by Cloudflare Workers &amp; D1 • Zero-Dependency Progressive
            HTML + CSS View Transitions
          </p>
        </footer>

        <script>
          {raw(`
            (function() {
              try {
                if (localStorage.getItem('npp_snow') === '1') {
                  document.body.classList.add('snow-enabled');
                }
              } catch (e) {}
            })();

            function toggleSnowfall() {
              var enabled = document.body.classList.toggle('snow-enabled');
              try {
                localStorage.setItem('npp_snow', enabled ? '1' : '0');
              } catch (e) {}
            }

            function playUnwrapChime() {
              try {
                var Ctx = window.AudioContext || window.webkitAudioContext;
                if (!Ctx) return;
                var ctx = new Ctx();
                var notes = [523.25, 659.25, 783.99, 1046.5];
                notes.forEach(function(freq, i) {
                  var osc = ctx.createOscillator();
                  var gain = ctx.createGain();
                  osc.type = 'triangle';
                  osc.frequency.value = freq;
                  gain.gain.setValueAtTime(0.001, ctx.currentTime + i * 0.075);
                  gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + i * 0.075 + 0.02);
                  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.075 + 0.45);
                  osc.connect(gain);
                  gain.connect(ctx.destination);
                  osc.start(ctx.currentTime + i * 0.075);
                  osc.stop(ctx.currentTime + i * 0.075 + 0.46);
                });
              } catch (e) {}
            }

            function copyToClipboard(text, btnEl, copiedLabel) {
              navigator.clipboard.writeText(text).then(function() {
                var original = btnEl.innerHTML;
                btnEl.innerHTML = copiedLabel || '✓ Copied!';
                btnEl.style.background = '#18543C';
                btnEl.style.color = '#FFFFFF';
                setTimeout(function() {
                  btnEl.innerHTML = original;
                  btnEl.style.background = '';
                  btnEl.style.color = '';
                }, 1800);
              });
            }

            document.addEventListener('submit', async function(e) {
              var form = e.target;
              if (!(form instanceof HTMLFormElement)) return;
              var targetSel = form.getAttribute('data-target');
              if (!targetSel) return;

              var confirmMsg = form.getAttribute('data-confirm');
              if (confirmMsg && !window.confirm(confirmMsg)) {
                e.preventDefault();
                return;
              }

              e.preventDefault();
              var submitBtn = e.submitter || form.querySelector('button[type="submit"]');
              if (submitBtn) submitBtn.disabled = true;

              var isUnwrap = form.getAttribute('data-unwrap') === 'true';
              if (isUnwrap) {
                playUnwrapChime();
                var env = form.closest('.gift-envelope');
                if (env) env.classList.add('is-breaking');
              }

              try {
                var fetchPromise = fetch(form.action, {
                  method: (form.method || 'POST').toUpperCase(),
                  body: new FormData(form),
                  headers: { 'X-Inline-Target': targetSel }
                });
                if (isUnwrap) {
                  await new Promise(function(r) { setTimeout(r, 260); });
                }
                var res = await fetchPromise;
                var html = await res.text();
                var applySwap = function() {
                  var doc = new DOMParser().parseFromString(html, 'text/html');
                  var replacement = doc.querySelector(targetSel) || doc.body.firstElementChild;
                  var current = document.querySelector(targetSel);
                  if (current && replacement) {
                    current.replaceWith(replacement);
                    var autofocusEl = replacement.querySelector('[data-autofocus]');
                    if (autofocusEl && typeof autofocusEl.focus === 'function') {
                      autofocusEl.focus();
                    }
                  } else {
                    window.location.reload();
                  }
                };
                if (document.startViewTransition) {
                  document.startViewTransition(applySwap);
                } else {
                  applySwap();
                }
              } catch (err) {
                form.submit();
              } finally {
                if (submitBtn) submitBtn.disabled = false;
              }
            });
          `)}
        </script>
      </body>
    </html>
  );
};
