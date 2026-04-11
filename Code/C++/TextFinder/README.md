# TextFinder

Recursively searches a directory tree for files whose content matches a
regular expression. C++23 port of
[RustTextFinder](../Projects/TextFinder1/RustTextFinder).

---

## Features

- Regex match against file content (binary-safe read)
- Filter by file extension (`/p cpp,h,ixx`)
- Optional recursion (`/s`) and directory hiding (`/H`)
- Regex compiled once per run — not per file

---

## Build

Requires CMake 3.30+, MSVC with C++23 support (VS 2022 17.5+).

```bat
cmake -S . -B build
cmake --build build --config Release
```

---

## Usage

```
TextFinder.exe /P <path> /p <exts> /r <regex> [/s true] [/H true] [/v] [/h]
```

| Option | Argument | Default | Meaning |
|--------|----------|---------|---------|
| `/P` | path | `.` | Root directory for search |
| `/p` | ext1,ext2 | *(all files)* | Comma-separated file extensions |
| `/r` | regex | `.` | Regular expression to match |
| `/s` | true/false | `true` | Recurse into subdirectories |
| `/H` | true/false | `true` | Hide directories with no matches |
| `/v` | | off | Print all parsed options |
| `/h` | | off | Print help and exit |

Running with no arguments prints the help message.
The `target` and `build` directories are always excluded.

### Examples

Search for `class` in all `.h` and `.ixx` files under the current tree:
```bat
TextFinder.exe /P . /p h,ixx /r class
```

Show all `.cpp` files without regex filtering (matches everything):
```bat
TextFinder.exe /P C:\src /p cpp /r .
```

Show every directory visited (no hiding):
```bat
TextFinder.exe /P . /r TODO /H false
```

---

## Architecture

Three C++23 named modules plus `main.cpp`:

```
CmdLine.ixx     — CmdLineParse: parses argc/argv into options and patterns
DirNav.ixx      — DirEvent interface + DirNav<App> template: walks the tree
TextFinder.ixx  — TextFinder (regex match) + TfAppl : DirEvent (output logic)
main.cpp        — wires the three modules together
```

### Module dependency graph

```
std  ──►  CmdLine
std  ──►  DirNav
std
DirNav ─► TextFinder
           │
CmdLine ───┤
DirNav  ───┤
TextFinder ┘
          main.cpp
```

### `CmdLine.ixx` — `CmdLineParse`

Parses `argc`/`argv` using `/X value` conventions.
- `value(char) -> optional<string>` — safe lookup, never throws
- `bool_value(char) -> bool` — convenience wrapper for true/false options
- `abs_path()` — canonicalises and normalises separators to `/`

### `DirNav.ixx` — `DirEvent` + `DirNav<App>`

`DirEvent` is a pure-virtual interface:
```cpp
virtual void do_dir (const std::string& dir)  = 0;
virtual void do_file(const std::string& file) = 0;
virtual void hide   (bool)                    {}  // optional hook
```

`DirNav<App>` (requires `App : DirEvent`) walks the tree with
`std::filesystem::directory_iterator`. Calling `hide(bool)` propagates
the flag to `app_.hide()` automatically — no manual sync required.

### `TextFinder.ixx` — `TextFinder` + `TfAppl`

`TextFinder` compiles the regex once (in `regex()`) and reuses it across
all `find()` calls. Files are read in binary mode; read errors and invalid
regexes return `false` rather than throwing.

`TfAppl` implements `DirEvent` and owns a `TextFinder`. It prints matching
file names and, when in hide mode, defers directory headers until the first
match in each directory.

---

## Source

C++23 port of `Code/Projects/TextFinder1/RustTextFinder`.  
Author: Jim Fawcett — https://JimFawcett.github.io
