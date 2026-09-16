# Spec_Rust_TextFinder_Entry — Binary Entry Point Specification

Specification for the `rust_textfinder_entry` binary of the Rust TextFinder implementation. This document refines [Spec_TextFinder.md](../../Spec_TextFinder.md) and inherits structural decisions from [Rust_TextFinder_Structure.md](../Rust_TextFinder_Structure.md).

## 1. Purpose

`rust_textfinder_entry` is the command-line entry point of the Rust TextFinder. It collects and decodes the program's arguments, parses them, wires the three libraries together, and drives directory traversal. Matching and file I/O belong to `rust_textfinder_dirnav` and `rust_textfinder_output`; the binary performs neither.

The binary does write process-level text of its own — help, the resolved option listing, and startup diagnostics — but it composes none of it. Each is a string `rust_textfinder_cmdline` hands it, and the binary decides only when to write it and to which stream. Block lines and announcements it neither composes nor writes.

## 2. Scope

This spec covers only the binary. Switch behavior is defined in the parent [Spec_TextFinder.md](../../Spec_TextFinder.md) §4–§5. Library behavior is specified in each library's own `Spec_*.md`.

## 3. Responsibilities

The binary:

- Depends on `rust_textfinder_cmdline`, `rust_textfinder_dirnav`, and `rust_textfinder_output`.
- Collects the program's arguments and decodes them to `String` values, which is the one thing about the argument vector Spec_TextFinder.md §4 leaves to this document. §4 of this spec states the encoding limit that follows.
- Owns the skip list and implements the build-time extension point Spec_TextFinder.md §3.5 defines, not exposed at runtime.
- Passes the decoded arguments to `rust_textfinder_cmdline` to obtain a `ProgramCommands` value in which every switch already carries its supplied value or its default — the `.` root included, so the option listing has a root path to name whether or not `/P` was typed.
- Obtains `help_text()`, `usage_line()`, and `options_text(&commands)` from `rust_textfinder_cmdline`, which owns all three and fixes their text against Spec_TextFinder.md §5.1, §5.2, and §5.3 respectively.
- Constructs the process's one `StdoutSink`, and writes its own stdout text through that value rather than through a handle of its own.
- Constructs a `Dirnav`, generic over `StdoutSink`, borrowing the sink, the finalized skip list, and the parsed commands.
- Owns all three of those for the lifetime of the `Dirnav` value, which borrows them rather than cloning them.
- Drives traversal across every supplied root path using the single reused `Dirnav` value.
- Handles process-level concerns: the bare command line of Spec_TextFinder.md §3.1, `/H` help, the `/v` option listing, exit codes, and top-level diagnostics.

## 4. Startup Sequence

`fn main() -> ExitCode` performs the following steps in order.

1. Collect the arguments from `std::env::args_os` and decode each to a `String`. `std::env::args` is not used: it panics on an argument that is not valid Unicode, and a command line the user typed must not crash the program. An argument that cannot be decoded is reported per §6 and the binary exits with code `2`, having parsed nothing.
2. Invoke `rust_textfinder_cmdline`'s `parse` with the decoded arguments. On `Err`, write the returned usage diagnostic to stderr unaltered and exit with code `1`. A malformed `/r` is not detected here; step 8 reaches it.
3. Construct the `StdoutSink`. `StdoutSink::new` returns `None` when a sink already exists (Spec_Rust_TextFinder_Output.md §4); on `None`, write `cannot initialize output` to stderr and exit with code `2` — the code Spec_TextFinder.md §3.4 fixes for a failure that is not about the command line, and the failure that section names as its example. Every later write to stdout passes through this value, so it is constructed before any of them.
4. If the parsed commands indicate `/H true`, write `help_text()` through the sink with `write_text`, exit with code 0, and do not proceed.
5. If the argument list holds one element — the program name alone, with no switch following it — write `options_text(&commands)` through the sink, exit with code 0, and do not proceed. This is the bare command line of Spec_TextFinder.md §3.1, and it succeeds: nothing was asked for and nothing failed. `commands` here is `ProgramCommands::default()`, so the listing names every default and its `/v` line reads `false`, per Spec_TextFinder.md §5.3. The binary reads the list's length for this test and nothing else; it inspects no element of it.
6. If `/v true`, write `options_text(&commands)` through the sink, in the form Spec_TextFinder.md §5.3 fixes, before traversal begins. Steps 5 and 6 are mutually exclusive: a command line bearing `/v` is not bare.
7. Finalize the skip list: the defaults listed in §5 of this document with the extension calls compiled into the binary applied, then taken out of the cell that holds it into a local that outlives the traversal.
8. Construct the `Dirnav`, generic over `StdoutSink`, borrowing the sink, the finalized skip list, and the parsed commands. Regex compilation occurs here, and `Dirnav::new` returns `Err` when the `/r` expression will not compile. On that `Err`:
   1. If step 6 did not already write it, write `options_text(&commands)` through the sink now, so that the user sees the `/r` line carrying the expression that failed. Spec_TextFinder.md §5.2 requires this listing whatever `/v` says, and §5.3 requires it not be repeated when `/v` already produced it.
   2. Call `flush` on the sink, so that the listing reaches the stream ahead of the diagnostic that explains it. The sink buffers stdout without per-line flushing (Spec_Rust_TextFinder_Output.md §7), so without this the two arrive out of order.
   3. Compose the usage diagnostic in the shape Spec_TextFinder.md §5.2 binds — the reason line `invalid regex for switch: /r`, a newline, then `usage_line()` — and write it to stderr. §6 fixes that reason line for this implementation. The binary composes it; neither `rust_textfinder_cmdline` nor `rust_textfinder_dirnav` does, the former supplying only `usage_line()` and the latter only the failure that triggers it. The text the `regex` crate puts in its own error is not written, for a reason that outlives §5.2's wording: that text is the crate's, so a crate upgrade would change this program's output without any document in this tree recording the change.
   4. Exit with code `1`, having traversed nothing.
9. For each root path in the parsed commands, in the order `/P` gave them, invoke `search` on the same `Dirnav` value, then continue with the next root path. A root path that cannot be searched — unopenable, a symbolic link, or neither a regular file nor a directory — is announced by `rust_textfinder_dirnav` itself, per Spec_TextFinder.md §3.4; the binary neither formats nor inspects that notice, and no root-path outcome affects the exit code.
10. Return exit code 0.

Every exit above returns from `main`, never calling `std::process::exit`. The `StdoutSink` is a local of `main`, and only a return drops it and flushes its stdout buffer (Spec_Rust_TextFinder_Output.md §7). Steps 4, 5, and 8 each write to stdout and then leave, and `std::process::exit` would discard what they wrote.

The `Dirnav` borrows the sink for as long as it lives, so the sink cannot be written to directly while the `Dirnav` exists. Step 8 substep 1 therefore writes its listing before the `Dirnav` is constructed, or after the failed construction has released the borrow; either satisfies the borrow checker, and the specification requires only that the listing precede the diagnostic.

Nothing writes to stderr before stdout has been flushed. Steps 1 and 2 predate the sink and so have no buffer to flush; step 8 flushes explicitly. `rust_textfinder_output` applies the same rule to its own runtime notice, per Spec_Rust_TextFinder_Output.md §6.

Nothing in the sequence panics. No step calls `unwrap` or `expect`, and every failure it can meet resolves to a diagnostic and an exit code.

## 5. Skip List

`rust_textfinder_entry` owns the process-wide skip list. It is initialized with the defaults specified in Spec_TextFinder.md §3.2:

    archive, .git, .svn, .hg, build, out, target, bin, obj, __pycache__, node_modules

The binary holds the list in a `RefCell` and implements the extension point of Spec_TextFinder.md §3.5 with that section's own signature:

```rust
thread_local! {
    static SKIP_LIST: RefCell<SkipList> = RefCell::new(default_skip_list());
}

fn default_skip_list() -> SkipList;
fn add_skip_directory(name: &str);
```

`add_skip_directory` takes the name alone, as §3.5 writes it, and reaches the list through the cell. The interior mutability a `RefCell` supplies is what makes that possible without `unsafe` and without a synchronization primitive: the borrow is checked at run time rather than at compile time, and the check costs one integer comparison per call.

The declaration is a `thread_local!` rather than a plain `static`. A `static` must be `Sync`, and `RefCell` is deliberately not — its borrow flag is an ordinary integer rather than an atomic one. `thread_local!` carries no `Sync` bound, since each thread receives its own value, and that costs this binary nothing: the list is built before traversal begins and traversal runs on one thread.

Neither function is `pub`, and both are defined in the binary crate, so no library and no test can call them; the calls that extend the list are written into the binary's source and compiled with it. `add_skip_directory` ignores a name the list already holds.

Those calls run at step 7 of §4, which then takes the finished list out of the cell with `RefCell::take` and holds it in a local. That local is what the `Dirnav` borrows, so the borrow lasts the whole traversal rather than the body of a closure passed to `with`. The list is held as a `SkipList` (Spec_Rust_TextFinder_Dirnav.md §4) and borrowed by the `Dirnav`, which consults but never modifies it — a shared borrow, so that it cannot. Nothing extends the list once traversal has begun, and the binary reads no configuration file.

## 6. Exit Codes and Diagnostics

The three codes Spec_TextFinder.md §3.4 fixes map onto this binary's failure modes as follows. No other value is returned from `main`.

- Exit code 0: all startup steps and traversal completed; or `/H true` printed help; or the command line was bare and step 5 printed the option listing. Match count and unopenable root paths do not affect the exit code.
- Exit code 1: `rust_textfinder_cmdline` parsing failed, or `/r` was a malformed regex. Both are usage diagnostics, in the shape Spec_TextFinder.md §5.2 binds. Spec_Rust_TextFinder_Cmdline.md §6 fixes the six reason lines `parse` produces; this document fixes the seventh, `invalid regex for switch: /r`, since the binary is what writes it.
- Exit code 2: an argument could not be decoded, or `StdoutSink::new` returned `None`. Neither writes a usage line, since neither is a usage diagnostic. Their text is `invalid argument encoding: <token>` and `cannot initialize output`, fixed here, as Spec_TextFinder.md §2 and §5.2 leave every stderr wording to the implementation.
- Block lines, file announcements, and error announcements are all emitted through the `StdoutSink` by `rust_textfinder_dirnav`, in the forms and under the gating Spec_TextFinder.md §3.4 fixes. The binary formats none of them, including the error announcements about root paths it supplied. Diagnostics for the failure modes above are written to stderr by the binary, as §4 describes. A parse failure and a malformed regex are usage diagnostics, whose shape Spec_TextFinder.md §5.2 binds and whose wording this implementation fixes, here and in Spec_Rust_TextFinder_Cmdline.md §6. A test therefore compares that text against these two documents rather than against the parent, and not against another implementation, which is free to word it differently. Neither may its line terminator be compared across platforms: Spec_TextFinder.md §3.4 leaves stderr's terminator to the platform.
- Only one exit-code-1 path writes to stdout: the malformed regex, whose option listing step 8 requires. A parse failure leaves stdout empty, as do both code-2 failures, which occur before the sink exists or because it does not.

An undecodable argument takes code 2 rather than code 1, and the reason is worth recording, since either would look defensible. Spec_TextFinder.md §5.2 fixes no reason line for it — it cannot arise in an implementation whose argument vector carries bytes or ASCII — and §3.4 defines code 1 as the code that accompanies a §5.2 diagnostic. The binary cannot form the command line it would have to validate, so the failure precedes command-line validation rather than resulting from it. The binary writes `invalid argument encoding: <token>` to stderr and nothing else, with `<token>` rendered by `to_string_lossy`, the only rendering available for text that is not valid Unicode. That text is fixed here rather than in the parent specification, and it binds Rust alone, as §5.2's last paragraph permits for a failure that is not a usage diagnostic.

## 7. Build

Per [Rust_TextFinder_Structure.md](../Rust_TextFinder_Structure.md):

- Cargo binary package `rust_textfinder_entry`, producing the executable `rust_textfinder`.
- Depends on the three libraries and on the standard library. It declares no third-party crate; the `regex` dependency belongs to `rust_textfinder_dirnav`.

## 8. Non-Goals

- The binary does not maintain per-file state.
- The binary requires every argument to be valid Unicode. It takes `std::env::args_os` and decodes each argument, and an argument that will not decode is refused per §6. On Windows that admits any command line the shell can express, since the arguments arrive as UTF-16; on POSIX it refuses a path holding bytes that are not valid UTF-8. Spec_TextFinder.md §4 leaves the argument type and its encoding to this document, so this is a stated limit of the Rust implementation rather than a departure from the parent spec. It does mean this implementation accepts non-ASCII root paths and expressions the C++ implementation cannot carry, and refuses POSIX paths that the C++ implementation passes through as bytes.
- The binary does not read a configuration file, and offers no runtime means of extending the skip list (§5).
