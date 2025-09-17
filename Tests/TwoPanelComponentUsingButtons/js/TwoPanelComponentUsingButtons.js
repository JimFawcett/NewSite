/* x-two-panel.external.js — classic <script>, no modules
   External controls only via data-two + data-two-for / aria-controls.
   Actions: narrow, widen, toggle-left, reset, set-left, set-gap
   Fixes:
   - Reset now restores original markup attrs (gap/left) captured at connect time.
   - No corner clipping: .wrap overflow: visible (was hidden).
*/

(function () {
  var CSS_TEXT = '\
:host{display:block;--two-gap:1rem;--two-height:max-content}\
.wrap{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);column-gap:var(--two-gap);height:var(--two-height);width:100%;box-sizing:border-box;overflow:visible;background:var(--two-bg,transparent);border:var(--two-border,none);border-radius:0;padding:var(--two-pad,0)}\
:host([data-left-fixed]) .wrap{grid-template-columns:minmax(0,var(--two-left)) minmax(0,1fr)}\
/* default padding 0 so visual gap ~= column-gap */\
.panel{min-width:0;min-height:0;overflow:auto;box-sizing:border-box;background:var(--two-panel-bg,#fff);border:var(--two-panel-border,1px solid #ececf2);border-radius:0px;padding:var(--two-panel-pad,0)}\
:host([collapsed-left]) .wrap{grid-template-columns:1fr}\
:host([collapsed-left]) .left{display:none}';

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
  function convert(value, fromUnit, toUnit, el) {
    if (fromUnit === toUnit) return value;
    var rfs = rootFontSize(el);
    if (fromUnit === 'rem' && toUnit === 'px') return value * rfs;
    if (fromUnit === 'px'  && toUnit === 'rem') return value / rfs;
    var hostWidth = el.getBoundingClientRect().width || 1;
    var gap = parseFloat(getComputedStyle(el).getPropertyValue('--two-gap')) || 0;
    var available = hostWidth - gap;
    if (fromUnit === '%' && toUnit === 'px') return (value / 100) * available;
    if (fromUnit === 'px' && toUnit === '%')  return (value / available) * 100;
    if (fromUnit === '%' && toUnit === 'rem') return ((value / 100) * available) / rfs;
    if (fromUnit === 'rem' && toUnit === '%') return (value * rfs / available) * 100;
    return value;
  }
  function closestControl(target) { return target.closest ? target.closest('[data-two]') : null; }
  function resolveHost(sel) {
    if (!sel) return null;
    if (sel.charAt(0) === '#') return document.getElementById(sel.slice(1));
    try { return document.querySelector(sel); } catch (_) { return null; }
  }

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
      '<section class="panel left" part="left-panel"><slot name="left"></slot></section>' +
      '<section class="panel right" part="right-panel"><slot name="right"></slot></section>';
    self._root.appendChild(wrap);

    self._wrap = wrap;
    self._left = wrap.querySelector('.left');

    // capture initial attributes once for Reset()
    self._initCaptured = false;
    self._init = { left: null, gap: null };

    return self;
  }
  XTwoPanel.prototype = Object.create(HTMLElement.prototype);
  XTwoPanel.prototype.constructor = XTwoPanel;

  Object.defineProperty(XTwoPanel, 'observedAttributes', {
    get: function () { return ['left', 'gap', 'height']; }
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
    var height = (this.getAttribute('height') || '').trim();
    if (height) this.style.setProperty('--two-height', height);
    else this.style.removeProperty('--two-height');

    var gap = (this.getAttribute('gap') || '').trim();
    if (gap) this.style.setProperty('--two-gap', gap);
    else this.style.removeProperty('--two-gap');

    var left = (this.getAttribute('left') || '').trim();
    if (left) {
      this.style.setProperty('--two-left', left);
      this.setAttribute('data-left-fixed', '');
    } else {
      this.style.removeProperty('--two-left');
      this.removeAttribute('data-left-fixed'); // back to 1fr | 1fr
    }
  };

  // ----- tiny public API (used by external controls) -----
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

    // restore initial LEFT
    if (this._init.left !== null) this.setAttribute('left', this._init.left);
    else this.removeAttribute('left');

    // restore initial GAP
    if (this._init.gap !== null) this.setAttribute('gap', this._init.gap);
    else this.removeAttribute('gap');
  };
  XTwoPanel.prototype.step = function (sign, stepOverride) {
    var cur = this.getAttribute('left');
    if (!cur) {
      var px = this._left.getBoundingClientRect().width;
      var rem = (px / rootFontSize(this)).toFixed(3) + 'rem';
      this.setAttribute('left', rem);
      cur = rem;
    }
    var parsed = parseLen(cur);
    var unit = parsed.unit, val = parsed.n;

    var stepLen = stepOverride || (unit === '%' ? '5%' : '2rem');
    var s = parseLen(stepLen);
    var delta = s.n;
    if (unit !== s.unit) delta = convert(delta, s.unit, unit, this);

    var next = val + sign * delta;
    if (unit === '%') {
      next = Math.max(10, Math.min(90, next));
    } else {
      var lo = convert(8,  'rem', unit, this);
      var hi = convert(48, 'rem', unit, this);
      next = Math.max(lo, Math.min(hi, next));
    }
    this.setAttribute('left', String(next) + unit);
    this.removeAttribute('collapsed-left');
  };

  if (!customElements.get('x-two-panel')) {
    customElements.define('x-two-panel', XTwoPanel);
  }

  // ---------- GLOBAL external-controls handler ----------
  if (!window.__X_TWO_PANEL_EXTERNAL_WIRED__) {
    document.addEventListener('click', function (ev) {
      var ctrl = closestControl(ev.target);
      if (!ctrl) return;

      var sel = ctrl.getAttribute('data-two-for') || ctrl.getAttribute('aria-controls');
      var host = resolveHost(sel);
      if (!host || host.tagName.toLowerCase() !== 'x-two-panel') return;

      var action = (ctrl.dataset.two || '').toLowerCase();
      switch (action) {
        case 'narrow': host.step(-1, ctrl.dataset.step); break;
        case 'widen':  host.step(+1, ctrl.dataset.step); break;
        case 'toggle-left': host.toggleLeft(); break;
        case 'reset':  host.reset(); break;
        case 'set-left':
          if (ctrl.dataset.left || ctrl.dataset.value) host.setLeft(ctrl.dataset.left || ctrl.dataset.value);
          break;
        case 'set-gap':
          if (ctrl.dataset.gap) host.setGap(ctrl.dataset.gap);
          break;
      }
    }, true);
    window.__X_TWO_PANEL_EXTERNAL_WIRED__ = true;
  }
})();
