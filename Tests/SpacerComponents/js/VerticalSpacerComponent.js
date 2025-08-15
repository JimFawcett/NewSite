// VerticalSizer.js
class VS extends HTMLElement {
  static get observedAttributes() { return ['height']; }

  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });

    this._box = document.createElement('div');
    this._box.part = 'box';

    const style = document.createElement('style');
    style.textContent = `
      :host { display: inline-block; }
      /* style the inner box via ::part(box) from the page */
    `;
    root.append(style, this._box);

    this._applyHeight = () => {
      const v = (this.getAttribute('height') || '').trim();
      const isPercent = v.includes('%'); // <-- broader detection

      // If % is used anywhere, give the host a definite height
      if (isPercent) {
        this.style.display = 'block';
        this.style.height = '100%'; // parent must have a definite height
      } else {
        this.style.removeProperty('height');
      }

      if (v === '0' || v === '0px' || (v && CSS.supports('height', v))) {
        this._box.style.height = v;
        this.toggleAttribute('data-invalid', false);
      } else {
        this._box.style.removeProperty('height');
        this.toggleAttribute('data-invalid', true);
      }
    };
  }

  connectedCallback() {
    // Promote inner text to height attr once: <v-s>50%</v-s>
    if (!this.hasAttribute('height')) {
      const val = (this.textContent || '').trim();
      if (val) this.setAttribute('height', val);
    }
    this.textContent = '';  // hide the light-DOM text
    this._applyHeight();
  }

  attributeChangedCallback(name) {
    if (name === 'height') this._applyHeight();
  }

  // Property mirror
  get height() { return this.getAttribute('height'); }
  set height(v) {
    if (v == null) this.removeAttribute('height');
    else this.setAttribute('height', String(v));
  }
}

customElements.define('v-s', VS);
