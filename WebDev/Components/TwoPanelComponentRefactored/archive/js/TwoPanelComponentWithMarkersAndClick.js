/* TwoPanelComponent.autoMarkSync.offset.click.autoscroll.activeMark.js — classic <script>, no modules
   Features:
     • <x-two-panel> custom element
     • Public API: attributes [left, gap, height, step, min-left, max-left, min-right,
                               click-controls, no-mark-sync, mark-offset]
                   methods    setLeft(), setGap(), toggleLeft(), reset(), step(sign[, stepOverride]),
                              scrollRightToTop()
     • Optional click-controls (set attribute `click-controls` or data-click-controls)
     • External control buttons via [data-two] + data-two-for="#id"
     • Linux Firefox height shim (per-instance)
     • Mark/Description sync:
         - ON by default; disable with `no-mark-sync`
         - Order mapping or explicit mapping via data-mark-map="explicit" and .mark[data-for="leftId"]
         - Custom selectors: data-desc-selector / data-mark-selector
         - mark-offset (px|rem|%) threshold near top before switching (default 5rem)
         - Direction-aware hysteresis: only switch when next/prev mark ENTERS the offset band
         - Right-pane single-click selects description for nearest-above mark
     • Auto-scroll right pane to top on connect (default)
     • NEW: Active .mark turns GREEN; others RED (inline style)
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

  display:flex;
  flex-direction:column;
  min-height:0;
  overflow:visible;
}
.scroller{
  min-width:0;
  min-height:0;
  height:auto;
  flex:1 1 auto;
  overflow-y:auto;
  overflow-x:var(--two-scroller-overflow-x,hidden);
  padding:var(--two-panel-pad,0.5rem 0rem);
  box-sizing:border-box;
}
:host([collapsed-left]) .wrap{ grid-template-columns:1fr }
:host([collapsed-left]) .left{ display:none !important }

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
    get: function () {
      return [
        'left','gap','height','step',
        'min-left','max-left','min-right',
        'click-controls','no-mark-sync',
        'mark-offset' // threshold for mark sync
      ];
    }
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

    // Per-instance Linux Firefox height shim
    this._wireLinuxFirefoxShim();

    // Mark sync is ON by default unless explicitly disabled
    if (!this.hasAttribute('no-mark-sync')) {
      this._wireMarkSync();
    }

    // Auto-scroll right pane to top by default
    var doScrollTop = () => {
      var sc = this._root?.querySelector('[part="right-scroller"]');
      if (sc) sc.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    };
    requestAnimationFrame(() => requestAnimationFrame(doScrollTop));
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => requestAnimationFrame(doScrollTop));
    }
  };

  XTwoPanel.prototype.attributeChangedCallback = function (name) {
    if (name === 'click-controls') {
      this._enableClickControls(this.hasAttribute('click-controls'));
      return;
    }
    if (name === 'no-mark-sync') {
      if (this.hasAttribute('no-mark-sync')) this._unwireMarkSync(true);
      else this._wireMarkSync(true);
      return;
    }
    if (name === 'mark-offset') {
      this._wireMarkSync(true); // re-read threshold immediately
      return;
    }
    this._applyAll();
  };

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

    var deltaPx;
    if (stepOverride) {
      var so = parseLen(stepOverride);
      deltaPx = convert(so.n, so.unit, 'px', this);
    } else {
      var cssStepPx = readVarPx(this, '--two-step');
      if (cssStepPx != null) deltaPx = cssStepPx;
      else if (this.hasAttribute('step')) {
        var sp = parseLen(this.getAttribute('step'));
        deltaPx = convert(sp.n, sp.unit, 'px', this);
      } else {
        var def = (unit === '%') ? parseLen('5%') : parseLen('6rem');
        deltaPx = convert(def.n, def.unit, 'px', this);
      }
    }

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

    var nextLeftPx = leftPx + sign * deltaPx;
    nextLeftPx = Math.max(minLeftPx, Math.min(maxLeftPx, nextLeftPx));

    var nextVal = convert(nextLeftPx, 'px', unit, this);
    var out;
    if (unit === '%') out = nextVal.toFixed(3) + '%';
    else if (unit === 'rem') out = nextVal.toFixed(3) + 'rem';
    else out = Math.round(nextVal) + 'px';

    this.setAttribute('left', out);
    this.removeAttribute('collapsed-left');
  };

  // Public helper to scroll right pane to top (also called automatically on connect)
  XTwoPanel.prototype.scrollRightToTop = function () {
    var sc = this._root?.querySelector('[part="right-scroller"]');
    if (sc) sc.scrollTo({ top: 0, left: 0, behavior: 'auto' });
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
          if (!(side === 'right' && self.hasAttribute('collapsed-left'))) {
            onSingle(side);
          }
          timer = null;
        }, 220);
      };
    }

    if (left) {
      left.addEventListener('click', handler('left'));
      left.addEventListener('dblclick', handler('left'));
    }
    if (right) {
      right.addEventListener('click', handler('right'));
      right.addEventListener('dblclick', handler('right'));
    }
    this._clicksWired = true;
  };

  // --- Linux Firefox height shim (per-instance; safe no-op elsewhere) ---
  XTwoPanel.prototype._wireLinuxFirefoxShim = function () {
    var ua = navigator.userAgent || "";
    var isFirefox = /Firefox\/\d+/.test(ua);
    var isLinux   = /Linux/.test(ua);
    if (!isFirefox || !isLinux) return;

    var root         = this._root;
    var leftSlot     = root.querySelector('slot[name="left"]');
    var leftScroller = root.querySelector('[part="left-scroller"]');
    if (!leftSlot || !leftScroller) return;

    var applyHeights = function () {
      var assigned = leftSlot.assignedElements({ flatten: true });
      assigned.forEach(function (node) {
        node.querySelectorAll('details').forEach(function (d) {
          var summary = d.querySelector('summary');
          var fill    = d.querySelector('.fill');
          if (!summary || !fill) return;

          var styles = getComputedStyle(d);
          var pt = parseFloat(styles.paddingTop)    || 0;
          var pb = parseFloat(styles.paddingBottom) || 0;

          var avail = d.clientHeight - summary.offsetHeight - pt - pb;
          if (avail > 0) fill.style.height = avail + 'px';
        });
      });
    };

    function wireDetailsIn(nodes) {
      nodes.forEach(function (n) {
        n.querySelectorAll && n.querySelectorAll('details').forEach(function (d) {
          d.addEventListener('toggle', applyHeights);
        });
      });
    }

    var ro = new ResizeObserver(function(){ applyHeights(); });
    try { ro.observe(leftScroller); } catch(e) {}

    window.addEventListener('resize', applyHeights, { passive: true });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(applyHeights);
    }

    leftSlot.addEventListener('slotchange', function () {
      var assigned = leftSlot.assignedElements({ flatten: true });
      wireDetailsIn(assigned);
      applyHeights();
    });

    var initialAssigned = leftSlot.assignedElements({ flatten: true });
    wireDetailsIn(initialAssigned);
    applyHeights();
  };

  // --- Mark/Description sync (default ON; disable with no-mark-sync) ---
  XTwoPanel.prototype._wireMarkSync = function (reinit) {
    if (reinit && this.__markSync && this.__markSync.wired) {
      this._unwireMarkSync(false);
    } else if (this.__markSync && this.__markSync.wired && !reinit) {
      return;
    }

    var root        = this._root;
    var leftSlot    = root.querySelector('slot[name="left"]');
    var rightSlot   = root.querySelector('slot[name="right"]');
    var rightScroll = root.querySelector('[part="right-scroller"]');
    if (!leftSlot || !rightSlot || !rightScroll) return;

    var descSel  = this.getAttribute('data-desc-selector') || '.marked-box';
    var markSel  = this.getAttribute('data-mark-selector') || '.mark';
    var explicit = (this.getAttribute('data-mark-map') || '').toLowerCase() === 'explicit';

    var leftBoxes = [];
    var marks     = [];
    var lastIdx   = -1;
    var lastMarkIdx = -1;
    var rafId     = null;

    // Track scroll direction with a tiny deadzone
    var lastScrollTop    = rightScroll.scrollTop;
    var pendingScrollTop = lastScrollTop;

    var collectLeft = () => {
      leftBoxes = [];
      leftSlot.assignedElements({ flatten: true }).forEach(function (node) {
        if (node.matches && node.matches(descSel)) leftBoxes.push(node);
        var found = node.querySelectorAll ? node.querySelectorAll(descSel) : [];
        found.forEach(function (n){ leftBoxes.push(n); });
      });
    };
    var collectMarks = () => {
      marks = [];
      rightSlot.assignedElements({ flatten: true }).forEach(function (node) {
        if (node.matches && node.matches(markSel)) marks.push(node);
        var found = node.querySelectorAll ? node.querySelectorAll(markSel) : [];
        found.forEach(function (n){ marks.push(n); });
      });
    };

    function colorizeAllRed() {
      for (var i=0; i<marks.length; ++i) {
        marks[i].style.backgroundColor = 'red';
        marks[i].classList.remove('active-mark');
        marks[i].removeAttribute('data-active-mark');
      }
    }
    function setActivePair(boxIdx, markIdx) {
      if (boxIdx == null || boxIdx < 0) return;

      if (boxIdx !== lastIdx) {
        lastIdx = boxIdx;
        for (var i=0; i<leftBoxes.length; ++i) {
          var show = (i === boxIdx);
          var box  = leftBoxes[i];
          box.style.display = show ? '' : 'none';
          box.setAttribute('aria-hidden', show ? 'false' : 'true');
          box.classList.toggle('active', show);
        }
      }

      if (markIdx != null && markIdx >= 0 && markIdx < marks.length) {
        if (lastMarkIdx !== -1 && marks[lastMarkIdx]) {
          marks[lastMarkIdx].style.backgroundColor = 'red';
          marks[lastMarkIdx].classList.remove('active-mark');
          marks[lastMarkIdx].removeAttribute('data-active-mark');
        }
        marks[markIdx].style.backgroundColor = 'green';
        marks[markIdx].classList.add('active-mark');
        marks[markIdx].setAttribute('data-active-mark','true');
        lastMarkIdx = markIdx;
      }
    }

    function mapMarkToBox(mark, idx) {
      if (explicit) {
        var id = mark.getAttribute('data-for');
        if (id) {
          for (var i=0; i<leftBoxes.length; ++i) {
            if (leftBoxes[i].id === id) return i;
          }
        }
      }
      return Math.min(idx, leftBoxes.length - 1);
    }

    // ---- threshold helpers ----
    function offsetPxFromAttr() {
      var raw = (this.getAttribute('mark-offset') || '5rem').trim(); // default
      var m = raw.match(/^(-?\d*\.?\d+)\s*(px|rem|%)?$/i);
      if (!m) return 0;
      var n = parseFloat(m[1]);
      var unit = (m[2] || 'px').toLowerCase();
      if (unit === 'px')  return n;
      if (unit === 'rem') return n * (rootFontSize(this) || 16);
      if (unit === '%') {
        var h = rightScroll.clientHeight || 1;
        return (n / 100) * h;
      }
      return n;
    }

    function indexFirstBelowTop(scTop) {
      for (var i = 0; i < marks.length; ++i) {
        if (marks[i].getBoundingClientRect().top >= scTop) return i;
      }
      return -1;
    }
    function indexLastAboveTop(scTop) {
      for (var i = marks.length - 1; i >= 0; --i) {
        if (marks[i].getBoundingClientRect().top < scTop) return i;
      }
      return -1;
    }

    // initial
    collectLeft();
    collectMarks();
    colorizeAllRed();
    if (leftBoxes.length) {
      for (var b=0; b<leftBoxes.length; ++b) {
        leftBoxes[b].style.display = 'none';
        leftBoxes[b].setAttribute('aria-hidden','true');
        leftBoxes[b].classList.remove('active');
      }
      if (marks.length) setActivePair(0, 0);
      else setActivePair(0, -1);
    }

    var requestUpdate = () => {
      if (rafId != null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;

        var scRect    = rightScroll.getBoundingClientRect();
        var threshold = offsetPxFromAttr.call(this);
        var dirDown   = pendingScrollTop > lastScrollTop + 0.5;
        var dirUp     = pendingScrollTop < lastScrollTop - 0.5;

        if (dirDown || (!dirUp && lastIdx < 0)) {
          var nextIdx = indexFirstBelowTop(scRect.top);
          if (nextIdx !== -1) {
            var dy = marks[nextIdx].getBoundingClientRect().top - scRect.top;
            if (dy <= threshold) {
              var boxIdx = mapMarkToBox(marks[nextIdx], nextIdx);
              setActivePair(boxIdx, nextIdx);
            }
          }
        } else if (dirUp) {
          var prevIdx = indexLastAboveTop(scRect.top);
          if (prevIdx !== -1) {
            var dyUp = scRect.top - marks[prevIdx].getBoundingClientRect().top;
            if (dyUp <= threshold) {
              var boxIdx2 = mapMarkToBox(marks[prevIdx], prevIdx);
              setActivePair(boxIdx2, prevIdx);
            }
          }
        }

        lastScrollTop = pendingScrollTop;
      });
    };

    // click-to-select in right pane
    function pickIndexForClientY(clientY) {
      if (!marks.length) return -1;
      var bestAbove = -1, bestAboveDy = Infinity;
      var bestBelow = -1, bestBelowDy = Infinity;
      for (var i = 0; i < marks.length; ++i) {
        var t = marks[i].getBoundingClientRect().top;
        var dy = t - clientY;
        if (dy <= 0) { // above or at
          var a = -dy;
          if (a < bestAboveDy) { bestAboveDy = a; bestAbove = i; }
        } else {
          if (dy < bestBelowDy) { bestBelowDy = dy; bestBelow = i; }
        }
      }
      return (bestAbove !== -1) ? bestAbove : bestBelow;
    }
    var onRightClick = (ev) => {
      if (ev.button !== 0) return;
      if (ev.detail && ev.detail > 1) return;
      var path = ev.composedPath ? ev.composedPath() : [ev.target];
      if (path.some(isInteractive) || hasSelection()) return;
      ev.stopPropagation();
      var idx = pickIndexForClientY(ev.clientY);
      if (idx >= 0) {
        var boxIdx = mapMarkToBox(marks[idx], idx);
        setActivePair(boxIdx, idx);
      }
    };

    // listeners/observers
    var onScroll   = () => { pendingScrollTop = rightScroll.scrollTop; requestUpdate(); };
    var onResize   = () => { requestUpdate(); };
    var onLeftSlot = () => { collectLeft(); requestUpdate(); };
    var onRightSlot= () => { collectMarks(); colorizeAllRed(); requestUpdate(); };

    rightScroll.addEventListener('scroll', onScroll, { passive:true });
    window.addEventListener('resize', onResize, { passive:true });
    rightScroll.addEventListener('click', onRightClick, false);

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(requestUpdate);
    }

    var ro = new ResizeObserver(requestUpdate);
    try { ro.observe(rightScroll); } catch(_) {}

    leftSlot.addEventListener('slotchange', onLeftSlot);
    rightSlot.addEventListener('slotchange', onRightSlot);

    // store teardown info
    this.__markSync = {
      wired: true,
      rightScroll,
      onScroll,
      onResize,
      onLeftSlot,
      onRightSlot,
      onRightClick,
      ro,
      leftBoxesRef: () => leftBoxes,
      marksRef: () => marks
    };
  };

  XTwoPanel.prototype._unwireMarkSync = function (showAll) {
    var ms = this.__markSync;
    if (!ms || !ms.wired) return;

    try { ms.rightScroll.removeEventListener('scroll', ms.onScroll); } catch(_){}
    try { window.removeEventListener('resize', ms.onResize); } catch(_){}
    try { ms.rightScroll.removeEventListener('click', ms.onRightClick); } catch(_){}
    try { ms.ro && ms.ro.disconnect && ms.ro.disconnect(); } catch(_){}

    var leftBoxes = ms.leftBoxesRef ? ms.leftBoxesRef() : [];
    var marks = ms.marksRef ? ms.marksRef() : [];
    if (showAll) {
      leftBoxes.forEach(function (b) {
        b.style.display = '';
        b.setAttribute('aria-hidden','false');
        b.classList.remove('active');
      });
      marks.forEach(function (m) {
        m.style.backgroundColor = 'red';
        m.classList.remove('active-mark');
        m.removeAttribute('data-active-mark');
      });
    }
    this.__markSync.wired = false;
  };

  // ---------- define ----------
  if (!customElements.get('x-two-panel')) {
    customElements.define('x-two-panel', XTwoPanel);
  }

  // ---------- global external-controls handler with scoped targeting ----------
  function findScopedPanel(ctrl, sel) {
    var host = resolveHost(sel);
    if (host && host.tagName && host.tagName.toLowerCase() === 'x-two-panel') return host;

    var inside = ctrl.closest && ctrl.closest('x-two-panel.with-buttons');
    if (inside) return inside;

    for (var n = ctrl.parentElement; n; n = n.parentElement) {
      var cand = n.querySelector && n.querySelector('x-two-panel.with-buttons');
      if (cand) return cand;
    }
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
