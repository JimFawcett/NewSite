class CodeViewer extends HTMLElement {
  static get observedAttributes() {
    return ['font-family', 'font-size', 'background-color', 'color', 'width', 'height', 'overflow-x'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    const titleBg = this.getAttribute('title-bg-color') || 'transparent';
    const componentBg = this.hasAttribute('bg-color') ? this.getAttribute('bg-color') : 'white';
    const wrapperBg = 'var(--light, white)';

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: inline-block; }
        .wrapper {
          padding: 1rem;
          box-sizing: border-box;
          background-color: ${wrapperBg};
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
          background-color: ${componentBg};
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
          background-color: ${titleBg};
          padding: 0.25rem 0.5rem;
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
          font-size: var(--code-font-size, 0.80rem);
          line-height: 1.4;
          white-space: pre;                       /* no wrap */
          overflow-y: auto;                       /* vertical scroll when tall */
          overflow-x: var(--code-overflow-x, auto);
          width: var(--code-width, auto);         /* attribute: width */
          height: var(--code-height, auto);       /* NEW: attribute: height */
          box-sizing: border-box;
        }

        /* Hide only the projection of slotted raw code */
        slot[name="code"]::slotted(*) { display: none !important; }
      </style>

      <div class="wrapper">
        <div class="component">
          <div class="title" part="title"><slot></slot></div>
          <div class="code"><pre id="code"></pre></div>
          <slot name="code" id="code-slot"></slot>
        </div>
      </div>
    `;

    this.titleElement = this.shadowRoot.querySelector('.title');
    this.preElement   = this.shadowRoot.querySelector('#code');
    this.codeSlot     = this.shadowRoot.querySelector('#code-slot');

    this.titleElement.addEventListener('click', () => this.resizeCode(1 / 1.2));
    this.preElement.addEventListener('click',   () => this.resizeCode(1.2));
    this.codeSlot.addEventListener('slotchange', () => this._updateCodeFromSlot());
  }

  connectedCallback() {
    this._applyStyleProps();
    this._updateCodeFromSlot();
  }

  attributeChangedCallback() {
    this._applyStyleProps();
  }

  resizeCode(scaleFactor) {
    const cs = window.getComputedStyle(this.preElement);
    const currentPx = parseFloat(cs.fontSize || '16');
    this.preElement.style.fontSize = `${currentPx * scaleFactor}px`;
  }

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

  _applyStyleProps() {
    this.style.setProperty('--code-bg', this.getAttribute('background-color') || '#333');
    this.style.setProperty('--code-fg', this.getAttribute('color') || '#eee');
    this.style.setProperty('--code-font-family',
      this.getAttribute('font-family') ||
      'ui-monospace, SFMono-Regular, Menlo, Consolas, "JetBrains Mono", monospace');
    this.style.setProperty('--code-font-size', this.getAttribute('font-size') || '0.85rem');
    this.style.setProperty('--code-width', this.getAttribute('width') || 'auto');
    this.style.setProperty('--code-height', this.getAttribute('height') || 'auto'); // NEW

    const ox = (this.getAttribute('overflow-x') || 'auto').trim();
    this.style.setProperty('--code-overflow-x', ox);
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
