import re


class Output:
    def __init__(self, hide: bool = True) -> None:
        self._hide = hide
        self._dir_printed = False
        self._match_count = 0
        self._current_dir = ""
        self._regex = re.compile(".")

    @property
    def match_count(self) -> int:
        return self._match_count

    def set_hide(self, hide: bool) -> None:
        self._hide = hide

    def set_regex(self, pattern: str) -> None:
        try:
            self._regex = re.compile(pattern)
        except re.error:
            self._regex = re.compile(".")

    def on_dir(self, dir_path: str) -> None:
        self._current_dir = dir_path
        self._dir_printed = False
        if not self._hide:
            print(f"\n  {self._current_dir}", flush=True)
            self._dir_printed = True

    def on_file(self, file_name: str) -> None:
        full_path = f"{self._current_dir}/{file_name}"
        if not self._find(full_path):
            return
        if self._hide and not self._dir_printed:
            print(f"\n  {self._current_dir}")
            self._dir_printed = True
        print(f"      {file_name}", flush=True)
        self._match_count += 1

    def _read_file(self, file_path: str) -> str | None:
        for encoding in ("utf-8", "latin-1"):
            try:
                with open(file_path, "r", encoding=encoding) as f:
                    return f.read()
            except (UnicodeDecodeError, LookupError):
                continue
            except OSError:
                return None
        return None

    def _find(self, file_path: str) -> bool:
        if self._regex.pattern == ".":
            return True
        contents = self._read_file(file_path)
        return contents is not None and bool(self._regex.search(contents))
