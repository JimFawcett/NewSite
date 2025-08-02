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
