/* Lienas Medus theme JS — no dependencies. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const fmt = (cents) => {
    const cur = (window.Shopify && Shopify.currency && Shopify.currency.active) || 'EUR';
    const loc = document.documentElement.lang || 'lv';
    return new Intl.NumberFormat(loc, { style: 'currency', currency: cur }).format(cents / 100);
  };

  /* ---------- Mobile nav ---------- */
  document.addEventListener('click', (e) => {
    const open = e.target.closest('[data-menu-open]');
    const close = e.target.closest('[data-menu-close]');
    const nav = $('[data-mobile-nav]');
    if (!nav) return;
    if (open) { nav.setAttribute('open', ''); document.body.classList.add('drawer-open'); $('a, button', nav)?.focus(); }
    if (close) { nav.removeAttribute('open'); document.body.classList.remove('drawer-open'); }
  });

  /* ---------- Cart drawer ---------- */
  const drawer = () => $('[data-cart-drawer]');
  let lastFocus = null;

  function openDrawer() {
    const d = drawer(); if (!d) return;
    lastFocus = document.activeElement;
    d.classList.add('is-open'); d.setAttribute('aria-hidden', 'false');
    document.body.classList.add('drawer-open');
    $('[data-drawer-close]', d)?.focus();
  }
  function closeDrawer() {
    const d = drawer(); if (!d) return;
    d.classList.remove('is-open'); d.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('drawer-open');
    lastFocus?.focus();
  }

  async function refreshCart(open = false) {
    const res = await fetch(`${window.theme.routes.root}?sections=cart-drawer-content,header`);
    const data = await res.json();
    const content = $('[data-cart-drawer-content]');
    if (content && data['cart-drawer-content']) {
      const html = new DOMParser().parseFromString(data['cart-drawer-content'], 'text/html');
      const fresh = $('[data-cart-drawer-content]', html);
      if (fresh) content.innerHTML = fresh.innerHTML;
    }
    if (data.header) {
      const html = new DOMParser().parseFromString(data.header, 'text/html');
      $$('[data-cart-count]').forEach((el) => {
        const fresh = $('[data-cart-count]', html);
        if (fresh) el.outerHTML = fresh.outerHTML;
      });
    }
    if (open) openDrawer();
  }

  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-cart-open]')) { e.preventDefault(); openDrawer(); }
    if (e.target.closest('[data-drawer-close]')) { e.preventDefault(); closeDrawer(); }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeDrawer();
      const nav = $('[data-mobile-nav]');
      if (nav?.hasAttribute('open')) { nav.removeAttribute('open'); document.body.classList.remove('drawer-open'); }
    }
  });

  async function changeLine(key, quantity) {
    await fetch(`${window.theme.routes.cartChange}.js`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ id: key, quantity })
    });
    await refreshCart();
  }

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-line-change]');
    if (!btn) return;
    e.preventDefault();
    const line = btn.closest('[data-line-key]');
    const input = $('input', line);
    const current = parseInt(input?.value || '0', 10);
    const delta = btn.dataset.lineChange === 'remove' ? -current : parseInt(btn.dataset.lineChange, 10);
    changeLine(line.dataset.lineKey, Math.max(0, current + delta));
  });
  document.addEventListener('change', (e) => {
    const input = e.target.closest('[data-line-key] input[name="updates[]"]');
    if (!input) return;
    changeLine(input.closest('[data-line-key]').dataset.lineKey, Math.max(0, parseInt(input.value, 10) || 0));
  });

  /* ---------- Add to cart (AJAX) ---------- */
  document.addEventListener('submit', async (e) => {
    const form = e.target.closest('form[data-ajax-cart]');
    if (!form || !drawer()) return;
    e.preventDefault();
    const btn = $('[type="submit"]', form);
    const label = btn?.innerHTML;
    if (btn) { btn.disabled = true; btn.textContent = window.theme.strings.adding; }
    try {
      const res = await fetch(`${window.theme.routes.cartAdd}.js`, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form)
      });
      if (!res.ok) {
        const err = await res.json();
        alertInline(form, err.description || err.message);
      } else {
        await refreshCart(true);
      }
    } finally {
      if (btn) { btn.disabled = false; btn.innerHTML = label; }
    }
  });

  function alertInline(form, msg) {
    let el = $('.form-message', form);
    if (!el) { el = document.createElement('p'); el.className = 'form-message'; el.setAttribute('role', 'alert'); form.appendChild(el); }
    el.textContent = msg;
  }

  /* ---------- Variant pickers (cards + product page) ---------- */
  document.addEventListener('change', (e) => {
    const picker = e.target.closest('[data-variant-picker]');
    if (!picker) return;
    const form = picker.closest('form');
    const variants = JSON.parse($('[data-variants-json]', picker.closest('[data-product]'))?.textContent || '[]');
    const selected = $$('input:checked, select', picker).map((i) => i.value);
    const variant = variants.find((v) => v.options.every((o, idx) => o === selected[idx]));
    if (!variant) return;
    $('input[name="id"]', form).value = variant.id;
    const scope = picker.closest('[data-product]');
    $$('[data-price]', scope).forEach((el) => {
      el.innerHTML = variant.compare_at_price > variant.price
        ? `<s>${fmt(variant.compare_at_price)}</s> <span>${fmt(variant.price)}</span>`
        : `<span>${fmt(variant.price)}</span>`;
    });
    const btn = $('[type="submit"]', form);
    if (btn) {
      btn.disabled = !variant.available;
      btn.firstChild.textContent = variant.available ? window.theme.strings.addToCart : window.theme.strings.soldOut;
    }
    if (scope.hasAttribute('data-update-url')) {
      const url = new URL(window.location.href);
      url.searchParams.set('variant', variant.id);
      history.replaceState({}, '', url);
    }
  });

  /* ---------- Quantity steppers ---------- */
  document.addEventListener('click', (e) => {
    const step = e.target.closest('[data-qty-step]');
    if (!step || step.closest('[data-line-key]')) return;
    const input = $('input', step.closest('.qty'));
    input.value = Math.max(1, (parseInt(input.value, 10) || 1) + parseInt(step.dataset.qtyStep, 10));
  });

  /* ---------- Gift set builder ---------- */
  $$('[data-gift-builder]').forEach((root) => {
    const max = parseInt(root.dataset.max, 10) || 3;
    const inputs = $$('input[type="checkbox"]', root);
    const slots = $$('.gift-builder__slot', root);
    const btn = $('[type="submit"]', root);
    const prop = $('[data-gift-property]', root);
    const sync = () => {
      const chosen = inputs.filter((i) => i.checked);
      inputs.forEach((i) => { i.disabled = !i.checked && chosen.length >= max; });
      slots.forEach((s, idx) => s.classList.toggle('is-filled', idx < chosen.length));
      const left = max - chosen.length;
      btn.disabled = left > 0;
      btn.textContent = left > 0 ? window.theme.strings.pickThree.replace('[count]', left) : window.theme.strings.giftReady;
      prop.value = chosen.map((i) => i.value).join(', ');
    };
    inputs.forEach((i) => i.addEventListener('change', sync));
    sync();
  });

  /* ---------- Reveal on scroll ---------- */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -10% 0px' });
    $$('.reveal').forEach((el) => io.observe(el));
  } else {
    $$('.reveal').forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- Theme editor ---------- */
  document.addEventListener('shopify:section:load', () => {
    $$('.reveal').forEach((el) => el.classList.add('is-visible'));
  });
})();
