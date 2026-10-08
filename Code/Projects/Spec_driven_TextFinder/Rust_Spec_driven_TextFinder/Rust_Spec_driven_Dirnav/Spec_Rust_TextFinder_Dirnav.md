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

    pub fn emit_run_summary(&mut self);
}
```

`new` compiles `commands.regex_text` with `regex::Regex::new` — the engine Spec_TextFinder.md §6.1 assigns to Rust — and returns `Err` with the crate's own error when it will not compile. `rust_textfinder_entry` maps that `Err` to the malformed-regex usage diagnostic of Spec_TextFinder.md §5.2. `rust_textfinder_cmdline` guarantees the text is non-empty. The failure is a returned value rather than a panic: a malformed pattern is something the user typed, so it is an ordinary outcome of construction.

All three arguments are borrowed for the lifetime `'a` and are owned by `rust_textfinder_entry`, which the borrow checker obliges to keep them alive for the lifetime of the `Dirnav` value. The skip list and the commands are shared borrows and cannot be modified through them; `out` is a unique borrow, since emitting a line mutates the sink.

`search` returns nothing: every failure it meets is announced through `Output` per §5. A single value is reused across every root path, so the compiled expression is built once per run, and `search` carries no state from one call to the next but for the two run counts of §8.1, which accumulate across calls by design.

`emit_run_summary` writes the run summary Spec_TextFinder.md §3.6 requires and is called once, by `rust_textfinder_entry`, after the last `search` returns. It takes `&mut self` because emitting mutates the sink, takes no other argument, and returns nothing: the counts are this value's own, and the sole reason the call sits with the caller is that only the caller knows which root was the last. No accessor is exposed for either count — the summary line is the whole of what they are for.

## 5. Traversal Rules

1. **Root paths.** Per Spec_TextFinder.md §3.2 and §3.4. The root's kind is taken from `std::fs::symlink_metadata`, not `std::fs::metadata`: the latter follows a symbolic link and would report the target's kind, hiding the very case §3.2 requires be announced.
2. **Order and descent.** The depth-first order of Spec_TextFinder.md §3.2, with the recursion written explicitly: one function iterates a directory and calls itself on each subdirectory it decides to enter, so that entries are handled as `std::fs::read_dir` yields them, without being collected or reordered. `read_dir` enumerates a single level only; its order is unspecified by the standard library and is whatever the platform facility §3.2 names returns. No directory-walking crate is used — `walkdir` among them — because such a crate owns the descent this library must own and may impose an order of its own.
3. **Recursion.** Subdirectories are descended only when `/s` is `true`.
4. **Skip list.** Per Spec_TextFinder.md §3.2, compared against the directory's basename by the rule §6 states for an extension — the same rule, applied by the same function, since §3.2 and §5 fix one comparison for both.
5. **Symbolic links.** A directory entry that is a symbolic link is passed over silently, whatever its target. The kind of an entry comes from `std::fs::DirEntry::file_type`, which does not follow a link; `std::fs::metadata` is not called on a traversal entry, because it does follow one and would admit a link's target as though the link were a file.
6. **Unrenderable names.** Spec_TextFinder.md §3.4 leaves to this document which names this implementation cannot render as text, and they are these: on POSIX, a name holding a byte sequence that is not valid UTF-8; on Windows, a name holding an unpaired surrogate code unit. Both follow from `OsStr`, which carries arbitrary bytes on POSIX and WTF-8 on Windows, and which in each case holds a name no `&str` can represent. Such an entry is not entered and not searched, and draws `cannot open <path>` per §3.4, with the text §8 produces. The test runs on every entry immediately after the symbolic-link test of rule 5, and therefore before the skip-list test, before the extension filter of §6, and before any attempt to open — which is what §3.4 requires, that rule being written over every such file rather than over the selected ones. `OsStr::to_str` reports the condition by returning `None` on both platforms, so nothing propagates and nothing is caught; traversal continues with the next entry.
7. **Failed opens.** Per Spec_TextFinder.md §3.4. An error yielded while iterating a directory is treated the same way, so a directory that becomes unreadable part way through is announced rather than silently truncated.

A symbolic link is tested before rule 6, so one whose name cannot be rendered is passed over silently like any other link rather than announced: rule 5 turns on the entry's kind, which costs no decoding, and §3.2 asks for silence there.

Nothing in traversal panics. Every operation that can fail returns `io::Result`, and each failure resolves to an announcement or to pruning, never to `unwrap`.

## 6. File Selection

Selection follows the `/p` rules of Spec_TextFinder.md §5. The list arrives from `rust_textfinder_cmdline` already normalized to bare extensions.

`std::path::Path::extension` does not implement those rules: it returns `None` for `.gitignore`, whereas §5 gives that file the extension `gitignore`. The extension is therefore taken as the text after the last `.` in the file name, with no special case for a leading dot, and a name holding no `.` at all has no extension.

The file name is read through `Path::file_name` and decoded with `OsStr::to_str`. That decoding cannot fail here: §5 rule 6 has already refused every entry whose name will not render, so selection sees a name and never a `None`, and neither an empty nor a non-empty `/p` list changes what happens to such a file.

Comparison is case-sensitive on POSIX and case-insensitive on Windows, per Spec_TextFinder.md §3.2 and §5. The Windows comparison uses `eq_ignore_ascii_case`, so it folds ASCII only; an extension holding a non-ASCII character compares case-sensitively on both platforms. §5 rule 4 applies the same comparison to skip-list entries.

Selection applies uniformly: a root path that is a regular file is filtered by `/p` like any other file.

## 7. Content Decoding and Line Splitting

A selected file is put to the three admission tests of Spec_TextFinder.md §3.3. The size test is applied to the length `std::fs::Metadata::len` reports, so a file above the limit is never read into memory; the NUL and UTF-8 tests are applied to the bytes read.

`Dirnav::new` records whether the run satisfies §3.3's no-content case — `regex_text` equal to `.` with `line_numbers` and `matched_line` both `false`. When it does, a selected file that passes the size test and is not empty produces a block of its path line alone, the file is never opened, and §3.3's rule that no file announcement accompanies that block applies unchanged.

A file that needs reading is read in full with `std::fs::read`, so one failing a later test is skipped entirely rather than searched in part. The NUL test asks whether the bytes hold a zero. The UTF-8 test is `std::str::from_utf8`, which rejects truncated sequences, overlong encodings, encoded surrogates, and scalar values above U+10FFFF — the four rejections §3.3 requires — so this implementation performs no validation of its own and the standard library is the authority for what valid UTF-8 means.

A leading UTF-8 BOM is stripped after the admission tests, so its three bytes count toward the size limit and toward the NUL scan like any others.

Lines are then split per Spec_TextFinder.md §3.3. `str::lines` is not used: it splits on LF and strips a trailing CR, but it does not treat a bare CR as a terminator, so a classic Mac OS file would arrive as one line. Line numbers count every line, including those that do not match.

## 8. Matching and Emission

The compiled expression is evaluated against each line with `Regex::is_match`, which gives the anywhere-in-the-line match Spec_TextFinder.md §3.3 requires and asks the engine for nothing more.

The line is passed as `&str`, so `.`, a character class, and a class escape each match one Unicode scalar value — the behavior of three of the four engines, with the C++ implementation the outlier Spec_TextFinder.md §6.1 records.

Blocks are emitted as Spec_TextFinder.md §3.4 fixes — form, indent, field separator, emission timing, and the single path line per matching file. The library tracks per file whether it has written that line, returns from the loop at the first match when `line_numbers` and `matched_line` are both `false`, and otherwise runs to the end of the file writing one detail line as each matching line is evaluated. Nothing is accumulated: `Output` receives each line as it is produced.

`<path>` begins with the root path `search` was given and is built by joining that root's text with the entry names descended through, rather than by formatting a `PathBuf`. `Path::display` is not used for a block line: it renders the platform's own separator, which on Windows would emit `\` and make the same tree produce different output on two platforms.

§3.4 requires `/` on every platform for the whole of `<path>`, the root's own text included, so a separator the user typed is normalized too: `-P src\sub` on Windows yields `src/sub/file.rs`. Every `\` in a root path's text becomes `/` before the first entry name is appended.

§5 rule 6 names which entry names this implementation cannot render, and §3.4 settles the case: the file is not searched and draws `cannot open`, naming it with U+FFFD substituted for each unit that will not render. This library performs that substitution with `OsStr::to_string_lossy`. That announcement is the one place a path reaching `Output` is not the path on disk; every name that survives rule 6 renders without substitution, so a block's path line is always the name itself.

Announcements go through the same `Output`, in the forms and under the gating of Spec_TextFinder.md §3.4, each emitted as the library reaches the entry it names. `commands.suppress_on_no_match` is the `/h` field §3.4 gates file announcements on; under `/h false` a file searched without matching draws `searched <path>` once its last line has been evaluated, which is the first moment the library knows it matched nothing, and a file rejected by a content test draws `skipped <path>` at the point of rejection.

### 8.1 Run Summary

Spec_TextFinder.md §3.6 puts the two run counts in this library, for every implementation alike, and fixes the line they produce. Two `usize` fields hold them, both zero from `new`, and neither is reset by `search`.

The file count is incremented where the `/p` test of §6 admits a file, at both of the two places that test is applied — the root-path arm of `search` and the file arm of `walk` — and ahead of the metadata call in each. Everything §3.6 excludes is therefore excluded by construction rather than by a second test: an entry refused by `/p`, a symbolic link, an entry beneath a pruned directory, an entry whose name will not render, and an entry that is neither a file nor a directory all fail or bypass that test, though the last two draw `cannot open` on the way past. A file admitted and then announced `too large` or `cannot open` is counted, the increment standing ahead of both.

Putting the increment at the two call sites rather than inside `examine` is deliberate. `walk` announces `cannot open` and never calls `examine` when `entry.metadata()` fails, and that file passed `/p`, so an increment inside `examine` would miss it and this implementation would report one file fewer than the others over the same tree.

The directory count is incremented at the head of `walk`, before `read_dir`, so a directory that cannot be enumerated is counted and announced alike. A root path that resolved to a directory reaches `walk` and is counted; a pruned directory and, under `/s false`, every subdirectory never reach it and are not.

`emit_run_summary` writes one line through `Output`, in the fixed form of Spec_TextFinder.md §3.6. It names no path, so the rendering rules of §8 do not reach it. `rust_textfinder_entry` calls it only on a run that traversed, per §3.6 and Spec_Rust_TextFinder_Entry.md §4.

## 9. Build

Per [Rust_TextFinder_Structure.md](../Rust_TextFinder_Structure.md):

- Cargo library package `rust_textfinder_dirnav`.
- Depends on the standard library, on `rust_textfinder_cmdline` for `ProgramCommands`, and on the `regex` crate. It is the only package that declares `regex`. It does not depend on `rust_textfinder_output`, which supplies the generic argument at the point of use.

## 10. Non-Goals

- The library does not parse the command line and does not read the program's arguments.
- The library does not own or extend the skip list, and does not implement the skip-list extension point.
- The library does not modify files, follow symbolic links, or report an exit code.
