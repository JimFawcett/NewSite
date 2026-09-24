# stdout_sink.py - the process's only writer over standard output

import io
import sys

from python_textfinder_dirnav import Output

_sink_exists = False


class StdoutSink(Output):
    def __init__(self) -> None:
        global _sink_exists
        if _sink_exists:
            raise RuntimeError("a StdoutSink already exists")
        self._writer = io.TextIOWrapper(
            sys.stdout.buffer,
            encoding="utf-8",
            errors="replace",
            newline="\n",
            line_buffering=False,
            write_through=False,
        )
        self._failed = False
        self._released = False
        _sink_exists = True

    def output(self, text: str) -> None:
        self._write(text + "\n")

    def write_text(self, text: str) -> None:
        self._write(text)

    def flush(self) -> None:
        if self._failed:
            return
        try:
            self._writer.flush()
        except (OSError, ValueError):
            self._fail()

    def __enter__(self) -> "StdoutSink":
        return self

    def __exit__(self, exc_type, exc_value, traceback) -> None:
        global _sink_exists
        if self._released:
            return
        self._released = True
        if not self._failed:
            try:
                self._writer.flush()
            except (OSError, ValueError):
                self._fail()
        try:
            self._writer.detach()
        except (OSError, ValueError):
            pass
        _sink_exists = False

    def _write(self, text: str) -> None:
        if self._failed:
            return
        try:
            self._writer.write(text)
        except (OSError, ValueError):
            self._fail()

    def _fail(self) -> None:
        if self._failed:
            return
        self._failed = True
        try:
            self._writer.flush()
        except (OSError, ValueError):
            pass
        try:
            sys.stderr.buffer.write(b"output failed\n")
            sys.stderr.buffer.flush()
        except (OSError, ValueError):
            pass
