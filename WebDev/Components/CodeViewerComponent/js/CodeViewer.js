class CodeViewer extends HTMLElement {
  static get observedAttributes() {
    return [
      'font-family', 'font-size', 'background-color', 'color',
      'width', 'height', 'overflow-x', 'bg-color', 'title-bg-color'
    ];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    // Template with inline CSS (shadow-safe; no external @import)
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
          user-select: text;
          width: min-content;
          box-shadow: 5px 5px 5px #999;
          box-sizing: border-box;
          background-color: var(--component-bg, white);
          transition: background-color 0.2s ease, border-color 0.2s ease;
        }
        .title {
          display: flex;
          font-family: "Comic Sans MS", cursive, sans-serif;
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
          padding: 0.25rem 0.5rem;
          user-select: none;
        }
        .code { display: block; flex: 0 0 auto; cursor: pointer; }

        pre {
          margin: 0;
          padding: 0.75rem 1rem;
          background-color: var(--code-bg, #333);
          color: var(--code-fg, #eee);
          border-radius: 4px;
          font-family: var(--code-font-family,
            ui-monospace, SFMono-Regular, Menlo, Consolas, "JetBrains Mono", monospace);
          font-size: var(--code-font-size, 0.85rem);
          line-height: 1.4;
          white-space: pre;                       /* no wrap */
          overflow-y: auto;                       /* vertical scroll when tall */
          overflow-x: var(--code-overflow-x, auto);
          width: var(--code-width, auto);         /* attribute: width */
          height: var(--code-height, auto);       /* attribute: height */
          box-sizing: border-box;
          transition: width 0.2s ease, font-size 0.2s ease;
        }

        /* Hide only the projection of slotted raw code */
        slot[name="code"]::slotted(*) { display: none !important; }
      </style>

      <div class="wrapper">
        <div class="component" part="component">
          <div class="title" part="title"><slot></slot></div>
          <div class="code"><pre id="code"></pre></div>
          <slot name="code" id="code-slot"></slot>
        </div>
      </div>
    `;

    // Refs
    this.titleElement = this.shadowRoot.querySelector('.title');
    this.preElement   = this.shadowRoot.querySelector('#code');
    this.codeSlot     = this.shadowRoot.querySelector('#code-slot');

    // Internal state
    this._fontRem = null;      // lazily set from computed value
    this._clickTimer = null;   // debouncer for single vs double
    this._clickDelay = 240;    // ms threshold to distinguish dblclick

    // Bind events
    this._bindEvents();
  }

  connectedCallback() {
    this._applyStyleProps();      // map attributes → CSS vars
    this._updateCodeFromSlot();   // load code
    // If width attribute exists, convert it to an inline width on <pre> so we
    // can adjust in pixels consistently afterward.
    this._normalizeInitialWidth();
  }

  attributeChangedCallback() {
    this._applyStyleProps();
  }

  /* -------------------- Events -------------------- */

  _bindEvents() {
    // We use click + dblclick debouncing so actions don't stack.
    // BODY: single → width+, double → font+
    this.preElement.addEventListener('click', (e) => this._debouncedSingle(e, () => this._incWidth()));
    this.preElement.addEventListener('dblclick', (e) => this._onDouble(e, () => this._incFont()));

    // TITLE: single → width-, double → font-
    this.titleElement.addEventListener('click', (e) => this._debouncedSingle(e, () => this._decWidth()));
    this.titleElement.addEventListener('dblclick', (e) => this._onDouble(e, () => this._decFont()));

    // Slot
    this.codeSlot.addEventListener('slotchange', () => this._updateCodeFromSlot());
  }

  _debouncedSingle(event, fn) {
    // If a dblclick happens, it fires after two clicks. We cancel the pending single.
    if (this._clickTimer) clearTimeout(this._clickTimer);
    this._clickTimer = setTimeout(() => {
      this._clickTimer = null;
      fn();
    }, this._clickDelay);
  }

  _onDouble(event, fn) {
    if (this._clickTimer) {
      clearTimeout(this._clickTimer);
      this._clickTimer = null;
    }
    fn();
  }

  /* -------------------- Actions -------------------- */

  _incWidth()  { this._bumpWidth(+1); }
  _decWidth()  { this._bumpWidth(-1); }
  _incFont()   { this._bumpFont(+1); }
  _decFont()   { this._bumpFont(-1); }

  _bumpWidth(direction) {
    // Adjust width in px increments regardless of initial unit.
    const stepPx = 40; // ~ 5ch at typical monospace sizes
    const rect = this.preElement.getBoundingClientRect();
    let w = rect.width;

    w = w + direction * stepPx;
    const minPx = 240; // ~ 20ch-ish, guardrail
    if (w < minPx) w = minPx;

    this.preElement.style.width = `${Math.round(w)}px`;
  }

  _bumpFont(direction) {
    // Lazy init from computed style to respect author CSS
    if (this._fontRem === null) {
      const cs = window.getComputedStyle(this.preElement);
      const px = parseFloat(cs.fontSize || '16');
      this._fontRem = px / 16; // assume root 16px; good enough for relative stepping
    }
    const stepRem = 0.10;
    this._fontRem = Math.max(0.50, +(this._fontRem + direction * stepRem).toFixed(2));
    this.preElement.style.fontSize = `${this._fontRem}rem`;
    // Keep CSS var in sync for any external readers
    this.style.setProperty('--code-font-size', `${this._fontRem}rem`);
  }

  _normalizeInitialWidth() {
    // If author provided width attr (any unit), let it render,
    // then write the computed pixel width back as inline style
    // so subsequent clicks are predictable.
    const attrWidth = this.getAttribute('width');
    if (attrWidth) {
      const rect = this.preElement.getBoundingClientRect();
      if (rect.width > 0) {
        this.preElement.style.width = `${Math.round(rect.width)}px`;
      }
    }
  }

  /* -------------------- Attrs → CSS vars -------------------- */

  _applyStyleProps() {
    // Map legacy attrs
    const bg = this.getAttribute('background-color') || '#333';
    const fg = this.getAttribute('color') || '#eee';
    const fam = this.getAttribute('font-family') ||
      'ui-monospace, SFMono-Regular, Menlo, Consolas, "JetBrains Mono", monospace';
    const fs = this.getAttribute('font-size') || '0.85rem';
    const w  = this.getAttribute('width') || 'auto';
    const h  = this.getAttribute('height') || 'auto';
    const ox = (this.getAttribute('overflow-x') || 'auto').trim();

    // Component surface vars
    const compBg  = this.getAttribute('bg-color') || 'white';
    const titleBg = this.getAttribute('title-bg-color') || 'transparent';

    this.style.setProperty('--code-bg', bg);
    this.style.setProperty('--code-fg', fg);
    this.style.setProperty('--code-font-family', fam);
    this.style.setProperty('--code-font-size', fs);
    this.style.setProperty('--code-width', w);
    this.style.setProperty('--code-height', h);
    this.style.setProperty('--code-overflow-x', ox);

    // For the box/border visuals you lost
    this.style.setProperty('--component-bg', compBg);
    this.style.setProperty('--title-bg', titleBg);
  }

  /* -------------------- Slot → <pre> -------------------- */

  _updateCodeFromSlot() {
    const nodes = this.codeSlot.assignedNodes({ flatten: true });
    let raw = '';
    for (const n of nodes) {
      if (n.nodeType === Node.ELEMENT_NODE && n.tagName === 'TEMPLATE') {
        raw += n.innerHTML ?? '';              // preserves <style>…</style>, etc.
      } else if (n.nodeType === Node.ELEMENT_NODE) {
        raw += n.outerHTML ?? '';
      } else {
        raw += n.textContent ?? '';
      }
    }
    this.preElement.innerHTML = this._escapeHTML(raw);
  }

  _escapeHTML(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}

customElements.define('code-viewer', CodeViewer);
