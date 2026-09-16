# Spec_Cpp_TextFinder_Dirnav — Directory Navigation Library Specification

Specification for the `Cpp_TextFinder_Dirnav` library of the C++ TextFinder implementation. This document is the C++ binding of [Spec_TextFinder.md](../../Spec_TextFinder.md) §3.2–§3.4, which remain the authority for traversal, matching, and output behavior; it inherits structural decisions from [Cpp_TextFinder_Structure.md](../Cpp_TextFinder_Structure.md). Its consumer is [Spec_Cpp_TextFinder_Entry.md](../Cpp_Spec_driven_TextFinder_Entry/Spec_Cpp_TextFinder_Entry.md); it takes its commands from [Spec_Cpp_TextFinder_Cmdline.md](../Cpp_Spec_driven_Cmdline/Spec_Cpp_TextFinder_Cmdline.md).

## 1. Purpose

`Cpp_TextFinder_Dirnav` walks a directory tree, reads each selected file, evaluates the regular expression against each line, and formats every matching file into the block Spec_TextFinder.md §3.4 fixes, emitting each of its lines as it is produced. It is the only component that touches file contents, and it writes to no stream.

## 2. Scope

This spec covers only the library. Command-line parsing is specified in Spec_Cpp_TextFinder_Cmdline.md, skip-list ownership and process-level concerns in Spec_Cpp_TextFinder_Entry.md, and the destination of emitted strings in Spec_Cpp_TextFinder_Output.md.

## 3. Responsibilities

The library:

- Is implemented as a C++ module targeting C++23, using modern idiomatic C++ constructs.
- Defines the abstract base class `Output` and binds to a concrete implementation of it through a template parameter.
- Compiles the `/r` expression once at construction and reuses it for every line of every file across every root path.
- Implements the traversal, file-admission, matching, and announcement behavior of Spec_TextFinder.md §3.2–§3.4, emitting every block line and announcement through `Output`.

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

The constructor compiles `commands.regexText` with `std::regex`, constructed with `std::regex::ECMAScript` — the engine Spec_TextFinder.md §6.1 assigns to C++ — and lets `std::regex_error` propagate when it will not compile; `Cpp_TextFinder_Entry` catches it and reports the malformed-regex usage diagnostic of Spec_TextFinder.md §5.2. `Cpp_TextFinder_Cmdline` guarantees the text is non-empty, so the constructor never sees an empty expression. All three constructor arguments are retained by reference and are owned by `Cpp_TextFinder_Entry`, which keeps them alive for the lifetime of the `Cpp_TextFinder_Dirnav` instance; the skip list and the commands are consulted but never modified.

`search` traverses one root path and returns nothing: every failure it meets is announced through `Output` per §5, so the caller has nothing to report on its behalf. A single instance is reused across every root path, so the compiled expression is built once per run, and `search` carries no state from one call to the next.

## 5. Traversal Rules

1. **Root paths.** A root path that resolves to a regular file is searched as that single file; one that resolves to a directory is traversed. A root that is a symbolic link, is neither a regular file nor a directory, or cannot be opened, is announced per Spec_TextFinder.md §3.4 and traversal of it stops there.
2. **Order and descent.** Traversal follows the depth-first visit order of Spec_TextFinder.md §3.2. The recursion is written explicitly: one function iterates a directory and calls itself on each subdirectory it decides to enter, so that entries are handled as `std::filesystem::directory_iterator` yields them, without being collected or reordered. `std::filesystem::recursive_directory_iterator` is not used — the library controls its own descent. `directory_iterator` enumerates a single level only; its order is unspecified by the standard and is whatever `readdir` or `FindFirstFileW` returns, which is the platform facility Spec_TextFinder.md §3.2 requires an implementation to enumerate through. Entries are neither sorted nor grouped, as §3.2 forbids.
3. **Recursion.** Subdirectories are descended only when `/s` is `true`. When `/s` is `false`, only the entries of the root path itself are considered.
4. **Skip list.** A directory matching a skip-list entry per Spec_TextFinder.md §3.2 is pruned silently — a pruned directory is not a failure and is not announced. The list is consulted for every directory met during traversal but never for a root path, which §3.2 exempts because the user named it explicitly: a root named `build` is traversed, and a `build` directory found beneath it is pruned. The list applies to directory names only, so a root path that is a regular file is searched whatever its name.
5. **Symbolic links.** A directory entry that is a symbolic link is passed over silently, whatever its target, since no attempt is made to open it.
6. **Unrenderable names.** An entry whose name this implementation cannot render as text is not entered and not searched, and draws the error announcement `cannot open <path>` per Spec_TextFinder.md §3.4, with the text §8 produces. The test runs on every entry immediately after the symbolic-link test of rule 5, and therefore before the skip-list test, before the extension filter of §6, and before any attempt to open. A name that cannot be rendered is announced whatever `/p` holds, since it never reaches selection — which is what Spec_TextFinder.md §3.4 requires, that rule being written over every such file rather than over the selected ones.
7. **Failed opens.** Any file or directory that cannot be opened draws the error announcement `cannot open <path>`; a directory so announced is pruned, a file so announced is not searched. Error announcements are not gated on `/h`, per Spec_TextFinder.md §3.4.

A symbolic link is tested before rule 6, so one whose name cannot be rendered is passed over silently like any other link rather than announced: rule 5 turns on the entry's kind, which costs no conversion, and §3.2 asks for silence there.

## 6. File Selection

Selection follows the `/p` rules of Spec_TextFinder.md §5, which fix the extension definition, the empty-list and no-extension cases, and the platform-dependent comparison. The list arrives from `Cpp_TextFinder_Cmdline` already normalized to bare extensions.

`std::filesystem::path::extension()` does not implement those rules: it returns an empty string for `.gitignore`, whereas §5 gives that file the extension `gitignore`. The extension is therefore taken as the text after the last `.` in the file name, with no special case for a leading dot, and a name holding no `.` at all has no extension. `u8string()` is not used: it returns `std::u8string`, which will not compare against the `std::string` extensions `Cpp_TextFinder_Cmdline` supplies. The name comes from the helper §8 fixes rather than from `filename().string()`, whose conversion can throw on Windows; §5 rule 6 has already refused every entry that helper cannot render, so selection sees a name and never a failure.

Selection applies uniformly: a root path that is a regular file is filtered by `/p` like any other file.

## 7. Content Decoding and Line Splitting

A selected file is put to the three admission tests of Spec_TextFinder.md §3.3. The size test is applied to the size reported by the filesystem, so a file above the limit is never read into memory; the NUL and UTF-8 tests are applied to the bytes read.

The constructor records whether the run satisfies §3.3's no-content case — `regexText` equal to `.` with `lineNumbers` and `matchedLine` both `false`. When it does, a selected file that passes the size test and is not empty produces a block of its path line alone, and `std::ifstream` is never opened for it.

No file announcement accompanies that block. `searched` reports a file that was read and matched nothing and `skipped` reports one a content test rejected, and in this case neither happened — every selected file matches — so the library emits neither, whatever `/h` says. A selected file of zero size produces no block and draws no announcement either. The size test still runs on filesystem metadata, so a file above the limit still draws the error announcement `too large`, and one whose metadata cannot be read still draws `cannot open`.

UTF-8 validation rejects truncated sequences, overlong encodings, encoded surrogates, and scalar values above U+10FFFF.

Lines are then split per Spec_TextFinder.md §3.3, and line numbers count every line, including those that do not match.

## 8. Matching and Emission

The compiled expression is evaluated against each line with `std::regex_search`, which gives the anywhere-in-the-line match Spec_TextFinder.md §3.3 requires. The line is passed as its bytes, so `.`, a character class, and a class escape each match one byte rather than one Unicode scalar value; Spec_TextFinder.md §6.1 records that as this implementation's divergence from the other three on a non-ASCII line.

A matching file is emitted as the block Spec_TextFinder.md §3.4 fixes. The library writes the path line through `Output` at the first match, ahead of the detail line for that same match, and tracks per file whether it has done so — a file that never matches must produce no line at all, and a file that matches many must produce its path line once. When `lineNumbers` and `matchedLine` are both `false` the block has no detail lines, so the loop over a file's lines returns as soon as the path line is written. Otherwise the loop runs to the end of the file, writing one detail line — two spaces of indent, then the fields `/n` and `/L` select — as each matching line is evaluated. Nothing is accumulated for the file: `Output` receives each line as it is produced.

Block form, indent, field separator, emission timing, and path rendering are fixed by Spec_TextFinder.md §3.4. `<path>` begins with the root path `search` was given, as §3.4 requires, and a leading `./` contributed by a root path of `.` is removed. `generic_u8string()` is not used: `Output::output` takes a `std::string`, not the `std::u8string` it returns.

`path::generic_string()` is not used either, and the reason is the rule Spec_TextFinder.md §3.4 states about names that cannot be rendered as text. That function's behavior is not the same on both platforms this implementation targets. On POSIX the native string is already `char`, so it copies bytes and cannot fail, and a name holding bytes that are not valid UTF-8 passes through unexamined. On Windows the native string is `wchar_t`, so it must convert UTF-16 to narrow, and an unpaired surrogate has no encoding — the standard has that conversion throw `std::system_error`. One platform therefore never reports the condition §3.4 defines, and the other reports it by throwing out of the walk.

Rendering is performed instead by a helper that behaves identically on both and never throws. It produces the generic form with `/` separators, substitutes U+FFFD REPLACEMENT CHARACTER for each unit that will not render, and reports whether it substituted any. On POSIX it walks the bytes with the same validity test `validUtf8` applies to file contents, copying each valid sequence and substituting for each byte that begins none. On Windows it walks the UTF-16 units, encoding each to UTF-8 and substituting for each unpaired surrogate. It calls neither `generic_string()` nor `filename().string()`, so there is no conversion left to throw and nothing to catch.

§5 rule 6 consumes the second return: an entry the helper had to substitute for is announced and skipped, and traversal continues with the next entry, as Spec_TextFinder.md §3.4 requires. Every name that survives that gate renders without substitution, so `baseName` and the block's path line receive text that is the name, and the U+FFFD form appears in one place only — the `cannot open` announcement naming the entry that failed the gate.

Announcements are emitted through the same `Output` in the forms and under the gating of Spec_TextFinder.md §3.4, and are emitted as the library goes. Neither waits on the completion of the directory holding the entry it names, and neither is accumulated for emission at the end of the run. An error announcement is emitted at the point the failure is met and is not gated on `/h`.

A file announcement reports only a file that produced no block, so it never repeats a path the output already carries. `commands.suppressOnNoMatch` — the `/h` field — decides whether one is emitted at all:

- `true`, the default: none is. A file searched without matching, and a file a content test rejected, each contribute nothing to the output.
- `false`: a file searched without matching draws `searched <path>` once its last line has been evaluated, which is the first moment the library knows it matched nothing; a file rejected by a content test draws `skipped <path>` at the point of rejection.

The no-content case of §7 produces a block for every selected non-empty file and so draws no file announcement under either setting.

## 9. Build

Per [Cpp_TextFinder_Structure.md](../Cpp_TextFinder_Structure.md):

- CMake library target `Cpp_TextFinder_Dirnav`.
- Implemented as a C++ module; consumes the standard library via `import std;` and `ProgramCommands` via `import Cpp_TextFinder_Cmdline;`. It does not depend on `Cpp_TextFinder_Output`, which supplies the template argument at the point of use.

## 10. Non-Goals

- The library does not parse the command line and does not read `argv`.
- The library does not own or extend the skip list, and does not implement `addSkipDirectory`.
- The library does not modify files, follow symbolic links, or report an exit code.
