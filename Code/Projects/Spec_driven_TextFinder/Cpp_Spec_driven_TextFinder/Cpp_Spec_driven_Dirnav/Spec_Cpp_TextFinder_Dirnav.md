# Spec_Cpp_TextFinder_Dirnav — Directory Navigation Library Specification

Specification for the `Cpp_TextFinder_Dirnav` library of the C++ TextFinder implementation. This document is the C++ binding of [Spec_TextFinder.md](../../Spec_TextFinder.md) §3.2–§3.4, which remain the authority for traversal, matching, and output behavior; it inherits structural decisions from [Cpp_TextFinder_Structure.md](../Cpp_TextFinder_Structure.md). Its consumer is [Spec_Cpp_TextFinder_Entry.md](../Cpp_Spec_driven_TextFinder_Entry/Spec_Cpp_TextFinder_Entry.md); it takes its commands from [Spec_Cpp_TextFinder_Cmdline.md](../Cpp_Spec_driven_Cmdline/Spec_Cpp_TextFinder_Cmdline.md).

## 1. Purpose

`Cpp_TextFinder_Dirnav` walks a directory tree, reads each selected file, evaluates the regular expression against each line, formats every match into a record, and emits it. It is the only component that touches file contents, and it writes to no stream.

## 2. Scope

This spec covers only the library. Command-line parsing is specified in Spec_Cpp_TextFinder_Cmdline.md, skip-list ownership and process-level concerns in Spec_Cpp_TextFinder_Entry.md, and the destination of emitted strings in Spec_Cpp_TextFinder_Output.md.

## 3. Responsibilities

The library:

- Is implemented as a C++ module targeting C++23, using modern idiomatic C++ constructs.
- Defines the abstract base class `Output` and binds to a concrete implementation of it through a template parameter.
- Compiles the `/r` expression once at construction and reuses it for every line of every file across every root path.
- Implements the traversal, file-admission, matching, and announcement behavior of Spec_TextFinder.md §3.2–§3.4, emitting every record and announcement through `Output`.

## 4. Public Interface

The module interface unit `Cpp_TextFinder_Dirnav.ixx` declares module `Cpp_TextFinder_Dirnav` and exports the following at global scope, matching the unqualified type usage in Spec_Cpp_TextFinder_Entry.md:

```cpp
export module Cpp_TextFinder_Dirnav;

import std;
import Cpp_TextFinder_Cmdline;

export class Output {
public:
    virtual ~Output() = default;
    virtual void output(const std::string& text) = 0;
};

export using SkipList = std::vector<std::string>;

export template <typename Out>
    requires std::derived_from<Out, Output>
class Cpp_TextFinder_Dirnav {
public:
    Cpp_TextFinder_Dirnav(Out& out, const SkipList& skips, const ProgramCommands& commands);
    void search(const std::filesystem::path& root);
};
```

Member definitions live in the interface unit, since `Cpp_TextFinder_Dirnav` is a template.

The constructor compiles `commands.regexText` as an ECMAScript expression and lets `std::regex_error` propagate when it will not compile; `Cpp_TextFinder_Entry` catches it and reports the malformed-regex usage diagnostic of Spec_TextFinder.md §5.2. `Cpp_TextFinder_Cmdline` guarantees the text is non-empty, so the constructor never sees an empty expression. All three constructor arguments are retained by reference and are owned by `Cpp_TextFinder_Entry`, which keeps them alive for the lifetime of the `Cpp_TextFinder_Dirnav` instance; the skip list and the commands are consulted but never modified.

`search` traverses one root path and returns nothing: every failure it meets is announced through `Output` per §5, so the caller has nothing to report on its behalf. A single instance is reused across every root path, so the compiled expression is built once per run, and `search` carries no state from one call to the next.

## 5. Traversal Rules

1. **Root paths.** A root path that resolves to a regular file is searched as that single file; one that resolves to a directory is traversed. A root that is a symbolic link, is neither a regular file nor a directory, or cannot be opened, is announced per Spec_TextFinder.md §3.4 and traversal of it stops there.
2. **Order and descent.** Traversal follows the depth-first visit order of Spec_TextFinder.md §3.2. The recursion is written explicitly: one function iterates a directory and calls itself on each subdirectory it decides to enter, so that entries are handled as `std::filesystem::directory_iterator` yields them, without being collected or reordered. `std::filesystem::recursive_directory_iterator` is not used — the library controls its own descent. `directory_iterator` enumerates a single level only; its order is unspecified by the standard and is in practice whatever `readdir` or `FindFirstFileW` returns, which is the filesystem order §3.2 adopts.
3. **Recursion.** Subdirectories are descended only when `/s` is `true`. When `/s` is `false`, only the entries of the root path itself are considered.
4. **Skip list.** A directory matching a skip-list entry per Spec_TextFinder.md §3.2 is pruned silently — a pruned directory is not a failure and is not announced. The list is consulted for every directory, root paths included, and applies to directory names only, so a root path that is a regular file is searched whatever its name.
5. **Symbolic links.** A directory entry that is a symbolic link is passed over silently, whatever its target, since no attempt is made to open it.
6. **Failed opens.** Any file or directory that cannot be opened draws the error announcement `cannot open <path>`; a directory so announced is pruned, a file so announced is not searched. Error announcements are not gated on `/h`, per Spec_TextFinder.md §3.4.

## 6. File Selection

Selection follows the `/p` rules of Spec_TextFinder.md §5, which fix the extension definition, the empty-list and no-extension cases, and the platform-dependent comparison. The list arrives from `Cpp_TextFinder_Cmdline` already normalized to bare extensions.

`std::filesystem::path::extension()` does not implement those rules: it returns an empty string for `.gitignore`, whereas §5 gives that file the extension `gitignore`. The extension is therefore taken as the text after the last `.` in `path::filename().u8string()`, with no special case for a leading dot, and a name holding no `.` at all has no extension.

Selection applies uniformly: a root path that is a regular file is filtered by `/p` like any other file.

## 7. Content Decoding and Line Splitting

A selected file is put to the three admission tests of Spec_TextFinder.md §3.3. The size test is applied to the size reported by the filesystem, so a file above the limit is never read into memory; the NUL and UTF-8 tests are applied to the bytes read.

The constructor records whether the run satisfies §3.3's no-content case — `regexText` equal to `.` with `lineNumbers` and `matchedLine` both `false`. When it does, a selected file that passes the size test and is not empty is reported from its path alone, and `std::ifstream` is never opened for it.

UTF-8 validation rejects truncated sequences, overlong encodings, encoded surrogates, and scalar values above U+10FFFF.

Lines are then split per Spec_TextFinder.md §3.3, and line numbers count every line, including those that do not match.

## 8. Matching and Emission

The compiled expression is evaluated against each line with `std::regex_search`, which gives the anywhere-in-the-line match Spec_TextFinder.md §3.3 requires. When a record would carry the path alone — `lineNumbers` and `matchedLine` both `false` — the loop over a file's lines returns after emitting the first match, per §3.4.

Record forms, field separator, emission timing, and path rendering are fixed by Spec_TextFinder.md §3.4; `<path>` is produced with `path::generic_u8string()` after removing a leading `./` contributed by a root path of `.`.

Announcements are emitted through the same `Output` in the forms and under the gating of Spec_TextFinder.md §3.4. Their placement: a file announcement is emitted once the file has been read and admitted or rejected, and so precedes any record from that file; an error announcement is emitted at the point the failure is met.

## 9. Build

Per [Cpp_TextFinder_Structure.md](../Cpp_TextFinder_Structure.md):

- CMake library target `Cpp_TextFinder_Dirnav`.
- Implemented as a C++ module; consumes the standard library via `import std;` and `ProgramCommands` via `import Cpp_TextFinder_Cmdline;`. It does not depend on `Cpp_TextFinder_Output`, which supplies the template argument at the point of use.

## 10. Non-Goals

- The library does not parse the command line and does not read `argv`.
- The library does not own or extend the skip list, and does not implement `addSkipDirectory`.
- The library does not modify files, follow symbolic links, or report an exit code.
