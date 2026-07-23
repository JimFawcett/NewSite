# ToolsNote.md — check_unused_css development session

---

## Prompt 1

> are there any stylesheets in SiteHome.html that are not being used by the page

## Response 1

Read `Site/SiteHome.html` and the candidate CSS files to determine which selectors each file defines and whether those selectors have any matching elements.

Three stylesheets have no matching elements in the page:

- **StylesSizerComp.css** — styles `.imgFrame`, `.imgContr`, `.imgTitle`, `.lightElem`, `.darkElem`; none appear in SiteHome.html
- **FigureSizer.css** — styles the `<figure-sizer>` custom element; not present on this page
- **help.css** — styles `table.help` and `hr.dotted`; the only rule that actually hits is `#github summary { margin-bottom: 0.75em }`, which applies to the `<summary>` elements on the page

The rest all have matching selectors: `content-links.css` covers `#about`, `#keys`, `#sections`, `#pages`; `StylesPhoto.css` covers `.photoContainer/.photoImage/.photoCaption`; `ContentMenus.css` covers the bottom menu; and so on.

---

## Prompt 2

> is it practical to build a python tool to investigate unused stylesheets without using the claude api

## Response 2

Yes, very practical. The core approach:

1. **Parse the HTML** with `beautifulsoup4` — find `<link rel="stylesheet">` tags and all elements/classes/IDs
2. **Parse each CSS file** with `tinycss2` or `cssutils` — extract all selectors
3. **Match selectors** against the HTML tree using `lxml` + `cssselect`

The main limitation is **dynamic content** — JS that adds classes or elements at runtime (e.g., `buildPages()` populating `#pages`) will cause false positives. For a static site like this one, that's manageable — you'd know to whitelist dynamically populated IDs.

The trickiest parts are:
- Stripping pseudo-classes (`:hover`, `::before`) before matching, since they can't be evaluated statically
- Handling `@media` blocks and `@keyframes` correctly
- Resolving relative paths from the HTML file to find the CSS files

For this site's structure (mostly class/ID selectors, no preprocessors, no build system) it would work well and be fast. It would have caught `StylesSizerComp.css` and `FigureSizer.css` cleanly.

---

## Prompt 3

> yes.

## Response 3

Built `Tools/check_unused_css.py`. Key design decisions made during development:

**Initial approach** used `lxml` + `cssselect` for CSS selector matching against the parsed HTML tree. This failed because lxml's HTML parser re-parents elements inside unknown custom elements (e.g., `<content-block>`, `<note-block>`), breaking selector matching for content nested inside them.

**Revised approach** uses BeautifulSoup with `html.parser` (handles custom elements correctly) plus a component-based match check:

- A selector *could match* if every CSS class, ID, and custom element name it references exists somewhere in the page's static HTML.
- Standard HTML element names (`div`, `table`, `summary`, etc.) are ignored — they're nearly always present and not diagnostic.

Additional fixes during development:
- Windows console encoding: added `sys.stdout.reconfigure(encoding='utf-8')` at startup
- UTF-8 BOM in one CSS file: switched to `encoding='utf-8-sig'` when reading CSS
- tinycss2 `AtRule` attribute is `at_keyword`, not `name`

**Final output on SiteHome.html:**

```
SiteHome.html  (11 stylesheets)
----------------------------------------------------------------
  partial 34/35  reset.css
  partial 11/20  ContentMenus.css
  partial  2/11  help.css
  UNUSED      StylesPhoto.css
  UNUSED      StylesSizerComp.css
  UNUSED      StylesWebComponents.css
  partial 55/138  Content.css
  partial  2/5   ThemeSite.css
  UNUSED      FigureSizer.css
  UNUSED      link-nav.css
  partial 10/12  content-links.css
```

Five UNUSED sheets confirmed:
- `StylesPhoto.css` — styles `photo-container`/`photo-image`/`photo-caption` custom elements; page uses plain `<div class="photoContainer">` instead
- `StylesSizerComp.css`, `FigureSizer.css` — no matching elements present
- `StylesWebComponents.css` — styles `photosizer-block`/`photo-block`/`code-block`; none on this page
- `link-nav.css` — styles `#link-container` and `.controls`; these may be injected by `link-nav.js` at runtime (static-analysis blind spot)

---

## Prompt 4

> create a README.md for the tool and place with the tool

## Response 4

Created `Tools/README.md` documenting:
- Requirements (`pip install tinycss2 beautifulsoup4`)
- Usage syntax
- Output label table (`ok`, `partial N/T`, `UNUSED`, `MISSING`)
- How the component-based matching strategy works
- Known limitation: JS-injected content is invisible to static analysis

---

## Prompt 5

> create ToolsNote.md and place all the prompts and responses in that. Save in Tools

## Response 5

Created this file.

---

## Prompt 6

> in check_unused_css.py add option to accept directory which causes tool to check all html files in directory.

## Response 6

Added directory support to `Tools/check_unused_css.py`. Changes:

- Updated usage comment and help text to show `<page.html|dir>`
- In `main()`, after resolving each path argument, check `is_dir()`: if true, glob `*.html` in that directory (non-recursive) and call `report()` for each file found; otherwise call `report()` as before.
- Mixed args (files and directories) work in a single invocation.

---

## Prompt 7

> add prompts and responses to ToolsNote.md

## Response 7

Added Prompts 6 and 7 (this entry) to this file.

---

## Prompt 8

> is it practical for check_unused_css.py to warn about possible injections, as you did in ToolsNote.md, without using claude api

## Response 8

Yes, practical. For each UNUSED stylesheet, extract the class names, IDs, and custom element names from its unmatched selectors, then search the JS files linked in the same HTML page for those strings. If a name appears in any script file, flag the stylesheet with a note like `UNUSED (possible JS injection: .photoContainer)`.

The main tradeoff: simple string search produces false positives - a common word like `header` may appear in JS for unrelated reasons. That's manageable for distinctive class names and hyphenated custom element names, but noisier for short or generic names. It also misses dynamically constructed strings like `'class-' + name`.

---

## Prompt 9

> implement that and update the README.md file

## Response 9

Added JS injection detection to `Tools/check_unused_css.py`. Three new functions:

- `collect_js_text(html_text, html_path)` — reads all `<script src="...">` files linked from the page plus inline `<script>` blocks into a single string.
- `selector_names(selectors)` — extracts bare class names, IDs, and custom element names from a list of selectors.
- `js_refs(names, js_text)` — returns sorted list of names that appear as substrings in the JS text.

In `report()`: UNUSED stylesheets append `[JS: name1, name2]` when any selector name is found in the JS text. With `--detail`, the same annotation appears on individual unmatched selectors in partial stylesheets.

Updated `README.md` to document the JS annotation behavior.

---

## Prompt 10

> add the complete output for SiteHome.html in README.md

## Response 10

Ran `python Tools/check_unused_css.py Site/SiteHome.html --detail` and replaced the truncated example in `README.md` with the full output, including all JS injection annotations.

---

## Prompt 11

> add Example without --detail before the example with --detail

## Response 11

Ran the tool without `--detail` and inserted that output as a new example block immediately before the `--detail` example in `README.md`.

---

## Prompt 12

> add new prompts and responses to ToolsNote.md

## Response 12

Added Prompts 8 through 12 (this entry) to this file.
