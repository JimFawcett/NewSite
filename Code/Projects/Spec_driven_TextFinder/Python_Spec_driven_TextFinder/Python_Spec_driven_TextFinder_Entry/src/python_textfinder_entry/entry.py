# entry.py - startup sequence, skip-list ownership, and exit codes

import os
import re
import sys

from python_textfinder_cmdline import (ParseFailure, help_text, options_text,
                                       parse, usage_line)
from python_textfinder_dirnav import Dirnav
from python_textfinder_output import StdoutSink

_WINDOWS = os.name == "nt"

_SKIP_LIST: list[str] = [
    "archive",
    ".git",
    ".svn",
    ".hg",
    "build",
    "out",
    "target",
    "bin",
    "obj",
    "__pycache__",
    "node_modules",
]


def _names_equal(left: str, right: str) -> bool:
    if _WINDOWS:
        return left.lower() == right.lower()
    return left == right


def _add_skip_directory(name: str) -> None:
    for existing in _SKIP_LIST:
        if _names_equal(existing, name):
            return
    _SKIP_LIST.append(name)


def main(argv: list[str]) -> int:
    result = parse(argv)
    if isinstance(result, ParseFailure):
        _write_stderr(result.diagnostic)
        return 1
    commands = result

    try:
        sink = StdoutSink()
    except (RuntimeError, OSError):
        _write_stderr("cannot initialize output\n")
        return 2

    with sink:
        if commands.help:
            sink.write_text(help_text())
            return 0

        if len(argv) == 1:
            sink.write_text(options_text(commands))
            return 0

        if commands.verbose:
            sink.write_text(options_text(commands))

        try:
            dirnav = Dirnav(sink, tuple(_SKIP_LIST), commands)
        except re.error:
            if not commands.verbose:
                sink.write_text(options_text(commands))
            sink.flush()
            _write_stderr("invalid regex for switch: /r\n" + usage_line())
            return 1

        for root in commands.root_paths:
            dirnav.search(root)
        dirnav.emit_run_summary()
        return 0


def _write_stderr(text: str) -> None:
    try:
        sys.stderr.buffer.write(text.encode("utf-8", "replace"))
        sys.stderr.buffer.flush()
    except (OSError, ValueError):
        pass
