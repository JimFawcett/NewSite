/*
  Horizontal and Vertical Spacer Components
  - content may be stated in any of the conventional space metrics.
  - space may be either declared as element content or as attributes.
*/
(() => {

  const numberRE = new RegExp('^\s*\d+(?:\.\d+)?\s*$'); // 12 or 12.5 (no unit)

  function asCssLength(val, fallback = '1rem') {
    if (val == null) return fallback;
    const s = String(val).trim();
    if (s === '') return fallback;
    if (numberRE.test(s)) return `${s}rem`; // unitless -> rems
    return s; // assume valid CSS length or var()/calc()
  }

  function pickSize(el, kind /* 'h'|'v' */) {
    // 1) attribute
    const attr = el.getAttribute('size');
    if (attr && attr.trim() !== '') return asCssLength(attr);
    // 2) inner text (do NOT clear; hidden via shadow <slot>)
    const inline = (el.textContent || '').trim();
    if (inline) return asCssLength(inline);
    // 3) CSS var on the host
    const varName = (kind === 'h') ? '--h-space-size' : '--v-space-size';
    const cssVar = el.style.getPropertyValue(varName) || getComputedStyle(el).getPropertyValue(varName);
    if (cssVar && cssVar.trim() !== '') return asCssLength(cssVar);
    // 4) default
    return '1rem';
  }

  function pickThickness(el) {
    // attribute > CSS var > default 0
    const attr = el.getAttribute('thickness');
    if (attr && attr.trim() !== '') return asCssLength(attr, '0');
    const cssVar = el.style.getPropertyValue('--h-thickness') || getComputedStyle(el).getPropertyValue('--h-thickness');
    if (cssVar && cssVar.trim() !== '') return asCssLength(cssVar, '0');
    return '0';
  }

  function defineHSpace(tagName) {
    if (customElements.get(tagName)) return;
    class HSpace extends HTMLElement {
      static get observedAttributes() { return ['size', 'block', 'thickness']; }
      #mo;
      constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        // Host paints the gap; optional thickness shows background/borders if desired.
        this.shadowRoot.innerHTML = `
          <style>
            :host {
              display: inline-block;
              width: var(--_h-size, 1rem);
              height: var(--_h-thickness, 0); /* default 0 to avoid layout shift */
              line-height: 0;
              color: inherit;
              background-color: inherit;
              font: inherit;
            }
            /* Hide any light-DOM children assigned to the default slot */
            slot { display: none !important; }
          </style>
          <slot></slot>
        `;
        this.setAttribute('aria-hidden', 'true');
        this.setAttribute('role', 'presentation');
        this.#mo = new MutationObserver(() => this.#update());
      }
      connectedCallback() {
        this.#mo.observe(this, { characterData: true, childList: true, subtree: true });
        this.#update();
      }
      disconnectedCallback() { this.#mo.disconnect(); }
      attributeChangedCallback() { this.#update(); }
      #update() {
        // Display mode toggle
        this.style.display = this.hasAttribute('block') ? 'block' : 'inline-block';
        // Size + thickness
        const size = pickSize(this, 'h');
        const thick = pickThickness(this);
        this.shadowRoot.host.style.setProperty('--_h-size', size);
        this.shadowRoot.host.style.setProperty('--_h-thickness', thick);
      }
      // JS property sugar
      get size() { return this.getAttribute('size'); }
      set size(v) { if (v == null) this.removeAttribute('size'); else this.setAttribute('size', v); }
      get thickness() { return this.getAttribute('thickness'); }
      set thickness(v) { if (v == null) this.removeAttribute('thickness'); else this.setAttribute('thickness', v); }
    }
    customElements.define(tagName, HSpace);
  }

  function defineVSpace(tagName) {
    if (customElements.get(tagName)) return;
    class VSpace extends HTMLElement {
      static get observedAttributes() { return ['size', 'inline']; }
      #mo;
      constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        // Host carries the height directly.
        this.shadowRoot.innerHTML = `
          <style>
            :host {
              display: block;
              height: var(--_v-size, 1rem);
              color: inherit;
              background-color: inherit;
              font: inherit;
            }
            slot { display: none !important; }
          </style>
          <slot></slot>
        `;
        this.setAttribute('aria-hidden', 'true');
        this.setAttribute('role', 'presentation');
        this.#mo = new MutationObserver(() => this.#update());
      }
      connectedCallback() {
        this.#mo.observe(this, { characterData: true, childList: true, subtree: true });
        this.#update();
      }
      disconnectedCallback() { this.#mo.disconnect(); }
      attributeChangedCallback() { this.#update(); }
      #update() {
        // Display mode toggle (inline vertical spacer)
        this.style.display = this.hasAttribute('inline') ? 'inline-block' : 'block';
        // Size
        const size = pickSize(this, 'v');
        this.shadowRoot.host.style.setProperty('--_v-size', size);
      }
      // JS property sugar
      get size() { return this.getAttribute('size'); }
      set size(v) { if (v == null) this.removeAttribute('size'); else this.setAttribute('size', v); }
    }
    customElements.define(tagName, VSpace);
  }

  // Define primary tags and short aliases
  defineHSpace('h-space');
  defineHSpace('h-s');
  defineVSpace('v-space');
  defineVSpace('v-s');
})();
