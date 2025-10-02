class CodeViewer extends HTMLElement {
  static get observedAttributes() {
    return [
      // visuals
      'bg-color', 'title-bg-color', 'background-color', 'color',
      // code sizing/typo
      'width', 'height', 'overflow-x', 'font-family', 'font-size', 'code-padding',
      // prism
      'highlight', 'language',
      // conveniences
      'trim', 'normalize-indent'
    ];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: inline-block; }
        .wrapper {
          padding: 1rem;
          box-sizing: border-box;
          background-color: var(--wrapper-bg, var(--light, white));
        }
        .component {
          border: 2px solid var(--dark, #333);
          padding: 0.5rem;
          display: flex;
          flex-direction: column;
          user-select: none; /* per your app */
          width: min-content;
          box-shadow: 5px 5px 5px #999;
          box-sizing: border-box;
          background-color: var(--component-bg, white);
        }
        .title {
          display: flex;
          font-family: "Comic Sans MS", cursive, sans-serif;
          font-size: 1rem;              /* stable title size */
          font-weight: bold;
          cursor: pointer;
          max-width: 100%;
          margin-bottom: 8px;
          line-height: 1.0rem;
          flex-wrap: wrap;
          overflow-wrap: break-word;
          white-space: wrap;
          color: var(--dark, #333);
          background-color: var(--title-bg, transparent);
          padding: 0.125rem 0.5rem;      /* compact */
        }
        .code { display: block; flex: 0 0 auto; }

        /* Default (non-Prism): show internal pre; hide slotted content */
        #pre-internal { display: block; cursor: pointer; }
        slot[name="code"]::slotted(*) { display: none !important; }

        /* Prism: hide internal pre; show slotted pre/code */
        :host([highlight="prism"]) #pre-internal { display: none; }
        :host([highlight="prism"]) slot[name="code"]::slotted(pre),
        :host([highlight="prism"]) slot[name="code"]::slotted(code) {
          display: block !important;
          cursor: pointer;
        }

        /* Internal pre defaults (non-Prism path) */
        #pre-internal {
          margin: 0;
          /* padding set dynamically to match Prism box */
          background-color: var(--code-bg, #333);
          color: var(--code-fg, #eee);
          border-radius: 4px;
          font-family: inherit;  /* overridden by attribute if provided */
          font-size: inherit;    /* overridden by attribute if provided */
          line-height: 1.4;
          white-space: pre;
          overflow-y: auto;
          overflow-x: var(--code-overflow-x, auto);
          width: var(--code-width, auto);
          height: var(--code-height, auto);
          box-sizing: border-box;
          transition: width 0.2s ease;
          text-align: left;
        }
      </style>

      <div class="wrapper">
        <div class="component" part="component">
          <div class="title" part="title"><slot></slot></div>
          <div class="code">
            <pre id="pre-internal"></pre>
          </div>
          <slot name="code" id="code-slot"></slot>
        </div>
      </div>
    `;

    // Refs
    this.titleEl     = this.shadowRoot.querySelector('.title');
    this.preInternal = this.shadowRoot.querySelector('#pre-internal');
    this.slotEl      = this.shadowRoot.querySelector('#code-slot');

    // Width stepping (single-click only)
    this._originWidthPx   = null;
    this._stepsFromOrigin = 0;
    this._stepPx          = 40;   // ≈ 5ch typical
    this._minPx           = 240;

    // Active display element (internal <pre> or slotted <pre>)
    this._displayEl = this.preInternal;

    // Handlers
    this._onBodyClick  = this._onBodyClick.bind(this);
    this._onTitleClick = this._onTitleClick.bind(this);
  }

  /* lifecycle */

  connectedCallback() {
    this._applyBoxColors();
    this._renderDefaultFromSlot();     // for non-Prism
    this._maybeSetupPrism();           // if Prism mode, ensure <pre><code> + highlight
    this._resolveDisplayEl(true);      // sets _displayEl and normalizes its box
    this._applySizingToDisplay();
    this._applyTypographyToDisplay();
    this._bindEvents();

    this.slotEl.addEventListener('slotchange', () => {
      this._renderDefaultFromSlot();
      this._maybeSetupPrism();
      const changed = this._resolveDisplayEl(true);
      if (changed) this._resetWidthStepping();
      this._applySizingToDisplay();
      this._applyTypographyToDisplay();
    });
  }

  attributeChangedCallback() {
    this._applyBoxColors();
    this._maybeSetupPrism();
    const changed = this._resolveDisplayEl(true);
    if (changed) this._resetWidthStepping();
    this._applySizingToDisplay();
    this._applyTypographyToDisplay();
  }

  /* events (single click only) */

  _bindEvents() {
    this._displayEl.addEventListener('click', this._onBodyClick);
    this.titleEl.addEventListener('click', this._onTitleClick);
  }

  _swapBodyListener(nextEl) {
    if (nextEl === this._displayEl) return;
    this._displayEl.removeEventListener('click', this._onBodyClick);
    this._displayEl = nextEl;
    this._displayEl.addEventListener('click', this._onBodyClick);
  }

  _resetWidthStepping() {
    this._originWidthPx = null;
    this._stepsFromOrigin = 0;
  }

  _onBodyClick()  { this._bumpWidth(+1); }
  _onTitleClick() { this._bumpWidth(-1); }

  _bumpWidth(direction) {
    const el = this._displayEl;
    if (!el) return;

    if (this._originWidthPx == null) {
      const rect = el.getBoundingClientRect();
      this._originWidthPx = rect.width > 0 ? rect.width : 480;
      this._stepsFromOrigin = 0;
    }

    let nextSteps = this._stepsFromOrigin + direction;
    let target = this._originWidthPx + nextSteps * this._stepPx;

    if (target < this._minPx) {
      target = this._minPx;
      nextSteps = Math.ceil((target - this._originWidthPx) / this._stepPx);
    }

    this._stepsFromOrigin = nextSteps;
    el.style.width = `${Math.round(target)}px`;
  }

  /* rendering paths */

  _renderDefaultFromSlot() {
    if (this.getAttribute('highlight') === 'prism') return;

    // Collect raw content from the slot
    const nodes = this.slotEl.assignedNodes({ flatten: true });
    let raw = '';
    for (const n of nodes) {
      if (n.nodeType === Node.ELEMENT_NODE && n.tagName === 'TEMPLATE') {
        raw += n.innerHTML ?? '';
      } else if (n.nodeType === Node.ELEMENT_NODE) {
        raw += n.outerHTML ?? '';
      } else {
        raw += n.textContent ?? '';
      }
    }

    // 1) Optional: trim a fully blank first/last line
    if (this.hasAttribute('trim')) {
      raw = raw.replace(/^\s*\n/, '').replace(/\n\s*$/, '');
    }

    // 2) Optional: normalize common indentation (spaces/tabs) across non-empty lines
    if (this.hasAttribute('normalize-indent')) {
      raw = this._stripCommonIndent(raw);
    }

    // Show literally (escaped) in internal <pre>
    this.preInternal.textContent = raw;
  }

  _maybeSetupPrism() {
    if (this.getAttribute('highlight') !== 'prism') return;

    const lang = (this.getAttribute('language') || '').trim();
    const assigned = this.slotEl.assignedElements({ flatten: true });
    if (!assigned.length) return;

    // Ensure <pre><code> structure (convenience: allow <code slot="code">…</code>)
    let preEl = assigned.find(n => n.tagName === 'PRE');
    let codeEl = assigned.find(n => n.tagName === 'CODE');

    if (!preEl && codeEl) {
      preEl = document.createElement('pre');
      const hostParent = codeEl.parentNode;
      hostParent.replaceChild(preEl, codeEl);
      preEl.appendChild(codeEl);
    } else if (preEl && !preEl.querySelector('code')) {
      const wrap = document.createElement('code');
      while (preEl.firstChild) wrap.appendChild(preEl.firstChild);
      preEl.appendChild(wrap);
      codeEl = wrap;
    } else {
      if (preEl) codeEl = preEl.querySelector('code') || codeEl;
    }

    // Optional: trim & normalize-indent for Prism too (affects codeEl text)
    if (codeEl) {
      let txt = codeEl.textContent ?? '';

      if (this.hasAttribute('trim')) {
        txt = txt.replace(/^\s*\n/, '').replace(/\n\s*$/, '');
      }
      if (this.hasAttribute('normalize-indent')) {
        txt = this._stripCommonIndent(txt);
      }

      codeEl.textContent = txt;
    }

    // Language class on both <pre> and <code> so width in ch uses the same font
    if (lang) {
      const cls = `language-${lang}`;
      if (preEl && !preEl.classList.contains(cls)) preEl.classList.add(cls);
      if (codeEl && !codeEl.classList.contains(cls)) codeEl.classList.add(cls);
    }

    // Highlight (if Prism is loaded)
    if (window.Prism) {
      const codes = [];
      assigned.forEach(el => {
        if (el.tagName === 'CODE') codes.push(el);
        codes.push(...el.querySelectorAll('code'));
      });
      if (codes.length === 0 && preEl) {
        window.Prism.highlightElement(preEl);
      } else {
        codes.forEach(c => window.Prism.highlightElement(c));
      }
    }
  }

  /* choose and normalize the visible code element */

  _resolveDisplayEl(normalize = false) {
    let next = this.preInternal;
    if (this.getAttribute('highlight') === 'prism') {
      const assigned = this.slotEl.assignedElements({ flatten: true });
      const pre = assigned.find(n => n.tagName === 'PRE');
      next = pre || assigned[0] || this.preInternal;
    }

    const changed = next !== this._displayEl;
    this._swapBodyListener(next);
    if (normalize) this._harmonizeDisplayBoxMetrics(next);
    return changed;
  }

  _harmonizeDisplayBoxMetrics(el) {
    if (!el) return;
    const pad = (this.getAttribute('code-padding') || '0.75rem 1rem').trim();

    el.style.boxSizing  = 'border-box';
    el.style.margin     = '0';
    el.style.padding    = pad;
    el.style.lineHeight = '1.4';
    el.style.display    = 'block';
    el.style.cursor     = 'pointer';
    el.style.textAlign  = 'left';

    // Ensure inner <code> (if any) doesn't center, and remove theme margins
    const inner = el.querySelector && el.querySelector('code');
    if (inner) {
      inner.style.display   = 'block';
      inner.style.textAlign = 'left';
      inner.style.margin    = '0';
    }
  }

  /* styling helpers */

  _applyBoxColors() {
    const compBg  = this.getAttribute('bg-color') || 'white';
    const titleBg = this.getAttribute('title-bg-color') || 'transparent';
    const codeBg  = this.getAttribute('background-color') || '#333';
    const codeFg  = this.getAttribute('color') || '#eee';
    this.style.setProperty('--component-bg', compBg);
    this.style.setProperty('--title-bg', titleBg);
    this.style.setProperty('--code-bg', codeBg);
    this.style.setProperty('--code-fg', codeFg);
  }

  _applySizingToDisplay() {
    const width  = this.getAttribute('width');       // e.g., "50ch", "25rem", "520px"
    const height = this.getAttribute('height') || null;
    const ox     = (this.getAttribute('overflow-x') || 'auto').trim();

    // Keep CSS vars in sync for internal path
    this.style.setProperty('--code-width', width || 'auto');
    this.style.setProperty('--code-height', height || 'auto');
    this.style.setProperty('--code-overflow-x', ox);

    // Apply directly to the visible element (internal or slotted)
    const el = this._displayEl;
    if (!el) return;
    el.style.width = width ? width : '';
    el.style.height = height ? height : '';
    el.style.overflowX = ox;
  }

  _applyTypographyToDisplay() {
    const fam = this.getAttribute('font-family');
    const fsz = this.getAttribute('font-size');

    const el = this._displayEl;
    if (!el) return;

    // In Prism mode, width is on <pre>, highlighting is on <code> — set both.
    const pre  = el.tagName === 'PRE' ? el : (el.closest && el.closest('pre')) || null;
    const code = (el.querySelector && el.querySelector('code')) || (el.tagName === 'CODE' ? el : null);

    const targets = new Set([el]);
    if (pre)  targets.add(pre);
    if (code) targets.add(code);

    targets.forEach(t => {
      if (fam && fam.trim()) t.style.fontFamily = fam; else t.style.removeProperty('font-family');
      if (fsz && fsz.trim()) t.style.fontSize   = fsz; else t.style.removeProperty('font-size');
    });
  }

  /* utilities */

  _stripCommonIndent(text) {
    // Split, but do NOT add or remove any extra newline beyond explicit trim step.
    const lines = text.split('\n');

    // Measure leading whitespace (spaces or tabs) on non-empty lines
    const indentLengths = [];
    for (const l of lines) {
      if (l.trim().length === 0) continue;
      const m = l.match(/^[ \t]*/);
      indentLengths.push(m ? m[0].length : 0);
    }
    if (indentLengths.length === 0) return text;

    // Find the smallest non-zero indent; if all are zero, nothing to strip
    const nonZero = indentLengths.filter(n => n > 0);
    if (nonZero.length === 0) return text;
    const minIndent = Math.min(...nonZero);

    // Remove up to minIndent leading whitespace from every line
    const re = new RegExp(`^[ \\t]{0,${minIndent}}`);
    const out = lines.map(l => l.replace(re, '')).join('\n');

    return out;
  }
}

customElements.define('code-viewer', CodeViewer);
