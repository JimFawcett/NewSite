# constitution.md — TextFinder C++ Project

## Purpose

`TextFinder` is a CLI tool that recursively searches a directory tree for files
whose content matches a regular expression. It is a C++17 port of the Rust
`RustTextFinder` crate found in `Code/Projects/TextFinder1/RustTextFinder`.

---

## CLI Options

| Flag | Argument       | Default       | Meaning                               |
|------|----------------|---------------|---------------------------------------|
| `/P` | path           | `.`           | Root directory for search             |
| `/p` | ext1,ext2,...  | *(all files)* | Comma-separated file extensions       |
| `/r` | regex          | `.`           | Regular expression to match           |
| `/s` | true/false     | `true`        | Recurse into subdirectories           |
| `/H` | true/false     | `true`        | Hide directories with no matches      |
| `/v` | *(flag)*       | off           | Print all parsed options before search|
| `/h` | *(flag)*       | off           | Print help and exit                   |

Running with no arguments, or with `/h`, prints the help message and exits.
The directory named `target` is always excluded from traversal.

---

## Architecture

Three single-header components plus `main.cpp`:

```
TextFinder/
  CmdLine.h       — command-line parser (CmdLineParse class)
  DirNav.h        — directory navigator (DirEvent interface + DirNav<App> template)
  TextFinder.h    — search engine (TextFinder class + TfAppl : DirEvent)
  main.cpp        — wires the three components together
  CMakeLists.txt  — CMake build (C++17, MSVC console app)
```

### CmdLine.h — `CmdLineParse`

Parses `argc`/`argv` into a `map<char, string>` options map and a
`vector<string>` patterns list. Mirrors `cmd_line_lib::CmdLineParse`.

Key methods: `parse()`, `default_options()`, `contains_option(char)`,
`value(char)`, `abs_path()`, `get_regex()`, `patterns()`.

### DirNav.h — `DirEvent` + `DirNav<App>`

`DirEvent` is a pure-virtual interface with two callbacks:

```cpp
virtual void do_dir(const std::string& d) = 0;   // called on each directory
virtual void do_file(const std::string& f) = 0;  // called on each matched file
```

`DirNav<App>` is a C++17 template (requires `App : DirEvent`) that uses
`std::filesystem::directory_iterator` for traversal. It mirrors
`dir_nav_lib::DirNav<App: DirEvent>`.

Key methods: `add_skip(string)`, `add_pat(string)`, `recurse(bool)`,
`hide(bool)`, `get_app()`, `get_dirs()`, `get_files()`, `visit(path)`.

### TextFinder.h — `TextFinder` + `TfAppl`

`TextFinder` reads a file as binary, converts to string, then applies
`std::regex_search`. Returns `false` on I/O error or invalid regex.

`TfAppl` owns a `TextFinder` instance and implements `DirEvent`:
- `do_dir` — saves current directory; prints it immediately if `hide` is false.
- `do_file` — builds fully-qualified path, calls `tf.find()`, prints directory
  (if hidden and first match there) then filename on a match.

### main.cpp

1. Parse options (`CmdLineParse`).
2. Print help and exit if no args or `/h` present.
3. Create `DirNav<TfAppl>`, skip `"target"` directory.
4. Apply `/s` (recurse) and `/H` (hide) flags.
5. Set regex and file-extension patterns.
6. Call `verbose()` to display search parameters.
7. Call `dn.visit(path)`.
8. Print totals.

---

## Design Decisions

- **Header-only components** (`CmdLine.h`, `DirNav.h`, `TextFinder.h`): consistent
  with the existing C++ projects in this repo (`DirNav/WinDirTraversal.h`, etc.)
  and avoids a separate compilation step for small utilities.

- **`std::regex`**: uses the C++11 standard library regex engine. No third-party
  dependency (replaces the Rust `regex` crate).

- **`std::filesystem`** (C++17): replaces Rust's `std::fs` and the `rust_dir_nav`
  crate's `DirEntry` / `Path` types.

- **`DirEvent` abstract class** instead of a Rust trait: C++ uses virtual dispatch.
  `DirNav<App>` is still templated (same as Rust) so the compiler can inline
  `do_dir`/`do_file` calls; the `static_assert` enforces the constraint.

- **Binary file reading**: files are opened in binary mode so that non-UTF-8
  content does not cause an exception (matches Rust's lossy UTF-8 fallback).

- **Path separator**: backslashes are replaced with forward slashes before
  printing, matching the Rust implementation's `replace_sep()` behaviour.

---

## Build

```bash
cmake -S . -B build
cmake --build build --config Release
./build/Release/TextFinder.exe /P .. /p "cpp,h" /r "struct" /H true /s true
```

Requires: CMake 3.15+, MSVC (or any C++17 compiler on Windows).
