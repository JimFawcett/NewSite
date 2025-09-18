/* x-two-panel.classic.js
   Plain <script> version (no modules, no private fields), Shadow DOM with <style>.
   Always renders side-by-side: default 1fr | 1fr; when [left] is set => left | 1fr.
   Built-in button handling via data-two="...".
*/
(function () {
  var CSS_TEXT = '\
:host{display:block;--two-gap:1rem;--two-height:max-content}\
.wrap{display:grid;grid-template-columns:1fr 1fr;column-gap:var(--two-gap);height:var(--two-height);width:100%;box-sizing:border-box;overflow:hidden;background:var(--two-bg,transparent);border:var(--two-border,none);border-radius:var(--two-radius,0);padding:var(--two-pad,0)}\
:host([data-left-fixed]) .wrap{grid-template-columns:minmax(0,var(--two-left)) minmax(0,1fr)}\
.panel{min-width:0;min-height:0;overflow:auto;box-sizing:border-box;background:var(--two-panel-bg,#fff);border:var(--two-panel-border,1px solid #ececf2);border-radius:10px;padding:.75rem}\
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
    if (fromUnit === 'px' && toUnit === 'rem') return value / rfs;
    var hostWidth = el.getBoundingClientRect().width || 1;
    var gap = parseFloat(getComputedStyle(el).getPropertyValue('--two-gap')) || 0;
    var available = hostWidth - gap;
    if (fromUnit === '%' && toUnit === 'px') return (value / 100) * available;
    if (fromUnit === 'px' && toUnit === '%') return (value / available) * 100;
    if (fromUnit === '%' && toUnit === 'rem') return ((value / 100) * available) / rfs;
    if (fromUnit === 'rem' && toUnit === '%') return (value * rfs / available) * 100;
    return value;
  }

  function findActionTarget(ev, host) {
    var path = (ev.composedPath && ev.composedPath()) || [];
    if (path.length) {
      for (var i = 0; i < path.length; i++) {
        var n = path[i];
        if (n && n.nodeType === 1 && n.dataset && n.dataset.two) return n;
        if (n === host) break;
      }
      return null;
    }
    // Fallback (older browsers without composedPath)
    var node = ev.target;
    while (node && node !== host) {
      if (node.dataset && node.dataset.two) return node;
      node = node.parentNode;
    }
    return null;
  }

  function XTwoPanel() {
    var _this = Reflect.construct(HTMLElement, [], new.target);
    _this._root = _this.attachShadow({ mode: 'open' });

    attachStyles(_this._root, CSS_TEXT);
    var wrap = document.createElement('div');
    wrap.setAttribute('class', 'wrap');
    wrap.setAttribute('part', 'wrap');
    wrap.setAttribute('role', 'group');
    wrap.setAttribute('aria-label', 'Two panel');
    wrap.innerHTML = '' +
      '<section class="panel left" part="left-panel"><slot name="left"></slot></section>' +
      '<section class="panel right" part="right-panel"><slot name="right"></slot></section>';
    _this._root.appendChild(wrap);

    _this._wrap = wrap;
    _this._left = wrap.querySelector('.left');
    _this._right = wrap.querySelector('.right');

    _this._onClick = function (ev) {
      var el = findActionTarget(ev, _this);
      if (!el) return;
      var action = (el.dataset.two || '').toLowerCase();
      var stepRaw = el.dataset.step;
      var widthRaw = el.dataset.left || el.dataset.value;
      var gapRaw = el.dataset.gap;

      switch (action) {
        case 'narrow':        _this._step(-1, stepRaw); break;
        case 'widen':         _this._step(+1, stepRaw); break;
        case 'toggle-left':   _this.toggleLeft(); break;
        case 'reset':         _this.reset(); break;
        case 'set-left':      if (widthRaw) _this.setLeft(widthRaw); break;
        case 'set-gap':       if (gapRaw) _this.setGap(gapRaw); break;
        case 'collapse-left': _this.setAttribute('collapsed-left', ''); break;
        case 'expand-left':   _this.removeAttribute('collapsed-left'); break;
      }
    };

    _this.addEventListener('click', _this._onClick, true);
    return _this;
  }
  XTwoPanel.prototype = Object.create(HTMLElement.prototype);
  XTwoPanel.prototype.constructor = XTwoPanel;

  Object.defineProperty(XTwoPanel, 'observedAttributes', {
    get: function () { return ['left', 'gap', 'height']; }
  });

  XTwoPanel.prototype.connectedCallback = function () { this._applyAll(); };
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

  // Public API
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
    this.removeAttribute('left');
  };

  // Internal: step width by +/- stepOverride (default 2rem or 5%)
  XTwoPanel.prototype._step = function (sign, stepOverride) {
    var cur = this.getAttribute('left');
    if (!cur) {
      // Establish baseline from rendered width
      var px = this._left.getBoundingClientRect().width;
      var rem = (px / rootFontSize(this)).toFixed(3) + 'rem';
      this.setAttribute('left', rem);
      cur = rem;
    }
    var parsed = parseLen(cur);
    var unit = parsed.unit;
    var val = parsed.n;

    var stepLen = stepOverride || (unit === '%' ? '5%' : '2rem');
    var stepParsed = parseLen(stepLen);
    var delta = stepParsed.n;
    if (unit !== stepParsed.unit) delta = convert(delta, stepParsed.unit, unit, this);

    var next = val + sign * delta;
    if (unit === '%') {
      next = Math.max(10, Math.min(90, next));
    } else {
      var lo = convert(8, 'rem', unit, this);
      var hi = convert(48, 'rem', unit, this);
      next = Math.max(lo, Math.min(hi, next));
    }
    this.setAttribute('left', String(next) + unit);
    this.removeAttribute('collapsed-left');
  };

  // Register
  if (!customElements.get('x-two-panel')) {
    customElements.define('x-two-panel', XTwoPanel);
  }
})();
