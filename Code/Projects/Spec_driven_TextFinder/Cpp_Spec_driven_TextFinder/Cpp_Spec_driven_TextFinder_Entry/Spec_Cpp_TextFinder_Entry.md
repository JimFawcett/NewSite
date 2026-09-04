# Spec_Cpp_TextFinder_Entry — Binary Entry Point Specification

Specification for the `Cpp_TextFinder_Entry` binary of the C++ TextFinder implementation. This document refines [Spec_TextFinder.md](../../Spec_TextFinder.md) and inherits structural decisions from [Cpp_Structure.md](../Cpp_Structure.md).

## 1. Purpose

`Cpp_TextFinder_Entry` is the command-line entry point of the C++ TextFinder. It parses invocation arguments, wires the three libraries together, and drives directory traversal. It contains no matching, no file I/O, and no formatting logic; those responsibilities belong to `Cpp_Dirnav` and `Cpp_Output`.

## 2. Scope

This spec covers only the binary. Switch behavior is defined in the parent [Spec_TextFinder.md](../../Spec_TextFinder.md) §4–§5. Library behavior is specified in each library's own `Spec_*.md`.

## 3. Responsibilities

The binary:

- Imports `Cpp_Cmdline`, `Cpp_Dirnav`, and `Cpp_Output` as C++ modules, and the standard library via `import std;`.
- Owns the skip list and implements `addSkipDirectory` as a code-level extension point (not exposed at runtime).
- Passes `argc` and `argv` to `Cpp_Cmdline` to obtain a program-command `struct`.
- Constructs a `Cpp_Output` instance, passing formatting information from the parsed commands.
- Constructs a `Cpp_Dirnav` instance, templated on the `Cpp_Output` type, taking the `Cpp_Output` instance and the finalized skip list as constructor arguments.
- Drives traversal across every supplied root path using the single reused `Cpp_Dirnav` instance.
- Handles process-level concerns: `/H` help, `/v` option listing, exit codes, and top-level diagnostics.

## 4. Startup Sequence

`main(int argc, char* argv[])` performs the following steps in order:

1. Invoke `Cpp_Cmdline`'s parser with `argc` and `argv`. If parsing fails, write a usage diagnostic to stderr and exit with code `1`.
2. If the parsed commands indicate `/H true`, write the help text to stdout, exit with code 0, and do not proceed.
3. If `/v true`, write the resolved option set to stdout, one key/value pair per line, before traversal begins.
4. Instantiate `Cpp_Output`, passing formatting information derived from the parsed commands to its constructor. If construction fails, write a diagnostic to stderr and exit with code `1`.
5. Finalize the skip list: begin with the defaults from §5, then apply any `addSkipDirectory` calls compiled into the binary.
6. Instantiate `Cpp_Dirnav<Cpp_Output>` with the `Cpp_Output` instance, the finalized skip list, and the parsed commands as constructor arguments. Regex compilation occurs here; a malformed `/r` argument is classified as an invalid command argument — write a usage diagnostic to stderr and exit with code `1`.
7. For each root path collected from `/P` (in the order given, defaulting to `.` when `/P` is omitted), invoke the `Cpp_Dirnav` traversal entry on the same `Cpp_Dirnav` instance. If a root path cannot be opened, pass the string `cannot open [path]` (with the actual path substituted) to `Cpp_Output` for display and continue with the next root path; unopenable root paths do not affect the exit code.
8. Return exit code 0.

## 5. Skip List

`Cpp_TextFinder_Entry` owns the process-wide skip list. It is initialized with the defaults specified in Spec_TextFinder.md §3.2:

    archive, .git, .svn, .hg, build, out, target, bin, obj, __pycache__, node_modules

The binary implements `addSkipDirectory(name)` (Spec_TextFinder.md §3.5) as a code-level extension point — not exposed at runtime. Duplicate entries are ignored. The finalized list is a constructor argument to `Cpp_Dirnav`, which consults but never modifies it.

## 6. Multi-Path Handling

Per Spec_TextFinder.md §3.2 and §5, `/P` may appear multiple times and each occurrence adds a root path. `Cpp_TextFinder_Entry` preserves argv order when collecting root paths and drives traversal against them in that order using a single reused `Cpp_Dirnav` instance; the regex state machine compiled at Dirnav construction is reused across all roots. When no `/P` is supplied, the single default root path `.` is used.

## 7. Exit Codes and Diagnostics

- Exit code 0: all startup steps and traversal completed, or `/H true` printed help. Match count and unopenable root paths do not affect the exit code.
- Exit code 1: `Cpp_Cmdline` parsing failed, `/r` was a malformed regex, or `Cpp_Output` construction failed.
- Match records are always emitted through `Cpp_Output`. Per-file announcements — emitted by `Cpp_Dirnav` — also flow through `Cpp_Output`: under `/h true` (the default), no announcement is emitted for files without matches; under `/h false`, every file examined is announced through `Cpp_Output` regardless of match state. Unopenable-path notices are formatted by the binary as `cannot open [path]` and passed to `Cpp_Output` for display. Usage diagnostics (invalid command line, malformed regex, `Cpp_Output` construction failure) are written to stderr by the binary.

## 8. Build

Per [Cpp_Structure.md](../Cpp_Structure.md):

- Language: C++23.
- Build system: CMake target that produces the executable `Cpp_TextFinder`.
- `Cpp_TextFinder_Entry` is a conventional translation unit (not a module); consumes the three libraries via `import` and `std` via `import std;`.
- Toolchain minimums for C++ Modules with `import std;`: GCC 14+, Clang 17+, or MSVC 19.36+ (Visual Studio 2022 17.6+). CMake 3.28+ recommended for module support.

## 9. Non-Goals

- The binary does not open, read, or parse file contents.
- The binary does not evaluate the regular expression.
- The binary does not format match output.
- The binary does not maintain per-file state.
- The binary does not support non-ASCII characters in argv (on Windows, system-codepage `argv` is not decoded to Unicode).
