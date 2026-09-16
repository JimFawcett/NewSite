# Spec_TextFinder — TextFinder Specification

## 1. Purpose

TextFinder is a command-line utility that traverses a directory tree — recursively by default — examining file contents for matches to a user-supplied regular expression. Every match is written to stdout.

## 2. Scope

This document specifies behavior common to all TextFinder implementations. Each lives in its own `<Lang>_Spec_driven_TextFinder/` folder holding a `<Lang>_TextFinder_Structure.md` and one subfolder per component, and refines this document without redefining it. [Cpp_Spec_driven_TextFinder/](Cpp_Spec_driven_TextFinder/) is the first; Rust, C#, and Python follow.

What this document fixes is what a user sees on stdout: the blocks and announcements of §3.4, the help text of §5.1, the option listing of §5.3, and the exit codes. Everything else is a component specification's to settle in its own language's idiom and to that language's needs — the argument vector's type and encoding (§4), the signature of the skip-list extension point (§3.5), the wording of any text written to stderr (§5.2), and the standard-library facilities each rule is implemented with. A detail fixed in a component specification is a fact about that implementation rather than a departure from this document, and an implementation whose idiom reads badly under a rule written here should say so in its own specification rather than follow the rule into awkward code.

Higher-level principles that constrain every implementation are recorded in [Constitution.md](Constitution.md) in this folder.

## 3. Functional Requirements

### 3.1 Input

TextFinder accepts a sequence of switch/value pairs, defined in §5 and parsed per §4. Every switch has a default, so any partial command line resolves to a full option set.

A command line bearing no switch at all names no work. TextFinder writes the resolved option listing of §5.3 to stdout, exits 0, and traverses nothing, so that a user who types the bare executable name learns the settings a real invocation would start from instead of waiting on a search of the current tree.

### 3.2 Traversal

Starting at the root path, TextFinder visits every subdirectory and every file that passes the active filters. Recursion is controlled by /s (see §5) and is enabled by default; when /s is set to `false`, TextFinder searches the files directly within the root path but descends into none of its subdirectories. When the root path resolves to a regular file rather than a directory, TextFinder searches that single file; when it resolves to anything else, it is not searched and is reported per §3.4.

Symbolic links are never opened. One met during traversal is passed over silently, since TextFinder makes no attempt to open it. A root path that is a symbolic link is reported per §3.4, because the user named it explicitly and it will not be searched.

Traversal is depth-first: on reaching a directory that is not pruned, TextFinder descends into it and completes its subtree before returning to the next entry of the parent. Within a directory, entries are visited in the order the platform's directory-reading facility presents them, files and directories interleaved rather than grouped — a directory is descended at the point it is reached in that order.

Two requirements fix that order, and §6's comparison of one implementation against another rests on both. An implementation enumerates a directory through the facility its platform provides — `readdir` on POSIX, `FindFirstFileW` and `FindNextFileW` on Windows, or whatever its own standard library wraps around them — and it does not substitute a facility that imposes an order of its own. It then visits entries in the order that facility yields: it does not sort them, and it does not group files ahead of directories or the reverse. Collecting a directory's entries before visiting any of them is permitted, since it changes no order; reordering them is not. The visit order is therefore the filesystem's own, and it is the same order in every implementation; §6 records what that leaves guaranteed and what it does not.

TextFinder maintains a skip list of directory names that are never entered during traversal. When a directory whose name appears in the skip list is encountered, its entire subtree is pruned. The default skip list holds directories that typically contain version-control metadata or intermediate build output:

    archive, .git, .svn, .hg, build, out, target, bin, obj, __pycache__, node_modules

The skip list is extended at build time, by the function described in §3.5. No command-line switch and no configuration file extends it.

A skip-list entry is compared against the directory's basename — the final component of its path — and matches when the two strings are equal. Matching is case-sensitive on POSIX systems and case-insensitive on Windows, following the filesystem conventions of each platform. The skip list applies to directory names only; file-name filtering by extension is controlled by /p (see §5).

The skip list governs directories met during traversal, never a root path the user supplied on /P. A root whose basename appears in the skip list is traversed like any other root, for the reason a root that is a symbolic link is announced rather than passed over: the user named it explicitly, and returning nothing without a word would leave that unexplained. Pruning resumes immediately below the root, so a `build` directory found beneath a root named `build` is pruned as usual.

### 3.3 Matching

Each candidate file is tested before it is searched. Its size, taken from the filesystem, must not exceed 10 MB (10,485,760 bytes); a file above the limit is never read. A file within the limit is read in full — so that one failing a later test is skipped entirely rather than searched in part — and is admitted only if its content holds no NUL byte and is valid UTF-8. The NUL test is the binary-file test of §7; UTF-8 validity alone does not serve, because a UTF-16 file of ASCII text is valid UTF-8. A leading UTF-8 BOM is consumed and does not belong to the first line. A file that fails any test is not searched and is reported per §3.4.

TextFinder evaluates the regular expression against each line of an admitted file.

One case needs no file content at all. When the expression is the default `.`, and /n and /L are both `false` — the state any command line reaches that overrides none of the three — a block carries only its path line and a single match settles it, so TextFinder reports every selected file of non-zero size without opening it. The size test still applies, reading only filesystem metadata, but the NUL and UTF-8 tests do not.

No file is opened in this case, so no file announcement of §3.4 arises: not `searched`, which reports a file that was read and matched nothing, and not `skipped`, which reports one a content test rejected. Every selected file matches, so every one produces a block instead. A selected file of zero size produces neither a block nor an announcement. Two consequences are accepted for the speed this buys: a file those tests would have rejected, a binary file among them, is reported; and so is a file whose lines are all empty, which `.` would not in fact have matched.

A line is a maximal run of characters bounded by a line terminator. The recognized terminators are LF (U+000A), CRLF (U+000D U+000A), and bare CR (U+000D); this covers Windows, Linux, and macOS conventions. If the final line of a file lacks a terminator, it is nevertheless treated as a line.

The regular expression is compiled by the engine §6.1 names for the implementation's language. Each implementation compiles the expression exactly once per invocation and reuses the compiled engine for every line evaluated. §6.1 fixes the pattern syntax every named engine accepts alike and states what a pattern outside that syntax costs.

The expression signifies a match by finding at least one occurrence anywhere within the line.

### 3.4 Output

Matches are written to stdout as blocks, one block per matching file. A block opens with a line naming the file and continues with a detail line for each matching line, when /n or /L asks for one:

    <path>
      <lineNumber> - <matchedLine>
      <lineNumber> - <matchedLine>

The first line of a block is `<path>` alone, with nothing before or after it. Each detail line is indented exactly two spaces and carries the fields /n and /L select, joined by the three-character separator ` - ` (space, hyphen, space) when both are present.

The `<lineNumber>` field appears only when /n is `true`; the `<matchedLine>` field only when /L is `true`. With /n `true` and /L `false` a detail line carries the number alone after its indent; with /L `true` and /n `false`, the line text alone.

When both are `false` — their defaults — a block has no detail lines. Its path line then says everything the block can say, so one block is emitted per matching file and evaluation of that file stops at its first match. When either is `true`, one detail line is emitted for every matching line, however many occurrences that line holds.

The two-level form exists to write a path once and once only. A file's path is emitted on its block's first line, whatever the number of its matches, and nothing below repeats it. No announcement below names a file that produced a block, so within a single root no path is ever written twice.

`<path>` is the path by which the file was reached: it begins with the root path currently being traversed — the /P occurrence whose subtree holds the file, not the first /P given — and continues with the entry names descended through to reach it. The root's own text is part of `<path>`, so a root of `src` yields `src/foo.cpp` rather than `foo.cpp`, and two roots holding files of the same name yield blocks that differ. A root of `.` is the one exception: it contributes no leading `./`. Every `<path>` is rendered with `/` separators on every platform.

Blocks are emitted as they occur — a block's path line is written the moment that file's first match is found, and each detail line as its own line is evaluated, before the next line is evaluated. Blocks therefore appear in the depth-first traversal order of §3.2, and detail lines within a block in line order; §6 records how far that order is reproducible. Nothing is buffered to the end of a file, a directory, or the run.

Besides blocks, TextFinder announces the files and directories that produced no block, through the same destination. An announcement is emitted as TextFinder deals with the entry it names, before moving on to the next one; none is held back until the directory holding it is finished, nor until the run is. Each announcement is a fixed form followed by a path rendered as above, and falls into one of two kinds.

**File announcements** report a file that was examined and yielded no match. They are emitted only when /h is `false`; under the default `true` such a file contributes nothing at all. A file that matched is never announced — its block already names it.

| Announcement      | Emitted when                                         |
|-------------------|------------------------------------------------------|
| `searched <path>` | a file was admitted by §3.3, read, searched, and matched nothing |
| `skipped <path>`  | a file was rejected by the NUL or UTF-8 test of §3.3  |

**Error announcements** report work TextFinder was asked to do and could not. They are emitted whatever /h says:

| Announcement         | Emitted when                                                                                              |
|----------------------|-----------------------------------------------------------------------------------------------------------|
| `too large <path>`   | a file exceeded the size limit of §3.3                                                                      |
| `cannot open <path>` | a file, directory, or root path could not be opened, is a symbolic link named as a root, is neither a regular file nor a directory, or carries a name the implementation cannot render as text |

A name that cannot be rendered as text is one the filesystem admits and the implementation's string type cannot carry: bytes that are not valid UTF-8 on POSIX, unpaired surrogate code units on Windows. Such a file is not searched. Its `cannot open` announcement names it with U+FFFD REPLACEMENT CHARACTER substituted for each unit that will not render, since an announcement that named nothing would leave the user with no way to find the file. Two costs follow, and this specification accepts both: the path reported is not the path on disk, and which names reach this case depends on the implementation's string type, so §6's match set agrees only over trees whose names every implementation can carry.

Rendering a name is not permitted to end the run. Where an implementation's conversion reports failure by throwing, or by any other means that would propagate out of the walk, it is contained where it arises: the entry draws the announcement above, and traversal continues with the next entry. One unrenderable name costs one file, never the remainder of the search, and a run that meets one still exits 0 — an error announcement does not change the exit code.

Every file TextFinder examines therefore contributes at most one of two things, never both: a block if it matched, a file announcement if it did not. Under the default /h `true` the output holds blocks and error announcements, and a file that matched nothing is silent. Under /h `false` every examined file appears exactly once. Under the default regex every file matches, so /h hides nothing there, and the no-content case of §3.3 reaches that state without opening a file — its block is the path line alone.

Every line of a block and every announcement is terminated by a single LF (U+000A) on every platform. An implementation must prevent its runtime from translating that terminator to CRLF, or the same tree would yield byte-different output on Windows and POSIX and the comparison of §6 would hold only within a platform.

That rule governs stdout alone. What terminator an implementation writes to stderr is whatever its runtime and platform produce, and this specification does not fix it. Comparing one implementation against another means comparing stdout: a run that writes to stderr has written a usage diagnostic and traversed nothing, so it has no search output to compare, and holding its stderr to the byte would test the platform rather than the implementation.

Usage diagnostics, whose shape §5.2 binds and whose wording each implementation owns, are written to stderr. The announcements above are routed through the output component, not to stderr, and nothing announced above affects the exit code.

The process returns one of three exit codes. The values are fixed here, not left to the implementation, so that two implementations can be compared by exit code as well as by output:

| Code | Returned when |
|------|---------------|
| 0 | The invocation succeeded. Whether matches were found, and whether any file or root path drew an error announcement, does not change this. /H returns 0 as well, per §5, as does the bare command line of §3.1. |
| 1 | The command line was invalid. TextFinder wrote the usage diagnostic §5.2 calls for, to stderr, and traversed nothing. An invalid /r writes the §5.3 listing to stdout ahead of that diagnostic, per §5.2; every other violation leaves stdout empty. |
| 2 | TextFinder could not start, for a reason that is not about what the user typed — a failure to initialize its output component, for instance. No usage diagnostic is written, and traversal does not begin. |

No other value is returned. Code 2 separates a failure of the program from a failure of the command line, so a test can tell the two apart; §5.2 binds the shape of a code-1 failure and requires it carry a usage line, where a code-2 failure carries none; the wording of both belongs to the implementation.

### 3.5 Skip-List Extension

The skip list of §3.2 is extended at build time, not at run time. Each implementation provides a function that adds a directory name to it:

    addSkipDirectory(name)

Every call is compiled into the program and takes effect before traversal begins; once traversal begins the list is fixed for the run. Calling addSkipDirectory extends the defaults defined in §3.2 rather than replacing them. Successive calls accumulate. Duplicate entries are ignored.

Each language-specific Spec_*.md fixes the exact function name, parameter type, and return type in the idiom of the target language, and says whether the function is exported from a library or confined to the component that owns the list. Nothing here requires it to be callable from outside the program.

A run-time mechanism — a configuration file read at startup, say — may be specified later. Until it is, a deployed build searches with the skip list compiled into it, and the user has no means of changing that.

## 4. Command-Line Syntax

Every switch is a single case-sensitive letter, introduced by either `/` or `-`. The two introducer forms are equivalent:

    /P        -P

Every switch takes exactly one argument, supplied as the next whitespace-separated token on the command line. There are no bare flags. Boolean switches accept the literal values `true` or `false`; boolean values are matched case-insensitively, so `TRUE`, `True`, and `true` are equivalent, as are `FALSE`, `False`, and `false`:

    /s true        -s False

Arguments containing whitespace or commas must be double-quoted. The calling shell removes the quotes before TextFinder sees its argv; TextFinder performs no quote processing of its own:

    /p "cpp, rs, h"        /r "int\s+main"        /P "src/foo bar"

Because switches are case-sensitive, `/h` and `/H` denote different commands.

A command line that violates these rules causes TextFinder to write the corresponding usage diagnostic from §5.2 to stderr and exit with a non-zero code, without traversing.

When a switch other than /P appears more than once on the command line, the last occurrence wins; earlier occurrences are silently discarded.

The form in which the program receives its arguments — the type of the argument vector, and the character encoding it carries — is a property of the language and its platform, not of this specification. Each language-specific Spec_*.md states the argument type its implementation takes and any encoding limit that follows from it; a limit stated there is a fact about that implementation rather than a departure from this document. Where two implementations differ in what an argument can hold, they differ in which command lines reach a search at all, and the consistency guarantee of §6 speaks only to the command lines both accept.

## 5. Defined Switches

| Switch | Argument (default)      | Meaning                                                                                                  |
|--------|-------------------------|----------------------------------------------------------------------------------------------------------|
| /P     | path (`.`)              | Root path for traversal. May be an absolute or a relative path. /P may be given more than once; each occurrence adds a root path, and the paths are traversed in the order given. |
| /p     | `"ext, ext, ..."` (`""`)| Comma-separated list of file extensions to search, quoted. The extension of a file is its last dot-suffix, a leading dot on the name notwithstanding: `.gitignore` has extension `gitignore`, so a dot-file is searched like any other and is excluded only by /p or by the skip list. Each item is trimmed of surrounding whitespace — space (U+0020), horizontal tab (U+0009), line feed (U+000A), vertical tab (U+000B), form feed (U+000C), and carriage return (U+000D), fixed here so that two implementations trim the same six characters — and loses one leading dot if present, so `cpp` and `.cpp` are equivalent; empty items are discarded, so `"cpp,,rs"` and `"cpp, rs"` name the same two extensions. Extensions compare case-sensitively on POSIX and case-insensitively on Windows, as skip-list entries do. When the resulting list is empty, every file is searched, including files with no extension. When it is non-empty, files with no extension are not searched. |
| /r     | regex (`"."`)           | Regular expression evaluated against each line. §6.1 names the engine that compiles it and fixes the syntax every engine accepts alike; the expression is compiled once per invocation. It must not be empty — the default `.` is the way to match every line. |
| /s     | `true` \| `false` (`true`)  | Recursive search. When `false`, the files directly within the root path are searched but no subdirectory is entered. |
| /h     | `true` \| `false` (`true`)  | Suppress the file announcements of §3.4, which report only files that matched nothing, leaving the blocks of matching files and the error announcements. When `false`, each file that was searched without matching or was skipped is announced, so that every examined file appears in the output exactly once. Announcements go through the implementation's output component, not to stderr. |
| /v     | `true` \| `false` (`false`) | When `true`, list the resolved option set at the top of output, in the form §5.3 fixes.             |
| /H     | `true` \| `false` (`false`) | When `true`, print help text to stdout, exit with code 0, and do not traverse.                      |
| /n     | `true` \| `false` (`false`) | When `true`, give a block one detail line per matching line, carrying the 1-based line number.      |
| /L     | `true` \| `false` (`false`) | When `true`, give a block one detail line per matching line, carrying that line's text.             |

Omitting a switch is equivalent to supplying its default value. Language-specific specifications may extend this table but must not redefine any switch listed here.

### 5.1 Help Text

Every implementation prints exactly this text under /H, and its first line alone as the usage line that terminates a usage diagnostic. `<executable>` is the implementation's executable name — `Cpp_TextFinder` for the C++ implementation.

```
usage: <executable> [/P path] [/p "ext, ext"] [/r regex] [/s bool] [/h bool] [/v bool] [/H bool] [/n bool] [/L bool]

  /P  path (.)             root path for traversal; repeat to add more root paths
  /p  "ext, ext" ()        comma-separated bare extensions to search; empty searches every file
  /r  regex (.)            regular expression evaluated against each line
  /s  true|false (true)    recurse into subdirectories
  /h  true|false (true)    hide files that matched nothing; errors always appear
  /v  true|false (false)   list the resolved option set before traversal
  /H  true|false (false)   print this help and exit
  /n  true|false (false)   add a detail line per match, carrying the line number
  /L  true|false (false)   add a detail line per match, carrying the line text

A matching file prints its path on one line; /n and /L add indented detail
lines beneath it. A path is never printed twice.

Switch introducers / and - are equivalent. Switch letters are case-sensitive,
so /h and /H differ. Every switch takes exactly one argument; there are no bare
flags. Arguments containing whitespace or commas must be quoted.

Run with no switches at all to list the resolved options and exit without
searching.
```

### 5.2 Usage Diagnostics

A usage diagnostic reports a command line TextFinder will not act on. Every implementation writes it to stderr as a reason line from the table below, a newline, then the usage line of §5.1, and exits with code 1 per §3.4. `<token>` is the offending token and `<switch>` the switch, each reproduced exactly as typed, preserving the introducer.

| Condition                                                    | Reason line                             |
|--------------------------------------------------------------|-----------------------------------------|
| Token in switch position has no `/` or `-` introducer        | `not a switch: <token>`                 |
| Introducer-led token that is not a switch defined in §5      | `unrecognized switch: <token>`          |
| Switch is the last token, with no argument token following   | `missing argument for switch: <switch>` |
| Boolean switch given a value other than `true` or `false`    | `invalid boolean for <switch>: <token>` |
| /P given an empty argument                                   | `empty root path for switch: <switch>`  |
| /r given an empty argument                                   | `empty expression for switch: <switch>` |
| /r given an expression the regex engine will not compile     | `invalid regex for switch: /r`          |

One diagnostic is preceded by output on stdout. A pattern the regex engine rejects is a pattern whose effect the user cannot see, so before writing `invalid regex for switch: /r` TextFinder writes the resolved option listing of §5.3 to stdout, whatever /v says — the listing's /r line carries the offending expression verbatim, which is the point of emitting it. Under /v `true` the listing has already been written and is not repeated. Every other row of the table leaves stdout empty.

These reason lines are the wording this document supplies, and an implementation that adopts them unchanged is the expected case. They are not binding text: §2 leaves what reaches stderr to each language, so a component specification may fix different wording where its idiom calls for it, and it then owns that wording. What this section does bind is the shape every implementation shares — a reason line, a newline, the usage line of §5.1 — together with the destination, the exit code, and the stdout behavior of the invalid-regex row above. Two implementations therefore agree on which command lines they refuse and on what each refusal leaves on stdout, and may differ in how they say so.

Failures that are not about what the user typed — a search that cannot initialize its output component, for instance — are not usage diagnostics at all. They carry no usage line, their text is specified per implementation, and their exit code is not, being the 2 that §3.4 fixes.

### 5.3 Resolved Option Listing

Every implementation writes the resolved option set before traversal begins, in three cases:

- under /v `true`, where it precedes the output it explains and traversal follows;
- on the bare command line of §3.1, where no output follows and the process exits 0;
- ahead of the invalid-regex diagnostic of §5.2, where no output follows and the process exits 1.

The form is fixed here, since an implementation free to choose it would make the listing of two implementations uncomparable.

The listing goes to stdout, one key/value pair per line, in the order the §5 table gives, each line formatted `<switch> <value>` with a single separating space and terminated by the single LF §3.4 fixes. Values render as follows:

- /P emits one line per root path, in traversal order.
- /p emits the normalized extension list — the bare extensions of §5, in the order they survived normalization — joined by `, `. An empty list emits `/p` alone, with no separating space and no trailing space, so that no line of the listing ends in whitespace.
- /r emits the expression text verbatim, as typed.
- Every boolean switch emits `true` or `false` in lower case.

A command line of `-v true` alone therefore produces these nine lines. No line ends in whitespace, so a fixture holding this text survives an editor that strips it:

```
/P .
/p
/r .
/s true
/h true
/v true
/H false
/n false
/L false
```

The /v line reads `true` only in the listing /v itself asked for. The other two cases list an option set in which /v was never set, and the line reads `false` there — a bare command line therefore emits the nine lines above with `/v false` in place of `/v true`.

## 6. Non-Functional Requirements

- Portability: each implementation must run on Windows and on POSIX systems (Linux, macOS).
- Dependencies: implementations use only the standard library and, where necessary, packages from the language's supported package ecosystem for regex and filesystem access. No third-party TextFinder library is used.
- Consistency: for the same inputs, every implementation produces the same match set, emitted in depth-first traversal order and, within a file, in line order. §6.1 scopes that guarantee to the patterns the four regex engines accept alike, and states what a pattern outside them costs. Because §3.2 leaves a directory's entries in filesystem order, the total emission order is reproducible only across runs over the same tree on the same platform and filesystem. There every implementation agrees, because §3.2 requires each to enumerate through its platform's own facility and forbids it to reorder what that facility yields, and runs can be compared line-for-line. Elsewhere the match set still agrees but the order of matches from different directory entries may not. §4 scopes it further to the command lines every implementation's argument vector can carry. Three further things are fixed rather than left to the implementation, so that a comparison can rest on them: the two-level block form and its indent (§3.4), the exit code (§3.4), and the form of the option listing (§5.3). The guarantee is over stdout. Two implementations given the same command line write the same bytes there and return the same exit code; what they write to stderr is each one's own, per §2 and §5.2, so a test that compares two implementations compares stdout and the exit code and leaves stderr to whichever implementation it belongs to.

### 6.1 Regular-Expression Portability

No regex engine in common use spans these four languages, and no third-party engine gives one syntax across all four without violating the dependency rule above. Each implementation therefore uses the engine its own language uses, and that engine is named here rather than left to the implementation:

| Language | Engine |
|----------|--------|
| C++      | `std::regex` constructed with `std::regex::ECMAScript` |
| Rust     | the `regex` crate |
| C#       | `System.Text.RegularExpressions.Regex` |
| Python   | the `re` module of the standard library |

A language-specific `Spec_*.md` names the engine assigned to it and no other. Substituting a different engine is a change to this table, not a local decision.

**What the four engines agree on.** TextFinder asks one question of a line: does the pattern occur anywhere in it (§3.3). Under /L it reports the whole line, never a match position, a matched substring, or a capture group. Greediness, alternation preference, and capture-group numbering are therefore unobservable, and the four engines differ on nothing TextFinder observes so long as the pattern is one they all accept. That portable subset is:

- literal characters, and `\` before any of `. \ * + ? ( ) [ ] { } | ^ $ /`
- `.`
- the quantifiers `*`, `+`, `?`, `{n}`, `{n,}`, and `{n,m}`, each also in its lazy form
- alternation `|`, grouping `(...)`, and non-capturing grouping `(?:...)`
- character classes `[...]` and `[^...]`, ranges included
- the anchors `^` and `$`
- the class escapes `\d`, `\D`, `\w`, `\W`, `\s`, `\S`, `\b`, `\B`
- the character escapes `\n`, `\r`, `\t`, `\f`, `\v`, and `\xHH`

Two of those rest on rules stated elsewhere. `.`, `^`, and `$` agree because §3.3 splits lines before matching and a line holds no terminator, so the engines' differing treatment of a terminator inside the subject never arises. The rest agree on ASCII lines: `std::regex` over `char` matches one byte where the other three engines match one Unicode scalar value, and `\d`, `\w`, `\s`, and `\b` are Unicode-aware in those three and ASCII-only in `std::regex`. On a line holding a non-ASCII character, a pattern using `.`, a character class, or a class escape can match in three implementations and not the fourth.

**What falls outside, and what it costs.** Backreferences, lookahead, lookbehind, named groups, inline flag groups such as `(?i)`, atomic and possessive quantifiers, Unicode property escapes such as `\p{L}`, POSIX class names such as `[[:alpha:]]`, and the anchors `\A`, `\z`, and `\Z` are outside the subset. Each is accepted by some of the four engines and rejected by others, and two that accept the same construct do not always spell it the same way.

TextFinder accepts a pattern outside the subset. It does not inspect a pattern for portability, and §5.2 defines no diagnostic for one. Two costs follow, and this specification accepts both:

1. An engine that rejects the pattern reports the diagnostic §5.2 calls for and exits non-zero, while an engine that accepts it searches the tree and exits 0. The two runs then differ in exit code, in stderr, and in every record. This is the larger cost of the two, and it is not a difference in output so much as a difference in whether there is output.
2. Two engines that both accept the pattern may still disagree on which lines it matches.

The match-set guarantee of §6 holds for a pattern in the subset over ASCII lines. Outside that, each implementation's output is the output of the engine named above for it, and a difference between two implementations is evidence about those engines rather than a defect in either. A test that compares implementations states the pattern it uses and stays inside the subset, or it is testing the engines.

### 6.2 Verification

Each implementation provides two kinds of automated test and one demonstration, so that a claim about its behavior can be checked rather than read.

- **Unit suites**, one per library component, each living beside the code it tests and exercising that component's own specification.
- **One integration suite**, driving the built executable end to end. It covers the entry binary, whose behavior is its startup sequence, its exit codes, and its stream routing, none of which a unit suite reaches.
- **One demonstration**, running the built executable against this project's own tree and capturing what it produces. It is a record of observed behavior rather than a test: it asserts nothing and fails nothing.

Each implementation also provides a runner per kind. A runner announces each suite it starts and the exit status that suite returned, and exits with the number of suites that failed. A suite that was never built counts as a failure rather than passing by absence, so a green run cannot mean that nothing ran.

The dependency rule of §6 applies, so a suite uses the standard library and the packages that rule already permits; no third-party test framework is introduced. Assertion wording and assertion counts belong to each implementation. What the suites must agree on across implementations is the observable behavior §3 through §5 already fix.

A demonstration's output moves as this project's own tree changes. A capture therefore states the date it was taken, and a stale capture is replaced by a fresh one rather than edited, since the same counts appear both in the captured text and in whatever prose surrounds it.

## 7. Non-Goals

- TextFinder does not modify files.
- TextFinder does not follow symbolic links (§3.2) and does not search binary files (§3.3).
