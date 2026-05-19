/* ============================================================================
  <code-viewer> — Reorganized for clarity & maintainability
  - Behavior preserved from the original.
  - Structure: constants → template → class with sections.
  - Single update pipeline (_updateAll) used by lifecycle + attribute changes.
============================================================================ */

/* ----------------------------- Constants ---------------------------------- */

const CV_STYLE = /* css */ `
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
    font-size: 1rem;            /* stable title size */
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
    padding: 0.125rem 0.5rem;   /* compact */
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
`;

const CV_TEMPLATE = /* html */ `
  <style>${CV_STYLE}</style>
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

/* ============================================================================
  Component
============================================================================ */
class CodeViewer extends HTMLElement {
  /* ------------------------ Observed attributes --------------------------- */
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

  /* ------------------------------ Setup ----------------------------------- */
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = CV_TEMPLATE;

    // Refs
    this._els = {
      title: this.shadowRoot.querySelector('.title'),
      preInternal: this.shadowRoot.querySelector('#pre-internal'),
      slot: this.shadowRoot.querySelector('#code-slot'),
    };

    // Width stepping (single-click only)
    this._originWidthPx = null;
    this._stepsFromOrigin = 0;
    this._stepPx = 40;        // ≈ 5ch typical
    this._minPx  = 240;

    // Active display element (internal <pre> or slotted <pre>)
    this._displayEl = this._els.preInternal;

    // Bind handlers once
    this._onBodyClick  = this._onBodyClick.bind(this);
    this._onTitleClick = this._onTitleClick.bind(this);
    this._onSlotChange = this._onSlotChange.bind(this);
  }

  /* ---------------------------- Lifecycle --------------------------------- */
  connectedCallback() {
    // Initial render/update cycle
    this._updateAll({ resetWidth: true, normalizeBox: true });

    // React to slot content changes
    this._els.slot.addEventListener('slotchange', this._onSlotChange);

    // Bind UI events (title toggles width down; body toggles width up)
    this._bindDisplayListeners();
    this._els.title.addEventListener('click', this._onTitleClick);
  }

  disconnectedCallback() {
    // Clean up event listeners
    this._unbindDisplayListeners();
    this._els.title.removeEventListener('click', this._onTitleClick);
    this._els.slot.removeEventListener('slotchange', this._onSlotChange);
  }

  attributeChangedCallback() {
    // Attributes affect visuals/typography/highlighting → run the pipeline
    this._updateAll({ maybeResetWidth: true, normalizeBox: true });
  }

  /* --------------------------- Public-ish flow ---------------------------- */
  /**
   * Central update pipeline used by lifecycle & attribute changes.
   * Options:
   *   - resetWidth: force width stepping baseline reset
   *   - maybeResetWidth: reset only if display element changed
   *   - normalizeBox: re-harmonize padding/box metrics of the visible element
   */
  _updateAll({ resetWidth = false, maybeResetWidth = false, normalizeBox = false } = {}) {
    this._applyBoxColors();

    // Non-prism path renders internal <pre> from slot. Prism path normalizes slot.
    this._renderDefaultFromSlotIfNeeded();
    this._maybeSetupPrism();

    // Choose which element is visible and optionally normalize its box
    const changed = this._resolveDisplayEl(normalizeBox);

    // Reset width stepping if requested or if the visible element changed
    if (resetWidth || (maybeResetWidth && changed)) this._resetWidthStepping();

    // Apply width/height/overflow + typography to the currently visible element
    this._applySizingToDisplay();
    this._applyTypographyToDisplay();
  }

  /* ----------------------------- Events ----------------------------------- */
  _bindDisplayListeners() {
    if (!this._displayEl) return;
    this._displayEl.addEventListener('click', this._onBodyClick);
  }

  _unbindDisplayListeners() {
    if (!this._displayEl) return;
    this._displayEl.removeEventListener('click', this._onBodyClick);
  }

  _swapBodyListener(nextEl) {
    if (nextEl === this._displayEl) return;
    this._unbindDisplayListeners();
    this._displayEl = nextEl;
    this._bindDisplayListeners();
  }

  _onSlotChange() {
    // Slot content changed → re-run pipeline
    this._updateAll({ maybeResetWidth: true, normalizeBox: true });
  }

  // Click body to widen; click title to narrow (single-step)
  _onBodyClick()  { this._bumpWidth(+1); }
  _onTitleClick() { this._bumpWidth(-1); }

  _resetWidthStepping() {
    this._originWidthPx = null;
    this._stepsFromOrigin = 0;
  }

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

  /* --------------------------- Render paths -------------------------------- */
  /**
   * Non-Prism mode: gather slot content (raw/template/text), optionally trim and
   * normalize indent, then place literal text into internal <pre>.
   */
  _renderDefaultFromSlotIfNeeded() {
    if (this.getAttribute('highlight') === 'prism') return;

    const nodes = this._els.slot.assignedNodes({ flatten: true });
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

    if (this.hasAttribute('trim')) {
      raw = raw.replace(/^\s*\n/, '').replace(/\n\s*$/, '');
    }
    if (this.hasAttribute('normalize-indent')) {
      raw = this._stripCommonIndent(raw);
    }

    this._els.preInternal.textContent = raw;
  }

  /**
   * Prism mode: ensure <pre><code> presence, apply trim/indent, language classes,
   * and trigger Prism highlighting when available.
   */
  _maybeSetupPrism() {
    if (this.getAttribute('highlight') !== 'prism') return;

    const lang = (this.getAttribute('language') || '').trim();
    const assigned = this._els.slot.assignedElements({ flatten: true });
    if (!assigned.length) return;

    // Ensure <pre><code>
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

    // Apply convenience transforms to code text as needed
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

    // Language class on both <pre> and <code> (helps width-in-ch & consistent fonts)
    if (lang) {
      const cls = `language-${lang}`;
      if (preEl && !preEl.classList.contains(cls)) preEl.classList.add(cls);
      if (codeEl && !codeEl.classList.contains(cls)) codeEl.classList.add(cls);
    }

    // Highlight if Prism is loaded
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

  /* ----------------- Choose & normalize the visible element ---------------- */
  _resolveDisplayEl(normalize = false) {
    let next = this._els.preInternal;
    if (this.getAttribute('highlight') === 'prism') {
      const assigned = this._els.slot.assignedElements({ flatten: true });
      const pre = assigned.find(n => n.tagName === 'PRE');
      next = pre || assigned[0] || this._els.preInternal;
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

  /* ----------------------------- Styling ---------------------------------- */
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

  /* ----------------------------- Utilities -------------------------------- */
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
    return lines.map(l => l.replace(re, '')).join('\n');
  }
}

/* --------------------------- Registration --------------------------------- */
customElements.define('code-viewer', CodeViewer);
