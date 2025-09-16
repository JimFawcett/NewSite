// components.js (ES module)

/* =========================================
   Tiny utility to create CSSStyleSheet
========================================= */
const sheet = (css) => {
  const s = new CSSStyleSheet();
  s.replaceSync(css);
  return s;
};

/* =========================================
   <x-site-header>
   Attributes:
     title        - string (optional if using slots)
     sticky       - boolean (optional) sticky to top
     dense        - boolean (optional) shorter header
   Slots:
     name="left" | (default) | name="right"
========================================= */
class XSiteHeader extends HTMLElement {
  static observedAttributes = ["title", "sticky", "dense"];
  #root;
  constructor() {
    super();
    this.#root = this.attachShadow({ mode: "open" });
    this.#root.adoptedStyleSheets = [
      sheet(`
        :host {
          --header-bg: var(--header-bg, linear-gradient(180deg,#f7f7fa,#ececf2));
          --header-fg: var(--header-fg, #222);
          --header-height: var(--header-height, 3.5rem);
          --header-height-dense: var(--header-height-dense, 2.75rem);
          --pad-x: var(--header-pad-x, 1rem);
          --border: var(--header-border, 1px solid #d3d3de);
          display:block;
          color: var(--header-fg);
          font: 600 1rem/1.2 system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
        }
        header {
          display:flex; align-items:center; justify-content:space-between;
          padding: 0 var(--pad-x); gap: 1rem;
          background: var(--header-bg);
          border-bottom: var(--border);
          height: var(--_height);
          box-sizing: border-box;
        }
        :host([sticky]) header { position: sticky; top: 0; z-index: 10; }
        :host(:not([dense])) { --_height: var(--header-height); }
        :host([dense]) { --_height: var(--header-height-dense); }
        .side { display:flex; align-items:center; gap:.5rem; min-width:0; }
        ::slotted(*) { white-space: nowrap; }
        .title { min-width:0; overflow:hidden; text-overflow:ellipsis; }
        .title h1 {
          margin:0; font: 700 1.15rem/1 system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
        }
      `)
    ];
    this.#root.innerHTML = `
      <header role="banner" part="header">
        <div class="side"><slot name="left"></slot></div>
        <div class="title"><slot><h1>${this.getAttribute("title") ?? ""}</h1></slot></div>
        <div class="side"><slot name="right"></slot></div>
      </header>
    `;
  }
  attributeChangedCallback() {
    // No-op; CSS reacts to attributes
  }
}
customElements.define("x-site-header", XSiteHeader);

/* =========================================
   <x-two-panel>
   Attributes:
     left         - CSS length or % (default 18rem)
     gap          - CSS length (default 1rem)
     stack-bp     - CSS length for stack breakpoint (default 900px)
   Slots:
     name="left" | name="right"
   Behavior:
     - Fills parent (height:100%) if parent lets it.
     - Each panel scrolls independently when overflow.
========================================= */
class XTwoPanel extends HTMLElement {
  static observedAttributes = ["left", "gap", "stack-bp"];
  #root;
  constructor() {
    super();
    this.#root = this.attachShadow({ mode: "open" });
    this.#root.adoptedStyleSheets = [
      sheet(`
        :host {
          --left-width: var(--two-left, 18rem);
          --gap: var(--two-gap, 1rem);
          --stack-bp: var(--two-stack-bp, 900px);
          --border: var(--two-border, 1px solid #d8d8e0);
          --radius: var(--two-radius, 12px);
          --bg: var(--two-bg, #fff);
          display:block; height:100%;
          box-sizing: border-box;
        }
        .wrap {
          display:grid;
          grid-template-columns: var(--left-width) 1fr;
          column-gap: var(--gap);
          height:100%;
          background: var(--bg);
          border: var(--border);
          border-radius: var(--radius);
          padding: .75rem;
          box-sizing: border-box;
          overflow: hidden; /* keep scroll inside panels */
        }
        .panel {
          min-width: 0; /* allow shrink in grid */
          min-height: 0; /* enable children scrolling */
          overflow: auto;
          border: 1px solid #ececf2;
          border-radius: 10px;
          padding: .75rem;
          box-sizing: border-box;
          background: #fff;
        }
        @media (max-width: var(--stack-bp)) {
          .wrap {
            grid-template-columns: 1fr;
            row-gap: var(--gap);
          }
        }
      `)
    ];
    this.#root.innerHTML = `
      <div class="wrap" part="wrap" role="group" aria-label="Two panel content">
        <section class="panel" part="left-panel"><slot name="left"></slot></section>
        <section class="panel" part="right-panel"><slot name="right"></slot></section>
      </div>
    `;
  }
  connectedCallback() { this.#apply(); }
  attributeChangedCallback() { this.#apply(); }
  #apply() {
    const left = this.getAttribute("left")?.trim() || "18rem";
    const gap  = this.getAttribute("gap")?.trim() || "1rem";
    const bp   = this.getAttribute("stack-bp")?.trim() || "900px";
    this.style.setProperty("--two-left", left);
    this.style.setProperty("--two-gap", gap);
    this.style.setProperty("--two-stack-bp", bp);
  }
}
customElements.define("x-two-panel", XTwoPanel);

/* =========================================
   <x-one-panel>
   Attributes:
     pad          - CSS length (default .75rem)
   Slots:
     (default)
   Behavior:
     - Fills parent (height:100%) if parent lets it.
     - Internal scrolling for overflow.
========================================= */
class XOnePanel extends HTMLElement {
  static observedAttributes = ["pad"];
  #root;
  constructor() {
    super();
    this.#root = this.attachShadow({ mode: "open" });
    this.#root.adoptedStyleSheets = [
      sheet(`
        :host {
          --pad: var(--one-pad, .75rem);
          --border: var(--one-border, 1px solid #d8d8e0);
          --radius: var(--one-radius, 12px);
          display:block; height:100%;
          box-sizing:border-box;
        }
        .wrap {
          height:100%;
          border: var(--border);
          border-radius: var(--radius);
          padding: var(--pad);
          overflow:auto;
          box-sizing:border-box;
          background:#fff;
        }
      `)
    ];
    this.#root.innerHTML = `
      <div class="wrap" part="wrap" role="region" aria-label="One panel content">
        <slot></slot>
      </div>
    `;
  }
  connectedCallback() { this.#apply(); }
  attributeChangedCallback() { this.#apply(); }
  #apply() {
    const pad = this.getAttribute("pad")?.trim() || ".75rem";
    this.style.setProperty("--one-pad", pad);
  }
}
customElements.define("x-one-panel", XOnePanel);
