# Projects

Multi-language implementations of software tools, each built to the same design and command-line interface so the languages can be compared side-by-side.

---

## Project Families

| Family | Languages | Description |
|--------|-----------|-------------|
| [TextFinder](TextFinder/) | C++23, C#, Python, Rust, Rust (opt) | Walk a directory tree and report files whose content matches a regular expression |
| [PageValidator](PageValidator/) | Rust, C++23, C#, Python | Validate HTML files for structural correctness against eight rules |

Each family README contains architecture diagrams, shared CLI documentation, code metrics, and performance timing.

---

## Utility Scripts

### `tf_timer.py`

Time a single TextFinder variant over a configurable search root.

```
python tf_timer.py <program> [--runs N] [TextFinder options ...]
```

| Argument | Description |
|----------|-------------|
| `<program>` | Required: `PyTextFinder`, `CsTextFinder`, `CppTextFinder`, `RustTextFinder`, or `RustTextFinderOpt` |
| `--runs N` | Timed runs after discarding warm-up (default: `20`) |
| TextFinder flags | Any TextFinder options, e.g. `/P . /p py /r "def "` — forwarded to the chosen program |

Both `/` and `-` flag prefixes are accepted; the script converts `-X` to `/X` for programs that require slash prefixes.

### `pa_timer.py`

Time all four PageValidator implementations against the same HTML tree and print a comparison table.

```
python pa_timer.py [--site PATH] [--runs N]
```

| Argument | Description |
|----------|-------------|
| `--site PATH` | Root directory to scan for HTML files (default: NewSite root) |
| `--runs N` | Timed runs per validator, first discarded as warm-up (default: `20`) |

### `code_metrics.py`

Report line counts and scope-opening token counts for every recognised source file under a project root.

```
python code_metrics.py [path] [--html] [--html-only] [--no-recurse]
```

| Argument | Description |
|----------|-------------|
| `path` | Project root directory (default: `.`) |
| `--html` | Print text table followed by an HTML table |
| `--html-only` | Print only the HTML table |
| `--no-recurse` | Search only the top-level directory, not subdirectories |

Recognised extensions: `.py .cs .cpp .c .h .hpp .ixx .rs .js .ts .jsx .tsx .java .go`.  
Skipped directories: `bin obj target build out __pycache__ .venv venv dist .git .vs .idea archive`.

---

## Other Contents

| Path | Description |
|------|-------------|
| [documents/](documents/) | Design notes, workflow chats, specification references |
| [archive/](archive/) | Earlier drafts and experimental versions |
