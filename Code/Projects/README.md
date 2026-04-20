# Projects

Multi-language implementations of software tools, built to the same design and command-line interface so the languages can be compared side-by-side.

---

## TextFinder Projects

Each TextFinder variant walks a directory tree and reports files whose content matches a regular expression. All four share the same command-line interface and three-component architecture (`CommandLine`, `DirNav`, `Output`/`TextFinder`) wired together in an entry point.

| Project | Language | Build tool | Entry point |
|---------|----------|------------|-------------|
| [CppTextFinder](CppTextFinder/) | C++23 (named modules) | CMake 3.28+ / MSVC or Clang | `build/EntryPoint/Release/text_finder` |
| [CsTextFinder](CsTextFinder/) | C# / .NET 10 | dotnet CLI | `CsTextFinder.exe` |
| [PyTextFinder](PyTextFinder/) | Python 3.10+ | none | `python EntryPoint/main.py` |
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

## Other Contents

| Path | Description |
|------|-------------|
| [TextFinder.md](TextFinder.md) | Top-level feature overview and usage summary |
| [documents/](documents/) | Shared design documents and notes |
| [archive/](archive/) | Earlier drafts and experimental versions |
