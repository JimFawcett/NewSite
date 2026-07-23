# Spec.md — EntryPoint

*Specifies the wiring and CLI surface of `Program.cs`.*

---

## Responsibility

EntryPoint is the application binary.  It:

1. Parses command-line flags manually (no external dependency).
2. Collects HTML files from the supplied paths (optionally recursive).
3. Calls `Validator.Validate` for each file.
4. Prints a human-readable report to `stdout`.
5. Exits with status `0` if all files pass, `1` if any file fails or cannot be
   read.

---

## Source File

```
EntryPoint/
└── Program.cs      ← C# top-level statements; assembly name: page_validator
```

---

## Command-Line Interface

```
page_validator [options] <path>...

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
top-level statements (args)
│
├─ parse flags and collect inputPaths
│
├─ if no paths: print help; return 0
│
├─ CollectHtmlFiles(path, recursive, files)   for each path
│     skips non-.html/.htm files
│     skips ShouldSkip() directories when recursive
│
├─ if no files found: print error; return 1
│
├─ for each file:
│     File.ReadAllText(); on failure: print error, ++readErrors, continue
│     report = Validator.Validate(src, file)
│     PrintReport(report, quiet)
│
├─ if summary: print "N passed, M failed"
│
└─ return (fail > 0 || readErrors > 0) ? 1 : 0
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

Skipping applies only when `--recursive` is active.  Single-file arguments
are always processed regardless of their parent directory name.

---

## Invariants

- Running with no arguments displays help and exits 0.
- EntryPoint never calls parsing or validation logic directly.
- A file that cannot be opened is counted as a read error and does not affect
  the pass/fail counts.

---

*End of Spec.md*
