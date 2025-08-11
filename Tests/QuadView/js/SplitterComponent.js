//-----------------------------------------------
// usage example
//-----------------------------------------------
// <!-- usage: defaults to 50/50 split -->
// <splitter-container style="height:300px;">
//   <div slot="first">…left content…</div>
//   <div slot="second">…right content…</div>
// </splitter-container>

// <!-- usage: left pane starts at 200px wide -->
// <splitter-container left-width="200px" style="height:300px;">
//   <div slot="first">…left content…</div>
//   <div slot="second">…right content…</div>
// </splitter-container>
//-----------------------------------------------

// SplitterComponent.js

class SplitterContainer extends HTMLElement {
  static get observedAttributes() { 
    return ['left-width']; 
  }

  constructor() {
    super();
    this._step    = 100;   // click‐resize step in px
    this._minPane = 30;    // minimum pane width in px

    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <style>
        :host { 
          display: block; width:100%;
          box-sizing: border-box; 
        }
        .container {
          box-sizing: border-box;
          display: flex;
          width:100%; height:100%; overflow:hidden;
          border:2px solid var(--dark,#333);
        }
        .pane {
          background:#eee; overflow:auto; user-select:none;
        }
        .pane.first {
          width: var(--left-width,50%);
          flex: 0 0 auto;
        }
        .pane.second {
          flex: 1 1 auto;
        }
        .splitter {
          flex: 0 0 10px;
          margin: 0 0.25rem;
          background: var(--dark,#333);
          cursor: col-resize;
          user-select: none;
        }
      </style>
      <div class="container">
        <div class="pane first"><slot name="first"></slot></div>
        <div class="splitter"></div>
        <div class="pane second"><slot name="second"></slot></div>
      </div>
    `;
  }

  connectedCallback() {
    this._applyLeftWidth();
    this._initDrag();
    this._initClickResize();
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (name === 'left-width') this._applyLeftWidth();
  }

  _applyLeftWidth() {
    const raw = this.getAttribute('left-width');
    if (raw != null) {
      const cleaned = raw.trim().replace(/;$/, '');
      this.style.setProperty('--left-width', cleaned);
    } else {
      this.style.removeProperty('--left-width');
    }
  }

  _initDrag() {
    const splitter  = this.shadowRoot.querySelector('.splitter');
    const firstPane = this.shadowRoot.querySelector('.pane.first');

    splitter.addEventListener('pointerdown', e => {
      e.preventDefault();
      const startX        = e.clientX;
      const startWidth    = firstPane.getBoundingClientRect().width;
      const hostWidth     = this.getBoundingClientRect().width;
      const splitterWidth = splitter.getBoundingClientRect().width;
      const minW = this._minPane;
      const maxW = hostWidth - splitterWidth - this._minPane;

      const onMove = ev => {
        let newW = startWidth + (ev.clientX - startX);
        newW = Math.min(Math.max(newW, minW), maxW);
        firstPane.style.width = `${newW}px`;
      };
      const onUp = () => {
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup',   onUp);
      };

      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup',   onUp);
    });
  }

  _initClickResize() {
    const firstPane  = this.shadowRoot.querySelector('.pane.first');
    const secondPane = this.shadowRoot.querySelector('.pane.second');
    const splitter   = this.shadowRoot.querySelector('.splitter');

    const clampWidth = w => {
      const hostWidth     = this.getBoundingClientRect().width;
      const splitterWidth = splitter.getBoundingClientRect().width;
      const minW = this._minPane;
      const maxW = hostWidth - splitterWidth - this._minPane;
      return Math.min(Math.max(w, minW), maxW);
    };

    // expand on left-pane click
    firstPane.addEventListener('click', () => {
      const curW = firstPane.getBoundingClientRect().width;
      firstPane.style.width = `${clampWidth(curW + this._step)}px`;
    });

    // shrink on right-pane click
    secondPane.addEventListener('click', () => {
      const curW = firstPane.getBoundingClientRect().width;
      firstPane.style.width = `${clampWidth(curW - this._step)}px`;
    });
  }
}

customElements.define('splitter-container', SplitterContainer);
