# Spec — code_metrics.py

## Purpose

Walk a directory tree and report two metrics per recognized source file: total line count (size) and scope-opening token count (complexity). Output as a text table, an HTML table, or both.

## Metrics

**Lines** — `len(text.splitlines())` — includes code, comments, and blank lines.

**Scopes** — language-dependent:
- Brace languages: `text.count('{')` — counts every `{` in the file, including those in strings and comments
- Python: count of lines whose stripped form ends with `:`

## CLI

```
python code_metrics.py [path] [--html] [--html-only] [--no-recurse]
```

| Argument | Type | Default | Effect |
|---|---|---|---|
| `path` | positional, optional | `.` | Root directory to analyze |
| `--html` | flag | off | Print text table then HTML table |
| `--html-only` | flag | off | Print HTML table only |
| `--no-recurse` | flag | off | Scan top-level directory only |

`path` is resolved to an absolute path via `Path.resolve()`. If it is not a directory the tool prints an error to stderr and exits with code 1.

`--html` and `--html-only` are not mutually exclusive; `--html-only` takes precedence (the text table is suppressed).

## File Recognition

Files are included when their extension (case-insensitive) appears in `EXTENSIONS`:

| Strategy | Extensions |
|---|---|
| `python` | `.py` |
| `brace` | `.cs`, `.cpp`, `.c`, `.h`, `.hpp`, `.hxx`, `.cxx`, `.ixx`, `.rs`, `.js`, `.ts`, `.jsx`, `.tsx`, `.java`, `.go` |

Files with unrecognized extensions are silently skipped.

## Directory Traversal

Uses `os.walk` for recursive mode, `Path.iterdir` for non-recursive.

Directories named in `SKIP_DIRS` are pruned before descent (mutating `dirnames[:]` in-place during `os.walk`):

`bin`, `obj`, `target`, `build`, `out`, `__pycache__`, `.venv`, `venv`, `dist`, `.git`, `.vs`, `.idea`, `archive`

Results are sorted by `Path` (lexicographic on the full absolute path).

## File Reading

Files are read with `encoding='utf-8', errors='replace'`. An `OSError` (permission denied, missing file) returns `(0, 0)` and processing continues — no error is raised or logged.

## Text Table Format

```
+-----------------------------+-------+--------+
| File                        | Lines | Scopes |
+-----------------------------+-------+--------+
| <relative path>             | nnn   | nnn    |
  ...
+-----------------------------+-------+--------+
| TOTAL                       | nnn   | nnn    |
+-----------------------------+-------+--------+
```

- File paths are relative to the analyzed root via `Path.relative_to(root)`; falls back to absolute path if `relative_to` raises `ValueError`
- Column widths are computed from the widest value in each column (header or data)
- TOTAL row is separated from data rows by a divider

## HTML Table Format

Wrapped in `<div class="code-metrics">`. Structure:

```html
<div class="code-metrics">
  <table>
    <colgroup>
      <col style="width:65%;">   <!-- File -->
      <col style="width:17%;">   <!-- Lines -->
      <col style="width:18%;">   <!-- Scopes -->
    </colgroup>
    <thead>...</thead>
    <tbody>...</tbody>
    <tfoot>
      <td><strong>TOTAL</strong></td>
      <td><strong>nnn</strong></td>
      <td><strong>nnn</strong></td>
    </tfoot>
  </table>
</div>
```

File paths use the same relative-path logic as the text table. Values are not HTML-escaped (paths are filesystem-derived).

## Module Structure

| Symbol | Kind | Role |
|---|---|---|
| `EXTENSIONS` | `dict[str, str]` | Extension-to-strategy mapping |
| `SKIP_DIRS` | `frozenset[str]` | Directory names to prune |
| `_measure(file_path)` | function | Returns `(line_count, scope_count)` for one file |
| `collect(root, recurse)` | function | Walks tree, returns sorted list of `(Path, lines, scopes)` |
| `_rel(path, root)` | function | Returns path relative to root, or absolute on failure |
| `text_table(data, root)` | function | Formats data as ASCII table string |
| `html_table(data, root)` | function | Formats data as HTML string |
| `main()` | function | Parses CLI args, calls collect, prints output |

## Dependencies

Standard library only: `os`, `sys`, `argparse`, `pathlib.Path`. Requires Python 3.9+.
