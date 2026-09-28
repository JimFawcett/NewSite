---
name: render-md-details
description: Render a project Markdown document (Spec*.md, *Structure.md, Prompts_*.md, Constitution.md, Project_Tree.md) into formatted HTML inside a Spec_Driven_Design_*.html page, or refresh every page after a .md changes. Use when asked to show a spec or prompt record on a documentation page, when a rendered block is stale, or when a block still shows raw markdown in a <pre>.
---

# Render Markdown into the Spec-Driven pages

Each `Code/Spec_Driven_Design_*.html` page carries the documents it discusses, rendered
to HTML and wrapped in `<div class="mdview">`. This skill regenerates those from source.

## Running it

```
node .claude/skills/render-md-details/render.js            # render and write
node .claude/skills/render-md-details/render.js --check    # report, write nothing
node .claude/skills/render-md-details/render.js --page Spec_Driven_Design_Cpp_Entry.html
```

Node only — markdown-it is vendored in `vendor/`, so there is nothing to install and it
works offline. It is the same library VS Code's Markdown preview uses.

Re-running is safe and is the normal way to work: every labelled block is regenerated from
its `.md`, whether it currently holds raw markdown or a fragment an earlier run produced.
After editing a specification, run it with no arguments and the pages catch up. A run that
changes nothing prints `0 page(s) changed`.

## What it acts on

A block is anything matching a label line followed by a markdown `<pre>` or an existing
fragment. Two label forms exist, and both are already used by the pages:

```html
<summary class="labelStyle darkItem">Spec_TextFinder.md</summary>     <!-- inside <details> -->
<h5 class="indent">Cpp_TextFinder_Structure.md</h5>                   <!-- inside a Source section -->
```

The label is the source file's name. The script finds that file by name under
`Code/Projects/Spec_driven_TextFinder`, skipping every `archive` directory, and reports
`MISSING` and exits 1 if a label names a file it cannot find.

## Adding a document to a page

Write the wrapper by hand, with an empty `<pre>` for the script to fill:

```html
      <indent-blocks>
        <details>
          <summary class="labelStyle darkItem">Spec_Rust_TextFinder_Dirnav.md</summary>
<pre><code class="language-markdown"></code></pre>
        </details>
      </indent-blocks>
```

Convention: a specification goes immediately after the page's `<div class="synopsis">`,
collapsed. Prompt records stay at the end of the page, per `Page_Structure.md` §8.
Then run the script.

## What the conversion does

- **Headings drop one level** — the document's `#` becomes `<h2>`, `##` becomes `<h3>`, and
  so on. The page already owns `<h2>` for its title and `<h3>` for its numbered sections,
  so an embedded `<h1>` would collide and break the outline.
- **Relative links are rewritten** to GitHub URLs under `CONFIG.repo`, resolved against the
  source document's own folder — `blob` for a file, `tree` for a folder. A relative `.md`
  link resolves to nothing from `Code/`, so left alone it would be dead.
- **Fences keep their language**, so Prism highlights them as it does the Source sections.
  An unlabelled fence or a 4-space indented block gets `language-text`, without which it
  renders unstyled against the page background instead of in Prism's dark panel.
- **Raw HTML in the markdown is escaped**, never emitted (`html: false`).
- **The CSS rule set is rewritten** on every page carrying a fragment, so the pages cannot
  drift apart. It lives in `CSS` at the top of `render.js`; change it there, run the script,
  and all pages follow. Note `rem` is 16px on this site while body text is 20px.

## Checking the result

Structure, after any run:

```
grep -c 'class="language-markdown"' Code/Spec_Driven_Design_*.html   # only intentional raw blocks
grep -c '<h1>' Code/Spec_Driven_Design_*.html                        # must be 0
```

Appearance: the pages load in nested iframes (`PageHost` → `ExploreCode` → content), so a
plain reload can leave the content frame cached — use a hard refresh. To see it without a
browser, load `ExploreCode.html?src=<page>` in headless Chrome, walk into the nested frames,
set `details.open = true`, and screenshot.

## Scope

`CONFIG` at the top of `render.js` holds the pages folder, the page-name pattern, the source
folder, and the repo URL. Nothing else is hard-coded to this project.
