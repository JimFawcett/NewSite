# Projects

Multi-language implementations of software tools, built to the same design and command-line interface so the languages can be compared side-by-side.

---

## TextFinder Projects

Each TextFinder variant walks a directory tree and reports files whose content matches a regular expression. All four share the same command-line interface and three-component architecture (`CommandLine`, `DirNav`, `Output`/`TextFinder`) wired together in an entry point.

| Project | Language | Build tool | Entry point |
|---------|----------|------------|-------------|
| [CppTextFinder](CppTextFinder/) | C++23 (named modules) | CMake 3.28+ / MSVC or Clang | `build/EntryPoint/Release/text_finder` |
| [CsTextFinder](CsTextFinder/) | C# / .NET 10 | dotnet CLI | `CsTextFinder.exe` |
| [PyTextFinder](PyTextFinder/) | Python 3.10+ | none | `python EntryPoint/PyTextFinder.py` |
| [rs_textfinder](rs_textfinder/) | Rust (Cargo workspace) | cargo | `cargo run` from `RustTextFinder/` |

### Shared Command-Line Interface

| Option | Meaning | Default |
|--------|---------|---------|
| `/P <path>` | Root directory to search | `.` (current directory) |
| `/p <ext,...>` | File extensions to include (comma-separated) | all files |
| `/r <regex>` | Regular expression matched against file content | `.` (any) |
| `/s` | Recurse into subdirectories | `true` |
| `/H` | `true`: show only directories with matches. `false`: show every directory entered. | `true` |
| `/v` | Verbose — echo all options before searching | off |
| `/h` | Print help and exit | off |

Both `/` and `-` flag prefixes are accepted (use `-` in Git Bash to avoid path conversion).

**Example — find `.cs` files containing `Action` starting from the current directory:**

```
CsTextFinder /P . /p cs /r "Action"
```

### Shared Architecture

```
CommandLine   DirNav   Output
      \          |       /
           EntryPoint
```

- `CommandLine` — parses `/Key [Value]` tokens from `argv`
- `DirNav` — depth-first directory walk; fires callbacks on each directory and file
- `Output` / `TextFinder` — performs the regex match and writes results to the console
- `EntryPoint` — wires the three components together; no direct cross-dependencies between them

### Source Regeneration

Each project contains a `generate_part.py` script that calls the Claude API to regenerate any component from its `Spec.md`:

```bash
# requires ANTHROPIC_API_KEY
python generate_part.py CommandLine
python generate_part.py DirNav
python generate_part.py Output
python generate_part.py EntryPoint
```

### Skip Lists

`DirNav` in every variant maintains a hard-coded skip list — a set of directory names that are never entered during traversal. This prevents the tool from wading through build artifacts and caches that are rarely useful to search and can be enormous.

| Language / tool | Skipped directory names |
|-----------------|-------------------------|
| C# / .NET | `bin`, `obj` |
| Rust | `target` |
| C++ | `build`, `out` |
| Python | `__pycache__`, `.venv`, `venv`, `dist` |
| VCS / IDE | `.git`, `.vs`, `.idea` |
| Archives | `archive` |

Skip list entries are matched against the bare directory name, not the full path, so a `bin` folder at any depth is skipped regardless of where it appears in the tree.

---

## Code Quality

All four TextFinder implementations have been reviewed for code smells and non-idiomatic usage. Each project carries unit tests for its `CommandLine`, `DirNav`, and `Output` components, plus integration tests exercised through the `EntryPoint` — all tests pass.

---

## Size and Complexity

Metrics collected by `code_metrics.py`. **Lines** = total line count; **Scopes** = count of `{` (brace languages) or lines ending with `:` (Python), both measuring nesting depth / branching density.

### CppTextFinder

| File | Lines | Scopes |
|------|------:|-------:|
| CommandLine\src\CmdLine.ixx | 126 | 29 |
| CommandLine\src\test.cpp | 225 | 79 |
| DirNav\src\DirNav.ixx | 126 | 19 |
| DirNav\src\test.cpp | 491 | 82 |
| EntryPoint\src\main.cpp | 67 | 8 |
| EntryPoint\src\test.cpp | 435 | 59 |
| generate_part.py | 339 | 28 |
| Output\src\Output.ixx | 110 | 17 |
| Output\src\test.cpp | 469 | 70 |
| **TOTAL** | **2388** | **391** |

### CsTextFinder

| File | Lines | Scopes |
|------|------:|-------:|
| CommandLine\CmdLine.cs | 91 | 11 |
| CommandLine\Test.cs | 50 | 12 |
| DirNav\DirNav.cs | 87 | 16 |
| DirNav\Test.cs | 184 | 47 |
| EntryPoint\Program.cs | 57 | 14 |
| EntryPoint\Test.cs | 138 | 35 |
| generate_part.py | 159 | 14 |
| Output\Output.cs | 66 | 20 |
| Output\Test.cs | 166 | 37 |
| **TOTAL** | **998** | **206** |

### PyTextFinder

| File | Lines | Scopes |
|------|------:|-------:|
| CommandLine\cmd_line.py | 90 | 20 |
| CommandLine\test_cmd_line.py | 70 | 20 |
| DirNav\dir_nav.py | 80 | 23 |
| DirNav\test_dir_nav.py | 153 | 35 |
| EntryPoint\PyTextFinder.py | 70 | 9 |
| EntryPoint\test_main.py | 115 | 35 |
| generate_part.py | 156 | 12 |
| Output\output.py | 57 | 20 |
| Output\test_output.py | 114 | 33 |
| **TOTAL** | **905** | **207** |

### RustTextFinder

| File | Lines | Scopes |
|------|------:|-------:|
| RustCmdLine\examples\test1.rs | 43 | 15 |
| RustCmdLine\src\cmd_line_lib.rs | 242 | 52 |
| RustDirNav\examples\test1.rs | 77 | 14 |
| RustDirNav\src\dir_nav_lib.rs | 294 | 53 |
| RustTextFinder\src\text_finder.rs | 297 | 77 |
| RustTfVerify\src\main.rs | 760 | 137 |
| **TOTAL** | **1715** | **348** |

---

## Timing

Search root: `NewSite`, extensions: `py js ts jsx tsx cpp c h hpp ixx cs rs`, content regex: `class`.

| TextFinder     | Files Visited | Files Matched | Elapsed (s) |
|----------------|--------------:|--------------:|------------:|
| PyTextFinder   |          1156 |           634 |       0.283 |
| CsTextFinder   |          1156 |           634 |       0.886 |
| CppTextFinder  |          1156 |           634 |       0.531 |
| RustTextFinder |          1156 |           634 |       0.677 |

All four agree on 634 matched.

### Why Python leads despite being interpreted

The workload is almost entirely **I/O-bound**. Every implementation spends most of its time in OS calls — `readdir`, `open`, `read` — which cost the same in every language because they all wait on the same kernel. The language overhead only applies to the thin control-flow glue between those calls.

Python's hot path is **C**. `os.scandir()`, `open()`, `file.read()`, and `re.search()` are all C extensions. Python only interprets the few lines of logic between them, so its "interpreted overhead" is nearly invisible for this workload.

**C++ `std::regex` is notoriously slow.** Its DFA construction is deferred to match time and not cached between calls, so every `std::regex_search` rebuilds work that Python's compiled `re` object caches once. This alone explains why C++ trails Python despite generating native code.

**C# pays .NET startup cost.** The runtime and JIT spin up before the first directory is touched — a large fraction of total elapsed time for a short-running tool.

**Rust is genuinely fast** — its `regex` crate is excellent — but per-file `read_to_string` with a UTF-8 fallback copy adds allocations that Python avoids by reading directly into a Python string buffer.

The rule of thumb: *interpreted vs. compiled matters for CPU-bound loops*. For I/O-bound tools with C-backed standard libraries, Python competes on equal terms and often wins against languages with heavyweight runtimes (C#) or slow standard-library implementations (C++ `std::regex`).

---

## Other Contents

| Path | Description |
|------|-------------|
| [TextFinder.md](TextFinder.md) | Top-level feature overview and usage summary |
| [documents/](documents/) | Shared design documents and notes |
| [archive/](archive/) | Earlier drafts and experimental versions |
