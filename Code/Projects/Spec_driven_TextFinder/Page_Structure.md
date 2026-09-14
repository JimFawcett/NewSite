# Page_Structure

The page structure for this project, organized around its two goals. It replaces an earlier structure of the same name, which described a single linear run of seven pages and had no place to put a second language. That earlier version sits in `archive/Page_Structure.md`.

[PageExample.html](../../PageExample.html) remains the reference implementation for the page shell and the navigation mechanism. [Text_Tone.md](Text_Tone.md) governs the prose that goes into a page. This document governs the set of pages, what each covers, and how a reader moves among them.

## 0. Placeholders

This document names no page and no file that belongs to one language. Where a generated page carries a language-specific name, this document writes a placeholder, and a page is built by substituting one value throughout. The four placeholders and their values are fixed here and nowhere else.

| Placeholder | Stands for | Values |
|-------------|------------|--------|
| `[lang]` | the language token inside a file or identifier name | `Cpp`, `Rust`, `CSharp`, `Python` |
| `[part]` | a page position within a language thread | the eight names of §5 |
| `[index]` | a page's 0-based position in its own thread's list | given per page in §6 |
| `[ext]` | the source extensions one language's demonstration searches | `ixx, cpp`, `rs`, `cs`, `py`, matching `[lang]` in order |

`[lang]` is the file-name token, not the display name. A reader-facing label spells the language as a reader names it, so the thread whose `[lang]` is `CSharp` titles its pages and heads its menu `C#`.

## 1. Goals and Threads

The project has two goals, each with a language-agnostic part and a language-specific part.

| Goal | Subgoal | Thread | Pages |
|------|---------|--------|-------|
| 1. Explain the spec-driven process | a. project level, language agnostic | Process | 5 |
| 1. Explain the spec-driven process | b. per language | the language's own thread, page 0 | 1 each |
| 2. Explain code structure and functionality | a. project level, language agnostic | Behavior | 5 |
| 2. Explain code structure and functionality | b. per language | the language's own thread, pages 1 through 7 | 7 each |

A **thread** is a set of pages a reader steps through in order. It is the unit the page menu and the Prev Page / Next Page controls operate on. Six threads exist: Process, Behavior, and one per value of `[lang]`. Each language thread carries both subgoal 1b and subgoal 2b, because the process that produced a language's specifications and the code those specifications fixed are read together.

Goal 1a and goal 2a both draw on [Spec_TextFinder.md](Spec_TextFinder.md), from different angles. The Process thread treats it as an artifact: how it was written, what authority it holds, what cites it. The Behavior thread treats it as a design: what the program does at its boundaries. Neither thread restates the other, and each cites the sections it binds.

## 2. Navigation

### 2.1 Three Mechanisms

A reader moves in three directions, and PageExample.html supplies a mechanism for each.

| Direction | Mechanism | Scope |
|-----------|-----------|-------|
| Within a page | `#sections` menu, Prev Sect / Next Sect | the page's numbered sections |
| Within a thread | `#pages` menu, Prev Page / Next Page | the thread's ordered pages |
| Across threads | the `repoLinks` header row | the same subject in another thread |

The explorer's control panel drives the first two by `postMessage`, handled in `js/contentMessages.js`. The third is ordinary anchors in the page header.

### 2.2 Within a Page

Each page hand-writes its `#sections` menu in `#bottomMenu`: an anchor to `#top`, one `<menu-elem class="secElem">` per numbered section, and an anchor to `#bottom`. Every section heading carries a matching `<a id="...">` immediately above it.

`link-nav.js` builds `LinkNavigator('#sections')` and always starts it at index 0, so Next Sect from a fresh load moves to the first section rather than resuming where the reader left off. The `#top` and `#bottom` anchors count as positions in that walk.

Number sections and subsections, per Text_Tone.md §5. Put the source last.

### 2.3 Within a Thread

Each thread owns one JavaScript file under `Code/js/` that defines `buildPages()`. The function fills `#pages` with a header div and one anchor per page of that thread, in thread order.

| Thread | Page-list file | Menu header |
|--------|----------------|-------------|
| Process | `SpecDrivenProcessPages.js` | Spec-Driven: Process |
| Behavior | `SpecDrivenBehaviorPages.js` | Spec-Driven: Behavior |
| one per language | `SpecDriven[lang]Pages.js` | Spec-Driven: [lang] |

Every page of every thread sits in `Code/`, beside `ExploreCode.html`, which is what makes the two script paths below differ: `js/` reaches the track's own `Code/js/`, and `../js/` reaches the site-wide `js/`. §6 states the directory once as the rule.

Each page loads its own thread's file and calls `buildPages()` near the bottom, then sets the index of its own position:

```html
<script src="js/SpecDriven[lang]Pages.js"></script>
<script>buildPages()</script>
<script>createSiteNavMenu('goto')</script>
<script src="../js/link-nav.js" defer></script>
<script>
  setCookie('#pages', [index], 10);
</script>
```

The second argument to `setCookie` is the page's 0-based index in its own thread's list, and it is the only per-page value in that block. `LinkNavigator('#pages')` reads the cookie, highlights that anchor, and steps from it. An index that does not match the page's position highlights the wrong entry and starts Next Page from the wrong place. Section 6 gives the index for every page.

The cookie key is shared across threads, which is what makes thread switching work: the page a reader arrives on rewrites the index to its own position in its own list, and stepping from there walks the new thread.

### 2.4 Across Threads

Every page carries the `repoLinks` header row PageExample.html defines, holding one entry per thread:

```
Process | Behavior | then one entry per language, in the order §0 lists the values of [lang]
```

The link targets follow one rule: **cross to the same subject where it exists, and to the thread's first page where it does not.** From a part page in one language thread, each other language's entry points at `Spec_Driven_Design_[lang]_[part].html` for the same `[part]`, and the Behavior entry points at the Behavior page that fixes what every implementation of that part must do. From a Process page, every language entry points at that language's own Process page.

Crossing is by part name, not by index. A language whose implementation does not divide the same way links its non-matching parts to its thread's first page rather than to a mismatched part.

A thread whose pages do not exist yet renders its entry disabled, in the form PageExample.html uses for a language it has no page for. Whether that thread's implementation builds is a separate question, settled in §6: a page exists once it is written, not once its code runs. An entry is disabled only when there is no page to point at.

```html
<a class="repoLinks" href="javascript:;" style="color:var(--atten); opacity:0.5; text-decoration:none; ...">[lang]</a>
```

The entry for the reader's current thread stays enabled and points at that thread's first page, which gives every page a one-click route back to the top of its own thread.

### 2.5 Reaching the Set

`Code/ExploreCode.html` carries one left-panel link, "Spec Driven", pointing at `Spec_Driven_Design_Introduction.html`. That page is the hub: it states both goals, names the six threads, and links to the first page of each. It belongs to the Process thread as page 0, so a reader who arrives and presses Next Page walks the process from the beginning.

### 2.6 The Page Shell

Every page carries the shell PageExample.html demonstrates, unchanged: the stylesheet and script load order in `<head>`, the `loadInExplorer()` redirect, the `load()` handler calling `buildBottomMenu()`, `postFileName()`, and `setPersistantElements()`, the `#about` block, the `<content-block>` with header and indented body, and the `#bottomMenu` holding `#keys`, `#sections`, `#pages`, `#url`, and `#goto`.

Three page-level styles recur and belong in the page's own `<style>` block: `pre` sized to its content and capped at the container with `overflow-x: auto`, `details` bordered for the prompt records, and `ul.tight`/`ol.tight` indented.

## 3. Thread: Process

Language-agnostic, goal 1a. How the specifications came to be, and what authority each holds. Pages are numbered from 0, as every page position in this document is, so the number heading each page below is the index it passes to `setCookie` per §2.3.

**0. Introduction.** `Spec_Driven_Design_Introduction.html`. The hub. What spec-driven design means here: the specifications are the source the code derives from, not a description written after the fact. States both goals, names the six threads and what each covers, and links to the first page of each. Carries no prompt records, so it reads as a map rather than an archive.

**1. The Constitution.** `Spec_Driven_Design_Process_Constitution.html`. The two rules of [Constitution.md](Constitution.md) and what each bounds: code derives only from `Spec*.md` and `*Structure.md`, and nothing outside the project tree is modified without an explicit request. Covers what the rules deliberately permit, general language knowledge among them, and why an ambiguous specification is a question rather than a gap to fill.

**2. Writing the Project Specification.** `Spec_Driven_Design_Process_Specification.html`. How [Spec_TextFinder.md](Spec_TextFinder.md) reached its current form, and the four properties that make a specification testable: requirements observable at the boundary, quantities given as numbers, fixed text quoted rather than described, and accepted costs stated. Draws its examples from the §5.1 help text and the §5.2 reason lines. This page covers the specification as an artifact; the Behavior thread covers what it requires.

**3. Documents, Order, and Citation.** `Spec_Driven_Design_Process_Documents.html`. The five document kinds, the order they come in, and the citation chain that runs from a component spec back to the project spec. Why a component spec cites a section rather than restating it, so a correction reaches the components without being applied twice. Uses [Project_Tree.md](Project_Tree.md) as its map.

**4. Governing the Prose.** `Spec_Driven_Design_Process_Prose.html`. [Text_Tone.md](Text_Tone.md) and this document. The project generates its own documentation, so the rules for that output are themselves project artifacts with their own prompt records.

## 4. Thread: Behavior

Language-agnostic, goal 2a. What every TextFinder does, decomposed by the boundaries the program has rather than by specification section number. Each page cites the sections it binds. Pages are numbered from 0, as in §3.

**0. What TextFinder Does.** `Spec_Driven_Design_Behavior_Overview.html`. The utility in one page: a root path, a regular expression, a walk, and records on stdout. The shape of a record, the four announcements, the three exit codes and why their values are fixed rather than left to each implementation, and the pipeline the four components form. Cites §1, §2, §3.1, and §3.4.

**1. Command Line.** `Spec_Driven_Design_Behavior_CommandLine.html`. Switch syntax, the nine switches and their defaults, the help text, the seven usage diagnostics, and the resolved option listing /v writes. Why fixing that text byte for byte in the project spec is what lets two implementations be compared by test. Cites §4, §5, §5.1, §5.2, and §5.3.

**2. Traversal and File Selection.** `Spec_Driven_Design_Behavior_Traversal.html`. Depth-first order in filesystem order, the 11 skip-list names and their platform-dependent comparison, the silent pass over symbolic links, root-path resolution, the `/p` extension rules including the dot-file case, and the three admission tests with the 10,485,760-byte limit. Cites §3.2 and §3.3.

**3. Matching and Output.** `Spec_Driven_Design_Behavior_Matching.html`. The expression compiled once per invocation, the anywhere-in-the-line match, line splitting across three terminators, the record forms and their gating, the no-content case and the two costs it accepts, and the LF terminator every platform emits. Cites §3.3 and §3.4. The engine each language names belongs to page 4, which cites §6.1.

**4. Interface, Portability, and Non-Goals.** `Spec_Driven_Design_Behavior_Contracts.html`. The one public function, `addSkipDirectory`, and why it extends rather than replaces. The three non-functional requirements, and the limit §6 places on its own reproducibility claim. The four regex engines §6.1 names, the pattern subset they accept alike, and the two costs a pattern outside it carries — including that one implementation may refuse a command line the other three run. The two non-goals, and why restating a decision §3 already made is the point. Cites §3.5, §6, §6.1, and §7.

## 5. Language Threads

Each language thread takes the same eight positions, so the `repoLinks` row crosses from any part to its counterpart. The right-hand column of the table below is the value set of `[part]`.

| Index | File | Subject | Goal |
|-------|------|---------|------|
| 0 | `Spec_Driven_Design_[lang]_Process.html` | How this language's specifications were produced, and the code built from them | 1b |
| 1 | `Spec_Driven_Design_[lang]_Structure.html` | Components, dependency direction, and build, from `[lang]_TextFinder_Structure.md` | 2b |
| 2 | `Spec_Driven_Design_[lang]_Entry.html` | The binary: startup sequence, skip-list ownership, lifetime, exit codes | 2b |
| 3 | `Spec_Driven_Design_[lang]_Cmdline.html` | Command-line parsing in this language's idiom | 2b |
| 4 | `Spec_Driven_Design_[lang]_Dirnav.html` | Traversal, admission, matching, emission | 2b |
| 5 | `Spec_Driven_Design_[lang]_Output.html` | The sink | 2b |
| 6 | `Spec_Driven_Design_[lang]_Testing.html` | The unit suites, the integration suite, and their output | 2b |
| 7 | `Spec_Driven_Design_[lang]_Demonstration.html` | The built executable run against this project's own tree | 2b |

Page 0 is subgoal 1b. It covers what the language's `Prompts_*.md` records show: the questions the specifications had to answer, the ambiguities found and resolved, and what turning the specifications into working code turned up. A reader following the Process thread for the project reads page 0 of each language thread to see the same process applied four times.

Pages 1 through 7 are subgoal 2b. Each names the specification section it implements and the project-spec section that specification binds, so the citation chain is visible from the code page.

Each part page puts its source last, per Text_Tone.md §5.

## 6. Page Inventory

42 pages across six threads, every one of them in `Code/`, beside `ExploreCode.html`. No page sits in a subdirectory of its own, which is what lets `[part]` alone distinguish two pages of one thread.

Every position in this document is numbered from 0. The Index column is the value that page passes to `setCookie('#pages', N, 10)` per §2.3; the Position column is the page's place among all 42, counted the same way. The numbers heading the pages of §3 and §4 are their Index values.

### Process thread

| Position | Index | File | Goal |
|----------|-------|------|------|
| 0 | 0 | `Spec_Driven_Design_Introduction.html` | 1a |
| 1 | 1 | `Spec_Driven_Design_Process_Constitution.html` | 1a |
| 2 | 2 | `Spec_Driven_Design_Process_Specification.html` | 1a |
| 3 | 3 | `Spec_Driven_Design_Process_Documents.html` | 1a |
| 4 | 4 | `Spec_Driven_Design_Process_Prose.html` | 1a |

### Behavior thread

| Position | Index | File | Goal |
|----------|-------|------|------|
| 5 | 0 | `Spec_Driven_Design_Behavior_Overview.html` | 2a |
| 6 | 1 | `Spec_Driven_Design_Behavior_CommandLine.html` | 2a |
| 7 | 2 | `Spec_Driven_Design_Behavior_Traversal.html` | 2a |
| 8 | 3 | `Spec_Driven_Design_Behavior_Matching.html` | 2a |
| 9 | 4 | `Spec_Driven_Design_Behavior_Contracts.html` | 2a |

### Each language thread

Eight positions, identical in every language thread, per §5. Positions run 10 through 17 for the first language thread and continue in blocks of eight, in the order §0 lists the values of `[lang]`, so the last page of the Python thread is position 41.

| Index | File | Goal |
|-------|------|------|
| 0 | `Spec_Driven_Design_[lang]_Process.html` | 1b |
| 1 | `Spec_Driven_Design_[lang]_Structure.html` | 2b |
| 2 | `Spec_Driven_Design_[lang]_Entry.html` | 2b |
| 3 | `Spec_Driven_Design_[lang]_Cmdline.html` | 2b |
| 4 | `Spec_Driven_Design_[lang]_Dirnav.html` | 2b |
| 5 | `Spec_Driven_Design_[lang]_Output.html` | 2b |
| 6 | `Spec_Driven_Design_[lang]_Testing.html` | 2b |
| 7 | `Spec_Driven_Design_[lang]_Demonstration.html` | 2b |

A page exists once it is written, not once its implementation builds. A language thread is created whole: all eight pages at once, at the indices above, each carrying its subject as far as the specifications fix it. Where a page needs a result only a running implementation can supply, it states that the result is pending and says so in place — a Demonstration page reserves its six blocks per §7.3, and a Testing page names the suites without their output. Pending content is therefore a condition of a page, never a missing page.

Two things follow. A thread's entry in the `repoLinks` row is disabled only while that thread has no pages at all, per §2.4, and never merely because its code does not yet run. And the eight indices hold from the moment the thread is created, so an index never changes meaning as the implementation fills in.

## 7. Demonstration

Each language thread ends with a Demonstration page. All four run one fixed set of invocations against the same tree, varying a single thing: `[ext]`, the source extensions that implementation's own files carry. Fixing everything else is what makes the four pages comparable — Spec_TextFinder.md §6 permits a line-for-line comparison across implementations over one tree on one platform, and a demonstration that chose its own command lines per language would forfeit it. §7.4 states what the one permitted variation leaves comparable and what it does not.

Every invocation supplies `-P . -p "md, [ext]"`, rooted at `Spec_driven_TextFinder/`, so each search covers the project's documents, which every implementation shares, together with that implementation's own sources.

Two rules govern which patterns the set may use, and §7.1 satisfies both.

**A pattern is portable across engines.** Every pattern stays inside the subset of Spec_TextFinder.md §6.1, and none of the patterns that match uses `.`, a character class, or a class escape, so none turns on which engine an implementation names. Invocation 1 matches nothing at all — §3.3's no-content case settles each file from its path alone — invocations 2 through 5 use only literals and an escaped `.`, and invocation 6 fails to compile in all four engines.

**A pattern has something to find in every implementation.** A pattern naming a construct of one language would make its invocation demonstrate that language and nothing else: `^export module` finds C++ module declarations, and a Rust or Python run would match it only inside the C++ specifications, which is a search of the documents dressed up as a search of the code. The set therefore draws its patterns from text Spec_TextFinder.md fixes for every implementation. `too large` is an announcement §3.4 fixes and `invalid regex` opens a reason line §5.2 fixes, so both appear as literals in all four implementations' sources as well as in the shared documents. `Spec_TextFinder.md` names a document every implementation searches.

A pattern added to this set is checked against both rules.

### 7.1 The Fixed Invocation Set

| # | What it demonstrates | Command line after `-P . -p "md, [ext]"` |
|---|----------------------|-------------------------------------------|
| 1 | The no-content case of §3.3: default `/r` of `.` with no `/n` or `/L`, so every selected file is listed from its path alone | (none) |
| 2 | Both optional fields on, one record per matching line | `-r "too large" -n true -L true` |
| 3 | Path-only records, one per matching file | `-r "Spec_TextFinder\.md"` |
| 4 | The same search with recursion off | `-r "Spec_TextFinder\.md" -s false` |
| 5 | File announcements and the resolved option set | `-r "invalid regex" -h false -v true -n true` |
| 6 | A malformed expression refused before traversal, per §5.2 | `-r "export("` |

### 7.2 Block Format

Each invocation occupies one block on the page, and every block takes the same five parts.

1. The purpose, stated in one or two lines.
2. The command line, echoed as `$ <executable> <arguments>`.
3. At most 14 output lines, then a `... N more` line where `N` is the number of lines withheld — the total emitted less the 14 shown. A run emitting 14 lines or fewer carries no such line, and an empty result prints `(no output)`.
4. Each stderr line, prefixed `[stderr]`, which separates a diagnostic from a record without reordering either.
5. The total number of lines the run emitted to stdout, shown and withheld together, and the exit code. The count is of the whole run, not of the excerpt above it, so `N` plus 14 equals it whenever a `... N more` line appears.

The captured text goes in a `<pre>` block, verbatim. Prose above each block explains what to look for; the reader then looks. A closing paragraph names what the block shows that the count alone does not.

The page opens with the header its driver writes, naming five things: the date of the capture, the platform it ran on, the executable, the search root, and the extension list. It closes with the output of the runner that starts it. This is the whole of the header; §7.3 adds nothing to it.

### 7.3 What Each Page Provides

A Demonstration page's blocks are filled when its implementation runs. For each of the six invocations the page provides, from an actual run and not by hand:

1. The command line as invoked, naming that implementation's own executable.
2. The captured stdout and stderr, verbatim, in the block format of §7.2.
3. The total line count and the exit code the run reported, per part 5 of §7.2.

The page also provides the header of §7.2, with all five of its fields, and the output of the runner that starts the demonstration.

No page paraphrases its output, abridges it beyond the 14-line rule of §7.2, or reconstructs a result from the specification. A page whose implementation does not build yet exists all the same, per §6: it reserves the six blocks in order and states that they are pending.

### 7.4 Comparability

Because `[ext]` resolves differently for each implementation, two runs share the project's documents and differ in their sources. Comparability is stated against the shared part.

Over the same tree state on the same platform, the document paths an invocation reports must agree across implementations, in the same relative order, and both runs must report the same exit code — Spec_TextFinder.md §3.4 fixes the three code values, so a disagreement there is a defect rather than a difference of convention. Invocation 6 traverses nothing, so its two stderr lines must agree in full except for the executable name in the usage line, which Spec_TextFinder.md §5.1 parameterizes as `<executable>`.

Invocation 5 sets `-v true`, and Spec_TextFinder.md §5.3 fixes the form of the listing that produces, so its nine lines must agree across implementations but for the `/p` line, which carries that implementation's own `[ext]`.

The source paths a run reports are its own, and the line counts differ with them.

Two further things differ by implementation. The header names its own executable and search root, and the echoed command line names its own executable and its own `[ext]` list.

A mismatch in the shared part is a defect in one of the two implementations or an ambiguity in [Spec_TextFinder.md](Spec_TextFinder.md), and the page reporting it says which.

### 7.5 Captures Are Dated

Three of the six invocations count files in this project, so their output moves when a document is added to the tree or removed from it. Each page therefore states the date of its capture, and a page whose counts disagree with a fresh run is stale rather than wrong.

Comparing two implementations means comparing captures taken over the same tree state. A page rebuilt after the tree changes is recaptured in full rather than edited in place, since the counts appear both in the blocks and in the prose around them.

## 8. Prompt Records

Every page that carries prompt records carries them as HTML `<details>` blocks at the end of the page, collapsed by default, one block per file, the summary naming the file and the body holding its entire contents. A page reads without them and opens to them on demand.

The records are process evidence, so they follow goal 1 rather than goal 2. Assignment runs in two steps, in this order. **The directory level a record was produced at picks its thread:** a record produced at the project level goes to the Process thread, and one produced inside a language's own directory goes to that language's thread. **Within that thread, the document the record produced picks the page.** The level rule decides first and decides alone, which is what keeps a record off the Behavior thread even where a Behavior page discusses the same document — `Spec_TextFinder.md` is discussed by one Process page and all five Behavior pages, and its records sit on the Process page.

The two tables below are that rule applied. They are the authority; where a reading of the rule and a table disagree, the table is right and the rule needs amending.

Project-level records sit on the Process thread:

| Prompt file | Page |
|-------------|------|
| `Prompts_Constitution.md`, `Prompts_Fix_Constitution.md` | Process: The Constitution |
| `Prompts_Spec_TextFinder.md`, `Prompts_Fix_Spec_TextFinder.md` | Process: Writing the Project Specification |
| `Prompts_Text_Tone.md`, `Prompts_Page_Structure.md` | Process: Governing the Prose |

That last row follows from §3 page 4, which covers Text_Tone.md and this document together, so the records of both sit with it. A `Prompts_Fix_*.md` written later for either document joins the same row.

Language-level records sit on the pages of that language's own thread, with `[lang]` resolving per §5:

| Prompt file | Page |
|-------------|------|
| `Prompts_[lang]_TextFinder_Structure.md`, `Prompts_Fix_[lang]_TextFinder_Structure.md` | [lang]: Structure |
| `Prompts_Fix_Spec_[lang]_TextFinder.md`, `Prompts_Build_[lang]_TextFinder.md` | [lang]: Process |
| `Prompts_Spec_[lang]_TextFinder_Entry.md`, `Prompts_Fix_Spec_[lang]_TextFinder_Entry.md` | [lang]: Entry |
| `Prompts_Spec_[lang]_TextFinder_Cmdline.md`, `Prompts_Fix_Spec_[lang]_TextFinder_Cmdline.md` | [lang]: Cmdline |
| `Prompts_Spec_[lang]_TextFinder_Dirnav.md`, `Prompts_Fix_Spec_[lang]_TextFinder_Dirnav.md` | [lang]: Dirnav |
| `Prompts_Spec_[lang]_TextFinder_Output.md`, `Prompts_Fix_Spec_[lang]_TextFinder_Output.md` | [lang]: Output |
| `Prompts_[lang]_Spec_driven_TextFinder_Tests.md` | [lang]: Testing |
| any record of demonstration changes at the language level | [lang]: Demonstration |

A language contributes 14 records at most, and a record its conversations never produced leaves its page without a block rather than requiring one. The last row is stated by role rather than by name because such a record sits inside a language's directory without carrying a `[lang]` token in its file name, and §0 bars this document from naming it. §9 rule 4 audits that row by level, not by name: a record in a language's directory that no earlier row claims belongs to that thread, and to its Demonstration page.

One consequence of deciding by level rather than by subject: a record that ranges wider than the page it lands on still lands there, whole. A language-level record covering both a project-spec change and a demonstration change goes to that language's Demonstration page in full, and the pages that discuss the other changes cite it rather than copy it, since §8's first paragraph gives every record exactly one home.

Every record appears on exactly one page. The Introduction carries none.

This changes the original rule, which put every `Prompts_*.md` from a directory level on one page and gave the Introduction five blocks and the Entry page six. Under the rule above no page carries more than two, which keeps a code page readable while the record stays one click away.

## 9. Bringing an Existing Page Into This Structure

A page written before this document, or written for one thread and moved to another, needs four things checked. None depends on which language the page belongs to.

1. **Thread file.** Its `<script src>` names the page-list file of the thread it now belongs to, per §2.3.
2. **Page index.** Its `setCookie('#pages', [index], 10)` matches its position in that thread's list, per §6. A page that changes threads almost always changes index.
3. **Header row.** It carries the full thread row of §2.4, with each entry pointing where that section says and unbuilt threads disabled.
4. **Prompt records.** The records it carries are the ones §8 assigns to it, and no others. A page that inherited a record belonging elsewhere gives it up; a page assigned one it lacks gains it.

Where a page covers two subjects this structure separates, the split follows §3 through §5: the material moves to the page that owns the subject, and the citation moves with it. A page whose content is redistributed rather than moved is rewritten, not trimmed, since prose written for one thread states its subject in terms of that thread's neighbors.