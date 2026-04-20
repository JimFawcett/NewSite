import os
from collections.abc import Callable


class DirNav:
    _DEFAULT_SKIPS: frozenset[str] = frozenset({
        "bin", "obj",
        "target",
        "build", "out",
        "__pycache__", ".venv", "venv", "dist",
        ".git", ".vs", ".idea",
        "archive",
    })

    def __init__(self, recurse: bool = True) -> None:
        self._recurse = recurse
        self._skips: set[str] = set(self._DEFAULT_SKIPS)
        self._patterns: set[str] = set()
        self._file_count = 0
        self._dir_count = 0
        self.dir_handler: Callable[[str], None] | None = None
        self.file_handler: Callable[[str], None] | None = None

    @property
    def file_count(self) -> int:
        return self._file_count

    @property
    def dir_count(self) -> int:
        return self._dir_count

    def add_pattern(self, ext: str) -> None:
        self._patterns.add(ext.lstrip(".").lower())

    def add_skip(self, name: str) -> None:
        self._skips.add(name)

    def set_recurse(self, r: bool) -> None:
        self._recurse = r

    def visit(self, root: str) -> bool:
        if not os.path.isdir(root):
            return False
        self._file_count = 0
        self._dir_count = 0
        self._visit_impl(root)
        return True

    def _visit_impl(self, dir_path: str) -> None:
        self._dir_count += 1
        normalised = dir_path.replace("\\", "/")
        if handler := self.dir_handler:
            handler(normalised)

        try:
            with os.scandir(dir_path) as it:
                entries = list(it)
        except OSError:
            return

        for entry in entries:
            if entry.is_file(follow_symlinks=False):
                if self._extension_matches(entry.name):
                    self._file_count += 1
                    if handler := self.file_handler:
                        handler(entry.name)
            elif entry.is_dir(follow_symlinks=False):
                if entry.name not in self._skips and self._recurse:
                    self._visit_impl(entry.path)

    def _extension_matches(self, filename: str) -> bool:
        if not self._patterns:
            return True
        _, dot_ext = os.path.splitext(filename)
        ext = dot_ext.lstrip(".").lower()
        return ext in self._patterns
