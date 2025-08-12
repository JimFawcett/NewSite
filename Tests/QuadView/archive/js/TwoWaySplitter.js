class TwoWaySplitter extends HTMLElement {
  static get observedAttributes() {
    return ['split-x','split-y','step','bar-size','min-pane','controls'];
  }
  constructor() {
    super();
    this.attachShadow({mode:'open'});
    this._state = {
      splitX: this._numAttr('split-x', 50), // percent
      splitY: this._numAttr('split-y', 50), // percent
      stepPx: this._numAttr('step', 16),    // px
      bar:    this._numAttr('bar-size', 8), // px
      minPanePx: this._numAttr('min-pane', 48)
    };
    // Remember onload defaults for "Home"/reset
    this._defaults = { splitX: this._state.splitX, splitY: this._state.splitY };

    this._drag = { mode: null, startX:0, startY:0, startSplitX:0, startSplitY:0 };
    this._ro = new ResizeObserver(() => this._apply());
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          position: relative;
          --split-x: ${this._state.splitX};
          --split-y: ${this._state.splitY};
          --bar: ${this._state.bar}px;
          --accent: #3b82f6;
          --bar-bg: #ddd;
          --bar-hover: #bbb;
          --nub-bg: #666;
          --nub-hover: #333;
          --controls-bg: rgba(255,255,255,0.9);
          --controls-border: #999;
          --btn-bg: #f5f5f5;
          --btn-hover: #e9e9e9;
          --btn-active: #ddd;
          min-height: 200px;
        }
        .wrap {
          position: absolute; inset: 0;
          display: grid;
          grid-template-columns: calc(var(--split-x) * 1%) var(--bar) 1fr;
          grid-template-rows:    calc(var(--split-y) * 1%) var(--bar) 1fr;
          overflow: hidden;
          outline: none; /* host keyboard focus */
        }
        .pane { min-width: 0; min-height: 0; overflow: auto; }
        .tl { grid-area: 1 / 1; }
        .tr { grid-area: 1 / 3; }
        .bl { grid-area: 3 / 1; }
        .br { grid-area: 3 / 3; }

        .vbar {
          grid-area: 1 / 2 / 4 / 2;
          background: var(--bar-bg);
          cursor: col-resize;
          position: relative;
        }
        .hbar {
          grid-area: 2 / 1 / 2 / 4;
          background: var(--bar-bg);
          cursor: row-resize;
          position: relative;
        }
        .vbar:hover, .hbar:hover { background: var(--bar-hover); }

        .nub {
          grid-area: 2 / 2 / 2 / 2;
          width: var(--bar); height: var(--bar);
          place-self: stretch;
          background: var(--nub-bg);
          cursor: move;
        }
        .nub:hover { background: var(--nub-hover); }

        .vbar:focus, .hbar:focus, .nub:focus, .btn:focus, .wrap:focus {
          outline: 2px solid var(--accent);
          outline-offset: 2px;
        }

        .controls {
          position: absolute;
          right: 8px;
          bottom: 8px;
          background: var(--controls-bg);
          border: 1px solid var(--controls-border);
          border-radius: 10px;
          padding: 6px;
          display: grid;
          grid-template-columns: 32px 32px 32px;
          grid-template-rows: 32px 32px 32px;
          gap: 4px;
          z-index: 2;
          user-select: none;
        }
        .btn {
          border: 1px solid #ccc;
          border-radius: 8px;
          background: var(--btn-bg);
          display: grid;
          place-items: center;
          cursor: pointer;
          font-size: 14px;
          line-height: 1;
        }
        .btn:hover { background: var(--btn-hover); }
        .btn:active { background: var(--btn-active); }
        .up   { grid-column: 2; grid-row: 1; }
        .left { grid-column: 1; grid-row: 2; }
        .home { grid-column: 2; grid-row: 2; }
        .right{ grid-column: 3; grid-row: 2; }
        .down { grid-column: 2; grid-row: 3; }
      </style>

      <div class="wrap" tabindex="0" role="application" aria-label="Two-way splitter">
        <div class="pane tl"><slot name="top-left"></slot></div>
        <div class="pane tr"><slot name="top-right"></slot></div>
        <div class="pane bl"><slot name="bottom-left"></slot></div>
        <div class="pane br"><slot name="bottom-right"></slot></div>

        <div class="vbar" part="vbar" tabindex="0" aria-label="Vertical splitter" role="separator" aria-orientation="vertical"></div>
        <div class="hbar" part="hbar" tabindex="0" aria-label="Horizontal splitter" role="separator" aria-orientation="horizontal"></div>
        <div class="nub"  part="nub"  tabindex="0" aria-label="Move both splitters"></div>

        <div class="controls" part="controls">
          <button class="btn up"    title="Move horizontal bar up"    aria-label="Up">▲</button>
          <button class="btn left"  title="Move vertical bar left"    aria-label="Left">◀</button>
          <button class="btn home"  title="Reset to defaults"         aria-label="Home">H</button>
          <button class="btn right" title="Move vertical bar right"   aria-label="Right">▶</button>
          <button class="btn down"  title="Move horizontal bar down"  aria-label="Down">▼</button>
        </div>
      </div>
    `;
  }

  connectedCallback() {
    this._els = {
      root: this.shadowRoot.querySelector('.wrap'),
      vbar: this.shadowRoot.querySelector('.vbar'),
      hbar: this.shadowRoot.querySelector('.hbar'),
      nub:  this.shadowRoot.querySelector('.nub'),
      ctrls: this.shadowRoot.querySelector('.controls'),
      up:   this.shadowRoot.querySelector('.up'),
      down: this.shadowRoot.querySelector('.down'),
      left: this.shadowRoot.querySelector('.left'),
      right:this.shadowRoot.querySelector('.right'),
      home: this.shadowRoot.querySelector('.home'),
    };

    if (this.getAttribute('controls') === 'off') {
      this._els.ctrls.style.display = 'none';
    }

    // Drag handlers
    this._els.vbar.addEventListener('pointerdown', (e)=>this._startDrag(e,'x'));
    this._els.hbar.addEventListener('pointerdown', (e)=>this._startDrag(e,'y'));
    this._els.nub .addEventListener('pointerdown', (e)=>this._startDrag(e,'xy'));
    window.addEventListener('pointermove', (e)=>this._onMove(e));
    window.addEventListener('pointerup',   ()=>this._endDrag());

    // Unified keyboard handler (arrows nudge like buttons; Home resets)
    const keyHandler = (e) => {
      if (!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(e.key)) return;
      e.preventDefault();
      switch(e.key){
        case 'ArrowLeft': this._nudge('x', -1); break;
        case 'ArrowRight':this._nudge('x', +1); break;
        case 'ArrowUp':   this._nudge('y', -1); break;
        case 'ArrowDown': this._nudge('y', +1); break;
        case 'Home':      this.resetSplits();   break;
      }
    };
    // Keyboard works when any of these have focus, and also on the overall region
    [this._els.vbar, this._els.hbar, this._els.nub, this._els.root, this].forEach(el=>{
      el.addEventListener('keydown', keyHandler);
    });

    // Buttons
    this._els.left .addEventListener('click', ()=>this._nudge('x', -1));
    this._els.right.addEventListener('click', ()=>this._nudge('x', +1));
    this._els.up   .addEventListener('click', ()=>this._nudge('y', -1));
    this._els.down .addEventListener('click', ()=>this._nudge('y', +1));
    this._els.home .addEventListener('click', ()=>this.resetSplits());

    this._apply();
    this._ro.observe(this);
  }

  disconnectedCallback() {
    this._ro.disconnect();
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal === newVal) return;
    switch(name){
      case 'split-x': this._setSplitX(this._numAttr('split-x', this._state.splitX)); break;
      case 'split-y': this._setSplitY(this._numAttr('split-y', this._state.splitY)); break;
      case 'step':    this._state.stepPx = this._numAttr('step', this._state.stepPx); break;
      case 'bar-size':this._state.bar    = this._numAttr('bar-size', this._state.bar); this.style.setProperty('--bar', `${this._state.bar}px`); break;
      case 'min-pane':this._state.minPanePx = this._numAttr('min-pane', this._state.minPanePx); break;
      case 'controls':
        if (this._els?.ctrls) this._els.ctrls.style.display = (newVal === 'off') ? 'none' : '';
        break;
    }
  }

  // Dragging
  _startDrag(e, mode){
    e.preventDefault();
    // Capture on the actual target if available
    if (e.currentTarget?.setPointerCapture) e.currentTarget.setPointerCapture(e.pointerId);
    const rect = this._bounds();
    this._drag = {
      mode,
      startX: e.clientX,
      startY: e.clientY,
      startSplitX: this._state.splitX,
      startSplitY: this._state.splitY,
      rect
    };
  }
  _onMove(e){
    if (!this._drag.mode) return;
    const {mode, startX, startY, startSplitX, startSplitY, rect} = this._drag;
    const dxPct = (e.clientX - startX) / Math.max(rect.width,1) * 100;
    const dyPct = (e.clientY - startY) / Math.max(rect.height,1) * 100;
    if (mode.includes('x')) this._setSplitX(startSplitX + dxPct);
    if (mode.includes('y')) this._setSplitY(startSplitY + dyPct);
  }
  _endDrag(){ this._drag.mode = null; }

  // Nudging with buttons/keys
  _nudge(axis, dir){
    const rect = this._bounds();
    if (axis === 'x') {
      const step = this._state.stepPx / Math.max(rect.width,1) * 100;
      this._setSplitX(this._state.splitX + dir * step);
    } else {
      const step = this._state.stepPx / Math.max(rect.height,1) * 100;
      this._setSplitY(this._state.splitY + dir * step);
    }
  }

  // Reset to onload defaults (Home)
  resetSplits(){
    this._setSplitX(this._defaults.splitX);
    this._setSplitY(this._defaults.splitY);
    this.dispatchEvent(new CustomEvent('reset', {detail:{splitX:this._state.splitX, splitY:this._state.splitY}}));
  }

  // Clamp helpers
  _minMaxX(){
    const {width} = this._bounds();
    const min = this._state.minPanePx;
    const bar = this._state.bar;
    const minPx = min;
    const maxPx = Math.max(width - bar - min, min);
    return {
      minPct: minPx / Math.max(width,1) * 100,
      maxPct: maxPx / Math.max(width,1) * 100
    };
  }
  _minMaxY(){
    const {height} = this._bounds();
    const min = this._state.minPanePx;
    const bar = this._state.bar;
    const minPx = min;
    const maxPx = Math.max(height - bar - min, min);
    return {
      minPct: minPx / Math.max(height,1) * 100,
      maxPct: maxPx / Math.max(height,1) * 100
    };
  }

  _setSplitX(pct){
    const {minPct, maxPct} = this._minMaxX();
    const v = Math.max(minPct, Math.min(maxPct, pct));
    this._state.splitX = v;
    this.style.setProperty('--split-x', v);
    this.dispatchEvent(new CustomEvent('change', {detail:{splitX:v, splitY:this._state.splitY}}));
  }
  _setSplitY(pct){
    const {minPct, maxPct} = this._minMaxY();
    const v = Math.max(minPct, Math.min(maxPct, pct));
    this._state.splitY = v;
    this.style.setProperty('--split-y', v);
    this.dispatchEvent(new CustomEvent('change', {detail:{splitX:this._state.splitX, splitY:v}}));
  }

  _apply(){
    this.style.setProperty('--split-x', this._state.splitX);
    this.style.setProperty('--split-y', this._state.splitY);
    this.style.setProperty('--bar', `${this._state.bar}px`);
  }

  _bounds(){ return this.getBoundingClientRect(); }
  _numAttr(name, fallback){
    const v = this.getAttribute(name);
    const n = v === null ? NaN : Number(v);
    return Number.isFinite(n) ? n : fallback;
  }

  // Public props
  get splitX(){ return this._state.splitX; }
  set splitX(v){ this._setSplitX(Number(v)); }
  get splitY(){ return this._state.splitY; }
  set splitY(v){ this._setSplitY(Number(v)); }
}

customElements.define('two-way-splitter', TwoWaySplitter);
