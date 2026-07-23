# CodeMetrics

A code metrics and benchmarking workspace. The root-level Python scripts measure and time multiple language implementations of two projects — TextFinder and PageValidator — that serve as test subjects.

## Tools

### code_metrics.py

Walks a directory tree and reports two metrics per source file:
- **Lines** — total line count (code + comments + blanks)
- **Scopes** — scope-opening tokens (`{` for C-family; line-ending `:` for Python)

```
python code_metrics.py [path] [--html] [--html-only] [--no-recurse]
```

Output is a text table or HTML table (for embedding in site pages) with per-file rows and a grand total.

### tf_timer.py

Benchmark harness for the five TextFinder implementations. Runs a warm-up, discards it, then reports min/median/max wall time over N runs.

```
python tf_timer.py
```

Targets: `PyTextFinder`, `CsTextFinder`, `CppTextFinder`, `RustTextFinder`, `RustTextFinderOpt`.

### pa_timer.py

Benchmark harness for the four PageValidator implementations. Same warm-up/discard approach as `tf_timer.py`.

```
python pa_timer.py
```

Targets: `PyPageValidator`, `CsPageValidator`, `CppPageValidator`, `rs_page_validator`.

---

## Test Projects

### TextFinder

Recursively searches a directory tree for files whose contents match a regex. Five implementations sharing the same three-module architecture: CommandLine, DirNav, Output.

| Implementation | Language | Build |
|---|---|---|
| `PyTextFinder` | Python 3 | none |
| `CsTextFinder` | C# / .NET 10 | `dotnet build` in `EntryPoint/` |
| `CppTextFinder` | C++23 / CMake | `cmake -B build && cmake --build build` |
| `RustTextFinder` | Rust | `cargo build` in `RustTextFinder/` |
| `rs_textfinder_opt` | Rust (optimized) | `cargo build` in `rs_textfinder_opt/` |

CLI (all implementations):

```
<program> /P <path> /r <regex> [/p <file-pattern>] [/s] [/H] [/v]
```

### PageValidator

Validates HTML files for structural correctness — doctype, tag nesting, void elements, attribute quoting, duplicate IDs. Four implementations sharing the same three-stage pipeline: Tokenizer, Lexer, Validator.

| Implementation | Language | Build |
|---|---|---|
| `PyPageValidator` | Python 3 | none |
| `CsPageValidator` | C# / .NET 10 | `dotnet build` in `EntryPoint/` |
| `CppPageValidator` | C++23 / CMake | `cmake -B build && cmake --build build` |
| `rs_page_validator` | Rust | `cargo build` in `entry_point/` |

CLI (all implementations):

```
<program> <path> [-r] [-q] [-s]
```

---

## Skipped Directories (code_metrics.py)

`bin`, `obj`, `target`, `build`, `out`, `__pycache__`, `.venv`, `venv`, `dist`, `.git`, `.vs`, `.idea`, `archive`

## Dependencies

- Python scripts: standard library only, Python 3.9+
- C# projects: .NET 10 SDK
- C++ projects: CMake 3.x, C++23-capable compiler
- Rust projects: Rust 2021 edition, Cargo

---

## Example Output

```
python code_metrics.py TextFinder/CppTextFinder
```

```
+-----------------------------+-------+--------+
| File                        | Lines | Scopes |
+-----------------------------+-------+--------+
| CommandLine\src\CmdLine.ixx | 126   | 29     |
| CommandLine\src\test.cpp    | 225   | 79     |
| DirNav\src\DirNav.ixx       | 126   | 19     |
| DirNav\src\test.cpp         | 491   | 82     |
| EntryPoint\src\main.cpp     | 67    | 8      |
| EntryPoint\src\test.cpp     | 435   | 59     |
| generate_part.py            | 339   | 28     |
| Output\src\Output.ixx       | 110   | 17     |
| Output\src\test.cpp         | 469   | 70     |
+-----------------------------+-------+--------+
| TOTAL                       | 2388  | 391    |
+-----------------------------+-------+--------+
```
