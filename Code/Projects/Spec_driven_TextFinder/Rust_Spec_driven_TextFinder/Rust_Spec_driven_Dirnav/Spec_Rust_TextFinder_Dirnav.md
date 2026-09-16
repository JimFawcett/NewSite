# Spec_Rust_TextFinder_Dirnav — Directory Navigation Library Specification

Specification for the `rust_textfinder_dirnav` library of the Rust TextFinder implementation. This document is the Rust binding of [Spec_TextFinder.md](../../Spec_TextFinder.md) §3.2–§3.4, which remain the authority for traversal, matching, and output behavior; it inherits structural decisions from [Rust_TextFinder_Structure.md](../Rust_TextFinder_Structure.md). Its consumer is [Spec_Rust_TextFinder_Entry.md](../Rust_Spec_driven_TextFinder_Entry/Spec_Rust_TextFinder_Entry.md); it takes its commands from [Spec_Rust_TextFinder_Cmdline.md](../Rust_Spec_driven_Cmdline/Spec_Rust_TextFinder_Cmdline.md).

## 1. Purpose

`rust_textfinder_dirnav` walks a directory tree, reads each selected file, evaluates the regular expression against each line, and formats every matching file into the block Spec_TextFinder.md §3.4 fixes, emitting each of its lines as it is produced. It is the only component that touches file contents, and it writes to no stream.

## 2. Scope

This spec covers only the library. Command-line parsing is specified in Spec_Rust_TextFinder_Cmdline.md, skip-list ownership and process-level concerns in Spec_Rust_TextFinder_Entry.md, and the destination of emitted strings in Spec_Rust_TextFinder_Output.md.

## 3. Responsibilities

The library:

- Is implemented as a Rust library crate targeting edition 2021, using idiomatic Rust constructs.
- Defines the `Output` trait and binds to a concrete implementation of it through a generic type parameter.
- Compiles the `/r` expression once at construction and reuses it for every line of every file across every root path.
- Implements the traversal, file-admission, matching, and announcement behavior of Spec_TextFinder.md §3.2–§3.4, emitting every block line and announcement through `Output`.

## 4. Public Interface

The crate root `lib.rs` declares package `rust_textfinder_dirnav` and exports the following:

```rust
use std::path::Path;                           // standard library
use regex::Error;                              // the regex crate, per §9
use rust_textfinder_cmdline::ProgramCommands;  // the sibling library, per §9

pub trait Output {
    fn output(&mut self, text: &str);
}

pub type SkipList = Vec<String>;

pub struct Dirnav<'a, O: Output> { /* private */ }

impl<'a, O: Output> Dirnav<'a, O> {
    pub fn new(out: &'a mut O, skips: &'a SkipList, commands: &'a ProgramCommands)
        -> Result<Self, regex::Error>;

    pub fn search(&mut self, root: &Path);
}
```

`new` compiles `commands.regex_text` with `regex::Regex::new` — the engine Spec_TextFinder.md §6.1 assigns to Rust — and returns `Err` with the crate's own error when it will not compile. `rust_textfinder_entry` maps that `Err` to the malformed-regex usage diagnostic of Spec_TextFinder.md §5.2. `rust_textfinder_cmdline` guarantees the text is non-empty, so `new` never sees an empty expression. The failure is a returned value rather than a panic: a malformed pattern is something the user typed, so it is an ordinary outcome of construction.

All three arguments are borrowed for the lifetime `'a` and are owned by `rust_textfinder_entry`, which the borrow checker obliges to keep them alive for the lifetime of the `Dirnav` value. The skip list and the commands are shared borrows and cannot be modified through them; `out` is a unique borrow, since emitting a line mutates the sink.

`search` returns nothing: every failure it meets is announced through `Output` per §5, so the caller has nothing to report on its behalf. A single value is reused across every root path, so the compiled expression is built once per run, and `search` carries no state from one call to the next.

## 5. Traversal Rules

1. **Root paths.** A root path that resolves to a regular file is searched as that single file; one that resolves to a directory is traversed. A root that is a symbolic link, is neither a regular file nor a directory, or cannot be opened, is announced per Spec_TextFinder.md §3.4 and traversal of it stops there. The root's kind is taken from `std::fs::symlink_metadata`, not `std::fs::metadata`: the latter follows a symbolic link and would report the target's kind, hiding the very case §3.2 requires be announced.
2. **Order and descent.** Traversal follows the depth-first visit order of Spec_TextFinder.md §3.2. The recursion is written explicitly: one function iterates a directory and calls itself on each subdirectory it decides to enter, so that entries are handled as `std::fs::read_dir` yields them, without being collected or reordered. `read_dir` enumerates a single level only; its order is unspecified by the standard library and is whatever `readdir` or `FindFirstFileW` returns, which is the platform facility Spec_TextFinder.md §3.2 requires an implementation to enumerate through. Entries are neither sorted nor grouped, as §3.2 forbids. No directory-walking crate is used — `walkdir` among them — because such a crate owns the descent this library must own and may impose an order of its own.
3. **Recursion.** Subdirectories are descended only when `/s` is `true`. When `/s` is `false`, only the entries of the root path itself are considered.
4. **Skip list.** A skip-list entry is compared against the directory's basename by the rule §6 states for an extension — the same rule, applied by the same function, since Spec_TextFinder.md §3.2 and §5 fix one comparison for both. A directory matching an entry per Spec_TextFinder.md §3.2 is pruned silently — a pruned directory is not a failure and is not announced. The list is consulted for every directory met during traversal but never for a root path, which §3.2 exempts because the user named it explicitly: a root named `build` is traversed, and a `build` directory found beneath it is pruned. The list applies to directory names only, so a root path that is a regular file is searched whatever its name.
5. **Symbolic links.** A directory entry that is a symbolic link is passed over silently, whatever its target, since no attempt is made to open it. The kind of an entry comes from `std::fs::DirEntry::file_type`, which does not follow a link; `std::fs::metadata` is not called on a traversal entry, because it does follow one and would admit a link's target as though the link were a file.
6. **Unrenderable names.** An entry whose name is not valid UTF-8 is not entered and not searched, and draws the error announcement `cannot open <path>` per Spec_TextFinder.md §3.4, with the text §8 produces. The test runs on every entry immediately after the symbolic-link test of rule 5, and therefore before the skip-list test, before the extension filter of §6, and before any attempt to open. A name that cannot be rendered is announced whatever `/p` holds, since it never reaches selection — which is what §3.4 requires, that rule being written over every such file rather than over the selected ones. `OsStr::to_str` reports the condition by returning `None`, so nothing propagates and nothing is caught; traversal continues with the next entry.
7. **Failed opens.** Any file or directory that cannot be opened draws the error announcement `cannot open <path>`; a directory so announced is pruned, a file so announced is not searched. An error yielded while iterating a directory is treated the same way, so a directory that becomes unreadable part way through is announced rather than silently truncated. Error announcements are not gated on `/h`, per Spec_TextFinder.md §3.4.

A symbolic link is tested before rule 6, so one whose name cannot be rendered is passed over silently like any other link rather than announced: rule 5 turns on the entry's kind, which costs no decoding, and §3.2 asks for silence there.

Nothing in traversal panics. Every operation that can fail returns `io::Result`, and each failure resolves to an announcement or to pruning, never to `unwrap`.

## 6. File Selection

Selection follows the `/p` rules of Spec_TextFinder.md §5, which fix the extension definition, the empty-list and no-extension cases, and the platform-dependent comparison. The list arrives from `rust_textfinder_cmdline` already normalized to bare extensions.

`std::path::Path::extension` does not implement those rules: it returns `None` for `.gitignore`, whereas §5 gives that file the extension `gitignore`. The extension is therefore taken as the text after the last `.` in the file name, with no special case for a leading dot, and a name holding no `.` at all has no extension.

The file name is read through `Path::file_name` and decoded with `OsStr::to_str`. That decoding cannot fail here: §5 rule 6 has already refused every entry whose name is not valid UTF-8, so selection sees a name and never a `None`. Selection therefore says nothing about such a file, and neither an empty nor a non-empty `/p` list changes what happens to it.

Comparison is case-sensitive on POSIX and case-insensitive on Windows, per Spec_TextFinder.md §3.2 and §5. The Windows comparison uses `eq_ignore_ascii_case`, so it folds ASCII only; an extension holding a non-ASCII character compares case-sensitively on both platforms. §5 rule 4 applies the same comparison to skip-list entries.

Selection applies uniformly: a root path that is a regular file is filtered by `/p` like any other file.

## 7. Content Decoding and Line Splitting

A selected file is put to the three admission tests of Spec_TextFinder.md §3.3. The size test is applied to the length `std::fs::Metadata::len` reports, so a file above the limit is never read into memory; the NUL and UTF-8 tests are applied to the bytes read. The limit is 10,485,760 bytes, the number §3.3 fixes.

`Dirnav::new` records whether the run satisfies §3.3's no-content case — `regex_text` equal to `.` with `line_numbers` and `matched_line` both `false`. When it does, a selected file that passes the size test and is not empty produces a block of its path line alone, and the file is never opened.

No file announcement accompanies that block. `searched` reports a file that was read and matched nothing and `skipped` reports one a content test rejected, and in this case neither happened — every selected file matches — so the library emits neither, whatever `/h` says. A selected file of zero size produces no block and draws no announcement either. The size test still runs on filesystem metadata, so a file above the limit still draws the error announcement `too large`, and one whose metadata cannot be read still draws `cannot open`.

A file that needs reading is read in full with `std::fs::read`, so one failing a later test is skipped entirely rather than searched in part. The NUL test asks whether the bytes hold a zero. The UTF-8 test is `std::str::from_utf8`, which rejects truncated sequences, overlong encodings, encoded surrogates, and scalar values above U+10FFFF — the four rejections §3.3 requires — so this implementation performs no validation of its own and the standard library is the authority for what valid UTF-8 means.

A leading UTF-8 BOM is consumed and does not belong to the first line. It is stripped after the admission tests, so its three bytes count toward the size limit and toward the NUL scan like any others.

Lines are then split per Spec_TextFinder.md §3.3: LF, CRLF, and bare CR each terminate a line, and a final unterminated run is a line. `str::lines` is not used: it splits on LF and strips a trailing CR, but it does not treat a bare CR as a terminator, so a classic Mac OS file would arrive as one line. Line numbers count every line, including those that do not match.

## 8. Matching and Emission

The compiled expression is evaluated against each line with `Regex::is_match`, which gives the anywhere-in-the-line match Spec_TextFinder.md §3.3 requires and asks the engine for nothing more — no match position, no matched substring, no capture group.

The line is passed as `&str`, so `.`, a character class, and a class escape each match one Unicode scalar value. Spec_TextFinder.md §6.1 records `std::regex` over `char` as the one engine of the four that matches a byte instead, so on a line holding a non-ASCII character this implementation agrees with the C# and Python implementations and the C++ one is the outlier.

A matching file is emitted as the block Spec_TextFinder.md §3.4 fixes. The library writes the path line through `Output` at the first match, ahead of the detail line for that same match, and tracks per file whether it has done so — a file that never matches must produce no line at all, and a file that matches many must produce its path line once. When `line_numbers` and `matched_line` are both `false` the block has no detail lines, so the loop over a file's lines returns as soon as the path line is written. Otherwise the loop runs to the end of the file, writing one detail line — two spaces of indent, then the fields `/n` and `/L` select — as each matching line is evaluated. Nothing is accumulated for the file: `Output` receives each line as it is produced.

Block form, indent, field separator, emission timing, and path rendering are fixed by Spec_TextFinder.md §3.4. `<path>` begins with the root path `search` was given, as §3.4 requires, and is built by joining that root's text with the entry names descended through, rather than by formatting a `PathBuf`. `Path::display` is not used for a block line: it renders the platform's own separator, which on Windows would emit `\` and make the same tree produce different output on two platforms.

§3.4 requires `/` on every platform for the whole of `<path>`, the root's own text included, so a separator the user typed is normalized too: `-P src\sub` on Windows yields `src/sub/file.rs`, not `src\sub/file.rs`. Every `\` in a root path's text becomes `/` before the first entry name is appended. A root path of `.` contributes no leading `./`.

An entry name that is not valid UTF-8 cannot be rendered as text. Spec_TextFinder.md §3.4 settles that case for every implementation, and §5 rule 6 applies it here: the file is not searched and draws the error announcement `cannot open`, naming it with U+FFFD substituted for each unit that will not render. This library performs that substitution with `OsStr::to_string_lossy`, which does exactly what §3.4 describes. That announcement is the one place a path reaching `Output` is not the path on disk; every name that survives rule 6 renders without substitution, so a block's path line is always the name itself.

Announcements are emitted through the same `Output` in the forms and under the gating of Spec_TextFinder.md §3.4, and are emitted as the library goes. Neither waits on the completion of the directory holding the entry it names, and neither is accumulated for emission at the end of the run. An error announcement is emitted at the point the failure is met and is not gated on `/h`.

A file announcement reports only a file that produced no block, so it never repeats a path the output already carries. `commands.suppress_on_no_match` — the `/h` field — decides whether one is emitted at all:

- `true`, the default: none is. A file searched without matching, and a file a content test rejected, each contribute nothing to the output.
- `false`: a file searched without matching draws `searched <path>` once its last line has been evaluated, which is the first moment the library knows it matched nothing; a file rejected by a content test draws `skipped <path>` at the point of rejection.

The no-content case of §7 produces a block for every selected non-empty file and so draws no file announcement under either setting.

## 9. Build

Per [Rust_TextFinder_Structure.md](../Rust_TextFinder_Structure.md):

- Cargo library package `rust_textfinder_dirnav`.
- Depends on the standard library, on `rust_textfinder_cmdline` for `ProgramCommands`, and on the `regex` crate. It is the only package that declares `regex`. It does not depend on `rust_textfinder_output`, which supplies the generic argument at the point of use.

## 10. Non-Goals

- The library does not parse the command line and does not read the program's arguments.
- The library does not own or extend the skip list, and does not implement the skip-list extension point.
- The library does not modify files, follow symbolic links, or report an exit code.
