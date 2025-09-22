/* x-two-panel.external.scroller.cssvars.js — classic <script>, no modules
   - External controls only (buttons with [data-two] + data-two-for="#id").
   - Slotted content lives in inner ".scroller" (avoids rounded-corner clipping).
   - Fallback defaults moved into the component:
       --two-gap: 0.50rem
       --two-panel-pad: 0.5rem 0rem
       --two-step: 6rem   (unless left is %, then default is 5%)
       --two-min-left: 8rem
       --two-min-right: 8rem
     (Apps can override these by setting the same CSS vars on x-two-panel.)
   - Equal columns when fixed-left and no --two-left provided:
       var(--two-left, calc(50% - var(--two-gap, 0.50rem)/2))
   - NOT porting --two-height; default remains max-content.
*/

(function () {
  var CSS_TEXT = '\
:host{display:block}\
.wrap{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);column-gap:var(--two-gap,0.50rem);height:var(--two-height,max-content);width:100%;box-sizing:border-box;overflow:visible;background:var(--two-bg,transparent);border:var(--two-border,none);border-radius:0;padding:var(--two-pad,0)}\
:host([data-left-fixed]) .wrap{grid-template-columns:minmax(0,var(--two-left,calc(50% - var(--two-gap,0.50rem)/2))) minmax(0,1fr)}\
.panel{min-width:0;min-height:0;overflow:visible;box-sizing:border-box;background:var(--two-panel-bg,#fff);border:var(--two-panel-border,1px solid #ececf2);border-radius:10px}\
.scroller{min-width:0;min-height:0;height:100%;overflow-y:auto;overflow-x:var(--two-scroller-overflow-x,hidden);padding:var(--two-panel-pad,0.5rem 0rem);box-sizing:border-box}\
:host([collapsed-left]) .wrap{grid-template-columns:1fr}\
:host([collapsed-left]) .left{display:none}\
::slotted(.left-panel),::slotted(.right-panel){border:none;padding:0}\
::slotted(.left-slot),::slotted(.right-slot){border:none}';

  // ---------- helpers ----------
  function attachStyles(shadowRoot, cssText) {
    var style = document.createElement('style');
    style.textContent = cssText;
    shadowRoot.appendChild(style);
  }
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
  function readVarPx(host, name) {
    var raw = getComputedStyle(host).getPropertyValue(name).trim();
    if (!raw) return null;                      // variable not set
    var p = parseLen(raw);
    return convert(p.n, p.unit, 'px', host);
  }
  function gapPx(el) {
    // read using the same fallback as CSS: var(--two-gap, 0.50rem)
    var raw = getComputedStyle(el).getPropertyValue('--two-gap').trim() || '0.50rem';
    var p = parseLen(raw);
    return convert(p.n, p.unit, 'px', el);
  }
  function availablePx(el) {
    var hostW = el.getBoundingClientRect().width || 1;
    return Math.max(0, hostW - gapPx(el));
  }
  function convert(value, fromUnit, toUnit, el) {
    if (fromUnit === toUnit) return value;
    var rfs = rootFontSize(el);
    // rem <-> px
    if (fromUnit === 'rem' && toUnit === 'px') return value * rfs;
    if (fromUnit === 'px'  && toUnit === 'rem') return value / rfs;

    // % <-> px relative to *available* width (host - gap)
    var avail = availablePx(el) || 1;
    if (fromUnit === '%' && toUnit === 'px') return (value / 100) * avail;
    if (fromUnit === 'px' && toUnit === '%')  return (value / avail) * 100;

    // % <-> rem via px
    if (fromUnit === '%' && toUnit === 'rem') return ((value / 100) * avail) / rfs;
    if (fromUnit === 'rem' && toUnit === '%') return (value * rfs / avail) * 100;

    return value;
  }
  function readAttrPx(host, attrName) {
    if (!host.hasAttribute(attrName)) return null;
    var v = host.getAttribute(attrName).trim().toLowerCase();
    if (attrName === 'max-left' && v === 'auto') {
      // "auto" => container - gap - min-right (attr/CSS var/default)
      var minRightPx = readVarPx(host, '--two-min-right');
      if (minRightPx == null) {
        var a = host.getAttribute('min-right');
        minRightPx = a ? convert(parseLen(a).n, parseLen(a).unit, 'px', host) : convert(8, 'rem', 'px', host);
      }
      return Math.max(0, availablePx(host) - minRightPx);
    }
    var p = parseLen(v);
    return convert(p.n, p.unit, 'px', host);
  }
  function closestControl(target) { return target.closest ? target.closest('[data-two]') : null; }
  function resolveHost(sel) {
    if (!sel) return null;
    if (sel.charAt(0) === '#') return document.getElementById(sel.slice(1));
    try { return document.querySelector(sel); } catch (_) { return null; }
  }

  // ---------- custom element ----------
  function XTwoPanel() {
    var self = Reflect.construct(HTMLElement, [], new.target);
    self._root = self.attachShadow({ mode: 'open' });

    attachStyles(self._root, CSS_TEXT);
    var wrap = document.createElement('div');
    wrap.className = 'wrap';
    wrap.setAttribute('part', 'wrap');
    wrap.setAttribute('role', 'group');
    wrap.setAttribute('aria-label', 'Two panel');
    wrap.innerHTML =
      '<section class="panel left"  part="left-panel">'+
        '<div class="scroller" part="left-scroller"><slot name="left"></slot></div>'+
      '</section>'+
      '<section class="panel right" part="right-panel">'+
        '<div class="scroller" part="right-scroller"><slot name="right"></slot></div>'+
      '</section>';
    self._root.appendChild(wrap);

    self._wrap = wrap;
    self._leftPanel  = wrap.querySelector('.left');

    // capture initial attributes for reset()
    self._initCaptured = false;
    self._init = { left: null, gap: null };

    return self;
  }
  XTwoPanel.prototype = Object.create(HTMLElement.prototype);
  XTwoPanel.prototype.constructor = XTwoPanel;

  Object.defineProperty(XTwoPanel, 'observedAttributes', {
    get: function () { return ['left', 'gap', 'height', 'step', 'min-left', 'max-left', 'min-right']; }
  });

  XTwoPanel.prototype.connectedCallback = function () {
    if (!this._initCaptured) {
      this._init.left = this.hasAttribute('left') ? this.getAttribute('left') : null;
      this._init.gap  = this.hasAttribute('gap')  ? this.getAttribute('gap')  : null;
      this._initCaptured = true;
    }
    this._applyAll();
  };
  XTwoPanel.prototype.attributeChangedCallback = function () { this._applyAll(); };

  XTwoPanel.prototype._applyAll = function () {
    // height (no new default; still max-content unless page sets --two-height or height attr)
    var height = (this.getAttribute('height') || '').trim();
    if (height) this.style.setProperty('--two-height', height);
    else this.style.removeProperty('--two-height');

    // gap (attribute maps to CSS var; CSS var from page can override if attribute omitted)
    var gap = (this.getAttribute('gap') || '').trim();
    if (gap) this.style.setProperty('--two-gap', gap);
    else this.style.removeProperty('--two-gap');

    // left (preserve user-provided data-left-fixed flag)
    var left = (this.getAttribute('left') || '').trim();
    if (left) {
      this.style.setProperty('--two-left', left);
      if (!this.hasAttribute('data-left-fixed')) {
        this.setAttribute('data-left-fixed', '');
        this._managedLeftFlag = true; // we added it
      }
    } else {
      this.style.removeProperty('--two-left');
      if (this._managedLeftFlag) {
        this.removeAttribute('data-left-fixed');
        this._managedLeftFlag = false;
      }
    }
  };

  // ----- public API for external controls -----
  XTwoPanel.prototype.setLeft = function (value) {
    this.removeAttribute('collapsed-left');
    this.setAttribute('left', value);
  };
  XTwoPanel.prototype.setGap = function (value) {
    this.setAttribute('gap', value);
  };
  XTwoPanel.prototype.toggleLeft = function () {
    if (this.hasAttribute('collapsed-left')) this.removeAttribute('collapsed-left');
    else this.setAttribute('collapsed-left', '');
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

    // STEP (button > CSS var > attr > default)
    var deltaPx;
    if (stepOverride) {
      var so = parseLen(stepOverride);
      deltaPx = convert(so.n, so.unit, 'px', this);
    } else {
      var cssStepPx = readVarPx(this, '--two-step'); // e.g., 6rem as px
      if (cssStepPx != null) {
        deltaPx = cssStepPx;
      } else if (this.hasAttribute('step')) {
        var sp = parseLen(this.getAttribute('step'));
        deltaPx = convert(sp.n, sp.unit, 'px', this);
      } else {
        // default: keep 5% when in %, else 6rem per your requested default
        var def = (unit === '%') ? parseLen('5%') : parseLen('6rem');
        deltaPx = convert(def.n, def.unit, 'px', this);
      }
    }

    // BOUNDS (CSS var > attr > default)
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

    // back to current unit (preserve unit)
    var nextVal = convert(nextLeftPx, 'px', unit, this);
    var out;
    if (unit === '%') out = nextVal.toFixed(3) + '%';
    else if (unit === 'rem') out = nextVal.toFixed(3) + 'rem';
    else out = Math.round(nextVal) + 'px';

    this.setAttribute('left', out);
    this.removeAttribute('collapsed-left');
  };

  if (!customElements.get('x-two-panel')) {
    customElements.define('x-two-panel', XTwoPanel);
  }

  // ---------- global external-controls handler ----------
  if (!window.__X_TWO_PANEL_EXTERNAL_WIRED__) {
    document.addEventListener('click', function (ev) {
      var ctrl = closestControl(ev.target);
      if (!ctrl) return;

      var sel = ctrl.getAttribute('data-two-for') || ctrl.getAttribute('aria-controls');
      var host = resolveHost(sel);
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
