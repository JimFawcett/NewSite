
(() => {
  class HSpace extends HTMLElement {
    static get observedAttributes() { return ['width','display','keep-text']; }

    constructor(){
      super();
      this._obs = new MutationObserver(() => {
        if (!this.hasAttribute('width')) this._apply();
      });
    }

    connectedCallback(){
      if (!this.hasAttribute('role')) this.setAttribute('role','presentation');
      if (!this.hasAttribute('aria-hidden')) this.setAttribute('aria-hidden','true');
      this._apply();
      this._obs.observe(this, {childList:true, characterData:true, subtree:true});
    }
    disconnectedCallback(){ this._obs.disconnect(); }
    attributeChangedCallback(){ this._apply(); }

    _apply(){
      // Honor any display the page/attr wants (including inline-flex)
      const disp = (this.getAttribute('display')||'').toLowerCase();
      if (disp) this.style.display = disp;       // e.g., "inline-flex", "block"
      // else: do NOT force an inline display here; let page CSS decide

      // width: CSS var > attr > inner text
      const attr = (this.getAttribute('width')||'').trim();
      const txt  = (this.textContent||'').trim();

      const useTxtAsWidth = !attr && !!txt && !this.hasAttribute('keep-text');
      const w = attr || (useTxtAsWidth ? txt : '0');

      if (useTxtAsWidth) this.textContent = '';  // consume text when used as width

      this.style.setProperty('width', `var(--h-space-width, ${w})`);

      // Height: only force 0 when acting as a “pure spacer”
      const hasVisibleContent = this.hasAttribute('keep-text') || this.children.length > 0;
      this.style.height = hasVisibleContent ? '' : '0';
    }
  }
  if (!customElements.get('h-space')) customElements.define('h-space', HSpace);
})();
