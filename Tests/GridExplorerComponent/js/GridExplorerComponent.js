class MyGridLayout extends HTMLElement {
  constructor() {
    super();
    // Attach a shadow root to encapsulate styles and markup.
    this.attachShadow({ mode: 'open' });

    // Create a template for the component.
    const template = document.createElement('template');
    template.innerHTML = `
      <style>
        /* Global reset */
        * {
          box-sizing: border-box;
        }
        :host {
          display: block;
          margin: 0;
          padding: 0;
          height: 100vh;
          width: 100vw;
          overflow: hidden;
          position: relative;
        }
        /* Grid container spanning the host element */
        #container {
          display: grid;
          grid-template-columns: 50% 50%;
          width: 100%;
          height: 100%;
        }
        /* Panel styling */
        .panel {
          overflow: auto;
          transition: all 0.3s ease;
        }
        #leftPanel {
          background: #f0f0f0;
          padding: 1rem;
          border: 4px solid red;
        }
        #rightPanel {
          background: #fff;
          padding: 1rem;
          border: 4px solid green;
        }
        /* Controls for demo */
        .controls {
          position: absolute;
          bottom: 10px;
          left: 10px;
          z-index: 10;
        }
        .controls button {
          margin-right: 5px;
        }
      </style>
      <div id="container">
        <div id="leftPanel" class="panel">
          Left Panel Content
        </div>
        <div id="rightPanel" class="panel">
          Right Panel Content
        </div>
      </div>
      <div class="controls">
        <button id="btnLeftLarger">Make Left Panel Larger</button>
        <button id="btnRightLarger">Make Right Panel Larger</button>
        <button id="btnCenter">Center Panels</button>
        <button id="btnOccupyLeft">Occupy Left Panel</button>
        <button id="btnOccupyRight">Occupy Right Panel</button>
        <button id="btnSetRightWidth">Specified Right Width</button>
      </div>
    `;

    // Attach the template content to the shadow root.
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }

  connectedCallback() {
    // Set up event listeners for the buttons.
    this.shadowRoot.getElementById('btnLeftLarger')
      .addEventListener('click', () => this.makeLeftLarger());
    this.shadowRoot.getElementById('btnRightLarger')
      .addEventListener('click', () => this.makeRightLarger());
    this.shadowRoot.getElementById('btnCenter')
      .addEventListener('click', () => this.centerPanels());
    this.shadowRoot.getElementById('btnOccupyLeft')
      .addEventListener('click', () => this.occupyLeftPanel());
    this.shadowRoot.getElementById('btnOccupyRight')
      .addEventListener('click', () => this.occupyRightPanel());
    this.shadowRoot.getElementById('btnSetRightWidth')
      .addEventListener('click', () => this.setRightPanelWidth(0.4));
  }

  // Helper: update the grid columns based on the left panel's width in pixels.
  updateGridColumns(leftWidthPx) {
    const container = this.shadowRoot.getElementById('container');
    const containerWidth = container.clientWidth;
    const rightWidthPx = containerWidth - leftWidthPx;
    container.style.gridTemplateColumns = `${leftWidthPx}px ${rightWidthPx}px`;
  }

  // Increase left panel's width by 100px.
  makeLeftLarger() {
    const container = this.shadowRoot.getElementById('container');
    const leftPanel = this.shadowRoot.getElementById('leftPanel');
    const rightPanel = this.shadowRoot.getElementById('rightPanel');
    // Ensure both panels are visible
    leftPanel.style.display = 'block';
    rightPanel.style.display = 'block';
    
    const currentLeftWidth = leftPanel.offsetWidth;
    const containerWidth = container.clientWidth;
    const increment = 100;
    let newLeftWidth = currentLeftWidth + increment;
    
    // If new left width is too close to the container width, occupy the left panel entirely.
    if (containerWidth - newLeftWidth <= increment) {
      this.occupyLeftPanel();
      return;
    }
    
    this.updateGridColumns(newLeftWidth);
  }

  // Increase right panel's width by 100px (by reducing left panel's width).
  makeRightLarger() {
    const container = this.shadowRoot.getElementById('container');
    const leftPanel = this.shadowRoot.getElementById('leftPanel');
    const rightPanel = this.shadowRoot.getElementById('rightPanel');
    leftPanel.style.display = 'block';
    rightPanel.style.display = 'block';
    
    const containerWidth = container.clientWidth;
    const currentRightWidth = rightPanel.offsetWidth;
    const increment = 100;
    let newRightWidth = currentRightWidth + increment;
    
    // If new right width is too close to the container width, occupy the right panel entirely.
    if (containerWidth - newRightWidth <= increment) {
      this.occupyRightPanel();
      return;
    }
    
    let newLeftWidth = containerWidth - newRightWidth;
    this.updateGridColumns(newLeftWidth);
  }

  // Make the left panel occupy the entire container.
  occupyLeftPanel() {
    const container = this.shadowRoot.getElementById('container');
    const containerWidth = container.clientWidth;
    container.style.gridTemplateColumns = `${containerWidth}px 0px`;
  }

  // Make the right panel occupy the entire container.
  occupyRightPanel() {
    const container = this.shadowRoot.getElementById('container');
    const containerWidth = container.clientWidth;
    container.style.gridTemplateColumns = `0px ${containerWidth}px`;
  }

  // Center panels so that both have equal widths.
  centerPanels() {
    const container = this.shadowRoot.getElementById('container');
    const panelWidth = container.clientWidth / 2;
    container.style.gridTemplateColumns = `${panelWidth}px ${panelWidth}px`;
  }

  // Set the right panel's width as a fraction of the total width.
  setRightPanelWidth(fracWidth) {
    const container = this.shadowRoot.getElementById('container');
    const rightPanelWidth = container.clientWidth * fracWidth;
    const leftPanelWidth = container.clientWidth * (1 - fracWidth);
    container.style.gridTemplateColumns = `${leftPanelWidth}px ${rightPanelWidth}px`;
  }
}

// Define the custom element.
customElements.define('my-grid-layout', MyGridLayout);
