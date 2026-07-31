# Replace photosizer-block with view-image

## Attribute mapping

| photosizer-block | view-image |
|---|---|
| `src="..."` | `src="..."` (unchanged) |
| `width="400"` | `width="400px"` (add px suffix) |
| `class="photoSizerBlock"` | remove |
| `class="photoSizerBlock right"` | remove; add `float:right;` to `style="..."` |
| inner `<span>` text | direct text content (slot) |
| inner `<span>` styles | remove |
| existing `style="..."` | keep for positioning only |
| *(none)* | `bg-color="var(--light)"` |
| *(none)* | `title-bg-color="#ccc"` |
| *(none)* | `step-px="100"` |

## Before / After — basic

```html
<photosizer-block src="Pictures/CodeWebifierOutput.JPG" width="400" class="photoSizerBlock" style="margin-top:0;">
  <span style="
    display: inline-block;
    font-weight: bold;
    font-family: 'Comic Sans MS', Tahoma;
    background-color: #ddd;
    width: 100%;
    padding: 5px 0px;
  ">
    Fig 1. CodeWebifier Output
  </span>
</photosizer-block>
```

```html
<view-image src="Pictures/CodeWebifierOutput.JPG" width="400px" bg-color="var(--light)" title-bg-color="#ccc" step-px="100" style="margin-top:0;">
  Fig 1. CodeWebifier Output
</view-image>
```

## Before / After — float right

```html
<photosizer-block src="pictures/StringLayout.JPG" width="400" class="photoSizerBlock right" style="margin-top:-1em;">
  <span style="font-family:'Comic Sans MS', Tahoma;">
    Fig 1. String Layout
  </span>
</photosizer-block>
```

```html
<view-image src="pictures/StringLayout.JPG" width="400px" bg-color="var(--light)" title-bg-color="#ccc" step-px="100" style="float:right; margin-right:-1rem; margin-top:-1em;">
  Fig 1. String Layout
</view-image>
```

## Notes

- `width` is optional - omit it to let the image size naturally.
- `step-px="100"` sets click-to-resize increment; use `step-px="40"` for finer control.
- Float positioning example: `style="float:right; margin-right:-2rem;"`
- After converting all instances, update the `<head>` — these changes are required:
  - Replace `<link rel="stylesheet" href="../css/StylesSizerComp.css" />` with `<link rel="stylesheet" href="../css/ViewImage.css" />`
  - Add `<script src="../js/ViewImage.js"></script>` after `ScriptsWebComponents.js` — do not remove `ScriptsWebComponents.js`
  - If a separate `ScriptsSizerComp.js` or `PhotoSizerComponent.js` is present, remove it
