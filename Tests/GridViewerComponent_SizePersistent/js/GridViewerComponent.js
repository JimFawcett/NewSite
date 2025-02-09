/*
  GridViewerComponent2.js
  - defines W3C component for two side-by-side panels with
    a grab-bar for resizing
*/

function resetTwoPanel(key) {
  localStorage.removeItem(key);
  window.location.reload(true);
}

class ResizablePanels extends HTMLElement {
  constructor() {
      super();
      this.attachShadow({ mode: 'open' });

      // Get attributes
      this.minWidth = this.getAttribute('min-width') || 100;
      this.storageKey = this.getAttribute('storage-key') || 'resizable-panels';
      
      // Load saved sizes if available
      let savedSizes = localStorage.getItem(this.storageKey);
      if (savedSizes) {
          savedSizes = JSON.parse(savedSizes);
      } else {
          savedSizes = { left: 50, right: 50 };
      }

      // Create template
      this.shadowRoot.innerHTML = `
          <style>
              :host {
                  --borderWidth: 2px;
                  --dividerWidth: 6px;

                  display: block;
                  width: 100%;
                  height: 100%;
                  border: var(--borderWidth) solid #333;
                  box-sizing: border-box;
              }

              .container {
                  display: grid;
                  grid-template-columns: ${savedSizes.left}% var(--dividerWidth) ${savedSizes.right}%;
                  // width: calc(100% - var(--borderWidth) / 2 - var(--dividerWidth));
                  width:100%;
                  height: 100%;
                  // outline: 2px dashed blue;
                  overflow: hidden;
              }

              .panel {
                  display: flex;
                  flex: 1;
                  align-items: top;
                  justify-content: left;
                  padding: 0px;
                  overflow: auto;
                  // outline: 2px dashed red;
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

          document.addEventListener('mousemove', (event) => {
              if (!this.isDragging) return;

              let containerRect = this.container.getBoundingClientRect();
              let offsetX = event.clientX - containerRect.left;
              let dividerWidthPx = parseInt(getComputedStyle(this.divider).width);
              
              let minWidthPx = parseInt(this.minWidth);
              let maxWidthPx = containerRect.width - minWidthPx - dividerWidthPx;

              // Ensure the left panel does not collapse beyond min-width
              if (offsetX >= minWidthPx && offsetX <= maxWidthPx) {
                  let leftPanelWidth = (offsetX / containerRect.width) * 100;
                  let rightPanelWidth = 100 - leftPanelWidth;

                  this.container.style.gridTemplateColumns = `${leftPanelWidth}% var(--dividerWidth) ${rightPanelWidth}%`;

                  // Save to localStorage
                  localStorage.setItem(this.storageKey, JSON.stringify({
                      left: leftPanelWidth,
                      right: rightPanelWidth
                  }));
              }
          });

          if (offsetX >= minWidthPx && offsetX <= maxWidthPx) {
              let leftPanelWidth = (offsetX / containerRect.width) * 100;
              let rightPanelWidth = 100 - leftPanelWidth;

              this.container.style.gridTemplateColumns = `minmax(${this.minWidth}px, ${leftPanelWidth}%) var(--dividerWidth) minmax(${this.minWidth}px, ${rightPanelWidth}%)`;

              // Save to localStorage
              localStorage.setItem(this.storageKey, JSON.stringify({
                  left: leftPanelWidth,
                  right: rightPanelWidth
              }));
          }
      });

      document.addEventListener('mouseup', () => {
          this.isDragging = false;
          document.body.style.cursor = 'default';
      });
  }
}

customElements.define('two-panels', ResizablePanels);
