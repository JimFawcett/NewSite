#!/usr/bin/env python3
"""page_validator — validate HTML files for structural correctness."""
from __future__ import annotations
import os
import sys
from pathlib import Path
from typing import List

sys.path.insert(0, str(Path(__file__).parent.parent))
from Validator.validator import Validator, Report


# ---------------------------------------------------------------------------
# Skip list and file helpers
# ---------------------------------------------------------------------------

_SKIP_DIRS = frozenset({
    'target', 'bin', 'obj', 'build', 'out',
    '__pycache__', '.venv', 'venv', 'dist',
    '.git', '.vs', '.idea', 'archive',
})

_HELP = """\
page_validator — validate HTML files for structural correctness

Usage:
  python page_validator.py [options] <path>...

Arguments:
  <path>...    HTML files or directories to validate

Options:
  -r, --recursive    Descend into subdirectories
  -q, --quiet        Print only files with errors
  -s, --summary      Print a pass/fail count after all files
  -h, --help         Print this help and exit

Rules checked:
  doctype       document begins with <!DOCTYPE html>
  root-element  exactly one <html> element
  head-required <head> present and contains <title>
  body-required <body> present
  tag-nesting   every open tag has a matching close tag
  void-elements void elements carry no close tag
  attr-quotes   all attribute values are quoted
  duplicate-id  id values are unique within the document

Exit status: 0 = all files pass, 1 = one or more files fail.
"""


def _should_skip(path: str) -> bool:
    return os.path.basename(path) in _SKIP_DIRS


def _is_html(path: str) -> bool:
    return os.path.splitext(path)[1].lower() in ('.html', '.htm')


def _collect_html_files(path: str, recursive: bool, files: List[str]) -> None:
    if os.path.isfile(path):
        if _is_html(path):
            files.append(path)
        return
    if not os.path.isdir(path):
        return
    try:
        entries = os.listdir(path)
    except OSError as e:
        print(f'ERROR cannot read directory {path}: {e}', file=sys.stderr)
        return
    subdirs: List[str] = []
    for entry in entries:
        full = os.path.join(path, entry)
        if os.path.isfile(full):
            if _is_html(full):
                files.append(full)
        elif recursive and os.path.isdir(full) and not _should_skip(full):
            subdirs.append(full)
    for subdir in subdirs:
        _collect_html_files(subdir, recursive, files)


def _print_report(report: Report, quiet: bool) -> None:
    if report.is_valid:
        if not quiet:
            print(f'PASS  {report.file}')
    else:
        print(f'FAIL  {report.file}')
        for e in report.errors:
            print(f'      [{e.rule}] {e.line}:{e.col} — {e.message}')
    sys.stdout.flush()


# ---------------------------------------------------------------------------
# main
# ---------------------------------------------------------------------------

def main(argv: List[str]) -> int:
    recursive = False
    quiet = False
    summary = False
    input_paths: List[str] = []

    for arg in argv:
        if arg in ('-r', '--recursive'):
            recursive = True
        elif arg in ('-q', '--quiet'):
            quiet = True
        elif arg in ('-s', '--summary'):
            summary = True
        elif arg in ('-h', '--help'):
            print(_HELP, end='')
            return 0
        else:
            input_paths.append(arg)

    if not input_paths:
        print(_HELP, end='')
        return 0

    files: List[str] = []
    for p in input_paths:
        _collect_html_files(p, recursive, files)

    if not files:
        print('no HTML files found', file=sys.stderr)
        return 1

    passed = 0
    failed = 0
    read_errors = 0

    for file in files:
        try:
            src = Path(file).read_text(encoding='utf-8', errors='replace')
        except Exception as e:
            print(f'ERROR {file} — {e}', file=sys.stderr)
            read_errors += 1
            continue
        report = Validator.validate(src, file)
        if report.is_valid:
            passed += 1
        else:
            failed += 1
        _print_report(report, quiet)

    if summary:
        print(f'\n{passed} passed, {failed} failed')

    return 1 if (failed > 0 or read_errors > 0) else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
