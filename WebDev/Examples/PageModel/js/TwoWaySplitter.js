// TwoWaySplitter.js
class TwoWaySplitter extends HTMLElement {
  static get observedAttributes() {
    return [
      'split-x','split-y','step','bar-size','min-pane','controls',
      // optional tweaks:
      'controls-size',     // px, size of each control grid cell
      'controls-font'      // px, font-size for button glyphs
    ];
  }

  constructor() {
    super();
    this.attachShadow({mode:'open'});

    // Encapsulated UI defaults (internal; not exposed unless you use attributes)
    this._ui = {
      controlsCell: 42,  // px – default control grid cell (was 32)
      controlsFontPx: 0  // 0 = auto (0.6 * cell). Will be computed in template.
    };

    // State
    this._state = {
      splitX: this._numAttr('split-x', 50), // percent
      splitY: this._numAttr('split-y', 50), // percent
      stepPx: this._numAttr('step', 16),    // px
      bar:    this._numAttr('bar-size', 8), // px
      minPanePx: this._numAttr('min-pane', 48)
    };
    this._defaults = { splitX: this._state.splitX, splitY: this._state.splitY };
    this._drag = { mode: null, startX:0, startY:0, startSplitX:0, startSplitY:0 };
    this._ro = new ResizeObserver(() => this._apply());

    // Shadow DOM
    const autoFontPx = Math.round((this._ui.controlsCell) * 0.6);
    const initialFontPx = this._ui.controlsFontPx || autoFontPx;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          position: relative;

          /* splitter variables */
          --split-x: ${this._state.splitX};
          --split-y: ${this._state.splitY};
          --bar: ${this._state.bar}px;

          /* colors */
          --accent: #3b82f6;
          --bar-bg: #ddd;
          --bar-hover: #bbb;
          --nub-bg: #666;
          --nub-hover: #333;

          /* controls palette */
          --controls-bg: rgba(255,255,255,0.9);
          --controls-border: #999;
          --btn-bg: #f5f5f5;
          --btn-hover: #e9e9e9;
          --btn-active: #ddd;

          /* controls sizing (encapsulated defaults) */
          --controls-cell: ${this._ui.controlsCell}px;
          --controls-font: ${initialFontPx}px;

          min-height: 200px;
        }
        .wrap {
          position: absolute; inset: 0;
          display: grid;
          grid-template-columns: calc(var(--split-x) * 1%) var(--bar) 1fr;
          grid-template-rows:    calc(var(--split-y) * 1%) var(--bar) 1fr;
          overflow: hidden;
          outline: none;
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
          grid-template-columns: repeat(3, var(--controls-cell));
          grid-template-rows:    repeat(3, var(--controls-cell));
          gap: 4px;
          z-index: 2;
          user-select: none;
          font-size: var(--controls-font);
        }
        .btn {
          border: 1px solid #ccc;
          border-radius: 8px;
          background: var(--btn-bg);
          display: grid;
          place-items: center;
          cursor: pointer;
          font-size: inherit;  /* inherits from .controls */
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

        <div class="controls" class="controls" part="controls">
          <button class="btn up"    part="btn up"    title="Move horizontal bar up"    aria-label="Up">▲</button>
          <button class="btn left"  part="btn left"  title="Move vertical bar left"    aria-label="Left">◀</button>
          <button class="btn home"  part="btn home"  title="Reset to defaults"         aria-label="Home">H</button>
          <button class="btn right" part="btn right" title="Move vertical bar right"   aria-label="Right">▶</button>
          <button class="btn down"  part="btn down"  title="Move horizontal bar down"  aria-label="Down">▼</button>
        </div>
      </div>
    `;

    // Single, capture-phase key handler bound on the host
    this._onKeyDown = (e) => {
      const k = e.key;
      if (!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(k)) return;
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      switch (k) {
        case 'ArrowLeft':  this._nudge('x', -1); break;
        case 'ArrowRight': this._nudge('x', +1); break;
        case 'ArrowUp':    this._nudge('y', -1); break;
        case 'ArrowDown':  this._nudge('y', +1); break;
        case 'Home':       this.resetSplits();   break;
      }
    };
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

    // Make host keyboard-focusable if not specified by author
    if (!this.hasAttribute('tabindex')) this.tabIndex = 0;

    if (this.getAttribute('controls') === 'off') {
      this._els.ctrls.style.display = 'none';
    }

    // Drag handlers
    this._els.vbar.addEventListener('pointerdown', (e)=>this._startDrag(e,'x'));
    this._els.hbar.addEventListener('pointerdown', (e)=>this._startDrag(e,'y'));
    this._els.nub .addEventListener('pointerdown', (e)=>this._startDrag(e,'xy'));
    window.addEventListener('pointermove', (e)=>this._onMove(e));
    window.addEventListener('pointerup',   ()=>this._endDrag());

    // Keyboard: bind once on the host, capture phase (prevents double-steps)
    if (!this._keysBound) {
      this.addEventListener('keydown', this._onKeyDown, { capture: true });
      this._keysBound = true;
    }

    // Buttons
    this._els.left .addEventListener('click', ()=>this._nudge('x', -1));
    this._els.right.addEventListener('click', ()=>this._nudge('x', +1));
    this._els.up   .addEventListener('click', ()=>this._nudge('y', -1));
    this._els.down .addEventListener('click', ()=>this._nudge('y', +1));
    this._els.home .addEventListener('click', ()=>this.resetSplits());

    // Apply defaults & reflect optional attributes if present
    this._apply();
    if (this.hasAttribute('controls-size')) {
      this._setControlsSize(this._numAttr('controls-size', this._ui.controlsCell));
    }
    if (this.hasAttribute('controls-font')) {
      this._setControlsFont(this._numAttr('controls-font', 0));
    }

    this._ro.observe(this);
  }

  disconnectedCallback() {
    this._ro.disconnect();
    if (this._keysBound) {
      this.removeEventListener('keydown', this._onKeyDown, { capture: true });
      this._keysBound = false;
    }
  }

  attributeChangedCallback(name, _oldVal, _newVal) {
    switch(name){
      case 'split-x':
        this._setSplitX(this._numAttr('split-x', this._state.splitX)); break;
      case 'split-y':
        this._setSplitY(this._numAttr('split-y', this._state.splitY)); break;
      case 'step':
        this._state.stepPx = this._numAttr('step', this._state.stepPx); break;
      case 'bar-size':
        this._state.bar    = this._numAttr('bar-size', this._state.bar);
        this.style.setProperty('--bar', `${this._state.bar}px`);
        break;
      case 'min-pane':
        this._state.minPanePx = this._numAttr('min-pane', this._state.minPanePx); break;
      case 'controls':
        if (this._els?.ctrls) this._els.ctrls.style.display = (this.getAttribute('controls') === 'off') ? 'none' : '';
        break;
      case 'controls-size':
        this._setControlsSize(this._numAttr('controls-size', this._ui.controlsCell));
        break;
      case 'controls-font':
        this._setControlsFont(this._numAttr('controls-font', 0));
        break;
    }
  }

  // --- Dragging ---
  _startDrag(e, mode){
    e.preventDefault();
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

  // --- Nudging with buttons/keys ---
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

  // --- Reset to onload defaults (Home) ---
  resetSplits(){
    this._setSplitX(this._defaults.splitX);
    this._setSplitY(this._defaults.splitY);
    this.dispatchEvent(new CustomEvent('reset', {detail:{splitX:this._state.splitX, splitY:this._state.splitY}}));
  }

  // --- Clamp helpers ---
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
    // ensure encapsulated UI vars are set on host (shadow reads them)
    if (!this.style.getPropertyValue('--controls-cell')) {
      this.style.setProperty('--controls-cell', `${this._ui.controlsCell}px`);
    }
    if (!this.style.getPropertyValue('--controls-font')) {
      const autoPx = Math.round(this._ui.controlsCell * 0.6);
      this.style.setProperty('--controls-font', `${autoPx}px`);
    }
  }

  _bounds(){ return this.getBoundingClientRect(); }
  _numAttr(name, fallback){
    const v = this.getAttribute(name);
    const n = v === null ? NaN : Number(v);
    return Number.isFinite(n) ? n : fallback;
  }

  // --- Optional tweak handlers (internal, encapsulated) ---
  _setControlsSize(px){
    if (!Number.isFinite(px) || px <= 0) return;
    this._ui.controlsCell = px;
    // update CSS var on host; shadow uses it in grid template
    this.style.setProperty('--controls-cell', `${px}px`);
    // if author hasn't specified a font explicitly, keep font auto-tied to cell
    if (!this.hasAttribute('controls-font')) {
      const autoPx = Math.round(px * 0.6);
      this.style.setProperty('--controls-font', `${autoPx}px`);
    }
  }
  _setControlsFont(px){
    if (!Number.isFinite(px) || px <= 0) {
      // treat invalid as "auto"
      const cell = this._ui.controlsCell;
      const autoPx = Math.round(cell * 0.6);
      this.style.setProperty('--controls-font', `${autoPx}px`);
      return;
    }
    this._ui.controlsFontPx = px;
    this.style.setProperty('--controls-font', `${px}px`);
  }

  // Public props
  get splitX(){ return this._state.splitX; }
  set splitX(v){ this._setSplitX(Number(v)); }
  get splitY(){ return this._state.splitY; }
  set splitY(v){ this._setSplitY(Number(v)); }
}

customElements.define('two-way-splitter', TwoWaySplitter);
