# Spec_Cpp_TextFinder_Entry — Binary Entry Point Specification

Specification for the `Cpp_TextFinder_Entry` binary of the C++ TextFinder implementation. This document refines [Spec_TextFinder.md](../../Spec_TextFinder.md) and inherits structural decisions from [Cpp_TextFinder_Structure.md](../Cpp_TextFinder_Structure.md).

## 1. Purpose

`Cpp_TextFinder_Entry` is the command-line entry point of the C++ TextFinder. It parses invocation arguments, wires the three libraries together, and drives directory traversal. It contains no matching, no file I/O, and no formatting logic; those responsibilities belong to `Cpp_TextFinder_Dirnav` and `Cpp_TextFinder_Output`.

## 2. Scope

This spec covers only the binary. Switch behavior is defined in the parent [Spec_TextFinder.md](../../Spec_TextFinder.md) §4–§5. Library behavior is specified in each library's own `Spec_*.md`.

## 3. Responsibilities

The binary:

- Imports `Cpp_TextFinder_Cmdline`, `Cpp_TextFinder_Dirnav`, and `Cpp_TextFinder_Output` as C++ modules, and the standard library via `import std;`.
- Owns the skip list and implements `addSkipDirectory` as a code-level extension point (not exposed at runtime).
- Passes `argc` and `argv` to `Cpp_TextFinder_Cmdline` to obtain a program-command `struct`.
- Constructs a `Cpp_TextFinder_Output` instance, which takes no configuration.
- Constructs a `Cpp_TextFinder_Dirnav` instance, templated on the `Cpp_TextFinder_Output` type, taking the `Cpp_TextFinder_Output` instance, the finalized skip list, and the parsed commands as constructor arguments.
- Owns all three of those for the lifetime of the `Cpp_TextFinder_Dirnav` instance, which holds references to them rather than copies.
- Drives traversal across every supplied root path using the single reused `Cpp_TextFinder_Dirnav` instance.
- Handles process-level concerns: `/H` help, `/v` option listing, exit codes, and top-level diagnostics.

## 4. Startup Sequence

`main(int argc, char* argv[])` performs the following steps in order:

1. Invoke `Cpp_TextFinder_Cmdline`'s parser with `argc` and `argv`. If parsing fails, write the returned usage diagnostic to stderr unaltered and exit with code `1`.
2. If the parsed commands indicate `/H true`, write `helpText()` to stdout, exit with code 0, and do not proceed.
3. Instantiate `Cpp_TextFinder_Output`, which takes no constructor arguments. If its constructor throws, write `cannot initialize output` to stderr and exit with code `1`.
4. If `/v true`, write `optionsText(commands)` to stdout — one key/value pair per line — before traversal begins. This follows step 3 so that `Cpp_TextFinder_Output` has already configured stdout, and the listing carries the same line terminator as the records after it.
5. Finalize the skip list: begin with the defaults from §5, then apply any `addSkipDirectory` calls compiled into the binary.
6. Instantiate `Cpp_TextFinder_Dirnav<Cpp_TextFinder_Output>` with the `Cpp_TextFinder_Output` instance, the finalized skip list, and the parsed commands as constructor arguments. Regex compilation occurs here; a malformed `/r` argument is an invalid command argument — write the usage diagnostic Spec_TextFinder.md §5.2 fixes for it, `invalid regex for switch: /r` followed by a newline and `usageLine()`, to stderr and exit with code `1`.
7. For each root path collected from `/P` (in the order given, defaulting to `.` when `/P` is omitted), invoke the `Cpp_TextFinder_Dirnav` traversal entry on the same `Cpp_TextFinder_Dirnav` instance, then continue with the next root path. A root path that cannot be searched — unopenable, a symbolic link, or neither a regular file nor a directory — is announced by `Cpp_TextFinder_Dirnav` itself, per Spec_TextFinder.md §3.4; the binary neither formats nor inspects that notice, and no root-path outcome affects the exit code.
8. Return exit code 0.

## 5. Skip List

`Cpp_TextFinder_Entry` owns the process-wide skip list. It is initialized with the defaults specified in Spec_TextFinder.md §3.2:

    archive, .git, .svn, .hg, build, out, target, bin, obj, __pycache__, node_modules

The binary implements the `addSkipDirectory` of Spec_TextFinder.md §3.5 as

    void addSkipDirectory(const std::string& name);

a code-level extension point, not exposed at runtime. Duplicate entries are ignored. The list is held as a `SkipList` (Spec_Cpp_TextFinder_Dirnav.md §4) and passed finalized to the `Cpp_TextFinder_Dirnav` constructor, which consults but never modifies it.

## 6. Exit Codes and Diagnostics

- Exit code 0: all startup steps and traversal completed, or `/H true` printed help. Match count and unopenable root paths do not affect the exit code.
- Exit code 1: `Cpp_TextFinder_Cmdline` parsing failed, `/r` was a malformed regex, or `Cpp_TextFinder_Output` construction failed.
- Match records, file announcements, and error announcements are all emitted through `Cpp_TextFinder_Output` by `Cpp_TextFinder_Dirnav`, in the forms and under the gating Spec_TextFinder.md §3.4 fixes. The binary formats none of them, including the error announcements about root paths it supplied. Diagnostics for the three failure modes are written to stderr by the binary, as §4 describes. A parse failure and a malformed regex are usage diagnostics, whose text Spec_TextFinder.md §5.2 fixes byte for byte; an output-construction failure is not about what the user typed, so it carries no usage line.

## 7. Build

Per [Cpp_TextFinder_Structure.md](../Cpp_TextFinder_Structure.md):

- CMake target producing the executable `Cpp_TextFinder`.
- `Cpp_TextFinder_Entry` is a conventional translation unit (not a module); consumes the three libraries via `import` and `std` via `import std;`.

## 8. Non-Goals

- The binary does not maintain per-file state.
- The binary does not support non-ASCII characters in argv (on Windows, system-codepage `argv` is not decoded to Unicode).
