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
          padding: 0.5rem 0.5rem 0rem 0.5rem;
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
          margin-bottom: 2px;
          line-height: 1.0rem;
          flex-wrap: wrap;
          word-wrap: break-word;
          overflow-wrap: break-word;
          white-space: normal;
          color: var(--dark, #333);
          font-size: 1rem;
          background-color: ${titleBg};
          padding: 0.5rem 0.5rem;
        }
        .content {
          font-family: system-ui, sans-serif;
          font-size: 1rem;
          line-height: 1.3;
          white-space: pre; /* preserve spacing */
          overflow-x: auto;
          word-break: normal;
          cursor: pointer;
          padding-bottom: 0rem;
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

  //   this.contentEl.addEventListener('click', (e) => {
  //     // Debug: see what measurements are at click time
  //     const scrollW = this.contentEl.scrollWidth;
  //     const clientW = this.contentEl.clientWidth;
  //     console.debug('TextViewer overflow check:', { scrollW, clientW });

  //     // Guard: only expand if there is meaningful horizontal overflow
  //     if (scrollW - clientW > 1) {
  //       this._adjustWidth(step);
  //     }
  //   });

    this.contentEl.addEventListener('click', () => {
      this._adjustWidth(step);
    });
  }
  
  MAX_WIDTH_FACTOR = 0.8; // use 0.8 for 80vw; use 0.008 for 0.8 * 1vw if you really meant 0.8px per vw

  _adjustWidth(factor) {
    const rect = this.componentEl.getBoundingClientRect();
    const currentWidth = parseFloat(this.componentEl.style.width) || rect.width;
    let newWidth = Math.max(10, currentWidth * factor);
    this.componentEl.style.width = `${newWidth}px`;

    // Cap to 80% of viewport width:
    const viewportCap = window.innerWidth * MAX_WIDTH_FACTOR;
    if (newWidth > viewportCap) {
      newWidth = viewportCap;
    }

    this.componentEl.style.width = `${newWidth}px`;
  }

    // this.contentEl.addEventListener('click', () => {
    //   const hasOverflow = this.contentEl.scrollWidth - this.contentEl.clientWidth > 1;
    //   if (hasOverflow) {
    //     this._adjustWidth(step);
    //   }
    //   // requestAnimationFrame(() => {
    //   //   const hasOverflow = this.contentEl.scrollWidth - this.contentEl.clientWidth > 1;
    //   //   if (hasOverflow) {
    //   //     this._adjustWidth(step);
    //   //   }
    //   // });
    // });

    // // Content click: expand width only if horizontal overflow exists
    // this.contentEl.addEventListener('click', () => {
    //   // if (this.contentEl.scrollWidth > this.contentEl.clientWidth + 1) {
    //   //   this._adjustWidth(step);
    //   // }
    //   this._adjustWidth(step);
    // });
  // }
  // _adjustWidth(factor) {
  //   const rect = this.componentEl.getBoundingClientRect();
  //   const currentWidth = parseFloat(this.componentEl.style.width) || rect.width;
  //   const newWidth = Math.max(10, currentWidth * factor);
  //   this.componentEl.style.width = `${newWidth}px`;
  // }
}


customElements.define('text-viewer', TextViewer);
