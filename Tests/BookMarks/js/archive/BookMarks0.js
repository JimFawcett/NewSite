/* BookmarkList — minimal, dependency-free
   Usage:
     const bl = new BookmarkList('#bookmarks');   // or pass an Element
     bl.add(location.href);                       // add current page
     // You can also call bl.add('https://example.com/docs/page.html');
*/
(() => {
  class BookmarkList {
    constructor(container, opts = {}) {
      this.el = (typeof container === 'string')
        ? document.querySelector(container)
        : container;

      if (!this.el) throw new Error('BookmarkList: container not found');

      this.storageKey = opts.storageKey || 'bookmark-list';
      this.max = Number.isFinite(opts.max) ? opts.max : 200;

      this.items = this.#load();
      this.#render();

      // Event delegation
      this.el.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;

        if (btn.dataset.action === 'clear') {
          this.clear();
        } else if (btn.dataset.action === 'remove') {
          const li = btn.closest('li[data-id]');
          if (li) this.remove(li.dataset.id);
        }
      });
    }

    /** Public API **/
    add(url) {
      const { id, href, name } = this.#makeEntry(url);
      // remove any existing with same id
      this.items = this.items.filter(item => item.id !== id);
      // add to top
      this.items.unshift({ id, href, name, ts: Date.now() });
      // enforce max length
      if (this.items.length > this.max) this.items.length = this.max;
      this.#save();
      this.#render();
    }

    remove(id) {
      const before = this.items.length;
      this.items = this.items.filter(item => item.id !== id);
      if (this.items.length !== before) {
        this.#save();
        this.#render();
      }
    }

    clear() {
      this.items = [];
      this.#save();
      this.#render();
    }

    toJSON() { return this.items.slice(); }

    /** Internals **/
    #makeEntry(inputUrl) {
      const u = this.#toURL(inputUrl);
      // identity: origin + pathname (no trailing slash) + search (ignore hash)
      const pathname = u.pathname.replace(/\/+$/, '') || '/';
      const id = u.origin + pathname + (u.search || '');
      const href = id; // normalized link without hash
      const name = this.#pageNameFrom(u);
      return { id, href, name };
    }

    #pageNameFrom(u) {
      // Prefer last non-empty path segment → strip extension → decode
      let seg = u.pathname.split('/').filter(Boolean).pop() || '';
      if (!seg) return u.hostname; // e.g., homepage
      try { seg = decodeURIComponent(seg); } catch { /* noop */ }
      seg = seg.replace(/\.[a-z0-9]+$/i, ''); // drop .html, .php, etc.
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

      // Minimal styles (optional): add once
      if (!document.getElementById('bm-inline-styles')) {
        const css = `
          .bm-wrap { font: 14px/1.4 system-ui, sans-serif; }
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

    #save() {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(this.items));
      } catch { /* ignore storage errors (private mode, quota, etc.) */ }
    }

    #load() {
      try {
        const raw = localStorage.getItem(this.storageKey);
        if (!raw) return [];
        const arr = JSON.parse(raw);
        if (!Array.isArray(arr)) return [];
        // Defensive: ensure required fields exist
        return arr.map(x => ({
          id: String(x.id || ''),
          href: String(x.href || x.id || ''),
          name: String(x.name || ''),
          ts: Number(x.ts || Date.now()),
        })).filter(x => x.id && x.href);
      } catch { return []; }
    }
  }

  // expose globally
  window.BookmarkList = BookmarkList;
})();
