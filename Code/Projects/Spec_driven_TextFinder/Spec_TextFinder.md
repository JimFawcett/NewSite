# Spec_TextFinder — TextFinder Specification

## 1. Purpose

TextFinder is a command-line utility that recursively traverses a directory tree, examining file contents for matches to a user-supplied regular expression. Every match is written to stdout.

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

Starting at the root path, TextFinder visits every subdirectory and every file that passes the active filters. Recursion is controlled by /s (see §5) and is enabled by default; when /s is set to `false`, only the starting path is searched. Symbolic links are not followed.

TextFinder maintains a skip list of directory names that are never entered during traversal. When a directory whose name appears in the skip list is encountered, its entire subtree is pruned. The default skip list holds directories that typically contain version-control metadata or intermediate build output:

    archive, .git, .svn, .hg, build, out, target, bin, obj, __pycache__, node_modules

The skip list can be extended programmatically, using the public function described in §3.5. No command-line switch for skip-list extension is defined in this specification.

A skip-list entry matches a directory whose name is exactly equal to the entry. Matching is case-sensitive on POSIX systems and case-insensitive on Windows, following the filesystem conventions of each platform. The skip list applies to directory names only; file-name filtering by extension is controlled by /p (see §5).

### 3.3 Matching

For each candidate file, TextFinder reads the content as text and evaluates the regular expression against each line. A match consists of:

- the file path,
- a 1-based line number,
- the text of the matching line.

### 3.4 Output

Matches are written to stdout, one match per line, in the form:

    <path>:<lineNumber>:<matchedLine>

Diagnostics — usage errors, unreadable files, unrecognized switches — are written to stderr. The process exit code is 0 when invocation succeeded (whether or not matches were found) and non-zero when the command line was invalid or the root path could not be opened.

### 3.5 Public Interface

Each implementation exposes its search functionality through a small public interface. That interface includes a function that adds a directory name to the skip list:

    addSkipDirectory(name)

Calling addSkipDirectory extends the current skip list; it does not replace the defaults defined in §3.2. Successive calls accumulate. Duplicate entries are ignored. Each language-specific Spec_*.md fixes the exact function name, parameter type, and return type in the idiom of the target language.

## 4. Command-Line Syntax

Every switch is a single case-sensitive letter, introduced by either `/` or `-`. The two introducer forms are equivalent:

    /P        -P

Every switch takes exactly one argument, supplied as the next whitespace-separated token on the command line. There are no bare flags. Boolean switches accept the literal values `true` or `false`:

    /s true        -s false

Arguments that contain whitespace or commas — extension lists and regular expressions — must be quoted:

    /p "cpp, rs, h"        /r "int\s+main"

Because switches are case-sensitive, `/h` and `/H` denote different commands. Every switch has a default; omitting a switch uses its default value as listed in §5.

## 5. Defined Switches

| Switch | Argument (default)      | Meaning                                                                                                  |
|--------|-------------------------|----------------------------------------------------------------------------------------------------------|
| /P     | path (`.`)              | Starting path for traversal.                                                                             |
| /p     | `"ext, ext, ..."` (`""`)| Comma-separated list of file extensions to search, quoted. Extensions are bare (no leading dot). Whitespace around commas is allowed. Empty list matches every file. |
| /r     | regex (`"."`)           | Regular expression evaluated against each line.                                                          |
| /s     | `true` \| `false` (`true`)  | Recursive search. When `false`, only the starting path is searched.                                  |
| /h     | `true` \| `false` (`true`)  | Suppress announcement of files that contain no match. When `false`, every file searched is named on stderr. |
| /v     | `true` \| `false` (`false`) | When `true`, list the resolved option set at the top of output.                                      |
| /H     | `true` \| `false` (`false`) | When `true`, print help text and exit; all other switches are ignored.                               |
| /n     | `true` \| `false` (`true`)  | When `true`, prefix each match line with its 1-based line number.                                    |

Omitting a switch is equivalent to supplying its default value. Language-specific specifications may extend this table but must not redefine any switch listed here.

## 6. Non-Functional Requirements

- Portability: each implementation must run on Windows and on POSIX systems (Linux, macOS).
- Dependencies: implementations use only the standard library and, where necessary, packages from the language's supported package ecosystem for regex and filesystem access. No third-party TextFinder library is used.
- Consistency: for the same inputs, every implementation must produce the same match set, subject only to unavoidable differences among the regular-expression dialects supported by each language's standard library. Any such differences are documented in the corresponding language-level Spec_*.md.

## 7. Non-Goals

- TextFinder does not modify files.
- TextFinder does not follow symbolic links.
- TextFinder does not search binary files. Files that fail a text-decoding check are skipped; when /h is `false`, each skipped file is named on stderr along with the files that were searched.

## 8. Development Order

1. C++ implementation, driven by Cpp_TextFinder/Spec_Cpp_TextFinder.md and Cpp_TextFinder/Structure_Cpp_TextFinder.md.
2. Rust, C#, and Python implementations follow, each derived from this specification together with its own language-level spec and structure documents.
