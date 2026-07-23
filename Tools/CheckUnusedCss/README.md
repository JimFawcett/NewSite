# check_unused_css.py

Reports CSS stylesheets linked in an HTML page that have no matching selectors.

## Requirements

```
pip install tinycss2 beautifulsoup4
```

## Usage

```
python check_unused_css.py <page.html|dir> [<page.html|dir> ...] [--detail]
```

Each argument may be an HTML file or a directory. A directory argument checks all `*.html` files found directly in that directory (non-recursive). Arguments may mix files and directories.

Add `--detail` to list the unmatched selectors within each partially-used stylesheet.

## Output

Each stylesheet is labeled:

| Label | Meaning |
|-------|---------|
| `ok` | Every selector matches at least one element |
| `partial N/T` | N of T selectors match; rest have no candidates |
| `UNUSED` | No selectors match anything on the page |
| `EMPTY` | Stylesheet has no rules |
| `MISSING` | File not found at the resolved path |

When a stylesheet is UNUSED, the tool also searches all linked JS files and inline scripts for the class names, IDs, and custom element names the stylesheet references. Matches are appended as `[JS: name1, name2]`. With `--detail`, the same annotation appears on individual unmatched selectors in partial stylesheets.

Example — `python check_unused_css.py Site/SiteHome.html`:

```
SiteHome.html  (11 stylesheets)
----------------------------------------------------------------
  partial 34/35  reset.css
  partial 11/20  ContentMenus.css
  partial  2/11  help.css
  UNUSED      StylesPhoto.css
  UNUSED      StylesSizerComp.css
  UNUSED      StylesWebComponents.css  [JS: code-block, hidephotosizer-block, photo-block, photosizer-block]
  partial 55/138  Content.css
  partial  2/5   ThemeSite.css
  UNUSED      FigureSizer.css  [JS: caption, content, figure-sizer]
  UNUSED      link-nav.css  [JS: active, controls, link-container]
  partial 10/12  content-links.css
```

Example — `python check_unused_css.py Site/SiteHome.html --detail`:

```
SiteHome.html  (11 stylesheets)
----------------------------------------------------------------
  partial 34/35  reset.css
               no match: :root
  partial 11/20  ContentMenus.css
               no match: :root
               no match: .menuHeader
               no match: .visible  [JS: visible]
               no match: .clickable:hover  [JS: clickable]
               no match: .clickable:hover a  [JS: clickable]
               no match: #keysTable  [JS: keysTable]
               no match: #keysTable th  [JS: keysTable]
               no match: #keysTable th  [JS: keysTable]
               no match: #keysTable a  [JS: keysTable]
  partial  2/11  help.css
               no match: #github table.help  [JS: help]
               no match: #github table.help tr th  [JS: help]
               no match: #github table.help tr td  [JS: help]
               no match: #github table.help a:link  [JS: help]
               no match: #github table.help a:visited  [JS: help]
               no match: #github table.help a:hover  [JS: help]
               no match: #github table.help a:active  [JS: help]
               no match: #github .help summary  [JS: help]
               no match: #github hr.dotted
  UNUSED      StylesPhoto.css
  UNUSED      StylesSizerComp.css
  UNUSED      StylesWebComponents.css  [JS: code-block, hidephotosizer-block, photo-block, photosizer-block]
  partial 55/138  Content.css
               no match: :root
               no match: #github .em-box
               no match: #github .inset
               no match: #github inset-tight
               no match: #github .inset-tight
               no match: #github t-b.notes
               no match: #github tm-b.notes
               no match: #github div.notes
               no match: #github c-s
               no match: #github .code  [JS: code]
               no match: #github #link-bar
               no match: #github #link-bar-about
               no match: #github #link-bar-repo
               no match: #github a.repoLink
               no match: #github section-container
               no match: #github section-content
               no match: #github section-container ol
               no match: #github section-container ul
               no match: #github section-container li
               no match: #github section-content li
               no match: #github li section-content
               no match: #github .note
               no match: #github .expandable-notes
               no match: #github .expandable-notes hr
               no match: #github .expandable-notes inset
               no match: #github pre.code-examples
               no match: #github pre.code-examples code
               no match: #github .quickStatusContainer
               no match: #github .quickStatus  [JS: quickStatus]
               no match: #github status-grid
               no match: #github status-itemLeft
               no match: #github #grid status-itemLeft a
               no match: #github status-itemRight
               no match: #github indent-block
               no match: #github .center  [JS: center]
               no match: #github .spread-up
               no match: #github .spread-down
               no match: #github .left  [JS: left]
               no match: #github .clear  [JS: clear]
               no match: #github .undef  [JS: undef]
               no match: #github .undef a  [JS: undef]
               no match: #github .undefined  [JS: undefined]
               no match: #github .undefined a  [JS: undefined]
               no match: #github .noBorder
               no match: #github .boxShadow
               no match: #github #content  [JS: content]
               no match: #github badge-container
               no match: #github badge-container:hover
               no match: #github .badge
               no match: #github sp-large
               no match: #github defn-outerBlock
               no match: .defn-outerBlock
               no match: #github defn-block
               no match: #github .defn-block
               no match: #github defn-head
               no match: #github .defn-head
               no match: #github defn-body
               no match: #github .defn-body
               no match: #github defn-code
               no match: #github .defn-code
               no match: #github .viewWidth
               no match: .vw
               no match: #github Table.tdefn
               no match: #github th.tdefn
               no match: #github td.tdefn
               no match: #github tdefn-block
               no match: .tdefn-block
               no match: #github tdefn-head
               no match: .tdefn-head
               no match: #github tdefn-block > tdefn-body
               no match: .tdefn-body
               no match: #github tdefn-block > tdefn-code
               no match: .tdefn-code
               no match: #github .defnBorder
               no match: #github .defnBorderTop
               no match: #github .defnBorderBottom
               no match: #github .defnBorderLeft
               no match: #github .defnBorderRight
               no match: #github .noBorder
               no match: #github .noBorderLeft
               no match: #github .noBorderRight
               no match: #github .noBorderTop
               no match: #github .noBorderBottom
  partial  2/5   ThemeSite.css
               no match: :root
               no match: #github #lpanel  [JS: lpanel]
               no match: #github red-text
  UNUSED      FigureSizer.css  [JS: caption, content, figure-sizer]
  UNUSED      link-nav.css  [JS: active, controls, link-container]
  partial 10/12  content-links.css
               no match: #sections a.active  [JS: active, sections]
               no match: #pages a.active  [JS: active, pages]
```

## How matching works

The tool does not execute CSS selector matching against a live DOM. Instead it checks whether every component a selector names — CSS classes, IDs, and custom element names (names containing a hyphen) — exists somewhere in the page's static HTML. Standard HTML element names (`div`, `table`, `summary`, etc.) are ignored because they are nearly always present.

This approach handles custom elements correctly and avoids false positives on UNUSED verdicts. It can produce false negatives on partial counts: a selector referencing only standard elements is counted as a match even if the specific combination never occurs.

## Known limitation

Elements or classes injected by JavaScript at runtime are invisible to static analysis. A stylesheet used exclusively by JS-injected content will be reported UNUSED. Cross-check any UNUSED result against the page's script files before removing it.
