# x-two-panel  
![custom-element](https://img.shields.io/badge/web-component-%E2%9C%93-brightgreen) ![deps](https://img.shields.io/badge/deps-none-informational)  
**Version:** v1.0.0

A lightweight Web Component for a two-pane layout: an adjustable **left** panel and a flexible **right** panel. Classic script (no modules), no client JS wiring required—control it with data attributes on buttons.

---

## Install

```html
<!-- Your compiled component -->
<script src="js/TwoPanelComponentUsingButtons.js"></script>
```

---

## Quick Start

```html
<x-two-panel id="panel" left="24rem" min-left="8rem" min-right="8rem">
  <div slot="left">Left content…</div>
  <div slot="right">Right content…</div>
</x-two-panel>

<!-- External controls (no custom JS needed) -->
<button data-two="narrow" data-two-for="#panel">Narrow</button>
<button data-two="widen"  data-two-for="#panel">Widen</button>
<button data-two="reset"  data-two-for="#panel">Reset</button>
```

---

## Attributes (HTML)

- `left="<len|%>"` – Initial left width (`px`, `rem`, or `%`). Enables **fixed-left** layout.  
- `gap="<len|%>"` – Space between panels. (Equivalent to `--two-gap`.)  
- `height="<len|vh|%|…>"` – Component height; panels scroll inside. (Equivalent to `--two-height`.)  
- `step="<len|%>"` – Default increment for `narrow` / `widen` (buttons can override).  
- `min-left="<len|%>"` – Minimum left width (default 8rem if not overridden).  
- `min-right="<len|%>"` – Minimum right width (limits how far `widen` can go; default 8rem).  
- `max-left="<len|%|auto>"` – Maximum left width. `auto` = container − gap − `min-right`.  
- `data-left-fixed` *(boolean)* – Use fixed-left layout without `left="…"`. Reads `--two-left` or falls back to equal halves.

### Flexible vs Fixed-left

- **Flexible (default):** no `left`, no `data-left-fixed` → grid `1fr 1fr` (both flexible).  
- **Fixed-left:** `left="…"`, or `data-left-fixed` → grid `minmax(0, LEFT) 1fr`.  
  - With `data-left-fixed` but **no** `left`/`--two-left`, fallback **LEFT** = `calc(50% - var(--two-gap)/2)` (equal halves with gap accounted for).

---

## CSS Custom Properties (set on the host)

- `--two-gap` – Gap between panels. *(Default: `0.50rem`)*  
- `--two-height` – Component height. *(Default: `max-content`)*  
- `--two-left` – Left width used when `data-left-fixed` is present (or as styling fallback).  
- `--two-step` – Default step size; overrides `step` attribute if set. *(Default: `6rem`; when `left` is `%`, default step = `5%`)*  
- `--two-min-left` / `--two-min-right` / `--two-max-left` – Bounds; override attributes. *(Defaults: `8rem`, `8rem`, `auto`)*  
- `--two-panel-pad` – Inner padding of each panel. *(Default: `0.5rem 0rem`)*  
- Theme hooks: `--two-panel-border`, `--two-panel-radius`, `--two-bg`, `--two-border`, `--two-pad`  
- Scroller behavior: `--two-scroller-overflow-x` (default `hidden`; set `auto` to allow horizontal scroll inside panels)

**Global defaults example**
```css
x-two-panel{
  --two-gap: .5rem;
  --two-height: 60vh;
  --two-panel-pad: .5rem 0;
  --two-step: 2rem;
  --two-min-left: 4rem;
  --two-min-right: 4rem;
  /* --two-max-left: 48rem; */
}
```

**Equal halves via CSS only**
```css
#panel { --two-left: calc(50% - var(--two-gap)/2); }
```
```html
<x-two-panel id="panel" data-left-fixed>…</x-two-panel>
```

---

## Slots

- `slot="left"` — Left panel content  
- `slot="right"` — Right panel content

---

## ::part() Targets

- `wrap`  
- `left-panel`, `right-panel`  
- `left-scroller`, `right-scroller`

```css
x-two-panel::part(left-panel),
x-two-panel::part(right-panel){
  border-radius: 0;
}
```

---

## External Controls (data attributes)

Attach to any button/link. Target the component with `data-two-for="#id"` (or `aria-controls="id"`).

**Actions (`data-two="…")**
- `narrow` – Decrease left width  
- `widen` – Increase left width  
- `toggle-left` – Collapse/restore left panel  
- `reset` – Restore initial `left`/`gap` from markup  
- `set-left` – With `data-left="24rem"` (or `data-value="…")`  
- `set-gap` – With `data-gap="1rem"`

**Per-button step override**
```html
<button data-two="widen" data-two-for="#panel" data-step="3rem">Widen +3rem</button>
```

---

## Public Methods (optional JS)

```js
const el = document.querySelector('x-two-panel');
el.setLeft('24rem');
el.setGap('1rem');
el.toggleLeft();
el.reset();
```

---

## Accessibility

- The container uses `role="group"` and `aria-label="Two panel"`.  
- Provide headings/landmarks **inside** your slotted content as appropriate.

---

## Troubleshooting

- **Gap not changing:** Don’t set both `gap="…"` *and* `--two-gap`; the attribute writes an inline style that wins. Use one method.  
- **CSS `--two-left` not applied:** When driving from CSS, include `data-left-fixed` so the fixed-left grid is used.  
- **Horizontal scrollbar on a panel:** Default hides horizontal overflow. Allow it with:
  ```css
  x-two-panel { --two-scroller-overflow-x: auto; }
  ```
  Or make just the code block scroll:
  ```css
  x-two-panel::part(right-scroller){ overflow-x: hidden; }
  .code-demo{ width:100%; overflow:auto; white-space:pre; }
  ```
- **Rounded-corner “clipping” with inner borders:** Remove panel rounding via
  `::part(left-panel/right-panel){ border-radius:0; }` or add inner padding via `--two-panel-pad`.

---

## Advanced Examples

**CSS-driven default (no inline attrs)**
```html
<style>
  #panel {
    --two-gap: .5rem;
    --two-left: 22rem;
    --two-min-left: 8rem;
    --two-min-right: 8rem;
  }
</style>

<x-two-panel id="panel" data-left-fixed>
  <div slot="left">…</div>
  <div slot="right">…</div>
</x-two-panel>
```

**Bounded growth**
```html
<x-two-panel id="panel"
             left="28rem"
             min-left="10rem"
             min-right="12rem"
             max-left="48rem">
  <div slot="left">…</div>
  <div slot="right">…</div>
</x-two-panel>
```

---

## License

MIT (or your project’s license).
