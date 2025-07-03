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

class SplitterContainer extends HTMLElement {
  static get observedAttributes() { 
    return ['left-width'];
  }

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });

    shadow.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
        }
        .container {
          display: flex;
          width: 100%;
          height: 100%;
          overflow: hidden;
          border: 3px solid var(--dark, #333);
        }
        .pane {
          background: #eee;
          overflow: auto;
          user-select: none;
        }
        .pane.first {
          /* use the custom property or default to 50% */
          width: var(--left-width, 50%);
          flex: 0 0 auto;
        }
        .pane.second {
          flex: 1 1 auto;
        }
        .splitter {
          flex: 0 0 10px;
          margin: 0 0.25rem;
          background: var(--dark, #333);
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
    // apply the initial left-width (if any)
    this._updateLeftWidth(this.getAttribute('left-width'));
    this._initDrag();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'left-width') {
      this._updateLeftWidth(newValue);
    }
  }

  _updateLeftWidth(raw) {
    if (raw != null) {
      // strip whitespace and any trailing semicolons
      const cleaned = raw.trim().replace(/;$/, '');
      // set it on the host so the shadow CSS var picks it up
      this.style.setProperty('--left-width', cleaned);
    } else {
      // no attribute: remove the custom property so CSS falls back to 50%
      this.style.removeProperty('--left-width');
    }
  }

  _initDrag() {
    const splitter = this.shadowRoot.querySelector('.splitter');
    const firstPane = this.shadowRoot.querySelector('.pane.first');

    splitter.addEventListener('pointerdown', e => {
      e.preventDefault();
      this._startX = e.clientX;
      this._startWidth = firstPane.getBoundingClientRect().width;

      this._onPointerMove = this._onPointerMove.bind(this, firstPane);
      this._onPointerUp   = this._onPointerUp.bind(this);

      document.addEventListener('pointermove', this._onPointerMove);
      document.addEventListener('pointerup',   this._onPointerUp);
    });
  }

  _onPointerMove(firstPane, e) {
    const dx = e.clientX - this._startX;
    firstPane.style.width = `${this._startWidth + dx}px`;
  }

  _onPointerUp() {
    document.removeEventListener('pointermove', this._onPointerMove);
    document.removeEventListener('pointerup',   this._onPointerUp);
  }
}

customElements.define('splitter-container', SplitterContainer);

