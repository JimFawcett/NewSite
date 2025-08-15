// Two-liner usage example (after defining the element below):
// <h-s>50%</h-s>            <!-- uses inner text -->
// <h-s width="320px"></h-s> <!-- uses attribute -->

class HS extends HTMLElement {
  static get observedAttributes() { return ['width']; }

  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });

    this._box = document.createElement('div');
    this._box.part = 'box';

    const style = document.createElement('style');
    style.textContent = `
      :host { display: inline-block; }
      /* The inner box gets its width set in JS */
    `;

    root.append(style, this._box);

    // Reusable validator to keep things safe
    this._applyWidth = () => {
      const v = (this.getAttribute('width') || '').trim();
      if (v && CSS.supports('width', v)) {
        this._box.style.width = v;
        this.toggleAttribute('data-invalid', false);
      } else if (v === '0' || v === '0px') { // 0 is valid
        this._box.style.width = '0';
        this.toggleAttribute('data-invalid', false);
      } else {
        this._box.style.removeProperty('width'); // fallback: unset
        this.toggleAttribute('data-invalid', true);
      }
    };
  }

  connectedCallback() {
    // Promote inner text to width attr once (e.g., <h-s>50%</h-s>)
    if (!this.hasAttribute('width')) {
      const val = (this.textContent || '').trim();
      if (val) this.setAttribute('width', val);
    }
    // Prevent the text from rendering alongside the box
    this.textContent = '';
    this._applyWidth();
  }

  attributeChangedCallback(name, _old, _val) {
    if (name === 'width') this._applyWidth();
  }

  // Public API (property mirror)
  get width() { return this.getAttribute('width'); }
  set width(v) {
    if (v == null) this.removeAttribute('width');
    else this.setAttribute('width', String(v));
  }
}

customElements.define('h-s', HS);
