class TextViewer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    // Attributes
    const hasBgAttr = this.hasAttribute('bg-color');
    const componentBg = hasBgAttr ? this.getAttribute('bg-color') : 'white';
    const wrapperBg = 'var(--light, white)';

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
          padding: 0.5rem 0.75rem;
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
        }
        .content {
          font-family: system-ui, sans-serif;
          font-size: 1rem;
          line-height: 1.3;
          white-space: pre; /* preserve spacing */
          padding-bottom: 1.0rem;
          overflow-x: auto;
          word-break: normal;
          cursor: pointer;
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

    // Content click: expand width only if content is currently overflowing horizontally
    this.contentEl.addEventListener('click', () => {
      // check overflow in the content area
      if (this.contentEl.scrollWidth > this.contentEl.clientWidth + 1) {
        this._adjustWidth(step);
      }
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
