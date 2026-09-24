# output.py - the sink protocol Dirnav emits through

from typing import Protocol, runtime_checkable


@runtime_checkable
class Output(Protocol):
    def output(self, text: str) -> None: ...
