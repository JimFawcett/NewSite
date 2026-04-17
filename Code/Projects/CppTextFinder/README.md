  # CppTextFinder

A command-line tool that walks a directory tree and reports files whose content
matches a regular expression.  Written in C++23 with named modules, built with
CMake 3.28+.

---

## Features

- Regex search over file contents (text and binary files)
- Recursive or single-directory walk
- File-extension filtering (e.g. search only `.cpp`, `.h`)
- Built-in skip list: `target`, `build`, `.git` are never entered
- Two output modes controlled by `/H`: real-time traversal vs. clean match-only output
- Summary line: files visited and files matched

---

## Command-Line Options

| Option | Meaning | Default |
|--------|---------|---------|
| `/P <path>` | Root directory to search | `.` (current directory) |
| `/p <ext,...>` | Comma-separated file extensions to include | all files |
| `/r <regex>` | Regular expression matched against file content | `.` (any content) |
| `/s` | Recurse into subdirectories | `true` |
| `/H` | `true`: print a directory only when it has a match (clean). `false`: print every directory as it is entered (real-time progress). | `true` |
| `/v` | Verbose — echo all options before searching | off |
| `/h` | Print help and exit | off |

**Example — find all `.cpp` files containing `std::regex` under the current tree:**

```
text_finder /P . /p .cpp /r "std::regex"
```

**Git Bash / MINGW note:** The shell converts `/P`, `/r`, etc. to Windows paths.
Prefix the command with `MSYS_NO_PATHCONV=1` to suppress this:

```bash
MSYS_NO_PATHCONV=1 ./build/EntryPoint/text_finder /P . /p .cpp /r "std::regex"
```

PowerShell and cmd.exe do not have this issue.

---

## Building

### Prerequisites

- CMake 3.28 or later
- A C++23-capable compiler with named-module support
  - **Windows:** Visual Studio 2022 (MSVC 19.41+) — recommended
  - **Linux/macOS:** Clang 17+ or GCC 14+ with Ninja

### Windows (Visual Studio 2022)

```powershell
cmake -S . -B build -G "Visual Studio 17 2022" -A x64
cmake --build build --config Release
```

The `text_finder` executable is placed under `build/EntryPoint/Release/`.

### Linux / macOS (Ninja)

```bash
cmake -S . -B build -G Ninja
cmake --build build
```

---

## Running Tests

```bash
ctest --test-dir build --output-on-failure
```

To run one component's tests in isolation:

```bash
ctest --test-dir build -R cmd_line_tests --output-on-failure
ctest --test-dir build -R dir_nav_tests  --output-on-failure
ctest --test-dir build -R output_tests   --output-on-failure
```

---

## Directory Layout

```
CppTextFinder/
├── Constitution.md         governing design document
├── Structure.md            C++/CMake implementation rules
├── CMakeLists.txt          top-level build file
├── generate_part.py        script: regenerate source files via Claude API
├── CommandLine/
│   ├── Spec.md
│   ├── Notes.md
│   ├── CMakeLists.txt
│   └── src/
│       ├── CmdLine.ixx     export module cmd_line;
│       └── test.cpp
├── DirNav/
│   ├── Spec.md
│   ├── Notes.md
│   ├── CMakeLists.txt
│   └── src/
│       ├── DirNav.ixx      export module dir_nav;
│       └── test.cpp
├── Output/
│   ├── Spec.md
│   ├── Notes.md
│   ├── CMakeLists.txt
│   └── src/
│       ├── Output.ixx      export module output;
│       └── test.cpp
└── EntryPoint/
    ├── Spec.md
    ├── Notes.md
    ├── CMakeLists.txt
    └── src/
        ├── main.cpp
        └── test.cpp
```

---

## Architecture

Three independent libraries, wired together only in `main.cpp`:

```
CommandLine   DirNav   Output
      \          |       /
           EntryPoint
```

- Libraries never import each other.
- `DirNav` fires events via `std::function` callbacks registered by `EntryPoint`.
- `Output` is a plain class with `on_dir()` and `on_file()` methods.

Default directories excluded from traversal: `target`, `build`, `.git`.

---

## Regenerating Source Files

The `generate_part.py` script calls the Claude API to regenerate any part from
its `Spec.md`:

```bash
# requires ANTHROPIC_API_KEY
python generate_part.py CommandLine
python generate_part.py DirNav
python generate_part.py Output
python generate_part.py EntryPoint
```

Each run overwrites the source files and appends a dated entry to the part's
`Notes.md`.
