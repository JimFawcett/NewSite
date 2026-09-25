# Page_Structure

The page structure for this project, organized around its two goals. It replaces an earlier structure of the same name, which described a single linear run of seven pages and had no place to put a second language. That earlier version sits in `archive/Page_Structure.md`.

[PageExample.html](../../PageExample.html) remains the reference implementation for the page shell and the navigation mechanism. [Text_Tone.md](Text_Tone.md) governs the prose that goes into a page. This document governs the set of pages, what each covers, and how a reader moves among them.

## 0. Placeholders

This document names no page and no file that belongs to one language. Where a generated page carries a language-specific name, this document writes a placeholder, and a page is built by substituting one value throughout. The eight placeholders and their values are fixed here and nowhere else.

| Placeholder | Stands for | Values |
|-------------|------------|--------|
| `[lang]` | the language token inside a file or identifier name | `Cpp`, `Rust`, `CSharp`, `Python` |
| `[part]` | a page position within a language thread | the eight names of §5 |
| `[index]` | a page's 0-based position in its own thread's list | given per page in §6 |
| `[ext]` | the source extensions one language's demonstration searches | `ixx, cpp`, `ixx, cpp, rs`, `ixx, cpp, rs, cs`, `ixx, cpp, rs, cs, py` |
| `[ownext]` | the source extensions of one language alone | `ixx, cpp`, `rs`, `cs`, `py` |
| `[decl]` | a pattern matching that language's publicly visible declarations at line start | `^export `, `^pub `, `^public `, `^def ` |
| `[docword]` | a literal that language's own `[lang]_TextFinder_Structure.md` contains | `import`, `Cargo`, `interface`, `import` |
| `[badregex]` | a pattern all four engines refuse to compile, in that language's own vocabulary | `export(`, `pub fn (`, `public (`, `def (` |

The last four appear only in §7.1, and only in the invocations that search one implementation's own files or search nothing at all. Each takes its values in the order §0 lists `[lang]`, as `[ext]` does.

`[ext]` is cumulative: each language's list is its own source extensions appended to the lists of the languages before it in the order above. A demonstration therefore searches every implementation's sources that exist by the time that language is written, not its own alone — the C# run reports C++ and Rust sources beside its own, and only the C++ run, being first, reports one language's. The reason is that a demonstration is a record of this project's tree, and a run that searched one language's files would report a fraction of the tree while claiming to be rooted at the whole of it. The alternative, one extension per language, is named here as rejected rather than left unmentioned; §7.4 states what the choice costs and, as much to the point, what it does not.

`[ownext]` is that rejected alternative kept for the one invocation that needs it. §7.1's invocation 8 is rooted in a single implementation's own component directories, where no other language's sources sit, so the cumulative list would select exactly the same files while echoing a command line that named extensions the roots cannot hold. The two placeholders differ only for Rust, C#, and Python; for C++, first in the order, they are the same value.

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

A page exists once it is written, not once its implementation builds. A language thread is created whole: all eight pages at once, at the indices above, each carrying its subject as far as the specifications fix it. Where a page needs a result only a running implementation can supply, it states that the result is pending and says so in place — a Demonstration page reserves its eleven blocks per §7.3, and a Testing page names the suites without their output. Pending content is therefore a condition of a page, never a missing page.

Two things follow. A thread's entry in the `repoLinks` row is disabled only while that thread has no pages at all, per §2.4, and never merely because its code does not yet run. And the eight indices hold from the moment the thread is created, so an index never changes meaning as the implementation fills in.

## 7. Demonstration

Each language thread ends with a Demonstration page. All four run one fixed set of eleven invocations against the same tree. Fixing the set is what makes the four pages comparable — Spec_TextFinder.md §6 permits a line-for-line comparison across implementations over one tree on one platform, and a demonstration that chose its own command lines per language would forfeit it. §7.4 states what the permitted variations leave comparable and what they do not.

The set divides in two. **Invocations 1 through 7 are shared work.** Each supplies `-P . -p "md, [ext]"`, rooted at `Spec_driven_TextFinder/`, so each search covers the project's documents, which every implementation shares, together with the sources of that implementation and of every implementation written before it. `[ext]` is the only thing that varies among them, and §0 makes it cumulative rather than per-language. **Invocations 8 through 11 are each implementation's own.** Two of them search only that implementation's own component directories, one searches only its own structure document, and two traverse nothing at all, so a pattern in that language's vocabulary costs nothing there.

Two rules govern which patterns the set may use, and §7.1 satisfies both.

**A pattern is portable across engines.** Every pattern stays inside the subset of Spec_TextFinder.md §6.1, and none of the patterns that match uses `.`, a character class, or a class escape, so none turns on which engine an implementation names. Invocation 2 needs no file content at all — §3.3's no-content case settles each file from its path alone — invocations 3 through 9 use only literals, an escaped `.`, and the anchor `^`, and invocation 10 fails to compile in all four engines.

**A pattern naming a language construct appears only where it searches that language.** Such a pattern would otherwise make its invocation demonstrate one language and nothing else: `^pub ` finds Rust declarations, and a C++ or Python run would match it only inside the Rust specifications, which is a search of the documents dressed up as a search of the code. Invocations 1 through 7 therefore draw their patterns from text Spec_TextFinder.md fixes for every implementation — `too large` is an announcement §3.4 fixes, and `Spec_TextFinder.md` names a document every implementation searches. `[decl]`, `[docword]`, and `[badregex]` are confined to invocations 8 through 11, where the only files under the root belong to the implementation running them, or where no file is opened.

A pattern added to this set is checked against both rules.

### 7.1 The Fixed Invocation Set

Invocations 1 through 7 take the root and extension list `-P . -p "md, [ext]"`; the column below gives what follows it. Invocations 8 through 11 give their whole command line, root included.

| # | What it demonstrates | Command line |
|---|----------------------|--------------|
| 1 | No switch at all: §3.1's bare command line lists the resolved options and exits 0 without traversing | (nothing at all, not even the root) |
| 2 | The no-content case of §3.3: default `/r` of `.` with no `/n` or `/L`, so every selected file is listed from its path alone | (the root and extension list alone) |
| 3 | The two-level block of §3.4, both optional fields on, one detail line per matching line | `-r "too large" -n true -L true` |
| 4 | The same search with `/L false`, leaving the line number alone on each detail line | `-r "too large" -n true` |
| 5 | Path-only blocks, one per matching file | `-r "Spec_TextFinder\.md"` |
| 6 | The same search with recursion off | `-r "Spec_TextFinder\.md" -s false` |
| 7 | File announcements and the resolved option set | `-r "Spec_TextFinder\.md" -h false -v true` |
| 8 | Two roots traversed in the order `/P` gave them, each path beginning with the root whose subtree holds it, and the skip list pruning beneath both | `-P [lang]_Spec_driven_TextFinder/[lang]_Spec_driven_Cmdline -P [lang]_Spec_driven_TextFinder/[lang]_Spec_driven_Output -p "[ownext]" -r "[decl]" -n true -L true` |
| 9 | A root that cannot be opened, announced beside a root that is a regular file, the run still exiting 0 and the error announcement ignoring `/h true` | `-P no_such_directory -P [lang]_Spec_driven_TextFinder/[lang]_TextFinder_Structure.md -r "[docword]"` |
| 10 | A malformed expression refused before traversal, per §5.2, with the option listing on stdout ahead of the diagnostic | `-P . -p "md, [ext]" -r "[badregex]"` |
| 11 | The help text of §5.1, written to stdout under `/H`, traversing nothing | `/H true` |

Invocation 11 is the one place the set uses the `/` introducer, which §4 makes equivalent to the `-` every other invocation uses. Showing both is the point.

### 7.2 Block Format

Each invocation occupies one block on the page, and every block takes the same six parts.

1. The purpose, stated in one or two lines.
2. The command line, echoed as `$ <executable> <arguments>`.
3. At most 14 output lines, then a `... N more` line where `N` is the number of lines withheld — the total emitted less the 14 shown. A run emitting 14 lines or fewer carries no such line, and an empty result prints `(no output)`.
4. The run summary Spec_TextFinder.md §3.6 requires, when the run emitted one and part 3 withheld it. It is the last line a traversing run writes, so on every invocation that emits more than 14 lines the excerpt above ends before reaching it, and a block that stopped there would hide the one line reporting what the run reached. It is shown after the `... N more` line and counted among the lines that line withholds.
5. Each stderr line, prefixed `[stderr]`, which separates a diagnostic from a record without reordering either.
6. The total number of lines the run emitted to stdout, shown and withheld together, and the exit code. The count is of the whole run, not of the excerpt above it, so `N` plus 14 equals it whenever a `... N more` line appears.

The captured text goes in a `<pre>` block, verbatim. Prose above each block explains what to look for; the reader then looks. A closing paragraph names what the block shows that the count alone does not.

The page opens with the header its driver writes, naming four things: the date of the capture, the executable, the search root, and the extension list. It closes with the output of the runner that starts it. This is the whole of the header; §7.3 adds nothing to it. The platform is not among the fields, though §7.4 rests on two captures having been taken on one platform; a capture states its date and leaves its platform to the prose around it.

### 7.3 What Each Page Provides

A Demonstration page's blocks are filled when its implementation runs. For each of the eleven invocations the page provides, from an actual run and not by hand:

1. The command line as invoked, naming that implementation's own executable.
2. The captured stdout and stderr, verbatim, in the block format of §7.2.
3. The total line count and the exit code the run reported, per part 6 of §7.2.

The page also provides the header of §7.2, with all four of its fields, and the output of the runner that starts the demonstration.

No page paraphrases its output, abridges it beyond the 14-line rule of §7.2, or reconstructs a result from the specification. A page whose implementation does not build yet exists all the same, per §6: it reserves the eleven blocks in order and states that they are pending.

### 7.4 Comparability

Because `[ext]` is cumulative, two runs of invocations 1 through 7 select different sets of files: every run reports the project's documents, and each reports the sources of its own language and of every language before it. Comparability is stated against the part two runs share, and the cumulative list narrows that part further than a per-language list would have.

**The paths-agree claim holds only where two runs select the same files.** Where they do, and over the same tree state on the same platform, the paths an invocation reports must agree across implementations in full and in order. Where they do not, the claim does not apply, and this document no longer makes a weaker one in its place.

An earlier §7.4 did make that weaker claim — that the *document* paths agree in the same relative order, whatever sources interleave with them — and it was true: the documents every run selects are the same, so their order among themselves is one depth-first walk in every run. It is dropped because it is not a claim a reader can check. The C# run reports `Rust_Spec_driven_Cmdline/src/lib.rs` between two documents the C++ run reports consecutively, so verifying the weaker claim means striking the source paths out of both captures first and then comparing what is left. A comparability rule worth stating is one a reader can apply to the captures as they stand.

What survives without that condition is narrower and still worth having. Both runs must report the same exit code — Spec_TextFinder.md §3.4 fixes the three values, so a disagreement there is a defect rather than a difference of convention. Invocations 1 and 7 list the resolved option set, whose form Spec_TextFinder.md §5.3 fixes, so their nine listing lines must agree but for the `/p` line, which carries that implementation's own `[ext]`, and for the `/v` line, which reads `true` only in the listing `/v` itself asked for.

Invocation 6 is where the paths-agree claim does apply, and it is the only one of the seven. Rooted at the project with `/s false`, it reads the project root alone, where no implementation's sources sit, so every run selects the same documents and reports them in the same order — and every run's summary reports the same two counts. A reader wanting to check Spec_TextFinder.md §6's consistency guarantee against captured output has that invocation and no other.

The source paths a run reports are its own, and the line counts differ with them. The run summary of §3.6 differs with them too: its two counts include every source the cumulative list admits, so only its form is comparable across implementations, not its numbers — invocation 6 excepted. Invocation 8 is rooted in one implementation's own component directories, so both its counts and its blocks are that implementation's alone.

Two things are worth separating here, because it would be easy to blame the cumulative list for both. Leaving invocation 6 as the only one whose whole path list agrees is not the cumulative list's doing: a per-language list would leave it the only one too, since two runs would still select different sources and still interleave them among the documents. What the cumulative list costs is narrower — it makes each run's file set a superset of the ones before it rather than a sibling of them, so the counts grow down the language order and no two of the four report the same number of files.

What it buys is the record. A per-language list would make each demonstration a search of one language's files, which is a fraction of the tree the run is rooted at, and a shrinking fraction as languages are added. §0 takes the wider record; §7.4 states the narrower claim that record supports, rather than keeping a wider claim by narrowing what each page searches.

Invocations 8 through 11 are not comparable by content, being each implementation's own by construction, and three of them are comparable in form. Invocation 9 must announce its unopenable root, report its structure document, and exit 0 in every implementation. Invocation 10 traverses nothing, so its option listing agrees but for the `/p` and `/r` lines, and its two stderr lines agree in full except for the executable name in the usage line, which Spec_TextFinder.md §5.1 parameterizes as `<executable>`. Invocation 11 prints the help text of §5.1, which is fixed text, so its lines must agree in full but for that same executable name.

Two further things differ by implementation. The header names its own executable and search root, and the echoed command line names its own executable and its own `[ext]` list.

A mismatch in the shared part is a defect in one of the two implementations or an ambiguity in [Spec_TextFinder.md](Spec_TextFinder.md), and the page reporting it says which.

### 7.5 Captures Are Dated

Seven of the eleven invocations count files in this project, so their output moves when a document is added to the tree or removed from it, and the run summary of Spec_TextFinder.md §3.6 moves with it in each of the eight that traverse. Invocations 1, 10, and 11 traverse nothing, so none of the three emits a summary and none moves with the tree. Each page therefore states the date of its capture, and a page whose counts disagree with a fresh run is stale rather than wrong.

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
| `Prompts_maintainability_[lang]_TextFinder.md` | [lang]: Process |
| `Prompts_Spec_[lang]_TextFinder_Entry.md`, `Prompts_Fix_Spec_[lang]_TextFinder_Entry.md` | [lang]: Entry |
| `Prompts_Spec_[lang]_TextFinder_Cmdline.md`, `Prompts_Fix_Spec_[lang]_TextFinder_Cmdline.md` | [lang]: Cmdline |
| `Prompts_Spec_[lang]_TextFinder_Dirnav.md`, `Prompts_Fix_Spec_[lang]_TextFinder_Dirnav.md` | [lang]: Dirnav |
| `Prompts_Spec_[lang]_TextFinder_Output.md`, `Prompts_Fix_Spec_[lang]_TextFinder_Output.md` | [lang]: Output |
| `Prompts_[lang]_Spec_driven_TextFinder_Tests.md` | [lang]: Testing |
| any record of demonstration changes at the language level | [lang]: Demonstration |

A language contributes 15 records at most, and a record its conversations never produced leaves its page without a block rather than requiring one. The last row is stated by role rather than by name because such a record sits inside a language's directory without carrying a `[lang]` token in its file name, and §0 bars this document from naming it. §9 rule 4 audits that row by level, not by name: a record in a language's directory that no earlier row claims belongs to that thread, and to its Demonstration page.

The maintainability row covers a record of reviewing a language's finished implementation — its idiom, its smells, and whatever defects the review turns up and fixes. Such a review ranges over every component of the thread at once, so no component page owns it, and it is process evidence of the same kind as an audit of the specifications: the Process page already carries those. A review that reaches into a sibling language, because the defect it found was never one thread's alone, still lands on the reviewed language's Process page whole, per the paragraph below.

One consequence of deciding by level rather than by subject: a record that ranges wider than the page it lands on still lands there, whole. A language-level record covering both a project-spec change and a demonstration change goes to that language's Demonstration page in full, and the pages that discuss the other changes cite it rather than copy it, since §8's first paragraph gives every record exactly one home.

Every record appears on exactly one page. The Introduction carries none.

This changes the original rule, which put every `Prompts_*.md` from a directory level on one page and gave the Introduction five blocks and the Entry page six. Under the rule above no page carries more than two, save a language's Process page, which carries three once that language has been reviewed. That keeps a code page readable while the record stays one click away.

## 9. Bringing an Existing Page Into This Structure

A page written before this document, or written for one thread and moved to another, needs four things checked. None depends on which language the page belongs to.

1. **Thread file.** Its `<script src>` names the page-list file of the thread it now belongs to, per §2.3.
2. **Page index.** Its `setCookie('#pages', [index], 10)` matches its position in that thread's list, per §6. A page that changes threads almost always changes index.
3. **Header row.** It carries the full thread row of §2.4, with each entry pointing where that section says and unbuilt threads disabled.
4. **Prompt records.** The records it carries are the ones §8 assigns to it, and no others. A page that inherited a record belonging elsewhere gives it up; a page assigned one it lacks gains it.

Where a page covers two subjects this structure separates, the split follows §3 through §5: the material moves to the page that owns the subject, and the citation moves with it. A page whose content is redistributed rather than moved is rewritten, not trimmed, since prose written for one thread states its subject in terms of that thread's neighbors.