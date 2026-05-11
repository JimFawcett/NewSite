# SplitterComponent

A zero-dependency vanilla JavaScript [W3C Web Component](https://www.w3.org/TR/components-intro/) that creates a two-pane resizable layout.  It is implemented as a Custom Element with Shadow DOM encapsulation — both part of the W3C Web Components standard — so it works as a native HTML element in any modern browser with no framework required.  The user can drag the splitter bar for fine-grained control or click either pane to step-resize in 100 px increments.

## Demo

Open `SplitterComponent.html` in a browser to see two live examples — one with the default 50/50 split and one with a fixed initial left-pane width.

## Installation

Copy `js/SplitterComponent.js` into your project and load it with a script tag.  No build step or package manager required.

```html
<script src="path/to/SplitterComponent.js"></script>
```

## Usage

```html
<!-- default 50/50 split -->
<splitter-container style="height: 300px;">
  <div slot="first">Left pane content</div>
  <div slot="second">Right pane content</div>
</splitter-container>

<!-- left pane starts at 28 rem -->
<splitter-container left-width="28rem" style="height: 300px;">
  <div slot="first">Left pane content</div>
  <div slot="second">Right pane content</div>
</splitter-container>
```

The component fills 100% of its parent's width.  Set a `height` on the element (inline or via CSS) to give the panes a defined vertical extent.

## API

### Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `left-width` | CSS length | `50%` | Initial width of the left pane.  Any valid CSS length unit is accepted: `px`, `rem`, `%`, etc. |

Changing `left-width` at runtime via `setAttribute` is reflected immediately.

### CSS Custom Properties

| Property | Default | Description |
|----------|---------|-------------|
| `--dark` | `#333` | Color of the outer border and the splitter bar. |

Apply custom properties from a stylesheet:

```css
splitter-container {
  --dark: maroon;
}
```

### Slots

| Slot | Description |
|------|-------------|
| `first` | Content placed in the left pane. |
| `second` | Content placed in the right pane. |

### Interaction

| Action | Effect |
|--------|--------|
| Drag the splitter bar | Smoothly resizes the left pane to the pointer position. |
| Click the left pane | Expands the left pane by 100 px. |
| Click the right pane | Shrinks the left pane by 100 px. |

Both drag and click resize are clamped so neither pane collapses below 30 px.

## Browser Support

`SplitterComponent` uses three W3C Web Component specifications:

| Specification | Purpose |
|---------------|---------|
| [Custom Elements v1](https://www.w3.org/TR/custom-elements/) | Defines `<splitter-container>` as a native HTML element |
| [Shadow DOM v1](https://www.w3.org/TR/shadow-dom/) | Encapsulates internal styles and structure |
| [HTML Slots](https://html.spec.whatwg.org/multipage/scripting.html#the-slot-element) | Exposes `first` and `second` insertion points |

It also requires CSS custom properties and pointer events.  All five are supported in every modern browser (Chrome, Edge, Firefox, Safari).

## File Structure

```
SplitterComponent/
├── SplitterComponent.html   demo page
├── js/
│   └── SplitterComponent.js  component source (~145 lines)
├── css/                      styles used by the demo page
└── images/
    └── favicon.ico
```

## License

&copy; James Fawcett — use freely with attribution.
