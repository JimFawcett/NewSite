/*
  GridViewerComponent.js
  - defines W3C component for two side-by-side panels with
    a grab-bar for resizing
*/

class ResizablePanels extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    // Get min-width attribute (ensure it's a valid number)
    this.minWidth = parseInt(this.getAttribute('min-width')) || 0;

    // Initial panel sizes (defaults to 50/50 split)
    this.leftPanelWidth = 50;
    this.rightPanelWidth = 50;

    // Create template
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          --dividerWidth: 6px;

          display: block;
          width: 100%;
          height: 100%;
          border: 2px solid #333;
          box-sizing: border-box;
        }

        .container {
          display: grid;
          grid-template-columns: minmax(${this.minWidth}px, ${this.leftPanelWidth}%) var(--dividerWidth) minmax(${this.minWidth}px, ${this.rightPanelWidth}%);
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        .panel {
          display: flex;
          flex: 1;
          align-items: flex-start;
          justify-content: left;
          padding: 0px;
          overflow: auto;
          user-select: none;
        }

        .panel1 {
          background-color: #fefefa;
        }

        .panel2 {
          background-color: #fefefa;
        }

        .divider {
          width: var(--dividerWidth);
          height: 100%;
          cursor: ew-resize;
          background-color: gray;
          transition: background-color 0.2s;
        }

        .divider:hover {
          background-color: darkgray;
        }
      </style>
        
      <div class="container">
        <div class="panel panel1"><slot name="left"></slot></div>
        <div class="divider"></div>
        <div class="panel panel2"><slot name="right"></slot></div>
      </div>
    `;

    this.container = this.shadowRoot.querySelector('.container');
    this.divider = this.shadowRoot.querySelector('.divider');

    this.isDragging = false;
    this.addEventListeners();
  }

  addEventListeners() {
    this.divider.addEventListener('mousedown', () => {
      this.isDragging = true;
      document.body.style.cursor = 'ew-resize';
    });

    document.addEventListener('mousemove', (event) => {
      if (!this.isDragging) return;

      let containerRect = this.container.getBoundingClientRect();
      let offsetX = event.clientX - containerRect.left;
      let dividerWidthPx = parseInt(getComputedStyle(this.divider).width);

      let minWidthPx = this.minWidth;
      let maxWidthPx = containerRect.width - minWidthPx - dividerWidthPx;

      // Allow full collapse when min-width is 0px
      if (minWidthPx === 0) {
        if (offsetX >= 0 && offsetX <= containerRect.width - dividerWidthPx) {
          let leftPanelWidth = (offsetX / containerRect.width) * 100;
          let rightPanelWidth = 100 - leftPanelWidth;

          this.container.style.gridTemplateColumns = `${leftPanelWidth}% var(--dividerWidth) ${rightPanelWidth}%`;
        }
      } else {
        // Enforce min-width when greater than 0px
        if (offsetX >= minWidthPx && offsetX <= maxWidthPx) {
          let leftPanelWidth = (offsetX / containerRect.width) * 100;
          let rightPanelWidth = 100 - leftPanelWidth;

          this.container.style.gridTemplateColumns = `minmax(${this.minWidth}px, ${leftPanelWidth}%) var(--dividerWidth) minmax(${this.minWidth}px, ${rightPanelWidth}%)`;
        }
      }
    });

    document.addEventListener('mouseup', () => {
      this.isDragging = false;
      document.body.style.cursor = 'default';
    });
  }
}

customElements.define('two-panels', ResizablePanels);
