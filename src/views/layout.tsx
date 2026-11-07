import type { Child, FC } from 'hono/jsx';
import { raw } from 'hono/html';

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
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="alternate icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="/styles.css?v=2026.7" />
      </head>
      <body>
        <header class="site-header">
          <div class="header-inner">
            <a href="/" class="brand-link" id="nav-home-link">
              <span class="brand-crest" aria-hidden="true">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M12 2v20M17 5l-5 5-5-5M17 19l-5-5-5 5M2 12h20M5 7l5 5-5 5M19 7l-5 5 5 5" />
                </svg>
              </span>
              <span>
                <span class="brand-title">North Pole Post</span>
                <span class="brand-sub">Secret Santa Dispatch</span>
              </span>
            </a>

            <nav class="header-nav" aria-label="Primary">
              {headerRight ?? (
                <a href="/#create-event-card" class="nav-link" id="nav-new-event-btn">
                  + New Exchange
                </a>
              )}
            </nav>
          </div>
        </header>

        <main class="main-container">{children}</main>

        <footer class="site-footer">
          <p class="footer-quote">“Sealed with secrecy, delivered with cheer.”</p>
          <p>North Pole Post • Powered by Cloudflare Workers &amp; D1 • Zero Passwords Required</p>
        </footer>

        <script>
          {raw(`
            function prefersReducedMotion() {
              return Boolean(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
            }

            function burstGoldSparks(x, y) {
              if (prefersReducedMotion()) return;
              try {
                var canvas = document.createElement('canvas');
                canvas.style.position = 'fixed';
                canvas.style.inset = '0';
                canvas.style.pointerEvents = 'none';
                canvas.style.zIndex = '9999';
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                document.body.appendChild(canvas);
                var ctx = canvas.getContext('2d');
                var particles = [];
                var colors = ['#F4DF9E', '#D6AB56', '#E8C77E', '#FFFFFF', '#AEF0C3'];
                for (var i = 0; i < 42; i++) {
                  var angle = Math.random() * Math.PI * 2;
                  var speed = Math.random() * 8.5 + 3;
                  particles.push({
                    x: x || window.innerWidth / 2,
                    y: y || window.innerHeight / 2,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed - 2.4,
                    size: Math.random() * 3.2 + 1.5,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    alpha: 1,
                    decay: Math.random() * 0.025 + 0.015
                  });
                }
                var start = performance.now();
                function loop() {
                  ctx.clearRect(0, 0, canvas.width, canvas.height);
                  var alive = false;
                  particles.forEach(function(p) {
                    p.x += p.vx;
                    p.y += p.vy;
                    p.vy += 0.22;
                    p.alpha -= p.decay;
                    if (p.alpha > 0) {
                      alive = true;
                      ctx.save();
                      ctx.globalAlpha = p.alpha;
                      ctx.fillStyle = p.color;
                      ctx.beginPath();
                      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                      ctx.fill();
                      ctx.restore();
                    }
                  });
                  if (alive && performance.now() - start < 1700) {
                    requestAnimationFrame(loop);
                  } else {
                    canvas.remove();
                  }
                }
                requestAnimationFrame(loop);
              } catch(e) {}
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
              var markCopied = function() {
                if (!btnEl) return;
                var original = btnEl.getAttribute('data-orig-label') || btnEl.innerHTML;
                btnEl.setAttribute('data-orig-label', original);
                btnEl.innerHTML = copiedLabel || '✓ Copied!';
                btnEl.style.borderColor = '#D6AB56';
                setTimeout(function() {
                  btnEl.innerHTML = original;
                  btnEl.style.borderColor = '';
                }, 1700);
              };
              if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(markCopied).catch(function() {});
              } else {
                var ta = document.createElement('textarea');
                ta.value = text;
                ta.style.position = 'fixed';
                ta.style.opacity = '0';
                document.body.appendChild(ta);
                ta.select();
                try { document.execCommand('copy'); markCopied(); } catch(e) {}
                ta.remove();
              }
            }

            function initTiltEffects() {
              if (prefersReducedMotion()) return;
              if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) return;
              document.querySelectorAll('[data-tilt]').forEach(function(el) {
                if (el._hasTilt) return;
                el._hasTilt = true;
                el.addEventListener('mousemove', function(e) {
                  var rect = el.getBoundingClientRect();
                  var x = e.clientX - rect.left - rect.width / 2;
                  var y = e.clientY - rect.top - rect.height / 2;
                  var rx = (y / (rect.height / 2)) * -3.5;
                  var ry = (x / (rect.width / 2)) * 3.5;
                  el.style.transform = 'perspective(1000px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg)';
                });
                el.addEventListener('mouseleave', function() {
                  el.style.transform = '';
                });
              });
            }

            // Close open <details class="action-menu"> when clicking outside or pressing Escape
            document.addEventListener('click', function(e) {
              var openMenus = document.querySelectorAll('details.action-menu[open]');
              openMenus.forEach(function(menu) {
                if (!menu.contains(e.target)) {
                  menu.removeAttribute('open');
                }
              });
            });
            document.addEventListener('keydown', function(e) {
              if (e.key === 'Escape') {
                document.querySelectorAll('details.action-menu[open]').forEach(function(menu) {
                  menu.removeAttribute('open');
                });
              }
            });

            if (document.readyState === 'loading') {
              document.addEventListener('DOMContentLoaded', initTiltEffects);
            } else {
              initTiltEffects();
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
                var rect = submitBtn ? submitBtn.getBoundingClientRect() : null;
                var sparkX = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
                var sparkY = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;
                burstGoldSparks(sparkX, sparkY);
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
                if (isUnwrap && !prefersReducedMotion()) {
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
                    initTiltEffects();
                    var autofocusEl = replacement.querySelector('[data-autofocus]');
                    if (autofocusEl && typeof autofocusEl.focus === 'function') {
                      autofocusEl.focus();
                    }
                  } else {
                    window.location.reload();
                  }
                };
                if (document.startViewTransition && !prefersReducedMotion()) {
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
