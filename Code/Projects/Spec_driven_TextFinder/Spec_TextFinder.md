# Spec_TextFinder — TextFinder Specification

## 1. Purpose

TextFinder is a command-line utility that traverses a directory tree — recursively by default — examining file contents for matches to a user-supplied regular expression. Every match is written to stdout.

## 2. Scope

This document specifies behavior common to all TextFinder implementations. Implementations live in sibling folders under Spec_driven_TextFinder:

- [Cpp_TextFinder/](Cpp_TextFinder/) — C++ implementation (initial focus)
- [Rust_TextFinder/](Rust_TextFinder/) — Rust implementation (planned)
- [CSharp_TextFinder/](CSharp_TextFinder/) — C# implementation (planned)
- [Python_TextFinder/](Python_TextFinder/) — Python implementation (planned)

Each language folder contains a Spec_*.md that refines this specification with language-specific detail, and a Structure_*.md that describes internal design.

Higher-level principles that constrain every implementation are recorded in [Constitution_TextFinder.md](Constitution_TextFinder.md) in this folder.

No code, design, or example outside Spec_driven_TextFinder is used as a reference. This project is entirely specification driven.

## 3. Functional Requirements

### 3.1 Input

TextFinder accepts, from its command line, a sequence of switch/value pairs defined in §5. Every switch has a default value; a command line with no switches runs TextFinder against the current directory using the default regular expression and default settings.

### 3.2 Traversal

Starting at the root path, TextFinder visits every subdirectory and every file that passes the active filters. Recursion is controlled by /s (see §5) and is enabled by default; when /s is set to `false`, only the root path itself is searched. Symbolic links are not followed. When the root path resolves to a regular file rather than a directory, TextFinder searches that single file. When /P is supplied more than once, each supplied path is treated as its own root path and is traversed in the order given.

TextFinder maintains a skip list of directory names that are never entered during traversal. When a directory whose name appears in the skip list is encountered, its entire subtree is pruned. The default skip list holds directories that typically contain version-control metadata or intermediate build output:

    archive, .git, .svn, .hg, build, out, target, bin, obj, __pycache__, node_modules

The skip list can be extended programmatically, using the public function described in §3.5. No command-line switch for skip-list extension is defined in this specification.

A skip-list entry is compared against the directory's basename — the final component of its path — and matches when the two strings are equal. Matching is case-sensitive on POSIX systems and case-insensitive on Windows, following the filesystem conventions of each platform. The skip list applies to directory names only; file-name filtering by extension is controlled by /p (see §5).

### 3.3 Matching

For each candidate file, TextFinder reads the content as UTF-8 text and evaluates the regular expression against each line.

A line is a maximal run of characters bounded by a line terminator. The recognized terminators are LF (U+000A), CRLF (U+000D U+000A), and bare CR (U+000D); this covers Windows, Linux, and macOS conventions. If the final line of a file lacks a terminator, it is nevertheless treated as a line.

The regular expression uses ECMAScript syntax. Each implementation compiles the expression exactly once per invocation and reuses the compiled engine for every line evaluated.

A match consists of:

- the file path,
- a 1-based line number,
- the text of the matching line.

### 3.4 Output

Matches are written to stdout, one match per line, with fields joined by the three-character separator ` - ` (space, hyphen, space). The default full form is:

    <path> - <lineNumber> - <matchedLine>

The `<lineNumber>` field is emitted only when /n is `true` (the default); when `false`, `<lineNumber>` and its trailing separator are omitted. The `<matchedLine>` field is emitted only when /L is `true` (the default); when `false`, `<matchedLine>` and its leading separator are omitted. When both /n and /L are `false`, only `<path>` is emitted, once per match encountered.

Matches are emitted as they occur — each match is written to stdout as soon as its line is evaluated, before the next line is read. This defines emission order across all implementations: matches appear in directory-traversal order, and within a file in line order.

Diagnostics — usage errors, unreadable files, unrecognized switches — are written to stderr. The process exit code is 0 when invocation succeeded (whether or not matches were found) and non-zero when the command line was invalid or the root path could not be opened. When /H is `true`, TextFinder prints its help text to stdout, exits with code 0, and does not traverse.

### 3.5 Public Interface

Each implementation exposes its search functionality through a small public interface. That interface includes a function that adds a directory name to the skip list:

    addSkipDirectory(name)

Calling addSkipDirectory extends the current skip list; it does not replace the defaults defined in §3.2. Successive calls accumulate. Duplicate entries are ignored. Each language-specific Spec_*.md fixes the exact function name, parameter type, and return type in the idiom of the target language.

## 4. Command-Line Syntax

Every switch is a single case-sensitive letter, introduced by either `/` or `-`. The two introducer forms are equivalent:

    /P        -P

Every switch takes exactly one argument, supplied as the next whitespace-separated token on the command line. There are no bare flags. Boolean switches accept the literal values `true` or `false`; boolean values are matched case-insensitively, so `TRUE`, `True`, and `true` are equivalent, as are `FALSE`, `False`, and `false`:

    /s true        -s False

Arguments that contain whitespace or commas — extension lists, regular expressions, and paths with embedded spaces — must be enclosed in double quotes. Single quotes are not recognized as quoting characters by TextFinder; quoting rules of the calling shell apply as usual before TextFinder sees its argv:

    /p "cpp, rs, h"        /r "int\s+main"        /P "src/foo bar"

Because switches are case-sensitive, `/h` and `/H` denote different commands. Every switch has a default; omitting a switch uses its default value as listed in §5.

An unrecognized switch, a boolean switch supplied with a value other than `true` or `false`, and any switch that appears at the end of the command line with no following argument token, each cause TextFinder to write a usage diagnostic to stderr and exit with a non-zero code.

When a switch other than /P appears more than once on the command line, the last occurrence wins; earlier occurrences are silently discarded. (/P accumulates root paths as described in §5.)

## 5. Defined Switches

| Switch | Argument (default)      | Meaning                                                                                                  |
|--------|-------------------------|----------------------------------------------------------------------------------------------------------|
| /P     | path (`.`)              | Root path for traversal. May be an absolute or a relative path. /P may be given more than once; each occurrence adds a root path, and the paths are traversed in the order given. |
| /p     | `"ext, ext, ..."` (`""`)| Comma-separated list of file extensions to search, quoted. Extensions are bare (no leading dot); the extension of a file is its last dot-suffix. Whitespace around commas is allowed. When the list is empty, every file is searched, including files with no extension. When the list is non-empty, files with no extension are not searched. |
| /r     | regex (`"."`)           | Regular expression evaluated against each line. Syntax is ECMAScript; the expression is compiled once per invocation. |
| /s     | `true` \| `false` (`true`)  | Recursive search. When `false`, only the root path itself is searched.                              |
| /h     | `true` \| `false` (`true`)  | Suppress announcement of files that contain no match. When `false`, every file searched is named on stderr. |
| /v     | `true` \| `false` (`false`) | When `true`, list the resolved option set at the top of output, one key/value pair per line.        |
| /H     | `true` \| `false` (`false`) | When `true`, print help text to stdout, exit with code 0, and do not traverse.                      |
| /n     | `true` \| `false` (`true`)  | When `true`, include the 1-based line-number field in each match line.                              |
| /L     | `true` \| `false` (`true`)  | When `true`, include the matched-line-text field in each match line.                                |

Omitting a switch is equivalent to supplying its default value. Language-specific specifications may extend this table but must not redefine any switch listed here.

## 6. Non-Functional Requirements

- Portability: each implementation must run on Windows and on POSIX systems (Linux, macOS).
- Dependencies: implementations use only the standard library and, where necessary, packages from the language's supported package ecosystem for regex and filesystem access. No third-party TextFinder library is used.
- Consistency: every implementation uses the ECMAScript regular-expression syntax fixed in §3.3. For the same inputs, every implementation must produce the same match set and emit matches in the same order — directory-traversal order as specified in §3.4 — so that runs from any implementation can be compared line-for-line.

## 7. Non-Goals

- TextFinder does not modify files.
- TextFinder does not follow symbolic links.
- TextFinder does not search binary files. Files whose contents cannot be decoded as UTF-8 are skipped; when /h is `false`, each skipped file is named on stderr along with the files that were searched.

## 8. Development Order

1. C++ implementation, driven by Cpp_TextFinder/Spec_Cpp_TextFinder.md and Cpp_TextFinder/Structure_Cpp_TextFinder.md.
2. Rust, C#, and Python implementations follow, each derived from this specification together with its own language-level spec and structure documents.
