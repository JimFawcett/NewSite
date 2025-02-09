class ImageViewer extends HTMLElement {
  constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this.scaleFactor = 1;

      this.titleText = this.getAttribute('title') || 'Image Viewer';
      this.imgSrc = this.getAttribute('src') || '';
      this.imgWidth = parseInt(this.getAttribute('width')) || 200;
      this.imgHeight = parseInt(this.getAttribute('height')) || 200;

      this.shadowRoot.innerHTML = `
          <div class="viewer">
              <div class="title">${this.titleText}</div>
              <img class="image" src="${this.imgSrc}" width="${this.imgWidth}" height="${this.imgHeight}">
          </div>
      `;

      this.viewerElement = this.shadowRoot.querySelector('.viewer');
      this.imageElement = this.shadowRoot.querySelector('.image');
      this.titleElement = this.shadowRoot.querySelector('.title');
      
      this.viewerElement.addEventListener('click', () => this.enlargeViewer());
      this.titleElement.addEventListener('click', (event) => {
          event.stopPropagation(); // Prevent conflicting clicks
          this.shrinkViewer();
      });
  }

  enlargeViewer() {
      this.scaleFactor *= 1.2;
      this.updateSize();
  }

  shrinkViewer() {
      this.scaleFactor /= 1.2;
      this.updateSize();
  }

  updateSize() {
      this.viewerElement.style.transform = `scale(${this.scaleFactor})`;
  }
}

customElements.define('image-viewer', ImageViewer);
