# Spec_Cpp_TextFinder_Entry — Binary Entry Point Specification

Specification for the `Cpp_TextFinder_Entry` binary of the C++ TextFinder implementation. This document refines [Spec_TextFinder.md](../../Spec_TextFinder.md) and inherits structural decisions from [Cpp_TextFinder_Structure.md](../Cpp_TextFinder_Structure.md).

## 1. Purpose

`Cpp_TextFinder_Entry` is the command-line entry point of the C++ TextFinder. It parses invocation arguments, wires the three libraries together, and drives directory traversal. Matching and file I/O belong to `Cpp_TextFinder_Dirnav` and `Cpp_TextFinder_Output`; the binary performs neither.

The binary does write process-level text of its own — help, the resolved option listing, and startup diagnostics — but it composes none of it. Each is a string `Cpp_TextFinder_Cmdline` hands it, and the binary decides only when to write it and to which stream. Match blocks and announcements it neither composes nor writes.

## 2. Scope

This spec covers only the binary. Switch behavior is defined in the parent [Spec_TextFinder.md](../../Spec_TextFinder.md) §4–§5. Library behavior is specified in each library's own `Spec_*.md`.

## 3. Responsibilities

The binary:

- Imports `Cpp_TextFinder_Cmdline`, `Cpp_TextFinder_Dirnav`, and `Cpp_TextFinder_Output` as C++ modules, and the standard library via `import std;`.
- Owns the skip list and implements `addSkipDirectory` as the build-time extension point Spec_TextFinder.md §3.5 defines, not exposed at runtime.
- Passes `argc` and `argv` to `Cpp_TextFinder_Cmdline` to obtain a program-command `struct` in which every switch already carries its supplied value or its default — the `.` root included, so the option listing has a root path to name whether or not `/P` was typed.
- Obtains `helpText()`, `usageLine()`, and `optionsText(commands)` from `Cpp_TextFinder_Cmdline`, which owns all three and fixes their text against Spec_TextFinder.md §5.1, §5.2, and §5.3 respectively.
- Constructs a `Cpp_TextFinder_Output` instance, which takes no constructor arguments. Constructing it puts the process's stdout into the mode Spec_TextFinder.md §3.4 requires — an LF written verbatim, never translated to CRLF — so every subsequent write to stdout carries that terminator, the binary's own writes included. This is the one configuration `Cpp_TextFinder_Output` performs, and it is a side effect of construction rather than something the binary asks for.
- Constructs a `Cpp_TextFinder_Dirnav` instance, templated on the `Cpp_TextFinder_Output` type, taking the `Cpp_TextFinder_Output` instance, the finalized skip list, and the parsed commands as constructor arguments.
- Owns all three of those for the lifetime of the `Cpp_TextFinder_Dirnav` instance, which holds references to them rather than copies.
- Drives traversal across every supplied root path using the single reused `Cpp_TextFinder_Dirnav` instance.
- Handles process-level concerns: the bare command line of Spec_TextFinder.md §3.1, `/H` help, the `/v` option listing, exit codes, and top-level diagnostics.

## 4. Startup Sequence

`main(int argc, char* argv[])` performs the following steps in order:

1. Invoke `Cpp_TextFinder_Cmdline`'s parser with `argc` and `argv`. If parsing fails, write the returned usage diagnostic to stderr unaltered and exit with code `1`. A malformed `/r` is not detected here; step 7 reaches it.
2. Instantiate `Cpp_TextFinder_Output`, which takes no constructor arguments. If its constructor throws, write `cannot initialize output` to stderr and exit with code `2` — the code Spec_TextFinder.md §3.4 fixes for a failure that is not about the command line. Steps 3 through 5 write to stdout directly and step 8's search output reaches it through `Cpp_TextFinder_Output`; every one of them depends on this step having configured the stream, so nothing that writes to stdout may precede it. Help text in particular is written after this step and not before, or the fixed text of Spec_TextFinder.md §5.1 would carry CRLF on Windows while the rest of the program's stdout carried LF.
3. If the parsed commands indicate `/H true`, write `helpText()` to stdout, exit with code 0, and do not proceed.
4. If `argc` is 1 — the executable name alone, with no switch following it — write `optionsText(commands)` to stdout, exit with code 0, and do not proceed. This is the bare command line of Spec_TextFinder.md §3.1, and it succeeds: nothing was asked for and nothing failed. `commands` here is a default-constructed `ProgramCommands`, so the listing names every default and its `/v` line reads `false`, per Spec_TextFinder.md §5.3. The binary reads `argc` for this test and nothing else; it inspects no element of `argv`.
5. If `/v true`, write `optionsText(commands)` to stdout, in the form Spec_TextFinder.md §5.3 fixes, before traversal begins. Steps 4 and 5 are mutually exclusive: a command line bearing `/v` is not bare.
6. Finalize the skip list: begin with the defaults listed in §5 of this document, then apply the `addSkipDirectory` calls compiled into the binary.
7. Instantiate `Cpp_TextFinder_Dirnav<Cpp_TextFinder_Output>` with the `Cpp_TextFinder_Output` instance, the finalized skip list, and the parsed commands as constructor arguments. Regex compilation occurs here, and the constructor throws when the `/r` expression will not compile. On that throw:
   1. If step 5 did not already write it, write `optionsText(commands)` to stdout now, so that the user sees the `/r` line carrying the expression that failed. Spec_TextFinder.md §5.2 requires this listing whatever `/v` says, and §5.3 requires it not be repeated when `/v` already produced it.
   2. Flush stdout, so that the listing reaches the stream ahead of the diagnostic that explains it. `std::cerr` is unit-buffered and `Cpp_TextFinder_Output` buffers stdout without per-line flushing (Spec_Cpp_TextFinder_Output.md §7), so without this the two arrive out of order.
   3. Compose the usage diagnostic Spec_TextFinder.md §5.2 fixes — `invalid regex for switch: /r`, a newline, then `usageLine()` — and write it to stderr. The binary composes it; neither `Cpp_TextFinder_Cmdline` nor `Cpp_TextFinder_Dirnav` does, the former supplying only `usageLine()` and the latter only the failure that triggers it.
   4. Exit with code `1`, having traversed nothing.
8. For each root path in the parsed commands, in the order `/P` gave them, invoke the `Cpp_TextFinder_Dirnav` traversal entry on the same `Cpp_TextFinder_Dirnav` instance, then continue with the next root path. A root path that cannot be searched — unopenable, a symbolic link, or neither a regular file nor a directory — is announced by `Cpp_TextFinder_Dirnav` itself, per Spec_TextFinder.md §3.4; the binary neither formats nor inspects that notice, and no root-path outcome affects the exit code.
9. Return exit code 0.

Every exit above is a `return` from `main`, never a call to `std::exit`. The `Cpp_TextFinder_Output` instance constructed at step 2 is a local of `main`, and only a return destroys it and flushes its stdout buffer (Spec_Cpp_TextFinder_Output.md §7). Steps 3, 4, and 7 each write to stdout and then leave, and `std::exit` would discard what they wrote.

Nothing writes to stderr before stdout has been flushed. Step 1 predates the `Cpp_TextFinder_Output` instance and so has no buffer to flush; step 2 fails before one exists; step 7 flushes explicitly. `Cpp_TextFinder_Output` applies the same rule to its own runtime notice, per Spec_Cpp_TextFinder_Output.md §6.

## 5. Skip List

`Cpp_TextFinder_Entry` owns the process-wide skip list. It is initialized with the defaults specified in Spec_TextFinder.md §3.2:

    archive, .git, .svn, .hg, build, out, target, bin, obj, __pycache__, node_modules

The binary implements the `addSkipDirectory` of Spec_TextFinder.md §3.5 as

    void addSkipDirectory(const std::string& name);

a build-time extension point. It is defined in the binary's own translation unit and exported from nothing, so no library and no test can call it; the calls that extend the list are written into the binary's source and compiled with it. Duplicate entries are ignored.

Those calls run at step 6 of §4, before the list is handed to `Cpp_TextFinder_Dirnav`. The list is held as a `SkipList` (Spec_Cpp_TextFinder_Dirnav.md §4) and passed finalized to the `Cpp_TextFinder_Dirnav` constructor, which consults but never modifies it. Nothing extends the list once traversal has begun, and the binary reads no configuration file.

## 6. Exit Codes and Diagnostics

The three codes Spec_TextFinder.md §3.4 fixes map onto this binary's failure modes as follows. No other value is returned from `main`.

- Exit code 0: all startup steps and traversal completed; or `/H true` printed help; or the command line was bare and step 4 printed the option listing. Match count and unopenable root paths do not affect the exit code.
- Exit code 1: `Cpp_TextFinder_Cmdline` parsing failed, or `/r` was a malformed regex. Both are usage diagnostics.
- Exit code 2: `Cpp_TextFinder_Output` construction failed. This is the one failure mode of this binary that is not about the command line.
- Match blocks, file announcements, and error announcements are all emitted through `Cpp_TextFinder_Output` by `Cpp_TextFinder_Dirnav`, in the forms and under the gating Spec_TextFinder.md §3.4 fixes. The binary formats none of them, including the error announcements about root paths it supplied. Diagnostics for the three failure modes are written to stderr by the binary, as §4 describes. A parse failure and a malformed regex are usage diagnostics, whose text Spec_TextFinder.md §5.2 fixes byte for byte, the line terminator excepted — Spec_TextFinder.md §3.4 leaves stderr's terminator to the platform, so a test must not compare it across platforms; an output-construction failure is not about what the user typed, so it carries no usage line and takes the separate code above.
- Only one exit-code-1 path writes to stdout: the malformed regex, whose option listing step 7 requires. A parse failure leaves stdout empty, as does an output-construction failure, which exits before anything could be written there.

## 7. Build

Per [Cpp_TextFinder_Structure.md](../Cpp_TextFinder_Structure.md):

- CMake target producing the executable `Cpp_TextFinder`.
- `Cpp_TextFinder_Entry` is a conventional translation unit (not a module); consumes the three libraries via `import` and `std` via `import std;`.

## 8. Non-Goals

- The binary does not maintain per-file state.
- The binary does not support non-ASCII characters in argv: it takes `main`'s `char* argv[]`, and on Windows that system-codepage vector is not decoded to Unicode. Spec_TextFinder.md §4 leaves the argument type and its encoding to this document, so this is a stated limit of the C++ implementation rather than a departure from the parent spec. It does mean a root path or expression holding non-ASCII characters may reach this implementation differently than it reaches the Rust, C#, and Python ones.
- The binary does not read a configuration file, and offers no runtime means of extending the skip list (§5).
