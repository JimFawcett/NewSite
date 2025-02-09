class ResizablePanels extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        // Get custom attributes
        this.minWidth = this.getAttribute('min-width') || 50;
        this.initialLeftWidth = this.getAttribute('initial-left-width') || 50;

        // Create template
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    width: 80vw;
                    height: 60vh;
                    border: 2px solid #333;
                }

                .container {
                    display: grid;
                    grid-template-columns: ${this.initialLeftWidth}% 5px ${100 - this.initialLeftWidth}%;
                    width: 100%;
                    height: 100%;
                }

                .panel {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                    color: white;
                }

                .panel1 {
                    background-color: steelblue;
                }

                .panel2 {
                    background-color: tomato;
                }

                .divider {
                    width: 5px;
                    cursor: ew-resize;
                    background-color: gray;
                    transition: background-color 0.2s;
                }

                .divider:hover {
                    background-color: darkgray;
                }
            </style>
            
            <div class="container">
                <div class="panel panel1">Panel 1</div>
                <div class="divider"></div>
                <div class="panel panel2">Panel 2</div>
            </div>
        `;

        this.container = this.shadowRoot.querySelector('.container');
        this.divider = this.shadowRoot.querySelector('.divider');

        this.isDragging = false;
        this.addEventListeners();
    }

    addEventListeners() {
        this.divider.addEventListener('mousedown', (event) => {
            this.isDragging = true;
            document.body.style.cursor = 'ew-resize';
        });

        document.addEventListener('mousemove', (event) => {
            if (!this.isDragging) return;

            let containerRect = this.container.getBoundingClientRect();
            let offsetX = event.clientX - containerRect.left;

            // Ensure panels do not shrink beyond minWidth
            let minWidthPx = parseInt(this.minWidth);
            let maxWidthPx = containerRect.width - minWidthPx;

            if (offsetX > minWidthPx && offsetX < maxWidthPx) {
                let leftPanelWidth = (offsetX / containerRect.width) * 100;
                let rightPanelWidth = 100 - leftPanelWidth;
                this.container.style.gridTemplateColumns = `${leftPanelWidth}% 5px ${rightPanelWidth}%`;
            }
        });

        document.addEventListener('mouseup', () => {
            this.isDragging = false;
            document.body.style.cursor = 'default';
        });
    }
}

customElements.define('resizable-panels', ResizablePanels);

