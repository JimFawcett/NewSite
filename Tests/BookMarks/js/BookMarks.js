/* js/BookMarks.js
   BookmarkList — per-item cookies + index cookie with sliding expiration
   - Each bookmark stored in its own cookie (name: <itemPrefix><key>)
   - Ordered index cookie keeps the list of item cookie names (comma-separated)
   - Sliding expiration: we refresh cookie expirations on read, click, and mutation
*/
(() => {
  class BookmarkList {
    constructor(container, opts = {}) {
      this.el = (typeof container === 'string')
        ? document.querySelector(container)
        : container;
      if (!this.el) throw new Error('BookmarkList: container not found');

      // Config
      this.indexCookieName = opts.indexCookieName || 'bm_index';
      this.itemPrefix      = opts.itemPrefix      || 'bm_';
      this.cookieDays      = Number.isFinite(opts.cookieDays) ? opts.cookieDays : 30;
      this.max             = Number.isFinite(opts.max) ? opts.max : 50;
      this.slideOnRead     = opts.slideOnRead !== false; // default true

      // State
      this.keys  = this.#loadIndex();           // newest first
      this.items = this.#collectItems(this.keys);

      this.#render();

      // Event delegation
      this.el.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (btn) {
          if (btn.dataset.action === 'clear') {
            this.clear();
            return;
          } else if (btn.dataset.action === 'remove') {
            const li = btn.closest('li[data-id]');
            if (li) this.remove(li.dataset.id);
            return;
          }
        }

        // Sliding expiry on access: touching a bookmark link refreshes its cookie + index
        const a = e.target.closest('a.bm-link');
        if (a) {
          const li = a.closest('li[data-id]');
          if (li) this.#touchOnAccess(li.dataset.id);
          // do NOT preventDefault – allow normal navigation
        }
      });
    }

    /* ---------- Public API ---------- */

    add(url) {
      const { id, href, name } = this.#makeEntry(url);
      const existingKey = this.#findKeyById(id);
      const key = existingKey || this.#uniqueKeyFor(id);

      // Upsert item cookie (mutation refreshes expiry)
      const payload = { id, href, name, ts: Date.now() };
      this.#setCookie(key, encodeURIComponent(JSON.stringify(payload)), this.cookieDays);

      // Move key to front (de-dupe)
      this.keys = this.keys.filter(k => k !== key);
      this.keys.unshift(key);

      // Enforce max; delete oldest item cookies if needed
      if (this.keys.length > this.max) {
        const removed = this.keys.splice(this.max);
        for (const k of removed) this.#deleteCookie(k);
      }

      this.#saveIndex();              // refreshes index cookie (slides)
      this.items = this.#collectItems(this.keys); // also slides each item on read (if enabled)
      this.#render();
    }

    remove(id) {
      const key = this.#findKeyById(id);
      if (!key) return;
      this.keys = this.keys.filter(k => k !== key);
      this.#deleteCookie(key);
      this.#saveIndex();              // slides index
      this.items = this.#collectItems(this.keys); // slides remaining items on read (if enabled)
      this.#render();
    }

    clear() {
      for (const k of this.keys) this.#deleteCookie(k);
      this.keys = [];
      this.items = [];
      this.#deleteCookie(this.indexCookieName);
      this.#render();
    }

    toJSON() { return this.items.slice(); }

    /* ---------- Internals ---------- */

    #makeEntry(inputUrl) {
      const u = this.#toURL(inputUrl);

      // Full URL without hash (works for http/https/file)
      const hrefNoHash = u.href.split('#')[0];

      let id;
      if (u.protocol === 'file:') {
        // For file URLs, origin is "null" — use full URL instead
        id = hrefNoHash;                // e.g., file:///C:/path/to/BookMarks.html
      } else {
        // For http/https: origin + normalized pathname + search
        const pathname = u.pathname.replace(/\/+$/, '') || '/';
        id = u.origin + pathname + (u.search || '');
      }

      const href = hrefNoHash;
      const name = this.#pageNameFrom(u);
      return { id, href, name };
    }

    #pageNameFrom(u) {
      let seg = u.pathname.split('/').filter(Boolean).pop() || '';
      if (!seg) return u.hostname;
      try { seg = decodeURIComponent(seg); } catch {}
      seg = seg.replace(/\.[a-z0-9]+$/i, '');
      return seg || u.hostname;
    }

    #toURL(urlLike) {
      try { return new URL(urlLike, window.location.href); }
      catch { throw new Error(`BookmarkList: invalid URL "${urlLike}"`); }
    }

    #render() {
      const items = this.items.map(item => `
        <li class="bm-item" data-id="${item.id}">
          <a class="bm-link" href="${item.href}" target="_blank" rel="noopener">${this.#escape(item.name)}</a>
          <button class="bm-remove" data-action="remove" aria-label="Remove ${this.#escape(item.name)}">Remove</button>
        </li>`).join('');

      this.el.innerHTML = `
        <div class="bm-wrap" role="region" aria-label="Bookmarks">
          <ul class="bm-list" role="list">
            <li class="bm-actions">
              <button class="bm-clear" data-action="clear" aria-label="Remove all bookmarks">Remove all</button>
            </li>
            ${items}
          </ul>
        </div>
      `;

      // Minimal styles (once)
      if (!document.getElementById('bm-inline-styles')) {
        const css = `
          .bm-wrap { font: 18px/1.4 system-ui, sans-serif; }
          .bm-list { list-style: none; margin: 0; padding: 0; }
          .bm-actions { padding: 0.25rem 0; border-bottom: 1px solid #ddd; margin-bottom: 0.25rem; }
          .bm-clear { cursor: pointer; }
          .bm-item { display: flex; align-items: center; gap: 0.5rem; padding: 0.25rem 0; }
          .bm-link { text-decoration: none; }
          .bm-link:hover { text-decoration: underline; }
          .bm-remove { margin-left: auto; cursor: pointer; }
        `;
        const style = document.createElement('style');
        style.id = 'bm-inline-styles';
        style.textContent = css;
        document.head.appendChild(style);
      }
    }

    #escape(s) {
      return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    }

    /* ---------- Sliding expiration helpers ---------- */

    #touchOnAccess(id) {
      if (!this.slideOnRead) return;
      const key = this.#findKeyById(id);
      if (!key) return;
      const map = this.#cookieMap();
      const enc = map[key];
      if (enc) this.#setCookie(key, enc, this.cookieDays); // slide item
      this.#touchIndex();                                   // slide index
    }

    #touchIndex() {
      if (!this.slideOnRead) return;
      const val = this.#getCookie(this.indexCookieName);
      if (val) this.#setCookie(this.indexCookieName, val, this.cookieDays);
    }

    /* ---------- Cookie-backed storage ---------- */

    #saveIndex() {
      const value = encodeURIComponent(this.keys.join(','));
      this.#setCookie(this.indexCookieName, value, this.cookieDays);
    }

    #loadIndex() {
      const raw = this.#getCookie(this.indexCookieName);
      if (!raw) return [];
      // Slide index on read
      if (this.slideOnRead) this.#setCookie(this.indexCookieName, raw, this.cookieDays);
      return decodeURIComponent(raw)
        .split(',')
        .map(s => s.trim())
        .filter(k => k && k.startsWith(this.itemPrefix));
    }

    #collectItems(keys) {
      const map = this.#cookieMap();
      const items = [];
      let dirty = false;

      for (const key of keys) {
        const enc = map[key];
        if (!enc) { dirty = true; continue; }
        // Slide each item on read
        if (this.slideOnRead) this.#setCookie(key, enc, this.cookieDays);

        try {
          const obj = JSON.parse(decodeURIComponent(enc));
          if (obj && obj.id && (obj.href || obj.id)) {
            items.push({
              id: String(obj.id),
              href: String(obj.href || obj.id),
              name: String(obj.name || ''),
              ts: Number(obj.ts || 0),
            });
          } else {
            dirty = true;
          }
        } catch {
          dirty = true;
        }
      }

      if (dirty) {
        // Rewrite index with only valid keys (also slides)
        const validKeys = [];
        const map2 = this.#cookieMap();
        for (const key of keys) {
          if (map2[key]) validKeys.push(key);
        }
        this.keys = validKeys;
        this.#saveIndex();
      }

      // Touch index at the end of a read pass as well
      this.#touchIndex();

      return items;
    }

    #cookieMap() {
      const map = Object.create(null);
      const parts = document.cookie ? document.cookie.split('; ') : [];
      for (const p of parts) {
        const i = p.indexOf('=');
        if (i > 0) {
          const name = p.slice(0, i);
          const val  = p.slice(i + 1);
          map[name] = val;
        }
      }
      return map;
    }

    #findKeyById(id) {
      const map = this.#cookieMap();
      for (const k of this.keys) {
        const enc = map[k];
        if (!enc) continue;
        try {
          const obj = JSON.parse(decodeURIComponent(enc));
          if (obj && obj.id === id) return k;
        } catch {}
      }
      return '';
    }

    #uniqueKeyFor(id) {
      // 32-bit FNV-1a, base36 output for compact cookie names
      const base = this.itemPrefix + this.#hash36(id);
      let key = base, n = 0;
      const map = this.#cookieMap();
      while (map[key]) {
        try {
          const obj = JSON.parse(decodeURIComponent(map[key]));
          if (obj && obj.id === id) break; // same entry
        } catch {}
        n += 1;
        key = `${base}_${n}`;
      }
      return key;
    }

    #hash36(str) {
      let h = 0x811c9dc5;
      for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
      }
      return (h >>> 0).toString(36);
    }

    #setCookie(name, value, days) {
      const expires = new Date(Date.now() + days * 864e5).toUTCString();
      let cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
      if (location.protocol === 'https:') cookie += '; Secure';
      document.cookie = cookie;
    }

    #getCookie(name) {
      const parts = document.cookie ? document.cookie.split('; ') : [];
      for (const p of parts) {
        if (p.startsWith(name + '=')) return p.slice(name.length + 1);
      }
      return '';
    }

    #deleteCookie(name) {
      let cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
      if (location.protocol === 'https:') cookie += '; Secure';
      document.cookie = cookie;
    }
  }

  // Expose globally
  window.BookmarkList = BookmarkList;
})();
