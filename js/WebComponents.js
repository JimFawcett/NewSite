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
        :host { display: block; width:100%; }
        .container {
          display: flex;
          width:100%; height:100%; overflow:hidden;
          border:3px solid var(--dark,#333);
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

class ImageViewer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    // Get attributes
    this.imgSrc = this.getAttribute('img-src') || '';
    this.imgWidth = this.getAttribute('img-width') || '400';
    const hasBgAttr = this.hasAttribute('bg-color');
    const componentBg = hasBgAttr ? this.getAttribute('bg-color') : 'white';
    const titleBg = this.getAttribute('title-bg-color') || 'transparent';

    // Wrapper background uses --light fallback to white
    const wrapperBg = 'var(--light, white)';

    // Shadow DOM markup
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block; /* allow float and shrink to content */
        }

        .wrapper {
          padding: 1rem; /* outer padding to keep text off the border when floated */
          box-sizing: border-box;
          background-color: ${wrapperBg};
        }

        .component {
          border: 2px solid var(--dark, #333); /* use client's --dark or fallback */
          padding: 0.5rem;
          display: flex;
          flex-direction: column;
          user-select: none;
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
          word-wrap: break-word;
          overflow-wrap: break-word;
          white-space: wrap;
          color: var(--dark, #333); /* title text uses --dark or fallback */
          background-color: ${titleBg};
          padding: 0.25rem 0.5rem;
        }

        .image {
          display: block;
          flex: 0 0 auto;
          cursor: pointer;
          transition: transform 0.2s ease-in-out;
        }

        img {
          display: block;
          height: auto;
          /* removed max-width so explicit width adjustments take effect */
        }
      </style>

      <div class="wrapper">
        <div class="component">
          <div class="title" part="title"><slot></slot></div>
          <div class="image">
            <img id="img" src="${this.imgSrc}" width="${this.imgWidth}">
          </div>
        </div>
      </div>
    `;

    // Event listeners
    this.titleElement = this.shadowRoot.querySelector('.title');
    this.imageElement = this.shadowRoot.querySelector('#img');

    this.titleElement.addEventListener('click', () => this.resizeImage(1 / 1.2));
    this.imageElement.addEventListener('click', () => this.resizeImage(1.2));
  }

  resizeImage(scaleFactor) {
    const currentWidth = parseFloat(window.getComputedStyle(this.imageElement).width);
    this.imageElement.style.width = `${currentWidth * scaleFactor}px`;
  }
}

customElements.define('image-viewer', ImageViewer);

class TextViewer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    // Attributes
    const hasBgAttr = this.hasAttribute('bg-color');
    const componentBg = hasBgAttr ? this.getAttribute('bg-color') : 'white';
    const wrapperBg = 'var(--light, white)';
    const titleBg = this.getAttribute('title-bg-color') || 'transparent';

    // Shadow DOM
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
        }
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
          user-select: none;
          width: ${this.getAttribute('width') || 'max-content'};
          height: ${this.getAttribute('height') || 'max-content'};
          box-shadow: 5px 5px 5px #999;
          box-sizing: border-box;
          background-color: ${componentBg};
          transition: width 0.2s ease;
          overflow: hidden;
        }
        .title {
          display: flex;
          font-family: "Comic Sans MS", cursive, sans-serif;
          font-weight: bold;
          cursor: pointer;
          max-width: 100%;
          margin-bottom: 12px;
          line-height: 1.0rem;
          flex-wrap: wrap;
          word-wrap: break-word;
          overflow-wrap: break-word;
          white-space: normal;
          color: var(--dark, #333);
          font-size: 1rem;
          background-color: ${titleBg};
          padding: 0.25rem 0.5rem;
        }
        .content {
          font-family: system-ui, sans-serif;
          font-size: 1rem;
          line-height: 1.3;
          overflow-x: auto;          /* allow scrolling when clipped */
          cursor: pointer;
          padding-bottom: 1rem;
          /* remove white-space here so <pre> controls it */
          word-break: normal;
        }

        .content pre {
          margin: 0;                 /* avoid additional spacing */
          white-space: pre;          /* preserve formatting */
          overflow: visible;         /* let parent handle scroll */
        }

        .content code {
          display: block;            /* behave like block for Prism */
          white-space: inherit;      /* inherit from <pre> */
        }
      </style>

      <div class="wrapper">
        <div class="component">
          <div class="title" part="title"><slot name="title">Text Viewer</slot></div>
          <div class="content" part="content"><slot name="content"></slot></div>
        </div>
      </div>
    `;

    this.componentEl = this.shadowRoot.querySelector('.component');
    this.titleEl = this.shadowRoot.querySelector('.title');
    this.contentEl = this.shadowRoot.querySelector('.content');

    const step = 1.2;

    // Title click: contract width
    this.titleEl.addEventListener('click', () => {
      this._adjustWidth(1 / step);
    });

    // Content click: expand width only if horizontal overflow exists
    this.contentEl.addEventListener('click', () => {
      this._adjustWidth(step);
    });
  }

  _adjustWidth(factor) {
    const rect = this.componentEl.getBoundingClientRect();
    const currentWidth = parseFloat(this.componentEl.style.width) || rect.width;
    const newWidth = Math.max(10, currentWidth * factor);
    this.componentEl.style.width = `${newWidth}px`;
  }
}

customElements.define('text-viewer', TextViewer);
