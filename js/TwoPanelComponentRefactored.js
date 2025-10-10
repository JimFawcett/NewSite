/* TwoPanelComponentRefactored_NoMarks.js — classic <script> (no modules)
   Two‑array design with NO marks:
     • Custom element: <x-two-panel>
     • Left/Right mapping is by INDEX only (no scroll coupling).
     • Public attributes: [left, gap, height, step, min-left, max-left, min-right, click-controls,
                           data-desc-selector, data-right-selector]
     • Public methods: setLeft(), setGap(), toggleLeft(), reset(), step(sign[, stepOverride]),
                       currentIndex(), setIndex(i), next({wrap}), prev({wrap}), scrollRightToTop()
     • External controls via [data-two] + data-two-for="#id"
       Actions: narrow | widen | toggle-left | reset | set-left | set-gap | collapse-left | expand-left |
                next | prev | next-mark | prev-mark
     • Emits CustomEvent 'two:nav' with {index, count}
*/
(function(){
  // -------- helpers --------
  function parseLen(s){
    var m = String(s||'').trim().match(/^(-?\d*\.?\d+)\s*(px|rem|%)?$/i);
    if(!m) return { n:0, unit:'px' };
    return { n: parseFloat(m[1]), unit: (m[2]||'px').toLowerCase() };
  }
  function rootFontSize(el){
    var root = (el && el.getRootNode && el.getRootNode()) || document;
    var doc = root instanceof Document ? root : document;
    var fs = parseFloat(getComputedStyle(doc.documentElement).fontSize);
    return isFinite(fs) && fs>0 ? fs : 16;
  }
  function convert(value, fromUnit, toUnit, el){
    if(fromUnit === toUnit) return value;
    var rfs = rootFontSize(el);
    if(fromUnit==='rem' && toUnit==='px') return value*rfs;
    if(fromUnit==='px'  && toUnit==='rem') return value/rfs;
    var avail = availablePx(el) || 1; // for %
    if(fromUnit==='%' && toUnit==='px') return (value/100)*avail;
    if(fromUnit==='px' && toUnit=== '%') return (value/avail)*100;
    if(fromUnit==='%' && toUnit==='rem') return ((value/100)*avail)/rfs;
    if(fromUnit==='rem' && toUnit=== '%') return (value*rfs/avail)*100;
    return value;
  }
  function readVarPx(host, name){
    var raw = getComputedStyle(host).getPropertyValue(name).trim();
    if(!raw) return null;
    var p = parseLen(raw);
    return convert(p.n, p.unit, 'px', host);
  }
  function gapPx(el){
    var raw = getComputedStyle(el).getPropertyValue('--two-gap').trim() || '0.50rem';
    var p = parseLen(raw);
    return convert(p.n, p.unit, 'px', el);
  }
  function availablePx(el){
    var hostW = el.getBoundingClientRect().width || 1;
    return Math.max(0, hostW - gapPx(el));
  }
  function readAttrPx(host, attrName){
    if(!host.hasAttribute(attrName)) return null;
    var v = host.getAttribute(attrName).trim().toLowerCase();
    if(attrName==='max-left' && v==='auto'){
      var minRightPx = readVarPx(host, '--two-min-right');
      if(minRightPx==null){
        var a = host.getAttribute('min-right');
        if(a){ var pr = parseLen(a); minRightPx = convert(pr.n, pr.unit, 'px', host); }
        else { minRightPx = convert(8,'rem','px',host); }
      }
      return Math.max(0, availablePx(host) - minRightPx);
    }
    var p = parseLen(v);
    return convert(p.n, p.unit, 'px', host);
  }
  function isElem(n){ return n && n.nodeType===1; }
  function isInteractive(n){
    return isElem(n) && n.closest && n.closest('a,button,input,textarea,select,label,summary,details,[contenteditable="true"]');
  }
  function hasSelection(){
    var s = window.getSelection && window.getSelection();
    return s && s.type==='Range' && String(s).length>0;
  }

  // -------- component --------
  function XTwoPanel(){
    var self = Reflect.construct(HTMLElement, [], new.target);
    var shadow = self.attachShadow({ mode:'open' });

    var CSS_TEXT = `
:host{display:block}
.wrap{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);column-gap:var(--two-gap,0.50rem);height:var(--two-height,max-content);width:100%;box-sizing:border-box}
:host([data-left-fixed]) .wrap{grid-template-columns:minmax(0,var(--two-left,calc(50% - var(--two-gap,0.50rem)/2))) minmax(0,1fr)}
.panel{min-width:0;box-sizing:border-box;background:var(--two-panel-bg,transparent);border:var(--two-panel-border,1px solid #ececf2);border-radius:10px;display:flex;flex-direction:column;min-height:0}
.scroller{min-width:0;min-height:0;height:auto;flex:1 1 auto;overflow:auto;padding:var(--two-panel-pad,0.5rem 0rem);box-sizing:border-box}
:host([collapsed-left]) .wrap{grid-template-columns:1fr}
:host([collapsed-left]) .left{display:none !important}
::slotted(.left-slot),::slotted(.right-slot){border:none}
`;
    var style = document.createElement('style'); style.textContent = CSS_TEXT; shadow.appendChild(style);

    var wrap = document.createElement('div');
    wrap.className = 'wrap';
    wrap.setAttribute('part','wrap');
    wrap.innerHTML = (
      '<section class="panel left" part="left-panel">'+
        '<div class="scroller" part="left-scroller"><slot name="left"></slot></div>'+
      '</section>'+
      '<section class="panel right" part="right-panel">'+
        '<div class="scroller" part="right-scroller"><slot name="right"></slot></div>'+
      '</section>'
    );
    shadow.appendChild(wrap);

    self._root = shadow;
    self._wrap = wrap;
    self._leftPanel = wrap.querySelector('.panel.left');

    self._left = [];   // description nodes
    self._right = [];  // code/content nodes
    self._i = -1;      // current index

    self._init = { left:null, gap:null };

    return self;
  }
  XTwoPanel.prototype = Object.create(HTMLElement.prototype);
  XTwoPanel.prototype.constructor = XTwoPanel;

  Object.defineProperty(XTwoPanel, 'observedAttributes', {
    get: function(){
      return ['left','gap','height','step','min-left','max-left','min-right','click-controls','data-desc-selector','data-right-selector'];
    }
  });

  XTwoPanel.prototype.connectedCallback = function(){
    if(!this._connectedOnce){
      this._init.left = this.hasAttribute('left') ? this.getAttribute('left') : null;
      this._init.gap  = this.hasAttribute('gap')  ? this.getAttribute('gap')  : null;
      this._connectedOnce = true;
    }
    this._applyAll();

    if(this.hasAttribute('click-controls') || this.dataset.clickControls !== undefined){
      this._wireClickControls();
    }

    this._recollect();
    var count = this._count();
    if(count>0){ this._i = 0; this._renderState(); }

    this.scrollRightToTop();
  };

  XTwoPanel.prototype.disconnectedCallback = function(){ /* no-op */ };

  XTwoPanel.prototype.attributeChangedCallback = function(name){
    if(name==='click-controls') return;
    if(name==='data-desc-selector' || name==='data-right-selector'){
      var idx = this._i >= 0 ? this._i : 0;
      this._recollect();
      this._i = Math.max(0, Math.min(idx, this._count()-1));
      this._renderState();
      return;
    }
    this._applyAll();
  };

  // ----- public API -----
  XTwoPanel.prototype.setLeft = function(value){ this.removeAttribute('collapsed-left'); this.setAttribute('left', value); };
  XTwoPanel.prototype.setGap  = function(value){ this.setAttribute('gap', value); };
  XTwoPanel.prototype.toggleLeft = function(){ if(this.hasAttribute('collapsed-left')) this.removeAttribute('collapsed-left'); else this.setAttribute('collapsed-left',''); };
  XTwoPanel.prototype.reset = function(){
    this.removeAttribute('collapsed-left');
    if(this._init.left!==null) this.setAttribute('left', this._init.left); else this.removeAttribute('left');
    if(this._init.gap !==null) this.setAttribute('gap',  this._init.gap);  else this.removeAttribute('gap');
  };
  XTwoPanel.prototype.step = function(sign, stepOverride){
    var cur = this.getAttribute('left');
    if(!cur){ var pxNow = this._leftPanel.getBoundingClientRect().width; var rem = (pxNow/rootFontSize(this)).toFixed(3)+'rem'; this.setAttribute('left', rem); cur = rem; }
    var parsed = parseLen(cur); var unit = parsed.unit; var leftPx = convert(parsed.n, unit, 'px', this);

    var deltaPx;
    if(stepOverride){ var so = parseLen(stepOverride); deltaPx = convert(so.n, so.unit, 'px', this); }
    else { var cssStepPx = readVarPx(this,'--two-step'); if(cssStepPx!=null) deltaPx = cssStepPx; else if(this.hasAttribute('step')){ var sp=parseLen(this.getAttribute('step')); deltaPx = convert(sp.n, sp.unit, 'px', this);} else { var def=parseLen('6rem'); deltaPx = convert(def.n, def.unit, 'px', this);} }

    var defMinLeftPx  = convert(8,'rem','px',this);
    var defMinRightPx = convert(8,'rem','px',this);

    var cssMinLeftPx  = readVarPx(this,'--two-min-left');
    var cssMinRightPx = readVarPx(this,'--two-min-right');
    var cssMaxLeftPx  = readVarPx(this,'--two-max-left');

    var minLeftPx  = (cssMinLeftPx  != null)? cssMinLeftPx  : (readAttrPx(this,'min-left')  ?? defMinLeftPx);
    var minRightPx = (cssMinRightPx != null)? cssMinRightPx : (readAttrPx(this,'min-right') ?? defMinRightPx);

    var containerMinusGap = availablePx(this);
    var autoMaxLeftPx     = Math.max(0, containerMinusGap - minRightPx);
    var userMaxPx         = (cssMaxLeftPx!=null)? cssMaxLeftPx : (readAttrPx(this,'max-left') ?? autoMaxLeftPx);
    var maxLeftPx         = Math.min(autoMaxLeftPx, userMaxPx);
    if(maxLeftPx < minLeftPx) maxLeftPx = minLeftPx;

    var nextLeftPx = Math.max(minLeftPx, Math.min(maxLeftPx, leftPx + sign*deltaPx));
    var nextVal = convert(nextLeftPx,'px',unit,this);
    var out = (unit==='%'? nextVal.toFixed(3)+'%' : unit==='rem'? nextVal.toFixed(3)+'rem' : Math.round(nextVal)+'px');
    this.setAttribute('left', out);
    this.removeAttribute('collapsed-left');
  };
  XTwoPanel.prototype.scrollRightToTop = function(){ var sc = this._rightScroller(); if(sc) sc.scrollTo({ top:0, left:0, behavior:'auto' }); };

  // navigation API (array-based)
  XTwoPanel.prototype.currentIndex = function(){ return this._i; };
  XTwoPanel.prototype.setIndex = function(i){
    var count = this._count(); if(count===0) return;
    var idx = Math.max(0, Math.min(count-1, i|0));
    if(idx !== this._i){ this._i = idx; this._renderState(); }
  };
  XTwoPanel.prototype.next = function(opts){ opts=opts||{wrap:false}; var count=this._count(); if(count===0) return; var i=this._i<0?0:this._i; if(opts.wrap) this.setIndex((i+1)%count); else this.setIndex(Math.min(i+1, count-1)); };
  XTwoPanel.prototype.prev = function(opts){ opts=opts||{wrap:false}; var count=this._count(); if(count===0) return; var i=this._i<0?0:this._i; if(opts.wrap) this.setIndex((i-1+count)%count); else this.setIndex(Math.max(i-1,0)); };

  // -------- internals --------
  XTwoPanel.prototype._rightScroller = function(){ return this._root && this._root.querySelector('[part="right-scroller"]'); };
  XTwoPanel.prototype._rightSlot     = function(){ return this._root && this._root.querySelector('slot[name="right"]'); };
  XTwoPanel.prototype._leftSlot      = function(){ return this._root && this._root.querySelector('slot[name="left"]'); };

  XTwoPanel.prototype._collectLeft = function(){
    var sel = (this.getAttribute('data-desc-selector') || '.marked-box, .left-item').trim();
    var slot = this._leftSlot(); var out=[]; if(!slot) return out;
    slot.assignedElements({ flatten:true }).forEach(function(node){
      if(node.matches && node.matches(sel)) out.push(node);
      if(node.querySelectorAll) node.querySelectorAll(sel).forEach(function(n){ out.push(n); });
    });
    return out;
  };
  XTwoPanel.prototype._collectRight = function(){
    var sel = (this.getAttribute('data-right-selector') || '.right-item').trim();
    var slot = this._rightSlot(); var out=[]; if(!slot) return out;
    slot.assignedElements({ flatten:true }).forEach(function(node){
      if(node.matches && node.matches(sel)) out.push(node);
      if(node.querySelectorAll) node.querySelectorAll(sel).forEach(function(n){ out.push(n); });
    });
    return out;
  };
  XTwoPanel.prototype._recollect = function(){
    this._left  = this._collectLeft();
    this._right = this._collectRight();
    // normalize base visibility
    for(var i=0;i<this._left.length;i++){ var L=this._left[i]; L.style.display='none'; L.setAttribute('aria-hidden','true'); L.classList.remove('active'); }
    for(var k=0;k<this._right.length;k++){ var R=this._right[k]; R.style.display='none'; R.setAttribute('aria-hidden','true'); R.classList.remove('active'); }
  };
  XTwoPanel.prototype._count = function(){ return Math.min(this._left.length, this._right.length); };

  XTwoPanel.prototype._renderState = function(){
    var count = this._count(); if(count===0){ return; }
    var i = Math.max(0, Math.min(count-1, this._i<0?0:this._i));

    for(var a=0;a<this._left.length;a++){
      var show = (a===i);
      var box=this._left[a];
      box.style.display = show? '' : 'none';
      box.setAttribute('aria-hidden', show? 'false':'true');
      box.classList.toggle('active', show);
    }
    for(var b=0;b<this._right.length;b++){
      var showR = (b===i);
      var r=this._right[b];
      r.style.display = showR? '' : 'none';
      r.setAttribute('aria-hidden', showR? 'false':'true');
      r.classList.toggle('active', showR);
    }

    this.dispatchEvent(new CustomEvent('two:nav', { detail:{ index:i, count:count } }));
  };

  XTwoPanel.prototype._applyAll = function(){
    var height = (this.getAttribute('height')||'').trim(); if(height) this.style.setProperty('--two-height', height); else this.style.removeProperty('--two-height');
    var gap    = (this.getAttribute('gap')||'').trim();    if(gap)    this.style.setProperty('--two-gap', gap);       else this.style.removeProperty('--two-gap');
    var left   = (this.getAttribute('left')||'').trim();   if(left){ this.style.setProperty('--two-left', left); if(!this.hasAttribute('data-left-fixed')) this.setAttribute('data-left-fixed',''); }
    else { this.style.removeProperty('--two-left'); if(this.hasAttribute('data-left-fixed')) this.removeAttribute('data-left-fixed'); }
  };

  XTwoPanel.prototype._wireClickControls = function(){
    var left  = this._root.querySelector('.panel.left');
    var right = this._root.querySelector('.panel.right');
    var timer = null; var self=this;
    function onSingle(side){ if(side==='left') self.step(+1); else self.step(-1); }
    function onDouble(side){ if(side==='left') self.reset(); else self.toggleLeft(); }
    function handler(side){
      return function(ev){
        var path = ev.composedPath ? ev.composedPath() : [ev.target];
        if(path.some(isInteractive) || hasSelection()) return;
        if(ev.type==='dblclick'){ if(timer){ clearTimeout(timer); timer=null; } onDouble(side); return; }
        if(timer) clearTimeout(timer);
        timer = setTimeout(function(){ if(!(side==='right' && self.hasAttribute('collapsed-left'))) onSingle(side); timer=null; },220);
      };
    }
    left  && left.addEventListener('click', handler('left'));
    left  && left.addEventListener('dblclick', handler('left'));
    right && right.addEventListener('click', handler('right'));
    right && right.addEventListener('dblclick', handler('right'));
  };

  // -------- define --------
  if(!customElements.get('x-two-panel')) customElements.define('x-two-panel', XTwoPanel);

  // -------- external controls (global; click delegation) --------
  function closestControl(target){ return target.closest ? target.closest('[data-two]') : null; }
  function resolveHost(sel){ if(!sel) return null; if(sel.charAt(0)==='#') return document.getElementById(sel.slice(1)); try{ return document.querySelector(sel); }catch(_){ return null; } }
  function findScopedPanel(ctrl, sel){
    var host = resolveHost(sel);
    if(host && host.tagName && host.tagName.toLowerCase()==='x-two-panel') return host;
    var inside = ctrl.closest && ctrl.closest('x-two-panel.with-buttons');
    if(inside) return inside;
    for(var n=ctrl.parentElement; n; n=n.parentElement){ var cand = n.querySelector && n.querySelector('x-two-panel.with-buttons'); if(cand) return cand; }
    return document.querySelector('x-two-panel.with-buttons') || document.querySelector('x-two-panel');
  }

  if(!window.__X_TWO_PANEL_EXTERNAL_WIRED__REFAC2__){
    document.addEventListener('click', function(ev){
      var ctrl = closestControl(ev.target); if(!ctrl) return;
      var sel  = ctrl.getAttribute('data-two-for') || ctrl.getAttribute('aria-controls');
      var host = findScopedPanel(ctrl, sel); if(!host || host.tagName.toLowerCase()!=='x-two-panel') return;
      var action = (ctrl.dataset.two || '').toLowerCase();
      switch(action){
        case 'narrow':        host.step(-1, ctrl.dataset.step); break;
        case 'widen':         host.step(+1, ctrl.dataset.step); break;
        case 'toggle-left':   host.toggleLeft(); break;
        case 'reset':         host.reset(); break;
        case 'set-left':      if(ctrl.dataset.left || ctrl.dataset.value) host.setLeft(ctrl.dataset.left || ctrl.dataset.value); break;
        case 'set-gap':       if(ctrl.dataset.gap) host.setGap(ctrl.dataset.gap); break;
        case 'collapse-left': host.setAttribute('collapsed-left',''); break;
        case 'expand-left':   host.removeAttribute('collapsed-left'); break;
        case 'next':
        case 'next-mark':     host.next({ wrap:false }); break;
        case 'prev':
        case 'prev-mark':     host.prev({ wrap:false }); break;
      }
    }, true);
    window.__X_TWO_PANEL_EXTERNAL_WIRED__REFAC2__ = true;
  }
})();  // ← end of the component IIFE

/* ---------------- Auto-disable Prev/Next at ends (standalone) ---------------- */
(function(){
  function isNav(btn){
    var a = (btn.dataset.two||'').toLowerCase();
    return a==='prev' || a==='prev-mark' || a==='next' || a==='next-mark';
  }
  function panelFor(btn){
    var sel = btn.getAttribute('data-two-for') || btn.getAttribute('aria-controls');
    if (sel) {
      try { return sel[0]==='#' ? document.getElementById(sel.slice(1)) : document.querySelector(sel); }
      catch(_) { return null; }
    }
    return (btn.closest && btn.closest('x-two-panel.with-buttons'))
           || document.querySelector('x-two-panel.with-buttons')
           || document.querySelector('x-two-panel');
  }
  function countPairs(host){
    if (host && host._marks && host._marks.length) return host._marks.length|0; // mark-based variant (if any)
    var L = (host && host._left  && host._left.length)  ? host._left.length  : 0; // index-based variant
    var R = (host && host._right && host._right.length) ? host._right.length : 0;
    return Math.min(L,R)|0;
  }
  function assocButtons(host){
    var list = [];
    var all = document.querySelectorAll('[data-two]');
    for (var i=0;i<all.length;i++){
      var b = all[i];
      if (!isNav(b)) continue;
      var p = panelFor(b);
      if (p === host) list.push(b);
    }
    return list;
  }
  function sync(host, idx, count){
    var btns = assocButtons(host);
    for (var i=0;i<btns.length;i++){
      var act = (btns[i].dataset.two||'').toLowerCase();
      if (act==='prev' || act==='prev-mark') btns[i].disabled = (idx <= 0);
      else if (act==='next' || act==='next-mark') btns[i].disabled = (count <= 0 || idx >= count-1);
    }
  }
  function initHost(host){
    if (!host) return;
    host.addEventListener('two:nav', function(e){
      var d = e.detail||{};
      var idx = (d.index|0);
      var cnt = (d.count!=null) ? (d.count|0) : countPairs(host);
      sync(host, idx, cnt);
    });
    // initial sync
    var kickoff = function(){
      var idx = (typeof host.currentIndex==='function') ? (host.currentIndex()|0)
              : (typeof host.currentMarkIndex==='function') ? (host.currentMarkIndex()|0) : 0;
      sync(host, idx, countPairs(host));
    };
    if ('requestAnimationFrame' in window) requestAnimationFrame(kickoff); else kickoff();
  }
  function boot(){
    var hosts = document.querySelectorAll('x-two-panel');
    for (var i=0;i<hosts.length;i++) initHost(hosts[i]);
  }
  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', boot, { once:true });
  else boot();
})();
