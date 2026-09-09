# Spec_TextFinder — TextFinder Specification

## 1. Purpose

TextFinder is a command-line utility that traverses a directory tree — recursively by default — examining file contents for matches to a user-supplied regular expression. Every match is written to stdout.

## 2. Scope

This document specifies behavior common to all TextFinder implementations. Implementations live in sibling folders under Spec_driven_TextFinder:

- [Cpp_Spec_driven_TextFinder/](Cpp_Spec_driven_TextFinder/) — C++ implementation (initial focus)
- `Rust_Spec_driven_TextFinder/` — Rust implementation (planned)
- `CSharp_Spec_driven_TextFinder/` — C# implementation (planned)
- `Python_Spec_driven_TextFinder/` — Python implementation (planned)

Each language folder contains a `<Lang>_TextFinder_Structure.md` describing internal design, and one subfolder per component holding that component's `Spec_*.md`.

Higher-level principles that constrain every implementation are recorded in [Constitution.md](Constitution.md) in this folder.

No code, design, or example outside Spec_driven_TextFinder is used as a reference. This project is entirely specification driven.

## 3. Functional Requirements

### 3.1 Input

TextFinder accepts, from its command line, a sequence of switch/value pairs defined in §5. Every switch has a default value; a command line with no switches runs TextFinder against the current directory using the default regular expression and default settings.

### 3.2 Traversal

Starting at the root path, TextFinder visits every subdirectory and every file that passes the active filters. Recursion is controlled by /s (see §5) and is enabled by default; when /s is set to `false`, only the root path itself is searched. Symbolic links are not followed. When the root path resolves to a regular file rather than a directory, TextFinder searches that single file.

TextFinder maintains a skip list of directory names that are never entered during traversal. When a directory whose name appears in the skip list is encountered, its entire subtree is pruned. The default skip list holds directories that typically contain version-control metadata or intermediate build output:

    archive, .git, .svn, .hg, build, out, target, bin, obj, __pycache__, node_modules

The skip list can be extended programmatically, using the public function described in §3.5. No command-line switch for skip-list extension is defined in this specification.

A skip-list entry is compared against the directory's basename — the final component of its path — and matches when the two strings are equal. Matching is case-sensitive on POSIX systems and case-insensitive on Windows, following the filesystem conventions of each platform. The skip list applies to directory names only; file-name filtering by extension is controlled by /p (see §5).

### 3.3 Matching

For each candidate file, TextFinder reads the content as UTF-8 text and evaluates the regular expression against each line.

A line is a maximal run of characters bounded by a line terminator. The recognized terminators are LF (U+000A), CRLF (U+000D U+000A), and bare CR (U+000D); this covers Windows, Linux, and macOS conventions. If the final line of a file lacks a terminator, it is nevertheless treated as a line.

The regular expression uses ECMAScript syntax. Each implementation compiles the expression exactly once per invocation and reuses the compiled engine for every line evaluated.

The expression signifies a match by finding at least one occurrence anywhere within the line.

### 3.4 Output

Matches are written to stdout, one match per line, with fields joined by the three-character separator ` - ` (space, hyphen, space). The default full form is:

    <path> - <lineNumber> - <matchedLine>

The `<lineNumber>` field is emitted only when /n is `true` (the default); when `false`, `<lineNumber>` and its trailing separator are omitted. The `<matchedLine>` field is emitted only when /L is `true` (the default); when `false`, `<matchedLine>` and its leading separator are omitted. When both /n and /L are `false`, only `<path>` is emitted, once per match encountered.

Matches are emitted as they occur — each match is written to stdout as soon as its line is evaluated, before the next line is read. This defines emission order across all implementations: matches appear in directory-traversal order, and within a file in line order.

Usage diagnostics, whose exact text §5.2 fixes, are written to stderr. File-level announcements, including unreadable and skipped files, are routed through the output component per /h in §5, not to stderr. The process exit code is 0 when invocation succeeded (whether or not matches were found) and non-zero when the command line was invalid; a root path that cannot be opened is announced through the output component and does not affect the exit code. When /H is `true`, TextFinder prints the help text of §5.1 to stdout, exits with code 0, and does not traverse.

### 3.5 Public Interface

Each implementation exposes its search functionality through a small public interface. That interface includes a function that adds a directory name to the skip list:

    addSkipDirectory(name)

Calling addSkipDirectory extends the current skip list; it does not replace the defaults defined in §3.2. Successive calls accumulate. Duplicate entries are ignored. Each language-specific Spec_*.md fixes the exact function name, parameter type, and return type in the idiom of the target language.

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

## 5. Defined Switches

| Switch | Argument (default)      | Meaning                                                                                                  |
|--------|-------------------------|----------------------------------------------------------------------------------------------------------|
| /P     | path (`.`)              | Root path for traversal. May be an absolute or a relative path. /P may be given more than once; each occurrence adds a root path, and the paths are traversed in the order given. |
| /p     | `"ext, ext, ..."` (`""`)| Comma-separated list of file extensions to search, quoted. The extension of a file is its last dot-suffix. Each item is trimmed of surrounding whitespace and loses one leading dot if present, so `cpp` and `.cpp` are equivalent; empty items are discarded, so `"cpp,,rs"` and `"cpp, rs"` name the same two extensions. When the resulting list is empty, every file is searched, including files with no extension. When it is non-empty, files with no extension are not searched. |
| /r     | regex (`"."`)           | Regular expression evaluated against each line. Syntax is ECMAScript; the expression is compiled once per invocation. |
| /s     | `true` \| `false` (`true`)  | Recursive search. When `false`, only the root path itself is searched.                              |
| /h     | `true` \| `false` (`true`)  | Suppress announcement of files that contain no match. When `false`, every file searched is announced through the implementation's output component, not on stderr. |
| /v     | `true` \| `false` (`false`) | When `true`, list the resolved option set at the top of output, one key/value pair per line.        |
| /H     | `true` \| `false` (`false`) | When `true`, print help text to stdout, exit with code 0, and do not traverse.                      |
| /n     | `true` \| `false` (`true`)  | When `true`, include the 1-based line-number field in each match line.                              |
| /L     | `true` \| `false` (`true`)  | When `true`, include the matched-line-text field in each match line.                                |

Omitting a switch is equivalent to supplying its default value. Language-specific specifications may extend this table but must not redefine any switch listed here.

### 5.1 Help Text

Every implementation prints exactly this text under /H, and its first line alone as the usage line that terminates a usage diagnostic. `<executable>` is the implementation's executable name — `Cpp_TextFinder` for the C++ implementation.

```
usage: <executable> [/P path] [/p "ext, ext"] [/r regex] [/s bool] [/h bool] [/v bool] [/H bool] [/n bool] [/L bool]

  /P  path (.)             root path for traversal; repeat to add more root paths
  /p  "ext, ext" ()        comma-separated bare extensions to search; empty searches every file
  /r  regex (.)            ECMAScript regular expression evaluated against each line
  /s  true|false (true)    recurse into subdirectories
  /h  true|false (true)    suppress announcement of files that contain no match
  /v  true|false (false)   list the resolved option set before traversal
  /H  true|false (false)   print this help and exit
  /n  true|false (true)    include the line-number field in each match line
  /L  true|false (true)    include the matched-line field in each match line

Switch introducers / and - are equivalent. Switch letters are case-sensitive,
so /h and /H differ. Every switch takes exactly one argument; there are no bare
flags. Arguments containing whitespace or commas must be quoted.
```

### 5.2 Usage Diagnostics

A usage diagnostic reports a command line TextFinder will not act on. Every implementation writes it to stderr as a reason line from the table below, a newline, then the usage line of §5.1, and exits with a non-zero code. `<token>` is the offending token and `<switch>` the switch, each reproduced exactly as typed, preserving the introducer.

| Condition                                                    | Reason line                             |
|--------------------------------------------------------------|-----------------------------------------|
| Token in switch position has no `/` or `-` introducer        | `not a switch: <token>`                 |
| Introducer-led token that is not a switch defined in §5      | `unrecognized switch: <token>`          |
| Switch is the last token, with no argument token following   | `missing argument for switch: <switch>` |
| Boolean switch given a value other than `true` or `false`    | `invalid boolean for <switch>: <token>` |
| /P given an empty argument                                   | `empty root path for switch: <switch>`  |
| /r given an expression the regex engine will not compile     | `invalid regex for switch: /r`          |

These reason lines are fixed text, identical across implementations, so that a rejected command line produces the same stderr output from any of them. Failures that are not about what the user typed — a search that cannot initialize its output component, for instance — are not usage diagnostics and are specified per implementation.

## 6. Non-Functional Requirements

- Portability: each implementation must run on Windows and on POSIX systems (Linux, macOS).
- Dependencies: implementations use only the standard library and, where necessary, packages from the language's supported package ecosystem for regex and filesystem access. No third-party TextFinder library is used.
- Consistency: every implementation uses the ECMAScript regular-expression syntax fixed in §3.3. For the same inputs, every implementation must produce the same match set and emit matches in the same order — directory-traversal order as specified in §3.4 — so that runs from any implementation can be compared line-for-line.

## 7. Non-Goals

- TextFinder does not modify files.
- TextFinder does not follow symbolic links.
- TextFinder does not search binary files. Files whose contents cannot be decoded as UTF-8 are skipped; when /h is `false`, each skipped file is announced through the output component along with the files that were searched.

## 8. Development Order

1. C++ implementation, driven by [Cpp_TextFinder_Structure.md](Cpp_Spec_driven_TextFinder/Cpp_TextFinder_Structure.md) and the per-component `Spec_Cpp_TextFinder_*.md` files beneath it.
2. Rust, C#, and Python implementations follow, each derived from this specification together with its own language-level spec and structure documents.
