const VI_STYLE = /* css */ `
  :host { display: inline-block; }

  .wrapper {
    padding: 1rem;
    box-sizing: border-box;
  }

  .view {
    border: 2px solid var(--dark, #333);
    padding: 0.5rem;
    display: flex;
    flex-direction: column;
    user-select: none;
    width: max-content;
    box-shadow: 5px 5px 5px #999;
    box-sizing: border-box;
    background-color: var(--view-bg, #f8f8f8);
  }

  .title {
    font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
    font-size: var(--title-font-size, 1rem);
    font-weight: bold;
    cursor: pointer;
    max-width: 100%;
    margin-bottom: 8px;
    line-height: 1.2;
    overflow-wrap: break-word;
    white-space: normal;
    color: var(--dark, #333);
    background-color: var(--title-bg, transparent);
    padding: 0.125rem 0.5rem;
  }

  .image-panel {
    display: block;
    cursor: pointer;
  }

  #img-internal {
    display: block;
    width: 100%;
    height: auto;
  }
`;

const VI_TEMPLATE = /* html */ `
  <style>${VI_STYLE}</style>
  <div class="wrapper">
    <div class="view" part="view">
      <div class="title" part="title"><slot></slot></div>
      <div class="image-panel">
        <img id="img-internal" alt="">
      </div>
    </div>
  </div>
`;

class ViewImage extends HTMLElement {
  static get observedAttributes() {
    return ['src', 'alt', 'width', 'bg-color', 'title-bg-color', 'step-px', 'min-width'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = VI_TEMPLATE;

    this._els = {
      title: this.shadowRoot.querySelector('.title'),
      view:  this.shadowRoot.querySelector('.view'),
      panel: this.shadowRoot.querySelector('.image-panel'),
      img:   this.shadowRoot.querySelector('#img-internal'),
    };

    this._originWidthPx   = null;
    this._stepsFromOrigin = 0;

    this._onBodyClick  = () => this._bumpWidth(+1);
    this._onTitleClick = () => this._bumpWidth(-1);
  }

  connectedCallback() {
    this._updateAll();
    this._els.panel.addEventListener('click', this._onBodyClick);
    this._els.title.addEventListener('click', this._onTitleClick);
  }

  disconnectedCallback() {
    this._els.panel.removeEventListener('click', this._onBodyClick);
    this._els.title.removeEventListener('click', this._onTitleClick);
  }

  attributeChangedCallback() {
    this._updateAll();
  }

  _updateAll() {
    this._applyBoxColors();
    this._applyImage();
    this._applySizing();
  }

  _applyBoxColors() {
    const viewBg  = this.getAttribute('bg-color')       || 'var(--light, #f8f8f8)';
    const titleBg = this.getAttribute('title-bg-color') || '#aaa';
    this.style.setProperty('--view-bg',  viewBg);
    this.style.setProperty('--title-bg', titleBg);
  }

  _applyImage() {
    this._els.img.src = this.getAttribute('src') || '';
    this._els.img.alt = this.getAttribute('alt') || '';
  }

  _applySizing() {
    const width = this.getAttribute('width');
    if (width) this._els.view.style.width = width;
  }

  _bumpWidth(dir) {
    if (this._originWidthPx == null) {
      const rect = this._els.view.getBoundingClientRect();
      this._originWidthPx   = rect.width > 0 ? rect.width : 320;
      this._stepsFromOrigin = 0;
    }
    const stepPx = parseFloat(this.getAttribute('step-px')) || 40;
    const minPx  = parseFloat(this.getAttribute('min-width')) || 120;
    let steps  = this._stepsFromOrigin + dir;
    let target = this._originWidthPx + steps * stepPx;
    if (target < minPx) {
      target = minPx;
      steps = Math.ceil((target - this._originWidthPx) / stepPx);
    }
    this._stepsFromOrigin = steps;
    this._els.view.style.width = `${Math.round(target)}px`;
  }
}

customElements.define('view-image', ViewImage);
