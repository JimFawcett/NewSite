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
          width: var(--code-width, auto);         /* attribute: width (initial only) */
          height: var(--code-height, auto);
          box-sizing: border-box;
          transition: width 0.2s ease, font-size 0.2s ease;
          user-select: none;
          -webkit-user-select: none;
          -moz-user-select: none;
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

    // ---- State ----
    // Font stepping — computed from actual root size to avoid a large first jump
    this._fontRem = null;              // lazily init from computed (px / rootPx)
    this._fontStepRem = 0.10;
    this._fontMinRem  = 0.50;

    // Width stepping — symmetric around first-interaction width
    this._originWidthPx = null;        // set on first width action
    this._stepsFromOrigin = 0;         // integer delta
    this._stepPx = 40;                 // ≈5ch typical
    this._minPx  = 240;                // guardrail

    // Click handling (single vs double with event.detail)
    this._clickDelay = 400;            // ms
    this._bodyTimer = null;
    this._titleTimer = null;

    this._bindEvents();
  }

  connectedCallback() {
    this._applyStyleProps();
    this._updateCodeFromSlot();
  }

  attributeChangedCallback() {
    this._applyStyleProps();
  }

  /* =================== Events =================== */

  _bindEvents() {
    // Body: single → width+, double → font+
    this._wireClickVsDouble(
      this.preElement,
      () => this._incWidth(),
      () => this._incFont(),
      'body'
    );

    // Title: single → width-, double → font-
    this._wireClickVsDouble(
      this.titleElement,
      () => this._decWidth(),
      () => this._decFont(),
      'title'
    );

    this.codeSlot.addEventListener('slotchange', () => this._updateCodeFromSlot());
  }

  _wireClickVsDouble(el, onSingle, onDouble, key) {
    el.addEventListener('click', (e) => {
      const timerKey = key === 'body' ? '_bodyTimer' : '_titleTimer';

      if (e.detail === 1) {
        if (this[timerKey]) clearTimeout(this[timerKey]);
        this[timerKey] = setTimeout(() => {
          this[timerKey] = null;
          onSingle();
        }, this._clickDelay);
        return;
      }

      if (e.detail === 2) {
        if (this[timerKey]) {
          clearTimeout(this[timerKey]);
          this[timerKey] = null;
        }
        onDouble();
      }
    });
  }

  /* =================== Actions =================== */

  _incWidth()  { this._bumpWidth(+1); }
  _decWidth()  { this._bumpWidth(-1); }
  _incFont()   { this._bumpFont(+1); }
  _decFont()   { this._bumpFont(-1); }

  _bumpWidth(direction) {
    // Lazily capture the true starting width at first width change.
    if (this._originWidthPx == null) {
      const rect = this.preElement.getBoundingClientRect();
      this._originWidthPx = rect.width > 0 ? rect.width : 480;
      this._stepsFromOrigin = 0;
    }

    let nextSteps = this._stepsFromOrigin + direction;
    let target = this._originWidthPx + nextSteps * this._stepPx;

    // Enforce minimum; adjust steps to keep symmetry
    if (target < this._minPx) {
      target = this._minPx;
      nextSteps = Math.ceil((target - this._originWidthPx) / this._stepPx);
    }

    this._stepsFromOrigin = nextSteps;
    this.preElement.style.width = `${Math.round(target)}px`;
  }

  _bumpFont(direction) {
    // Initialize from computed font-size using the actual document root size.
    if (this._fontRem === null) {
      const prePx  = parseFloat(getComputedStyle(this.preElement).fontSize) || 16;
      const rootPx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      this._fontRem = prePx / rootPx;
    }

    // Exact 0.10rem steps, with rounding to 3 decimals to avoid float drift.
    const next = this._fontRem + direction * this._fontStepRem;
    this._fontRem = Math.max(this._fontMinRem, Math.round(next * 1000) / 1000);

    this.preElement.style.fontSize = `${this._fontRem}rem`;
    // Keep CSS var in sync for external readers
    this.style.setProperty('--code-font-size', `${this._fontRem}rem`);
  }

  /* =========== Attributes → CSS Variables =========== */

  _applyStyleProps() {
    const bg  = this.getAttribute('background-color') || '#333';
    const fg  = this.getAttribute('color') || '#eee';
    const fam = this.getAttribute('font-family') ||
      'ui-monospace, SFMono-Regular, Menlo, Consolas, "JetBrains Mono", monospace';
    const fs  = this.getAttribute('font-size') || '0.85rem';
    const w   = this.getAttribute('width') || 'auto';
    const h   = this.getAttribute('height') || 'auto';
    const ox  = (this.getAttribute('overflow-x') || 'auto').trim();

    const compBg  = this.getAttribute('bg-color') || 'white';
    const titleBg = this.getAttribute('title-bg-color') || 'transparent';

    this.style.setProperty('--code-bg', bg);
    this.style.setProperty('--code-fg', fg);
    this.style.setProperty('--code-font-family', fam);
    this.style.setProperty('--code-font-size', fs);
    this.style.setProperty('--code-width', w);
    this.style.setProperty('--code-height', h);
    this.style.setProperty('--code-overflow-x', ox);

    this.style.setProperty('--component-bg', compBg);
    this.style.setProperty('--title-bg', titleBg);
  }

  /* =========== Slot → <pre> (escaped) =========== */

  _updateCodeFromSlot() {
    const nodes = this.codeSlot.assignedNodes({ flatten: true });
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
