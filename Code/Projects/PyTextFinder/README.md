# PyTextFinder

A command-line tool that walks a directory tree and reports files whose content
matches a regular expression.  Written in Python 3.10+, no build step required.

---

## Features

- Regex search over file contents (text and binary files)
- Recursive or single-directory walk
- File-extension filtering (e.g. search only `py`, `txt`)
- Built-in skip list covering C#, Rust, C++, and Python build outputs — never entered
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

**Example — find all `.py` files containing `def ` under the current tree:**

```
python EntryPoint/main.py /P . /p py /r "def "
```

**Git Bash / MINGW note:** The shell converts `/P`, `/r`, etc. to Windows paths.
Use `-` as the flag prefix instead to avoid this:

```bash
python EntryPoint/main.py -P . -p py -r "def "
```

PowerShell and cmd.exe accept `/` prefixes without issue.

---

## Building

No build step is required.

### Prerequisites

- Python 3.10+ (`python --version` should show 3.10 or later)

### Run

```bash
# from PyTextFinder/
python EntryPoint/main.py -P . -r "def " -p py
```

---

## Testing

```bash
# run all tests via the -T flag
python EntryPoint/main.py -T

# or with the standard unittest runner
python -m unittest discover -s . -p "test_*.py"
```

---

## Directory Layout

```
PyTextFinder/
├── Constitution.md         governing design document
├── Structure.md            Python implementation rules
├── Notes.md                project-level prompt/response log
├── README.md
├── generate_part.py        scaffolds a new part directory
├── CommandLine/
│   ├── __init__.py
│   ├── cmd_line.py         class CmdLine — parses /Key [Value] tokens
│   ├── test_cmd_line.py
│   ├── Spec.md
│   └── Notes.md
├── DirNav/
│   ├── __init__.py
│   ├── dir_nav.py          class DirNav — depth-first directory walk
│   ├── test_dir_nav.py
│   ├── Spec.md
│   └── Notes.md
├── Output/
│   ├── __init__.py
│   ├── output.py           class Output — regex match and console output
│   ├── test_output.py
│   ├── Spec.md
│   └── Notes.md
└── EntryPoint/
    ├── __init__.py
    ├── main.py             wires CommandLine, DirNav, Output; drives execution
    ├── test_main.py
    ├── Spec.md
    └── Notes.md
```

---

## Architecture

Three independent packages, wired together only in `main.py`:

```
CommandLine   DirNav   Output
      \          |       /
           EntryPoint
```

- Packages never import each other.
- `DirNav` fires events via callables registered by `EntryPoint`.
- `Output` is a plain class with `on_dir()` and `on_file()` methods.

Default directories excluded from traversal:

| Language / tool | Skipped names |
|-----------------|---------------|
| C# / .NET       | `bin`, `obj` |
| Rust            | `target` |
| C++             | `build`, `out` |
| Python          | `__pycache__`, `.venv`, `venv`, `dist` |
| VCS / IDE       | `.git`, `.vs`, `.idea` |
| Archives        | `archive` |

---

*End of README.md*
