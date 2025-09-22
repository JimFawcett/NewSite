/* TwoPanelComponentUsingClicks.js — classic <>, no modules
   Public API:
     - Attributes: left, gap, height, step, min-left, max-left, min-right
     - Methods: setLeft(value), setGap(value), toggleLeft(), reset(), step(+1|-1[, stepOverride])
     - Click controls (opt-in): add attribute `click-controls` or data-click-controls

   Click mappings:
     - Single-click left  → widen   (step +1)
     - Single-click right → narrow  (step -1)
     - Double-click left  → reset
     - Double-click right → toggleLeft()
*/
(function () {
  // ---------- helpers ----------
  function parseLen(s) {
    var m = String(s || '').trim().match(/^(-?\d*\.?\d+)\s*(px|rem|%)$/i);
    if (!m) return { n: parseFloat(s) || 0, unit: 'px' };
    return { n: parseFloat(m[1]), unit: m[2].toLowerCase() };
  }
  function rootFontSize(el) {
    var root = (el.getRootNode && el.getRootNode()) || document;
    var doc = root instanceof Document ? root : document;
    var fs = parseFloat(getComputedStyle(doc.documentElement).fontSize);
    return isFinite(fs) && fs > 0 ? fs : 16;
  }
  function convert(value, fromUnit, toUnit, el) {
    if (fromUnit === toUnit) return value;
    var rfs = rootFontSize(el);
    if (fromUnit === 'rem' && toUnit === 'px') return value * rfs;
    if (fromUnit === 'px'  && toUnit === 'rem') return value / rfs;
    var avail = availablePx(el) || 1; // for %
    if (fromUnit === '%' && toUnit === 'px') return (value / 100) * avail;
    if (fromUnit === 'px' && toUnit === '%')  return (value / avail) * 100;
    if (fromUnit === '%' && toUnit === 'rem') return ((value / 100) * avail) / rfs;
    if (fromUnit === 'rem' && toUnit === '%') return (value * rfs / avail) * 100;
    return value;
  }
  function readVarPx(host, name) {
    var raw = getComputedStyle(host).getPropertyValue(name).trim();
    if (!raw) return null;
    var p = parseLen(raw);
    return convert(p.n, p.unit, 'px', host);
  }
  function gapPx(el) {
    var raw = getComputedStyle(el).getPropertyValue('--two-gap').trim() || '0.50rem';
    var p = parseLen(raw);
    return convert(p.n, p.unit, 'px', el);
  }
  function availablePx(el) {
    var hostW = el.getBoundingClientRect().width || 1;
    return Math.max(0, hostW - gapPx(el));
  }
  function readAttrPx(host, attrName) {
    if (!host.hasAttribute(attrName)) return null;
    var v = host.getAttribute(attrName).trim().toLowerCase();
    if (attrName === 'max-left' && v === 'auto') {
      var minRightPx = readVarPx(host, '--two-min-right');
      if (minRightPx == null) {
        var a = host.getAttribute('min-right');
        if (a) {
          var pr = parseLen(a);
          minRightPx = convert(pr.n, pr.unit, 'px', host);
        } else {
          minRightPx = convert(8, 'rem', 'px', host);
        }
      }
      return Math.max(0, availablePx(host) - minRightPx);
    }
    var p = parseLen(v);
    return convert(p.n, p.unit, 'px', host);
  }
  function closestControl(target){ return target.closest ? target.closest('[data-two]') : null; }
  function resolveHost(sel){
    if (!sel) return null;
    if (sel.charAt(0) === '#') return document.getElementById(sel.slice(1));
    try { return document.querySelector(sel); } catch(_) { return null; }
  }
  function isElem(n){ return n && n.nodeType === 1; }
  function isInteractive(n) {
    return isElem(n) && n.closest &&
      n.closest('a,button,input,textarea,select,label,summary,details,[contenteditable="true"]');
  }
  function hasSelection() {
    var s = window.getSelection && window.getSelection();
    return s && s.type === 'Range' && String(s).length > 0;
  }

  // ---------- component ----------
  function XTwoPanel() {
    var self = Reflect.construct(HTMLElement, [], new.target);
    var shadow = self.attachShadow({ mode: 'open' });

    var CSS_TEXT = `
:host{display:block}
.wrap{
  display:grid;
  grid-template-columns:minmax(0,1fr) minmax(0,1fr);
  column-gap:var(--two-gap,0.50rem);
  height:var(--two-height,max-content);
  width:100%;
  box-sizing:border-box;
  overflow:visible;
  background:var(--two-bg,transparent);
  border:var(--two-border,none);
  border-radius:0;
  padding:var(--two-pad,0)
}
:host([data-left-fixed]) .wrap{
  grid-template-columns:minmax(0,var(--two-left,calc(50% - var(--two-gap,0.50rem)/2))) minmax(0,1fr)
}
.panel{
  min-width:0;
  box-sizing:border-box;
  background:var(--two-panel-bg,#fff);
  border:var(--two-panel-border,1px solid #ececf2);
  border-radius:10px;

  /* Always flex columns, avoid min-content trap */
  display:flex;
  flex-direction:column;
  min-height:0;    /* allow scroller to shrink */
  overflow:visible;
}
.scroller{
  min-width:0;
  min-height:0;
  height:auto;                 /* don't rely on 100% */
  flex:1 1 auto;               /* fill remaining panel height */
  overflow-y:auto;
  overflow-x:var(--two-scroller-overflow-x,hidden);
  padding:var(--two-panel-pad,0.5rem 0rem);
  box-sizing:border-box;
}
:host([collapsed-left]) .wrap{ grid-template-columns:1fr }
:host([collapsed-left]) .left{ display:none !important } /* protect collapse vs page ::part */

/* Optional trims for slotted helpers (compatibility) */
::slotted(.left-panel),::slotted(.right-panel){border:none;padding:0}
::slotted(.left-slot),::slotted(.right-slot){border:none}
`;
    var style = document.createElement('style');
    style.textContent = CSS_TEXT;
    shadow.appendChild(style);

    var wrap = document.createElement('div');
    wrap.className = 'wrap';
    wrap.setAttribute('part','wrap');
    wrap.setAttribute('role','group');
    wrap.setAttribute('aria-label','Two panel');
    wrap.innerHTML =
      '<section class="panel left"  part="left-panel">'+
        '<div class="scroller" part="left-scroller"><slot name="left"></slot></div>'+
      '</section>'+
      '<section class="panel right" part="right-panel">'+
        '<div class="scroller" part="right-scroller"><slot name="right"></slot></div>'+
      '</section>';
    shadow.appendChild(wrap);

    self._root = shadow;
    self._wrap = wrap;
    self._leftPanel  = wrap.querySelector('.left');
    self._clicksWired = false;
    self._initCaptured = false;
    self._init = { left:null, gap:null };

    return self;
  }
  XTwoPanel.prototype = Object.create(HTMLElement.prototype);
  XTwoPanel.prototype.constructor = XTwoPanel;

  Object.defineProperty(XTwoPanel, 'observedAttributes', {
    get: function () { return ['left','gap','height','step','min-left','max-left','min-right','click-controls']; }
  });

  XTwoPanel.prototype.connectedCallback = function () {
    if (!this._initCaptured) {
      this._init.left = this.hasAttribute('left') ? this.getAttribute('left') : null;
      this._init.gap  = this.hasAttribute('gap')  ? this.getAttribute('gap')  : null;
      this._initCaptured = true;
    }
    this._applyAll();
    if (this.hasAttribute('click-controls') || this.dataset.clickControls !== undefined) {
      this._enableClickControls(true);
    }
  };
  XTwoPanel.prototype.attributeChangedCallback = function (name) {
    if (name === 'click-controls') {
      this._enableClickControls(this.hasAttribute('click-controls'));
      return;
    }
    this._applyAll();
  };

  XTwoPanel.prototype._applyAll = function () {
    // height via CSS var
    var height = (this.getAttribute('height') || '').trim();
    if (height) this.style.setProperty('--two-height', height);
    else this.style.removeProperty('--two-height');

    // gap maps to CSS var
    var gap = (this.getAttribute('gap') || '').trim();
    if (gap) this.style.setProperty('--two-gap', gap);
    else this.style.removeProperty('--two-gap');

    // left (and manage data-left-fixed if needed)
    var left = (this.getAttribute('left') || '').trim();
    if (left) {
      this.style.setProperty('--two-left', left);
      if (!this.hasAttribute('data-left-fixed')) {
        this.setAttribute('data-left-fixed','');
        this._managedLeftFlag = true;
      }
    } else {
      this.style.removeProperty('--two-left');
      if (this._managedLeftFlag) {
        this.removeAttribute('data-left-fixed');
        this._managedLeftFlag = false;
      }
    }
  };

  // ----- public API -----
  XTwoPanel.prototype.setLeft = function (value) {
    this.removeAttribute('collapsed-left');
    this.setAttribute('left', value);
  };
  XTwoPanel.prototype.setGap = function (value) {
    this.setAttribute('gap', value);
  };
  XTwoPanel.prototype.toggleLeft = function () {
    if (this.hasAttribute('collapsed-left')) this.removeAttribute('collapsed-left');
    else this.setAttribute('collapsed-left','');
  };
  XTwoPanel.prototype.reset = function () {
    this.removeAttribute('collapsed-left');
    if (this._init.left !== null) this.setAttribute('left', this._init.left);
    else this.removeAttribute('left');
    if (this._init.gap !== null) this.setAttribute('gap', this._init.gap);
    else this.removeAttribute('gap');
  };
  // Symmetric stepping with CSS-var/attr-configurable bounds
  XTwoPanel.prototype.step = function (sign, stepOverride) {
    var cur = this.getAttribute('left');
    if (!cur) {
      var pxNow = this._leftPanel.getBoundingClientRect().width;
      var rem = (pxNow / rootFontSize(this)).toFixed(3) + 'rem';
      this.setAttribute('left', rem);
      cur = rem;
    }
    var parsed = parseLen(cur);
    var unit   = parsed.unit;
    var leftPx = convert(parsed.n, unit, 'px', this);

    // STEP: override > CSS var > attr > default
    var deltaPx;
    if (stepOverride) {
      var so = parseLen(stepOverride);
      deltaPx = convert(so.n, so.unit, 'px', this);
    } else {
      var cssStepPx = readVarPx(this, '--two-step'); // e.g., 6rem
      if (cssStepPx != null) deltaPx = cssStepPx;
      else if (this.hasAttribute('step')) {
        var sp = parseLen(this.getAttribute('step'));
        deltaPx = convert(sp.n, sp.unit, 'px', this);
      } else {
        var def = (unit === '%') ? parseLen('5%') : parseLen('6rem');
        deltaPx = convert(def.n, def.unit, 'px', this);
      }
    }

    // BOUNDS: CSS var > attr > default (8rem each side)
    var defMinLeftPx  = convert(8, 'rem', 'px', this);
    var defMinRightPx = convert(8, 'rem', 'px', this);

    var cssMinLeftPx  = readVarPx(this, '--two-min-left');
    var cssMinRightPx = readVarPx(this, '--two-min-right');
    var cssMaxLeftPx  = readVarPx(this, '--two-max-left');

    var minLeftPx  = (cssMinLeftPx  != null) ? cssMinLeftPx  : (readAttrPx(this, 'min-left')  ?? defMinLeftPx);
    var minRightPx = (cssMinRightPx != null) ? cssMinRightPx : (readAttrPx(this, 'min-right') ?? defMinRightPx);

    var containerMinusGap = availablePx(this);
    var autoMaxLeftPx     = Math.max(0, containerMinusGap - minRightPx);

    var userMaxPx = (cssMaxLeftPx != null) ? cssMaxLeftPx : (readAttrPx(this, 'max-left') ?? autoMaxLeftPx);
    var maxLeftPx = Math.min(autoMaxLeftPx, userMaxPx);
    if (maxLeftPx < minLeftPx) maxLeftPx = minLeftPx;

    // apply step & clamp
    var nextLeftPx = leftPx + sign * deltaPx;
    nextLeftPx = Math.max(minLeftPx, Math.min(maxLeftPx, nextLeftPx));

    // preserve unit
    var nextVal = convert(nextLeftPx, 'px', unit, this);
    var out;
    if (unit === '%') out = nextVal.toFixed(3) + '%';
    else if (unit === 'rem') out = nextVal.toFixed(3) + 'rem';
    else out = Math.round(nextVal) + 'px';

    this.setAttribute('left', out);
    this.removeAttribute('collapsed-left');
  };

  // ----- click controls (opt-in) -----
  XTwoPanel.prototype._enableClickControls = function (enable) {
    if (enable && !this._clicksWired) this._wireClicks();
  };
  XTwoPanel.prototype._wireClicks = function () {
    if (this._clicksWired) return;
    var left  = this._root.querySelector('.panel.left');
    var right = this._root.querySelector('.panel.right');
    var timer = null;
    var self  = this;

    function onSingle(side) {
      if (side === 'left') self.step(+1);
      else self.step(-1);
    }
    function onDouble(side) {
      if (side === 'left') self.reset();
      else self.toggleLeft();
    }
    function handler(side) {
      return function (ev) {
        var path = ev.composedPath ? ev.composedPath() : [ev.target];
        if (path.some(isInteractive) || hasSelection()) return;

        if (ev.type === 'dblclick') {
          if (timer) { clearTimeout(timer); timer = null; }
          onDouble(side);
          return;
        }
        if (timer) clearTimeout(timer);
        timer = setTimeout(function () {
          // If left is collapsed and user single-clicks right (narrow), do nothing
          if (!(side === 'right' && self.hasAttribute('collapsed-left'))) {
            onSingle(side);
          }
          timer = null;
        }, 220);
      };
    }

    if (left) {
      // no forced cursor; let page CSS decide (pointer by default)
      left.addEventListener('click', handler('left'));
      left.addEventListener('dblclick', handler('left'));
    }
    if (right) {
      right.addEventListener('click', handler('right'));
      right.addEventListener('dblclick', handler('right'));
    }
    this._clicksWired = true;
  };

  // ---------- define ----------
  if (!customElements.get('x-two-panel')) {
    customElements.define('x-two-panel', XTwoPanel);
  }

  // ---------- global external-controls handler with scoped targeting ----------
  function findScopedPanel(ctrl, sel) {
    // 1) Explicit selector wins
    var host = resolveHost(sel);
    if (host && host.tagName && host.tagName.toLowerCase() === 'x-two-panel') return host;

    // 2) Button lives inside a panel marked with-buttons
    var inside = ctrl.closest && ctrl.closest('x-two-panel.with-buttons');
    if (inside) return inside;

    // 3) For each ancestor, find the nearest descendant panel marked with-buttons
    for (var n = ctrl.parentElement; n; n = n.parentElement) {
      var cand = n.querySelector && n.querySelector('x-two-panel.with-buttons');
      if (cand) return cand;
    }

    // 4) Last resort: first panel marked with-buttons in the document
    return document.querySelector('x-two-panel.with-buttons');
  }

  if (!window.__X_TWO_PANEL_EXTERNAL_WIRED__) {
    document.addEventListener('click', function (ev) {
      var ctrl = closestControl(ev.target);
      if (!ctrl) return;

      var sel  = ctrl.getAttribute('data-two-for') || ctrl.getAttribute('aria-controls');
      var host = findScopedPanel(ctrl, sel);
      if (!host || host.tagName.toLowerCase() !== 'x-two-panel') return;

      var action = (ctrl.dataset.two || '').toLowerCase();
      switch (action) {
        case 'narrow':        host.step(-1, ctrl.dataset.step); break;
        case 'widen':         host.step(+1, ctrl.dataset.step); break;
        case 'toggle-left':   host.toggleLeft(); break;
        case 'reset':         host.reset(); break;
        case 'set-left':
          if (ctrl.dataset.left || ctrl.dataset.value) host.setLeft(ctrl.dataset.left || ctrl.dataset.value);
          break;
        case 'set-gap':
          if (ctrl.dataset.gap) host.setGap(ctrl.dataset.gap);
          break;
        case 'collapse-left': host.setAttribute('collapsed-left',''); break;
        case 'expand-left':   host.removeAttribute('collapsed-left'); break;
      }
    }, true);
    window.__X_TWO_PANEL_EXTERNAL_WIRED__ = true;
  }
})();

