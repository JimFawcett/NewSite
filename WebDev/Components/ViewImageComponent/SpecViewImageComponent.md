# Spec: ViewImageComponent

## Purpose

`<view-image>` is a W3C custom element (Shadow DOM) that displays a titled, bordered image panel inline with page content. Users click the image to widen it and click the title to narrow it, one fixed step per click. The image always preserves its original aspect ratio.

The view panel is wrapped with a div with 1rem padding and no border to act like a margin even when floated.

The view panel contains an `<img>` element set to `width: 100%; height: auto` so aspect ratio is maintained automatically as the panel width changes.

---

## Element Registration

```js
customElements.define('view-image', ViewImage);
```

---

## Attributes

| Attribute        | Type   | Default        | Description                                      |
|------------------|--------|----------------|--------------------------------------------------|
| `src`            | string | (none)         | URL of the image to display                      |
| `alt`            | string | `""`           | Alt text for the image                           |
| `width`          | string | `auto`         | Initial width of the image panel (any CSS length)|
| `bg-color`       | string | `var(--light)` | Background of the view box                       |
| `title-bg-color` | string | `#aaa`         | Background of the title bar                      |
| `step-px`        | number | `40`           | Pixels per width step when clicking              |
| `min-width`      | number | `120`          | Minimum width in pixels when narrowing           |

---

## Shadow DOM Structure

```
:host (inline-block)
└── div.wrapper          ← outer padding, page-background-color
    └── div.view         ← border, box-shadow, flex column, width owner
        ├── div.title    ← slot (default), click to narrow
        └── div.image-panel   ← click to widen
            └── img#img-internal  ← width: 100%; height: auto
```

---

## Content Slots

### Default slot (title text)

Inline content of the element becomes the title bar text.

---

## Behavior

### Width stepping

- Click image body: widen by one step (`step-px` attribute, default 40 px).
- Click title: narrow by one step.
- Minimum width: 120 px (`min-width` attribute).
- Width is owned by `div.view`; `img#img-internal` fills it at `width: 100%` with `height: auto`, preserving the original aspect ratio.
- Baseline is captured from `div.view.getBoundingClientRect()` on first click.

### Attribute change

Re-applies styles and updates `img.src` / `img.alt` when any observed attribute changes.

---

## CSS Custom Properties (internal)

Set on `:host` during `_applyBoxColors()`:

| Property         | Controlled by attribute |
|------------------|------------------------|
| `--view-bg`      | `bg-color`             |
| `--title-bg`     | `title-bg-color`       |

---

## Inline Style Notes

- `font-size` on the host cascades through the shadow boundary and affects the title text.
- `--title-font-size` is read by the title's shadow CSS rule (`font-size: var(--title-font-size, 1rem)`). Set it via `style="--title-font-size: 1.2rem"` on the host.

---

## Dependencies

- No external runtime dependencies.

---

## File Layout

```
ViewImageComponent/
  js/
    ViewImage.js            ← component definition
    prism.js                ← copied from parent Components/js/ (available if needed)
  css/
    ViewImage.css           ← host-page placement helpers
    prism.css               ← copied from parent Components/css/ (available if needed)
  ViewImageComponent.html   ← demo / test page
  SpecViewImageComponent.md ← this file
```

---

## Usage Examples

### Basic usage

```html
<script src="ViewImageComponent/js/ViewImage.js" defer></script>

<view-image src="pictures/MyPhoto.jpg" alt="Landscape photo" width="20rem"
            bg-color="var(--light)" title-bg-color="#ccc">
  Figure 1. Landscape near Stowe, VT
</view-image>
```

### Floated with custom step

```html
<script src="ViewImageComponent/js/ViewImage.js" defer></script>

<view-image src="pictures/Diagram.png" alt="Architecture diagram"
            width="18rem" step-px="60" min-width="150"
            style="float:right; --title-font-size:1.1rem;">
  Figure 2. System architecture
</view-image>
```

---

## Differences from `<view-code>`

| Concern              | `<view-code>`                        | `<view-image>`                        |
|----------------------|--------------------------------------|---------------------------------------|
| Content              | `<pre><code>` block                  | `<img>` element                       |
| Content slot         | `slot="code"` named slot             | `src` attribute, no named slot        |
| Aspect ratio         | not applicable                       | preserved automatically (height: auto)|
| Prism dependency     | optional                             | none                                  |
| Height attribute     | sets explicit panel height           | not used; height follows aspect ratio |
| Overflow-x attribute | controls horizontal scroll           | not used                              |
