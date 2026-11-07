import type { Child, FC } from 'hono/jsx';
import { raw } from 'hono/html';
import { APP_CSS } from '../styles';

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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=JetBrains+Mono:wght@400;500&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <style>{raw(APP_CSS)}</style>
      </head>
      <body>
        <header class="site-header">
          <div class="header-inner">
            <a href="/" class="brand-link" id="nav-home-link">
              <span class="brand-mark" aria-hidden="true">✻</span>
              <span>North Pole Post</span>
            </a>
            <div>
              {headerRight || (
                <a href="/#create-event-card" class="btn btn-secondary btn-sm" id="nav-new-event-btn">
                  + New Exchange
                </a>
              )}
            </div>
          </div>
        </header>

        <main class="main-container">{children}</main>

        <footer
          style="text-align: center; padding: 2rem 1.5rem 3rem; color: var(--text-muted); font-size: 0.85rem; border-top: 1px solid var(--border-warm);"
        >
          <p>North Pole Post • Cloudflare Workers &amp; Hono • Progressive Native Forms (~600B JS)</p>
        </footer>

        <script>
          {raw(`
            // 1. Copy helper for Share buttons
            function copyToClipboard(text, btnEl, copiedLabel) {
              navigator.clipboard.writeText(text).then(function() {
                var original = btnEl.innerHTML;
                btnEl.innerHTML = copiedLabel || '✓ Copied!';
                btnEl.style.backgroundColor = '#18543C';
                btnEl.style.color = '#FFFFFF';
                setTimeout(function() {
                  btnEl.innerHTML = original;
                  btnEl.style.backgroundColor = '';
                  btnEl.style.color = '';
                }, 1800);
              });
            }

            // 2. ~600B Progressive Enhancement for Native <form method="post" data-target="#...">
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

              try {
                var res = await fetch(form.action, {
                  method: (form.method || 'POST').toUpperCase(),
                  body: new FormData(form),
                  headers: { 'X-Inline-Target': targetSel }
                });
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
                form.submit(); // Native fallback if network/fetch fails
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
