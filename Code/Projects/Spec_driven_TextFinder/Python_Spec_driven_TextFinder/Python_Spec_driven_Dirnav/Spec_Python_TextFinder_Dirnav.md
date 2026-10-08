# Spec_Python_TextFinder_Dirnav — Directory Navigation Library Specification

Specification for the `python_textfinder_dirnav` library of the Python TextFinder implementation. This document is the Python binding of [Spec_TextFinder.md](../../Spec_TextFinder.md) §3.2–§3.4, which remain the authority for traversal, matching, and output behavior; it inherits structural decisions from [Python_TextFinder_Structure.md](../Python_TextFinder_Structure.md). Its consumer is [Spec_Python_TextFinder_Entry.md](../Python_Spec_driven_TextFinder_Entry/Spec_Python_TextFinder_Entry.md); it takes its commands from [Spec_Python_TextFinder_Cmdline.md](../Python_Spec_driven_Cmdline/Spec_Python_TextFinder_Cmdline.md).

## 1. Purpose

`python_textfinder_dirnav` walks a directory tree, reads each selected file, evaluates the regular expression against each line, and formats every matching file into the block Spec_TextFinder.md §3.4 fixes, emitting each of its lines as it is produced. It is the only component that touches file contents, and it writes to no stream.

## 2. Scope

This spec covers only the library. Command-line parsing is specified in Spec_Python_TextFinder_Cmdline.md, skip-list ownership and process-level concerns in Spec_Python_TextFinder_Entry.md, and the destination of emitted strings in Spec_Python_TextFinder_Output.md.

## 3. Responsibilities

The library:

- Is a package importable as `python_textfinder_dirnav`, written in idiomatic Python for CPython 3.10 or later, with annotations throughout.
- Defines the `Output` protocol and binds to a concrete implementation of it through an annotated constructor parameter.
- Compiles the `/r` expression once and reuses it for every line of every file across every root path.
- Implements the traversal, file-admission, matching, and announcement behavior of Spec_TextFinder.md §3.2–§3.4, emitting every block line and announcement through `Output`.

## 4. Public Interface

The package exports the following, defined in `output.py` and `dirnav.py` and re-exported from `__init__.py`:

```python
@runtime_checkable
class Output(Protocol):
    def output(self, text: str) -> None: ...


class Dirnav:
    def __init__(self, output: Output, skips: Sequence[str],
                 commands: ProgramCommands) -> None: ...

    def search(self, root: str) -> None: ...

    def emit_run_summary(self) -> None: ...
```

`Output` is a `typing.Protocol`, so a class satisfies it by carrying the one method rather than by inheriting from it; `python_textfinder_output` nonetheless names it as a base, which makes the structure document's dependency edge a real import, and a test recorder need not. `@runtime_checkable` is applied for a suite that wants the assertion; nothing in this library calls `isinstance` on it.

`Dirnav` is not generic. `typing.Generic[TOutput]` is rejected by name: a type parameter changes no dispatch in Python, every call being an attribute lookup, and it would add a parameter to every annotation to express a bound the annotation on `output` already expresses. Python_TextFinder_Structure.md records what that costs against the siblings.

The constructor compiles a `re.Pattern` from `commands.regex_text` — the engine Spec_TextFinder.md §6.1 assigns to Python — and lets `re.error` propagate when the pattern will not compile. `python_textfinder_entry` catches that type and maps it to the malformed-regex usage diagnostic of Spec_TextFinder.md §5.2. A constructor that raises on an argument it cannot accept is the Python expression of a failed construction, and a `try_create` factory would put the type's only failure mode behind a second entry point for no gain. `python_textfinder_cmdline` guarantees the text is non-empty.

No flags are passed to `re.compile`. `re.IGNORECASE` would change which lines match and no switch asks for it. `re.ASCII` is rejected by name: it would make `\d`, `\w`, `\s`, and `\b` match ASCII only, which is what `std::regex` over `char` does and what Spec_TextFinder.md §6.1 records as the C++ implementation's difference from the other three — passing it here would move this implementation to the wrong side of that difference. `re.MULTILINE` and `re.DOTALL` govern how `^`, `$`, and `.` treat a line terminator inside the subject, and §7 splits lines before matching so no subject holds one.

`skips` is annotated `Sequence[str]` and `python_textfinder_entry` passes a `tuple`, which cannot be modified at all. Nothing in this library modifies it in any case.

`search` returns nothing: every failure it meets is announced through `Output` per §5. A single instance is reused across every root path, so the expression is compiled once per run, and `search` carries no state from one call to the next but for the two run counts of §8.1, which accumulate across calls by design.

`emit_run_summary` writes the run summary Spec_TextFinder.md §3.6 requires and is called once, by `python_textfinder_entry`, after the last `search` returns. It takes no argument and returns nothing: the counts are this instance's own, and the sole reason the call sits with the caller is that only the caller knows which root was the last. No property exposes either count — the summary line is the whole of what they are for.

`search` takes a `str` rather than a `pathlib.Path`. The root is the text the user typed, and §8's rendering works from that text directly; a `Path` would normalize it — collapsing `./`, rewriting separators, dropping a trailing one — and §3.4 requires the emitted path begin with the root as given.

## 5. Traversal Rules

The seven rules below are stated one concern at a time, and the order they are applied in matters as much as the rules themselves — a skip-list test run before the symbolic-link test would announce a link named `build`, and a selection test run before the name test would let an unrenderable name reach the `/p` comparison. That order is fixed here, ahead of the rules, so it does not have to be reconstructed from them.

**A root path**, per `search`: render its text (§8) → test for a surrogate (rule 6) → `os.lstat` (rule 1) → dispatch on kind, a link and an entry that is neither a regular file nor a directory each drawing `cannot open` (rules 1, 7) → a directory walks, a regular file is put to the `/p` test of §6 and then examined. The skip list is not consulted (rule 4).

**A directory**, per `_walk`: count it (§8.1) → `os.scandir` (rule 2) → visit each entry in the order yielded, without sorting or grouping.

**An entry**, per `_visit`: take its name and build its display path (§8) → test for a surrogate (rule 6) → `is_symlink`, which returns silently (rule 5) → `is_dir` and `is_file`, both with `follow_symlinks=False` (rule 5) → a directory is tested against `/s` and then the skip list and walks (rules 3, 4); an entry that is neither directory nor regular file draws `cannot open` (rule 7); a regular file is put to the `/p` test of §6 and then examined. Any `OSError` from the three predicates draws `cannot open` for that entry and no other (rule 7).

**A selected file**, per `_examine`: count it (§8.1) → size (§7) → the no-content case returns here without opening anything (§7) → read, NUL test, UTF-8 test, BOM strip (§7) → split and match (§8).

1. **Root paths.** Per Spec_TextFinder.md §3.2 and §3.4. The root's kind comes from `os.lstat`, tested with `stat.S_ISLNK`, `S_ISDIR`, and `S_ISREG` in that order; `os.lstat` reports the entry itself and does not follow a symbolic link. `os.path.isdir` and `os.path.isfile` are rejected by name: both follow a link and would report the target's kind, hiding the very case §3.2 requires be announced, and both answer `False` for an entry that exists and cannot be opened, which would turn an error announcement into silence. Unlike the C# implementation, this one can distinguish a regular file from a FIFO, a socket, or a device node, because `stat` exposes the mode bits that `FileAttributes` does not; §3.2's "neither a regular file nor a directory" case is therefore reached by its own test here rather than by a failed read.
2. **Order and descent.** The depth-first order of Spec_TextFinder.md §3.2, with the recursion written explicitly: one method iterates a directory and calls itself on each subdirectory it decides to enter, so entries are handled as `os.scandir` yields them, without being collected or reordered. `os.scandir` enumerates a single level, yields lazily, interleaves files and directories as the platform presents them, and is the interpreter's wrapper over the platform facility §3.2 requires. It is used as a context manager, so the directory handle is released at the end of the level rather than at a collection the interpreter schedules. Three alternatives are rejected by name: `os.walk` yields a directory's subdirectory names and file names as two separate lists, which groups directories ahead of files in exactly the way §3.2 forbids, and it owns the descent that `/s` and the skip list must decide; `pathlib.Path.rglob` owns the descent too; and `os.listdir` returns names alone, forcing a `stat` per entry that `os.scandir` has already cached.
3. **Recursion.** Subdirectories are descended only when `/s` is `true`.
4. **Skip list.** Per Spec_TextFinder.md §3.2, compared against the directory's basename by the rule §6 states for an extension — the same rule, applied by the same function, since §3.2 and §5 fix one comparison for both.
5. **Symbolic links.** A directory entry for which `DirEntry.is_symlink()` answers `True` is passed over silently, whatever its target. That predicate does not follow the link and covers both platforms. The kind tests that follow are `DirEntry.is_dir(follow_symlinks=False)` and `DirEntry.is_file(follow_symlinks=False)`, with the argument written out at every call: both default to `follow_symlinks=True`, so the default is the behavior §3.2 forbids and a call that omits the argument is a defect rather than a shorthand.
6. **Names the interpreter cannot render.** Spec_TextFinder.md §3.4 leaves to this document which names this implementation cannot render as text, and they are these: on either platform, a name whose decoded form holds any scalar value in the surrogate range U+D800–U+DFFF. §3.4 settles what happens once such an entry is met, and the case resolves differently in Python than in any sibling. The interpreter decodes a filename with the filesystem encoding and the `surrogateescape` error handler, so a POSIX name that is not valid UTF-8 arrives as a `str` carrying one lone surrogate in U+DC80–U+DCFF for each undecodable byte, and a Windows name holding unpaired surrogates arrives carrying those. Such a name can be opened, because the same handler encodes it back to the original bytes — so unlike the C# implementation, this one *could* search the file. §3.4 requires that it not be searched, and the specification wins, so this library runs an explicit test where C# needs none. The test is applied to the entry's own name before its kind is considered, and to each root path before rule 1 classifies it; §8 performs the U+FFFD substitution §3.4 requires of the announcement. The file this implementation gives up is the price of the match set §6 guarantees: a tree holding such a name would otherwise yield one result set here and another in C#.
7. **Failed opens.** Per Spec_TextFinder.md §3.4. Every filesystem call this library makes is wrapped so that `OSError` resolves to that announcement rather than propagating. `OSError` is the one type to catch and the narrower spellings are not used: `FileNotFoundError`, `PermissionError`, `IsADirectoryError`, and `NotADirectoryError` all derive from it, as does the `WindowsError` alias, so catching the base covers every filesystem failure the interpreter raises without enumerating a list that a later interpreter could extend. An error met while iterating a `scandir` result is treated the same way, so a directory that becomes unreadable part way through is announced rather than silently truncated.

A symbolic link is tested before rule 7 reaches the entry, so a link whose target is unreachable is passed over silently rather than announced: rule 5 turns on the entry's own kind, which `DirEntry` supplies from the enumeration, and §3.2 asks for silence there.

Nothing in traversal propagates an exception to the caller, with one stated exception. `RecursionError` is not caught and is not guarded against: the traversal is written as recursion, so a directory tree deeper than the interpreter's recursion limit — 1000 frames by default, and this library spends more than one frame per level — ends the run. `sys.setrecursionlimit` is not called, because raising the limit trades a clean exception for a stack overflow the interpreter cannot report. The siblings have no equivalent bound short of exhausting the process stack, and this is a limit of this implementation rather than of the specification. No suite exercises it, since no fixture builds a tree of that depth.

## 6. File Selection

Selection follows the `/p` rules of Spec_TextFinder.md §5. The list arrives from `python_textfinder_cmdline` already normalized to bare extensions.

The extension is taken as the text after the last `.` in the file name, with no special case for a leading dot, and a name holding no `.` at all has no extension. `name.rfind(".")` implements that in one call. Two standard facilities are rejected by name, and unlike the C# implementation's rejection of `Path.GetExtension`, which agrees with §5 and was rejected on principle, these two disagree with §5 and would change which files are searched:

- **`os.path.splitext`** returns `(".gitignore", "")` for `.gitignore`, treating a leading dot as part of the stem rather than as a separator. §5 fixes that `.gitignore` has extension `gitignore`, so a `/p` list naming `gitignore` would select nothing.
- **`pathlib.Path.suffix`** returns `""` for the same name, by the same rule, and is rejected with it.

The file name comes from `DirEntry.name`, and for a root path that resolved to a regular file from the text after the last `/` or `\` in the root — since this library builds paths from text and does not ask the standard library to parse them.

Comparison is case-sensitive on POSIX and case-insensitive on Windows, per Spec_TextFinder.md §3.2 and §5. The platform test is `os.name == "nt"`, evaluated once at import and held in a module-level constant; there being no compile step, the C++ `#ifdef` and Rust `#[cfg]` have no counterpart here.

The insensitive comparison folds both sides with `str.lower()`. `str.casefold()` is rejected by name: it performs full case folding, mapping `ß` onto `ss` and `ﬁ` onto `fi`, so two names Windows treats as distinct would compare equal and one file would be selected in place of another. `str.lower()` is defined by the Unicode database rather than by a locale, so the Turkish-culture hazard the C# implementation guards against does not arise; that this is simple case mapping rather than Windows' own upper-case table is an approximation shared with the siblings.

Selection applies uniformly: a root path that is a regular file is filtered by `/p` like any other file.

## 7. Content Decoding and Line Splitting

A selected file is put to the three admission tests of Spec_TextFinder.md §3.3. The size test is applied to `st_size` from `DirEntry.stat(follow_symlinks=False)`, so a file above the limit is never read into memory; the NUL and UTF-8 tests are applied to the bytes read. The limit is written `10_485_760` so the digit grouping is in the source rather than in a comment. `os.lstat` on the assembled path serves a root that resolved to a regular file, there being no `DirEntry` for it.

The constructor records whether the run satisfies §3.3's no-content case — `regex_text` equal to `"."` with `line_numbers` and `matched_line` both `False`. When it does, a selected file that passes the size test and is not empty produces a block of its path line alone, the file is never opened, and §3.3's rule that no file announcement accompanies that block applies unchanged.

A file that needs reading is read in full, in binary mode, with `open(path, "rb")` as a context manager and one `read()`, so one failing a later test is skipped entirely rather than searched in part. The NUL test asks whether the bytes hold a zero: `b"\x00" in data`.

The UTF-8 test is `data.decode("utf-8")`, and a `UnicodeDecodeError` means the file is rejected. Three easier spellings are rejected by name, and the rejection is the sharpest in this document because each of them turns a test §3.3 requires into no test at all:

- **`data.decode("utf-8", errors="replace")`** substitutes U+FFFD for every invalid sequence and reports nothing, so every file would pass the UTF-8 test and a UTF-16 file of ASCII text — the case §3.3 names — would be searched with its NUL bytes already caught and its mojibake silently accepted.
- **`errors="surrogateescape"`** is worse in the same direction: it preserves the invalid bytes, so nothing is lost and nothing is detected, and the surrogates it produces would then reach the sink.
- **`open(path, "r")`** in text mode decodes with the locale's preferred encoding, which is not UTF-8 on every platform, and applies universal-newline translation, which rewrites CR and CRLF to LF before §3.3's line rule ever sees them. Text mode is not used anywhere in this library.

A leading UTF-8 BOM survives decoding as U+FEFF and is removed with `str.removeprefix("﻿")`, which removes one occurrence. The removal happens after the admission tests, so its three bytes count toward the size limit and toward the NUL scan like any others.

Lines are then split per Spec_TextFinder.md §3.3. The split uses one module-level compiled pattern, `re.compile(r"\r\n|\n|\r")`, with `\r\n` first in the alternation so that a CRLF is one terminator rather than two. `re.split` over the decoded text yields one element per line and a final empty element when the text ends in a terminator; that element is discarded, since §3.3 defines a line as a run of characters and an empty run after the last terminator is not one. An empty file yields no lines at all.

Two standard splitters are rejected by name:

- **`str.splitlines()`** is the obvious choice and splits on eight terminators §3.3 does not recognize — vertical tab, form feed, the file, group, record, and unit separators, NEL (U+0085), and the line and paragraph separators (U+2028, U+2029). A line holding a form feed would become two lines here and stay one line in every sibling, which would put a difference in the match set §6 guarantees.
- **`str.split("\n")`** does not treat a bare CR as a terminator, leaves a CR at the end of every line of a CRLF file — where it would be visible under `/L` — and yields a trailing empty element for a file that ends in a terminator.

Line numbers count every line, including those that do not match.

## 8. Matching and Emission

The expression is evaluated against each line with `Pattern.search`, which gives the anywhere-in-the-line match Spec_TextFinder.md §3.3 requires and asks the engine for nothing more. Only its truthiness is read. `Pattern.match` and `Pattern.fullmatch` are rejected by name: the first anchors at the start of the line and the second requires the whole line, so each would report a different match set than the other three implementations. The module-level `re.search(pattern, string)` is rejected too: it consults `re`'s internal pattern cache and would defeat §3.3's requirement that the expression be compiled once per invocation, and that cache is cleared when it fills, so the cost would appear only on a long run.

The line is passed as a `str`, so `.`, a character class, and a class escape each match one Unicode scalar value — the behavior of three of the four engines, with the C++ implementation the outlier Spec_TextFinder.md §6.1 records. Above U+10000 this agrees with Rust and differs from C#, where a `.` matches one UTF-16 code unit of a surrogate pair; §6.1 scopes its portable subset to ASCII lines, so that difference falls outside what it guarantees.

Blocks are emitted as Spec_TextFinder.md §3.4 fixes — form, indent, field separator, emission timing, and the single path line per matching file. The library tracks per file whether it has written that line, returns from the loop at the first match when `line_numbers` and `matched_line` are both `False`, and otherwise runs to the end of the file writing one detail line as each matching line is evaluated. Nothing is accumulated: `Output` receives each line as it is produced.

`<path>` begins with the root path `search` was given and is built by joining that root's text with the entry names descended through. `os.path.join` is rejected by name for the emitted form: it joins with `os.sep`, which on Windows is `\`, and would make the same tree produce different output on two platforms. `os.path.abspath` and `Path.resolve` are rejected too, since §3.4 asks for the path by which the file was reached rather than its absolute form, and `Path.resolve` additionally follows symbolic links.

§3.4 requires `/` on every platform for the whole of `<path>`, the root's own text included, so a separator the user typed is normalized too: `-P src\sub` on Windows yields `src/sub/file.py`. Every `\` in a root path's text becomes `/` before the first entry name is appended.

Every emitted path passes through one rendering function, which replaces each scalar value in U+D800–U+DFFF with U+FFFD as §5 rule 6 requires. It is applied to a root path's text and to each entry name as the enumeration yields it, rather than only to the announcement that needs it, so that no surrogate can reach the sink through a route this document did not consider; text carrying none is returned unchanged. Separator normalization is not part of that function: a `\` is a name character on POSIX rather than a separator, so rewriting one inside an entry name would report a path the tree does not hold, and only the root path's text is normalized.

The path this library hands to the filesystem is not the path it emits. Filesystem calls take the platform form — `DirEntry.path`, or a join with `os.sep` — and the emitted form is built alongside it with `/`. Two strings are therefore carried through the walk for each entry; the alternative, emitting one and translating at the point of the call, would put a translation in every filesystem call rather than one join per entry.

Announcements go through the same `Output`, in the forms and under the gating of Spec_TextFinder.md §3.4, each emitted as the library reaches the entry it names. `commands.suppress_on_no_match` is the `/h` field §3.4 gates file announcements on; under `/h false` a file searched without matching draws `searched <path>` once its last line has been evaluated, which is the first moment the library knows it matched nothing, and a file rejected by a content test draws `skipped <path>` at the point of rejection.

### 8.1 Run Summary

Spec_TextFinder.md §3.6 puts the two run counts in this library, for every implementation alike, and fixes the line they produce. Two `int` attributes hold them, both zero on construction, and neither is reset by `search`. Python's `int` is unbounded, so neither can overflow and no width is chosen.

The file count is incremented at the head of `_examine`, which both call sites reach only after the `/p` test of §6 admits the file, and which is entered before `st_size` is read. Everything §3.6 excludes is therefore excluded by construction rather than by a second test — an entry refused by `/p`, a symbolic link, an entry whose name will not render, and an entry beneath a pruned directory never reach `_examine`, and an entry whose metadata cannot be read draws `cannot open` before selection is attempted. A file admitted and then announced `too large` or `cannot open` is counted, the increment standing ahead of both.

The directory count is incremented at the head of `_walk`, before `os.scandir`, so a directory that cannot be enumerated is counted and announced alike. A root path that resolved to a directory reaches `_walk` and is counted; a pruned directory and, under `/s false`, every subdirectory never reach it and are not.

One case §3.6 leaves to be read rather than states is fixed here: a directory whose name will not render draws `cannot open` under §5 rule 6 and is **not** counted. §3.6's primary rule is that a directory counts when TextFinder reads its entries or tries to, and this one is refused before the attempt, as a pruned directory is; the clause counting an announced directory governs one whose enumeration was attempted and failed. This reading also agrees with §3.6's treatment of the same case for a file, which it excludes by name. The case does not arise in C#, where the runtime's substitution makes the name unopenable before this library would see it, so this document is the first in the project to have to settle it.

`emit_run_summary` writes one line through `Output`, in the fixed form of Spec_TextFinder.md §3.6. Both numbers are formatted with plain interpolation and no format specification, so neither carries a grouping separator; `:,` is not used, and Python's `str.format` consults no locale, so the `InvariantCulture` the C# implementation must ask for has no counterpart. The line names no path, so §8's rendering rules do not reach it. `python_textfinder_entry` calls it only on a run that traversed, per §3.6 and Spec_Python_TextFinder_Entry.md §4.

## 9. Build

Per [Python_TextFinder_Structure.md](../Python_TextFinder_Structure.md):

- Package `python_textfinder_dirnav` under this folder's `src/`, importable once that folder is on `PYTHONPATH`.
- Imports `python_textfinder_cmdline` for `ProgramCommands`, and from the standard library: `os`, `re`, and `stat` in `dirnav.py`, `Sequence` from `collections.abc` in the same file, and `Protocol` and `runtime_checkable` from `typing` in `output.py`. `Sequence` is taken from `collections.abc` rather than from `typing`, whose aliases for the abstract base classes have been deprecated since 3.9. No distributed package is required. It does not import `python_textfinder_output`, which the caller supplies at the point of construction.
- Its unit suite sits under `test/` and is not part of the package, so importing the package does not import the suite.

## 10. Non-Goals

- The library does not parse the command line and does not read `sys.argv`.
- The library does not own or extend the skip list, and does not implement the skip-list extension point.
- The library does not modify files, follow symbolic links, or report an exit code.
