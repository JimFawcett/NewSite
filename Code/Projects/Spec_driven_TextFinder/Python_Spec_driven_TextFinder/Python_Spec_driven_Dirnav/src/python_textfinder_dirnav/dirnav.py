# dirnav.py - depth-first traversal, file admission, matching, and block emission

import os
import re
import stat
from collections.abc import Sequence

from python_textfinder_cmdline import ProgramCommands

from .output import Output

_SIZE_LIMIT = 10_485_760
_LINE_SPLITTER = re.compile(r"\r\n|\n|\r")
_WINDOWS = os.name == "nt"


class Dirnav:
    def __init__(self, output: Output, skips: Sequence[str],
                 commands: ProgramCommands) -> None:
        self._output = output
        self._skips = skips
        self._commands = commands
        self._regex = re.compile(commands.regex_text)
        self._no_content = (commands.regex_text == "."
                            and not commands.line_numbers
                            and not commands.matched_line)
        self._detail = commands.line_numbers or commands.matched_line
        self._file_count = 0
        self._dir_count = 0

    def search(self, root: str) -> None:
        display = _render(root.replace("\\", "/"))
        if _has_surrogate(root):
            self._error("cannot open", display)
            return
        try:
            mode = os.lstat(root).st_mode
        except OSError:
            self._error("cannot open", display)
            return

        if stat.S_ISLNK(mode):
            self._error("cannot open", display)
        elif stat.S_ISDIR(mode):
            self._walk(root, display)
        elif stat.S_ISREG(mode):
            if self._selected(_basename(root)):
                self._examine(root, display, None)
        else:
            self._error("cannot open", display)

    def emit_run_summary(self) -> None:
        self._output.output(
            f"accessed {self._file_count} files, {self._dir_count} directories")

    def _walk(self, path: str, display: str) -> None:
        self._dir_count += 1
        try:
            with os.scandir(path) as entries:
                for entry in entries:
                    self._visit(entry, display)
        except OSError:
            self._error("cannot open", display)

    def _visit(self, entry: os.DirEntry, parent: str) -> None:
        display = _join(parent, _render(entry.name))
        if _has_surrogate(entry.name):
            self._error("cannot open", display)
            return
        try:
            if entry.is_symlink():
                return
            is_directory = entry.is_dir(follow_symlinks=False)
            is_file = entry.is_file(follow_symlinks=False)
        except OSError:
            self._error("cannot open", display)
            return

        if is_directory:
            if self._commands.recurse and not self._skipped(entry.name):
                self._walk(entry.path, display)
        elif not is_file:
            self._error("cannot open", display)
        elif self._selected(entry.name):
            self._examine(entry.path, display, entry)

    def _skipped(self, name: str) -> bool:
        return any(_names_equal(name, skip) for skip in self._skips)

    def _selected(self, name: str) -> bool:
        if not self._commands.extensions:
            return True
        dot = name.rfind(".")
        if dot < 0:
            return False
        extension = name[dot + 1:]
        return any(_names_equal(extension, allowed)
                   for allowed in self._commands.extensions)

    def _examine(self, path: str, display: str, entry: os.DirEntry | None) -> None:
        self._file_count += 1
        try:
            if entry is None:
                size = os.lstat(path).st_size
            else:
                size = entry.stat(follow_symlinks=False).st_size
        except OSError:
            self._error("cannot open", display)
            return

        if size > _SIZE_LIMIT:
            self._error("too large", display)
            return

        if self._no_content:
            if size > 0:
                self._output.output(display)
            return

        try:
            with open(path, "rb") as source:
                data = source.read()
        except OSError:
            self._error("cannot open", display)
            return

        if b"\x00" in data:
            self._file_announcement("skipped", display)
            return
        try:
            text = data.decode("utf-8")
        except UnicodeDecodeError:
            self._file_announcement("skipped", display)
            return

        self._match(text.removeprefix("﻿"), display)

    def _match(self, text: str, display: str) -> None:
        lines = _LINE_SPLITTER.split(text) if text else []
        if lines and lines[-1] == "":
            lines.pop()

        emitted = False
        for number, line in enumerate(lines, 1):
            if self._regex.search(line) is None:
                continue
            if not emitted:
                self._output.output(display)
                emitted = True
            if not self._detail:
                return
            self._output.output("  " + self._detail_text(number, line))

        if not emitted:
            self._file_announcement("searched", display)

    def _detail_text(self, number: int, line: str) -> str:
        if self._commands.line_numbers and self._commands.matched_line:
            return f"{number} - {line}"
        if self._commands.line_numbers:
            return f"{number}"
        return line

    def _error(self, kind: str, display: str) -> None:
        self._output.output(f"{kind} {display}")

    def _file_announcement(self, kind: str, display: str) -> None:
        if not self._commands.suppress_on_no_match:
            self._output.output(f"{kind} {display}")


def _join(parent: str, name: str) -> str:
    if parent == ".":
        return name
    if parent.endswith("/"):
        return parent + name
    return parent + "/" + name


def _basename(path: str) -> str:
    return path[max(path.rfind("/"), path.rfind("\\")) + 1:]


def _has_surrogate(text: str) -> bool:
    return any("\ud800" <= character <= "\udfff" for character in text)


def _render(text: str) -> str:
    if not _has_surrogate(text):
        return text
    return "".join("�" if "\ud800" <= character <= "\udfff" else character
                   for character in text)


def _names_equal(left: str, right: str) -> bool:
    if _WINDOWS:
        return left.lower() == right.lower()
    return left == right
