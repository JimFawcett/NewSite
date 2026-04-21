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

Search root: `NewSite`, extensions: `py js ts jsx tsx cpp c h hpp ixx cs rs`, content regex: `class`. Each elapsed time is the minimum of three consecutive warm-cache runs.

| TextFinder        | Files Visited | Files Matched | Elapsed (s) |
|-------------------|--------------:|--------------:|------------:|
| PyTextFinder      |          1166 |           634 |       0.269 |
| CsTextFinder      |          1166 |           634 |       1.076 |
| CppTextFinder     |          1166 |           634 |       0.612 |
| RustTextFinder    |          1166 |           634 |       0.905 |
| RustTextFinderOpt |          1166 |           634 |       0.713 |

All five agree on 634 matched.

### Why Python leads despite being interpreted

The workload is almost entirely **I/O-bound**. Every implementation spends most of its time in OS calls — `readdir`, `open`, `read` — which cost the same in every language because they all wait on the same kernel. The language overhead only applies to the thin control-flow glue between those calls.

Python's hot path is **C**. `os.scandir()`, `open()`, `file.read()`, and `re.search()` are all C extensions. Python only interprets the few lines of logic between them, so its "interpreted overhead" is nearly invisible for this workload.

**C++ `std::regex` is notoriously slow.** The compiled regex object is cached across calls, so the pattern is only built once — but `std::regex_search` itself uses a backtracking NFA engine that rescans the input on every match attempt. Python's `re` and Rust's `regex` crate both use DFA-based engines that scan in a single linear pass, which is why they pull ahead despite the C++ binary being native code. The standard fix is to swap `std::regex` for Google's RE2 library, which uses a DFA and would likely bring CppTextFinder into the same performance class as Python and Rust. RE2 was not adopted here because it is a third-party dependency not available in the C++ standard library.

**C# pays .NET startup cost.** The runtime and JIT spin up before the first directory is touched — a large fraction of total elapsed time for a short-running tool.

**Rust is genuinely fast** — its `regex` crate is excellent — but the baseline `RustTextFinder` has two inefficiencies that `RustTextFinderOpt` corrects.

### RustTextFinderOpt — optimization steps

Three changes were investigated; only the third produced a clear gain.

**Step 1 — pre-compile the regex (no measurable gain).** The baseline compiles `regex::Regex::new(&self.re_str)` inside `find()`, once per file. The fix stores a compiled `Option<regex::Regex>` in the struct and compiles it once in the `regex()` setter. Elapsed time was unchanged. The `regex` crate's DFA construction is fast enough that it does not dominate per-file cost.

**Step 2 — search raw bytes instead of UTF-8 strings (minor gain).** The baseline reads each file with `read_to_string` (UTF-8 validation + heap allocation), then falls back to `read → String::from_utf8_lossy().to_string()` (a second allocation) for files that fail UTF-8 decoding. The fix switches to `regex::bytes::Regex`, reads every file as raw bytes with a thread-local reused buffer, and matches directly on `&[u8]` — no UTF-8 conversion at all. This eliminates the double-allocation fallback path but the overall gain was small because most files decode as valid UTF-8 on the first attempt.

**Step 3 — use `DirEntry::file_type()` instead of `Path::is_dir()` (dominant gain).** The baseline calls `path.is_dir()` for every entry inside the directory scan loop. `is_dir()` on a `Path` issues a separate `stat` syscall to query the file type — one extra kernel round-trip per entry. `DirEntry::file_type()`, by contrast, returns the type already cached by the OS as part of the `readdir` response; no extra syscall is needed. Fixing this one call reduced elapsed time from ~0.90 s to ~0.71 s, a 21% improvement, and accounts for nearly all of the gap closed between `RustTextFinder` and `RustTextFinderOpt`.

The remaining gap between Rust (~0.71 s) and Python (~0.27 s) is attributable to per-path string manipulation in `DirNav` (`replace_sep` on every directory entry) and Python's tighter integration between `os.scandir()` and the OS page cache.

---

## Other Contents

| Path | Description |
|------|-------------|
| [documents/](documents/) | Shared design documents and notes |
| [archive/](archive/) | Earlier drafts and experimental versions |
