# Spec.md — entry_point

Parses the command line, collects HTML files, calls `Validator::validate` for
each, prints results, and exits with an appropriate status code.

---

## Command-line interface

```
rs_page_validator [OPTIONS] <path>...

Arguments:
  <path>...    One or more HTML files or directories to validate

Options:
  -r, --recursive    Descend into subdirectories
  -q, --quiet        Print only files that contain errors
  -s, --summary      Print a pass/fail count after all files
  -h, --help         Print help
```

Implemented with `clap 4` derive macros.

---

## File collection

`collect_html_files(path, recursive, out)` appends `.html` and `.htm` files
to `out`.  When `recursive` is true, subdirectories are entered except those
whose final path component matches the skip list:

`target  bin  obj  build  out  __pycache__  .venv  venv  dist  .git  .vs  .idea  archive`

The skip check applies only during recursive descent, not to paths supplied
directly as arguments.

---

## Output format

```
PASS  path/to/file.html
FAIL  path/to/file.html
      [rule-id] line:col — message
ERROR path/to/file.html — <io error>
```

With `--quiet`, `PASS` lines are suppressed.  With `--summary`, a final line
`N passed, M failed` is printed.

---

## Exit status

| Condition | Status |
|-----------|--------|
| Validator ran successfully (files may have errors) | `0` |
| One or more files could not be read | `1` |
| No HTML files found | `1` (with message to stderr) |

---

## Responsibilities

- Wire `Validator::validate` to files; do not duplicate validation logic.
- Report read errors per-file and continue; do not abort the run.

---

*End of Spec.md*
