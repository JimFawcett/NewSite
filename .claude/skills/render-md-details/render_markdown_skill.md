# render-md-details

A Claude Code skill that renders the project's Markdown documents into the
`Code/Spec_Driven_Design_*.html` pages as formatted HTML, and refreshes them when a
source document changes.

This file documents the skill for a reader. [SKILL.md](SKILL.md) is the operational
contract Claude loads when it invokes the skill; the two agree, and SKILL.md wins where
they do not.

## What problem it solves

The Spec-Driven pages argue that the specifications are the authority and the code derives
from them. Publishing the code while leaving the specifications unpublished inverted that
claim, so each page now carries the document it discusses.

Embedding the raw Markdown in a `<pre>` was the first attempt and failed on line length:
paragraphs ran to 1048 characters and one table row to 1280, so the block scrolled
horizontally and read badly. Hard-wrapping the text fixed the paragraphs but could not
touch the table rows without breaking the tables, nor the help text of `Spec_TextFinder.md`
§5.1, which that document fixes byte for byte. Rendering the Markdown solves both: the
browser reflows prose and table cells to the container, and the source file is untouched.

## Scope

**Where the skill is available.** It lives in `.claude/skills/` at the repository root, so
it is a project skill for the whole NewSite repository - available in any session whose
working directory tree includes that root, and in no other project. Move the folder to
`~/.claude/skills/` to make it global, though its defaults are specific to this site.

**What it writes.** Only `Code/Spec_Driven_Design_*.html`, matched by
`CONFIG.pageName`. No other HTML in `Code/`, and nothing in the `Rust/`, `Cpp/`,
`CSharp/`, `Python/`, `WebDev/`, or `SWDev/` track folders.

**What it reads.** Every `.md` file under `Code/Projects/Spec_driven_TextFinder`,
recursively, skipping any directory named `archive` at any depth. Files are located by
base name, taken from the label above each block.

Paths are anchored to the repository root, computed from the script's own location, so the
result does not change with the shell's working directory.

**A boundary note.** The sources sit inside `Spec_driven_TextFinder/` and the pages sit
above it, so running this skill modifies files outside the project directory. Constitution
rule 2 requires explicit authorization for that, and the skill does not supply it. Ask
before running it, as you would before editing those pages by hand.

## Using it

```
node .claude/skills/render-md-details/render.js            # render and write
node .claude/skills/render-md-details/render.js --check    # report, write nothing
node .claude/skills/render-md-details/render.js --page Spec_Driven_Design_Cpp_Entry.html
```

Node is the only requirement. markdown-it, the library VS Code's Markdown preview uses, is
vendored under `vendor/` as a single bundled file, so there is no install step and the
skill works offline.

**Refreshing after a spec changes.** Run it with no arguments. Every labelled block is
regenerated from its source, whether it currently holds raw Markdown or a fragment an
earlier run produced, so the pages catch up in one pass. This matters because the rendered
HTML is no longer a verbatim copy you can compare against the file by eye. A run that finds
nothing to do prints `0 page(s) changed`.

**Adding a document to a page.** Write the wrapper by hand with an empty `<pre>`, then run
the script:

```html
      <indent-blocks>
        <details>
          <summary class="labelStyle darkItem">Spec_Rust_TextFinder_Dirnav.md</summary>
<pre><code class="language-markdown"></code></pre>
        </details>
      </indent-blocks>
```

A specification goes immediately after the page's `<div class="synopsis">`, collapsed.
Prompt records stay at the end of the page, per `Page_Structure.md` §8.

**Verifying.** `--check` reports what would change without writing. After a real run:

```
grep -c 'class="language-markdown"' Code/Spec_Driven_Design_*.html   # only blocks you meant to keep raw
grep -c '<h1>' Code/Spec_Driven_Design_*.html                        # must be 0
```

The pages load in nested iframes, so a plain browser reload can leave the content frame
cached. Use a hard refresh before concluding something is wrong.

## What it does to the Markdown

Summarized here; [SKILL.md](SKILL.md) gives the reasoning for each.

- Headings drop one level, so the document's `#` becomes `<h2>`. The page already owns
  `<h2>` for its title and `<h3>` for its sections.
- Relative links are rewritten to GitHub `blob` and `tree` URLs, resolved against the
  source document's own folder. Left alone they resolve to nothing from `Code/`.
- Fenced blocks keep their language class so Prism highlights them. Unlabelled fences and
  4-space indented blocks get `language-text`.
- Raw HTML in the Markdown is escaped, never emitted.
- One shared CSS rule set is rewritten on every page carrying a fragment, so the pages
  cannot drift apart.

## Skipping it

**When it is the wrong tool.** It renders whole documents into blocks the pages already
declare. It does not write prose, choose which document belongs on which page, create the
`<details>` wrapper, or touch anything outside the page set above. For a one-off snippet,
or for editing the page's own prose, edit the page directly.

**Exempting one block.** The script matches a label line followed immediately by the block,
with nothing between them. Any of these leaves a block alone:

- put a line between the label and the `<pre>`, such as a `<t-b>` note;
- use a language class other than `language-markdown`;
- give the `<summary>` a class other than `labelStyle darkItem`, or the `<h5>` a class
  other than `indent`;
- name the label something that does not end in `.md`.

Exempting every block on a page does not fully exempt the page: if any rendered fragment
remains, the shared CSS rule set is still rewritten there. A page with no fragments and no
matching blocks is skipped entirely.

**Exempting a page.** Rename it outside `CONFIG.pageName`, or narrow that pattern.

**Preventing Claude from invoking it.** Say so in the prompt - the skill is offered, not
imposed, and a session that is told to leave the pages alone will. To remove it from a
session's options altogether, move or rename `.claude/skills/render-md-details/`.

**Undoing a run.** The pages are the only thing it writes, so `git checkout --` on them
restores the previous state. The source `.md` files are never modified.

## Maintenance

`CONFIG` at the top of `render.js` holds the four values that bind the skill to this
project: the pages folder, the page-name pattern, the source folder, and the repository
URL. The `CSS` array above it holds the rule set. Change either, run the script, and every
page follows.

`rem` is 16px on this site while body text is 20px, which is worth remembering when
adjusting sizes in that rule set - a heading at `1.0rem` comes out smaller than the
paragraphs around it.

`vendor/markdown-it.umd.min.js` is markdown-it's bundled browser build, MIT licensed, with
the license beside it. Replacing it with a newer bundle is the whole of upgrading.
