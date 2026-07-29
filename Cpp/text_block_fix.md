# t-b Structure Instructions

## What `<t-b>` Is

`<t-b>` is a custom block element styled in `css/Content.css` at line 179:
- `display: block`
- `white-space: normal`
- `max-width: 90ch`
- `margin: 0rem 0rem 0.9rem 0rem` (bottom margin only)

`<tm-b>` is the same but with a top margin as well (`0.9rem 0rem 0.9rem 0rem`).

## Desired Structure

text blocks, i.e., `<t-b></t-b>`, should not be nested.  If you find nesting remove the outer
block `<t-b>` and `</t-b>` leaving all inner text as it was before editing, and cite the removal as you go. for this fixing treat `<tm-b>` as if it were `<t-b>`.

before starting, announce the file; after each removal, name the line number of the removed 
`<t-b>` and give brief description of the content wrapped by outer block.

vertical shims have the markup `<div style="height:0.75rem;"></div>`

if you remove an outer block, place a vertical 0.75rem shim where the removed `<t-b>` at the top
of the block was placed.

all text should be limited to 90ch width, so after each edit wrap any direct text content 
from the removed block that now lacks a `<t-b>` block wrapper with one.

while scanning, wrap in `<t-b>` any prose paragraph that is a direct child of the main content container and has no width constraint.

if there are no nested text blocks announce that before finishing.

## Notes

- Classes `mbz` (margin-bottom: 0) and `mtz` (margin-top: 0) are used to suppress margins when needed.
- `t-b.notes` adds a red dotted border for draft/annotation use.

## Special Conditions

### `<div class="t-b ...">` — convert to `<t-b>`

A `<div>` using the `t-b` class (e.g. `<div class="t-b mbz">`) gets the 90ch width constraint via CSS, but is not a `<t-b>` element. Convert it to `<t-b>`, preserving any additional classes:

```
<div class="t-b mbz">...</div>  →  <t-b class="mbz">...</t-b>
```

### `<div style="...">` wrapping prose without a width constraint — convert to `<t-b>`

A `<div>` that wraps a prose paragraph and carries only spacing/padding styles (not a width or max-width) should be converted to `<t-b>`. The `t-b` bottom margin replaces any padding-bottom. If the div had significant top padding (e.g. `padding-top:15px`), a preceding shim `<div style="height:0.75rem;"></div>` may be used to preserve the visual gap.

### Prose inside `<li>` without a width constraint — wrap with `<t-b>`

If a `<li>` contains multi-sentence prose and its containing `<ol>` or `<ul>` does not impose a `max-width`, wrap the text content with `<t-b>` inside the `<li>`:

```html
<li>
  <t-b>
    prose text here...
  </t-b>
</li>
```
