# Spec.md — EntryPoint

*Specifies the wiring and CLI surface of `page_validator.py`.*

---

## Responsibility

EntryPoint is the application entry point.  It:

1. Parses command-line flags manually (no external dependency).
2. Collects HTML files from the supplied paths (optionally recursive).
3. Calls `Validator.validate` for each file.
4. Prints a human-readable report to `stdout`.
5. Exits with status `0` if all files pass, `1` if any file fails or cannot be
   read.

---

## Source File

```
EntryPoint/
└── page_validator.py   ← main(argv) function with if __name__ == '__main__' guard
```

---

## Command-Line Interface

```
python page_validator.py [options] <path>...

Arguments:
  <path>...    HTML files or directories to validate

Options:
  -r, --recursive    Descend into subdirectories
  -q, --quiet        Print only files with errors
  -s, --summary      Print a pass/fail count after all files
  -h, --help         Print help and exit
```

Running with no arguments displays help and exits 0.

---

## Flow

```
main(argv)
│
├─ parse flags and collect input_paths
│
├─ if no paths: print help; return 0
│
├─ _collect_html_files(path, recursive, files)   for each path
│     skips non-.html/.htm files
│     skips _SKIP_DIRS entries when recursive
│
├─ if no files found: print error; return 1
│
├─ for each file:
│     Path(file).read_text(encoding='utf-8'); on failure: print error,
│     ++read_errors, continue
│     report = Validator.validate(src, file)
│     _print_report(report, quiet)
│
├─ if summary: print "N passed, M failed"
│
└─ return 1 if (failed > 0 or read_errors > 0) else 0
```

---

## Output Format

```
PASS  path/to/file.html
FAIL  path/to/file.html
      [rule-id] line:col — error message
      [rule-id] line:col — error message
```

In `--quiet` mode, `PASS` lines are suppressed; only `FAIL` blocks are printed.

---

## Skipped Directories

`target`, `bin`, `obj`, `build`, `out`, `__pycache__`, `.venv`, `venv`,
`dist`, `.git`, `.vs`, `.idea`, `archive`.

Stored as `_SKIP_DIRS: frozenset[str]` (module-level constant).  Skipping
applies only when `--recursive` is active.  Single-file arguments are always
processed regardless of their parent directory name.

---

## Invariants

- Running with no arguments displays help and exits 0.
- EntryPoint never calls parsing or validation logic directly.
- A file that cannot be opened is counted as a read error and does not affect
  the pass/fail counts.

---

*End of Spec.md*
