# Structure.md — PyTextFinder

*Language- and toolchain-specific layout document for the Python implementation.*

---

## Language & Toolchain

- **Language:** Python 3.10+
- **Build:** none — run directly with the Python interpreter
- **Dependencies:** standard library only (`os`, `sys`, `re`, `unittest`, `tempfile`, `io`, `contextlib`)

---

## Directory Layout

```
PyTextFinder/
├── Constitution.md
├── Structure.md
├── Notes.md
├── README.md
├── generate_part.py            ← scaffolds a new part directory
├── EntryPoint/
│   ├── __init__.py
│   ├── PyTextFinder.py                 ← top-level entry; wires and drives execution
│   ├── test_PyTextFinder.py
│   ├── Spec.md
│   └── Notes.md
├── CommandLine/
│   ├── __init__.py
│   ├── cmd_line.py             ← class CmdLine — parses /Key [Value] tokens
│   ├── test_cmd_line.py
│   ├── Spec.md
│   └── Notes.md
├── DirNav/
│   ├── __init__.py
│   ├── dir_nav.py              ← class DirNav — depth-first directory walk
│   ├── test_dir_nav.py
│   ├── Spec.md
│   └── Notes.md
└── Output/
    ├── __init__.py
    ├── output.py               ← class Output — regex match and console output
    ├── test_output.py
    ├── Spec.md
    └── Notes.md
```

---

## Package Layout

Each part is a directory containing an `__init__.py`, making it a Python
package.  The source file is the snake_case equivalent of the part name
(e.g. `DirNav` → `dir_nav.py`).

`PyTextFinder.py` inserts the PyTextFinder root into `sys.path` at startup so that
sibling packages (`CommandLine`, `DirNav`, `Output`) are importable without
installing anything.

---

## Running

```bash
# from PyTextFinder/
python EntryPoint/PyTextFinder.py -P . -r "def " -p py
```

---

## Testing

```bash
# run all tests via the -T flag (discovers test_*.py in all part dirs)
python EntryPoint/PyTextFinder.py -T

# or with the standard unittest runner
python -m unittest discover -s . -p "test_*.py"
```

---

## Scaffolding a New Part

```bash
python generate_part.py <PartName> [project_dir]
```

Creates `<PartName>/` with `__init__.py`, `<snake_name>.py`,
`test_<snake_name>.py`, `Spec.md`, and `Notes.md`.

---

## Component Dependencies

```
CommandLine   DirNav   Output
     \           |       /
      \          |      /
       \         |     /
           EntryPoint
```

Part packages never import each other or EntryPoint.
Cross-package communication flows through callables registered by EntryPoint
at startup.

---

## External Dependencies

| Dependency | Purpose | How obtained |
|------------|---------|--------------|
| `os`       | Directory traversal | Python standard library |
| `re`       | Content matching    | Python standard library |
| `sys`      | argv, path, exit    | Python standard library |
| `unittest` | Testing framework   | Python standard library |

No third-party packages required.

---

*End of Structure.md*
