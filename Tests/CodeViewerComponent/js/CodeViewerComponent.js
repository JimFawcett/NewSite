class CodeViewer extends HTMLElement {
  constructor() {
      super();

      // Attach Shadow DOM
      this.attachShadow({ mode: "open" });

      // Template with a slot for user-supplied code
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
              background-color: var(--background-color, rgb(249, 236, 236));
          }

          .title {
              display: flex;
              font-family: "Comic Sans MS", cursive, sans-serif;
              font-weight: bold;
              cursor: pointer;
              max-width: 100%;
              margin-bottom: 4px;
              line-height: 1.0rem;
              flex-wrap: wrap;
              word-wrap: break-word;
              overflow-wrap: break-word;
              white-space: wrap;
          }

          .content {
              display: block;
              flex: 1;
              font-family: 'Consolas, Courier New', Courier, monospace;
              font-size: 0.75rem;
              cursor: pointer;
              transition: transform 0.2s ease-in-out;
              height: max-content;
              padding: 0rem;
              margin: 0rem;
              overflow-x: auto;
          }

          pre {
              display: block;
              min-width: 300px;  /* Minimum width */
              max-width: 1000px; /* Maximum width */
              width: auto;       /* Default width */
              transition: width 0.2s ease-in-out;
          }
      </style>

      <div class="title"> <slot name="title">Code Viewer</slot> </div>
      <div class="content">
          <slot></slot>
      </div>
      `;

      // References
      this.titleElement = this.shadowRoot.querySelector(".title");
      this.contentElement = this.shadowRoot.querySelector(".content");

      // Bind event handlers
      this.titleElement.addEventListener("click", () => this.smaller());
      this.contentElement.addEventListener("click", () => this.bigger());
  }

  // Find the <pre> element inside the user-supplied content
  getPreElement() {
      return this.querySelector("pre");
  }

  // Increase width
  bigger() {
      let preElement = this.getPreElement();
      if (preElement) {
          let currentWidth = parseFloat(window.getComputedStyle(preElement).width);
          let newWidth = Math.min(currentWidth * 1.2, 1000); // Max width limit
          preElement.style.width = `${newWidth}px`;
      }
  }

  // Decrease width
  smaller() {
      let preElement = this.getPreElement();
      if (preElement) {
          let currentWidth = parseFloat(window.getComputedStyle(preElement).width);
          let newWidth = Math.max(currentWidth / 1.2, 30); // Min width limit
          preElement.style.width = `${newWidth}px`;
      }
  }
}

// Define custom element
customElements.define("code-viewer", CodeViewer);
