class ImageViewer extends HTMLElement {
  constructor() {
      super();
      this.attachShadow({ mode: 'open' });

      // Get attributes
      this.imgSrc = this.getAttribute('img-src') || '';
      this.imgWidth = this.getAttribute('img-width') || '400';
      this.bgColor = this.getAttribute('bg-color') || 'white';
      // Create shadow DOM structure
      this.shadowRoot.innerHTML = `
          <style>
              :host {
                  display: flex;
                  flex-direction: column;
                  border: 2px solid black;
                  padding: 6px 10px 10px 10px;
                  user-select: none;
                  width: min-content;
                  box-shadow: 5px 5px 5px #999;
                  background-color: ${this.bgColor};
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
              }

              .image {
                  display: block;
                  flex: 0 0 auto;
                  cursor: pointer;
                  transition: transform 0.2s ease-in-out;
              }
          </style>

          <div class="title" part="title"><slot></slot></div>
          <div class="image">
              <img id="img" src="${this.imgSrc}" width="${this.imgWidth}">
          </div>
      `;

      // Event listeners
      this.titleElement = this.shadowRoot.querySelector('.title');
      this.imageElement = this.shadowRoot.querySelector('#img');

      this.titleElement.addEventListener('click', () => this.resizeImage(1 / 1.2));
      this.imageElement.addEventListener('click', () => this.resizeImage(1.2));
  }

  resizeImage(scaleFactor) {
      let currentWidth = parseFloat(window.getComputedStyle(this.imageElement).width);
      this.imageElement.style.width = `${currentWidth * scaleFactor}px`;
  }
}

customElements.define('image-viewer', ImageViewer);
