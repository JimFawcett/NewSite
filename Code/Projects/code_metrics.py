#!/usr/bin/env python3
"""
code_metrics.py — report size and complexity for code files in a project tree.

Size     = total line count (code + comments + blank lines).
Complexity = number of scope-opening tokens:
               - brace languages (C++, C#, Rust, JS, …): count of '{'
               - Python: count of lines whose stripped form ends with ':'

Usage:
    python code_metrics.py [path] [--html] [--html-only] [--no-recurse]
"""

import os
import sys
import argparse
from pathlib import Path

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

# Maps file extension -> scope-detection strategy
EXTENSIONS: dict[str, str] = {
    '.py':  'python',
    '.cs':  'brace',
    '.cpp': 'brace', '.c':   'brace', '.h':   'brace',
    '.hpp': 'brace', '.hxx': 'brace', '.cxx': 'brace',
    '.ixx': 'brace',
    '.rs':  'brace',
    '.js':  'brace', '.ts':  'brace',
    '.jsx': 'brace', '.tsx': 'brace',
    '.java':'brace', '.go':  'brace',
}

SKIP_DIRS: frozenset[str] = frozenset({
    'bin', 'obj',
    'target',
    'build', 'out',
    '__pycache__', '.venv', 'venv', 'dist',
    '.git', '.vs', '.idea',
    'archive',
})

# ---------------------------------------------------------------------------
# Analysis
# ---------------------------------------------------------------------------

def _measure(file_path: Path) -> tuple[int, int]:
    """Return (line_count, scope_count) for a single file."""
    strategy = EXTENSIONS.get(file_path.suffix.lower(), 'brace')
    try:
        text = file_path.read_text(encoding='utf-8', errors='replace')
    except OSError:
        return 0, 0

    file_lines = text.splitlines()
    line_count  = len(file_lines)

    if strategy == 'python':
        scope_count = sum(1 for ln in file_lines if ln.rstrip().endswith(':'))
    else:
        scope_count = text.count('{')

    return line_count, scope_count


def collect(root: Path, recurse: bool) -> list[tuple[Path, int, int]]:
    """Walk *root* and return [(path, lines, scopes), …] sorted by path."""
    results: list[tuple[Path, int, int]] = []

    if recurse:
        for dirpath, dirnames, filenames in os.walk(root):
            dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
            for name in filenames:
                fp = Path(dirpath) / name
                if fp.suffix.lower() in EXTENSIONS:
                    lines, scopes = _measure(fp)
                    results.append((fp, lines, scopes))
    else:
        for fp in sorted(root.iterdir()):
            if fp.is_file() and fp.suffix.lower() in EXTENSIONS:
                lines, scopes = _measure(fp)
                results.append((fp, lines, scopes))

    results.sort(key=lambda t: t[0])
    return results


# ---------------------------------------------------------------------------
# Text table
# ---------------------------------------------------------------------------

def _rel(path: Path, root: Path) -> str:
    try:
        return str(path.relative_to(root))
    except ValueError:
        return str(path)


def text_table(data: list[tuple[Path, int, int]], root: Path) -> str:
    if not data:
        return "No code files found."

    HDR = ('File', 'Lines', 'Scopes')
    rows = [(_rel(p, root), str(ln), str(sc)) for p, ln, sc in data]

    total_lines  = sum(ln for _, ln, _ in data)
    total_scopes = sum(sc for _, _, sc in data)
    rows.append(('TOTAL', str(total_lines), str(total_scopes)))

    widths = [max(len(HDR[i]), max(len(r[i]) for r in rows)) for i in range(3)]

    sep = '+' + '+'.join('-' * (w + 2) for w in widths) + '+'

    def fmt(cells: tuple[str, ...]) -> str:
        return '|' + '|'.join(f' {c:<{w}} ' for c, w in zip(cells, widths)) + '|'

    lines = [sep, fmt(HDR), sep]
    for row in rows[:-1]:
        lines.append(fmt(row))
    lines += [sep, fmt(rows[-1]), sep]
    return '\n'.join(lines)


# ---------------------------------------------------------------------------
# HTML table
# ---------------------------------------------------------------------------

def html_table(data: list[tuple[Path, int, int]], root: Path) -> str:
    if not data:
        return '<div class="code-metrics"><p>No code files found.</p></div>'

    total_lines  = sum(ln for _, ln, _ in data)
    total_scopes = sum(sc for _, _, sc in data)

    out: list[str] = []
    out.append('<div class="code-metrics">')
    out.append('  <table>')
    # colgroup sets fixed proportional widths for each column
    out.append('  <colgroup>')
    out.append('    <col style="width:65%;">')
    out.append('    <col style="width:17%;">')
    out.append('    <col style="width:18%;">')
    out.append('  </colgroup>')
    out.append('  <thead>')
    out.append('    <tr>')
    out.append('      <th>File</th>')
    out.append('      <th>Lines</th>')
    out.append('      <th>Scopes</th>')
    out.append('    </tr>')
    out.append('  </thead>')
    out.append('  <tbody>')
    for path, lines, scopes in data:
        rel = _rel(path, root)
        out.append('    <tr>')
        out.append(f'      <td>{rel}</td>')
        out.append(f'      <td>{lines}</td>')
        out.append(f'      <td>{scopes}</td>')
        out.append('    </tr>')
    out.append('  </tbody>')
    out.append('  <tfoot>')
    out.append('    <tr>')
    out.append('      <td><strong>TOTAL</strong></td>')
    out.append(f'      <td><strong>{total_lines}</strong></td>')
    out.append(f'      <td><strong>{total_scopes}</strong></td>')
    out.append('    </tr>')
    out.append('  </tfoot>')
    out.append('  </table>')
    out.append('</div>')
    return '\n'.join(out)


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def main() -> None:
    parser = argparse.ArgumentParser(
        description='Report size and complexity for code files in a project tree.'
    )
    parser.add_argument(
        'path', nargs='?', default='.',
        help='Project root directory (default: current directory)'
    )
    parser.add_argument(
        '--html', action='store_true',
        help='Print text table followed by HTML table'
    )
    parser.add_argument(
        '--html-only', action='store_true',
        help='Print only the HTML table'
    )
    parser.add_argument(
        '--no-recurse', action='store_true',
        help='Search only the top-level directory, not subdirectories'
    )
    args = parser.parse_args()

    root = Path(args.path).resolve()
    if not root.is_dir():
        print(f'error: {root} is not a directory', file=sys.stderr)
        sys.exit(1)

    data = collect(root, recurse=not args.no_recurse)

    if not args.html_only:
        print(text_table(data, root))

    if args.html or args.html_only:
        if not args.html_only:
            print()
        print(html_table(data, root))


if __name__ == '__main__':
    main()
