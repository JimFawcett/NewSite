# Spec_Rust_TextFinder_Output — Output Library Specification

Specification for the `rust_textfinder_output` library of the Rust TextFinder implementation. It is the output component that [Spec_TextFinder.md](../../Spec_TextFinder.md) §3.4 routes block lines and announcements through, and it implements the `Output` trait defined in [Spec_Rust_TextFinder_Dirnav.md](../Rust_Spec_driven_Dirnav/Spec_Rust_TextFinder_Dirnav.md) §4. It inherits structural decisions from [Rust_TextFinder_Structure.md](../Rust_TextFinder_Structure.md) and is constructed by [Spec_Rust_TextFinder_Entry.md](../Rust_Spec_driven_TextFinder_Entry/Spec_Rust_TextFinder_Entry.md).

## 1. Purpose

`rust_textfinder_output` is the sink. It receives fully formed strings from `rust_textfinder_dirnav`, writes each as one line to stdout, and absorbs any write failure so that neither the traversal nor the binary has to reason about it.

## 2. Scope

This spec covers only the library. What is emitted, in what form, and under what gating is fixed by Spec_TextFinder.md §3.4 and produced by `rust_textfinder_dirnav`; this library chooses none of it.

## 3. Responsibilities

The library:

- Is implemented as a Rust library crate targeting edition 2021, using idiomatic Rust constructs.
- Implements the `Output` trait and its one method.
- Owns the process's only handle to stdout, and accepts the binary's own already-terminated text as well as the traversal's lines, so that one value controls the order everything reaches the stream in.
- Buffers stdout and flushes it when dropped.

## 4. Public Interface

The crate root `lib.rs` declares package `rust_textfinder_output` and exports the following:

```rust
use std::cell::Cell;

thread_local! {
    static SINK_TAKEN: Cell<bool> = Cell::new(false);
}

pub struct StdoutSink { /* private */ }

impl StdoutSink {
    pub fn new() -> Option<Self>;
    pub fn write_text(&mut self, text: &str);
    pub fn flush(&mut self);
}

impl Output for StdoutSink {
    fn output(&mut self, text: &str);
}

impl Drop for StdoutSink {
    fn drop(&mut self);
}
```

`new` takes no arguments and yields `Some` the first time it is called and `None` every time after, so that the process holds one sink and one only. §7 records why a second would corrupt the output. The flag lives in a `thread_local!` `Cell` for the reason Spec_Rust_TextFinder_Entry.md §5 gives for the skip list: interior mutability without `unsafe` and without a synchronization primitive, on a value only one thread reaches. `Drop` clears the flag, so a sink dropped before another is created releases the right to make one.

`None` is the only way construction fails. `rust_textfinder_entry` builds exactly one sink, so its own code cannot provoke it; it handles the case all the same, per Spec_Rust_TextFinder_Entry.md §4 step 3, because a constructor with a failure mode that callers ignore is a constructor whose failure mode will eventually be reached. `Default` is not implemented: `Default::default` must return `Self`, and this type cannot promise one.

`flush` writes the buffer through to stdout. `rust_textfinder_entry` calls it at §4 step 8, where a diagnostic on stderr must follow text already written to stdout; nothing else needs it, since §7 flushes on `Drop`.

The type takes no configuration. `rust_textfinder_dirnav` formats every line in full before emitting it — a block's path line, a block's indented detail lines, and every announcement alike — so there is nothing left here to parameterize.

Three methods write, and the first two differ only in what they add:

- `output`, the trait method, writes the string it is given followed by the single LF Spec_TextFinder.md §3.4 fixes. It is the method `rust_textfinder_dirnav` reaches, and the trait is the only thing that library knows about this one.
- `write_text` writes the string verbatim, adding nothing. It exists for the help text of Spec_TextFinder.md §5.1 and the option listing of §5.3, which `rust_textfinder_cmdline` returns already newline-terminated. It is an inherent method rather than part of the trait, so `rust_textfinder_dirnav` cannot reach it and cannot emit unterminated text.

Once constructed, neither method panics and neither reports failure to a caller.

## 5. Destination and Line Termination

Output goes to stdout, the destination Spec_TextFinder.md §3.4 names.

Spec_TextFinder.md §3.4 obliges an implementation to prevent its runtime translating the LF terminator to CRLF. Rust's standard output writes the bytes it is given on every platform and performs no such translation, so this implementation meets that requirement by doing nothing. The C++ implementation has to put its stream into binary mode and can fail trying; there is no corresponding step here, and nothing in this crate needs a `#[cfg]` on the target platform.

One failure mode remains, and it is about this library rather than about the stream: a second `StdoutSink` while one already exists (§4). That is the failure Spec_TextFinder.md §3.4's exit code 2 names, so the code has a path in this implementation after all, and Spec_Rust_TextFinder_Entry.md §6 records the two ways it is reached.

`output` adds the terminator and nothing else — no prefix, no separator, no trailing content — because the string arrives fully formatted.

## 6. Error Handling

A write that fails — a closed pipe, a full disk — sets an internal failed state. On the first such failure the library flushes stdout and then writes the single line `output failed` to stderr. The flush comes first so that every line already buffered reaches the stream ahead of the notice explaining why the lines stop; it is best-effort, since whatever broke the write may break it too. Thereafter the library discards every string it is given and writes nothing more, to stdout or stderr.

The failed state is permanent and one notice is written, not one per discarded line, so a broken pipe does not turn a long search into a long stderr transcript.

The flush performed when the value is dropped (§7) obeys the same rule. A failure there sets the failed state and writes the one notice, if no earlier failure has already written it, because the final flush is the write most likely to be the first one that fails: it is the only one that must reach the stream, and on a short search it is the only one that reaches it at all. Nothing follows it, so nothing is left to discard.

All three methods swallow the `io::Result` their writes return. The library never panics, never returns a status, and never lets the failure reach `rust_textfinder_dirnav`, which goes on traversing. `unwrap` and `expect` appear nowhere in it.

A failed write does not affect the exit code, which Spec_Rust_TextFinder_Entry.md §6 reserves for command-line failures. A run whose output went nowhere still exits 0: the exit code answers whether TextFinder could do what it was asked, not whether the reader received it.

## 7. Buffering and Flushing

`std::io::stdout` returns a handle that flushes on every newline, and every line this library writes ends in one, so writing through it directly would flush once per emitted line and that cost would dominate a search that emits many. The sink therefore holds a `std::io::BufWriter` wrapping that handle, which defers the write until its buffer fills.

No flush is performed per line. The stream is flushed when the value is dropped, and `rust_textfinder_entry` reaches that drop on every path out of the program, since each of its exits returns from `main` rather than calling `std::process::exit` (Spec_Rust_TextFinder_Entry.md §4). `Drop` is implemented explicitly rather than left to `BufWriter`'s own, which discards a failing flush without notice; §6 fixes what this one does with it instead. `flush` (§4) performs the same write on demand, for the one case that needs the buffer drained before the process ends.

This buffer is why the process holds one sink and one only (§4). Two would wrap the same stdout with two independent buffers, and their contents would reach the stream in the order the buffers happened to fill rather than the order the lines were written — which would break the emission order Spec_TextFinder.md §3.4 fixes, silently and only under load.

One rule keeps the deferral from reordering the output: **stdout is flushed before any write to stderr.** This library applies the rule to its own `output failed` notice (§6), and `rust_textfinder_entry` applies it to the diagnostic that follows the option listing on an invalid `/r` (Spec_Rust_TextFinder_Entry.md §4 step 8).

Because this value owns the only stdout handle in the process, the binary's help text and option listing pass through `write_text` rather than through a handle of their own. They therefore share this buffer and reach the stream in the order written, and the ordering rule above is the only coordination needed.

## 8. Build

Per [Rust_TextFinder_Structure.md](../Rust_TextFinder_Structure.md):

- Cargo library package `rust_textfinder_output`.
- Depends on the standard library and on `rust_textfinder_dirnav` for the `Output` trait. Nothing depends on this package except `rust_textfinder_entry`, which supplies it as the generic argument to `Dirnav`.

## 9. Non-Goals

- The library does not format block lines or announcements, does not know one from the other, does not indent a detail line, and does not apply `/h`, `/n`, or `/L`; all of that is settled before a string reaches it.
- The library does not read files, paths, or the command line.
- The library does not write usage diagnostics; those go to stderr from `rust_textfinder_entry`.
