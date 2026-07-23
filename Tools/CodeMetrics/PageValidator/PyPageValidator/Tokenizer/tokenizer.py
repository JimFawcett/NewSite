from __future__ import annotations
from dataclasses import dataclass
from typing import Optional, Tuple


# ---------------------------------------------------------------------------
# Token hierarchy — one subclass per lexical unit.
# ---------------------------------------------------------------------------

class Token:
    pass

@dataclass
class TagOpen(Token):
    name: str

@dataclass
class TagClose(Token):
    name: str

@dataclass
class AttrName(Token):
    name: str

@dataclass
class AttrValue(Token):
    value: str          # quoted

@dataclass
class AttrUnquoted(Token):
    value: str          # unquoted

class SelfClose(Token):
    pass

class TagEnd(Token):
    pass

@dataclass
class Text(Token):
    content: str

@dataclass
class Comment(Token):
    content: str

@dataclass
class Doctype(Token):
    content: str

class Eof(Token):
    pass


# ---------------------------------------------------------------------------
# Tokenizer
# ---------------------------------------------------------------------------

class Tokenizer:
    def __init__(self, src: str) -> None:
        self._src = src
        self._pos = 0
        self._line = 1
        self._col = 1
        self._in_tag = False
        self._pending: Optional[Tuple[Token, Tuple[int, int]]] = None
        self._last_start: Tuple[int, int] = (1, 1)

    @property
    def token_start(self) -> Tuple[int, int]:
        return self._last_start

    def next_token(self) -> Token:
        if self._pending is not None:
            tok, pos = self._pending
            self._pending = None
            self._last_start = pos
            return tok

        self._last_start = (self._line, self._col)

        if self._in_tag:
            return self._scan_in_tag()

        if self._pos >= len(self._src):
            return Eof()

        if self._src[self._pos] == '<':
            self._advance()
            if self._pos < len(self._src) and self._src[self._pos] == '!':
                self._advance()
                if (self._pos + 1 < len(self._src) and
                        self._src[self._pos] == '-' and
                        self._src[self._pos + 1] == '-'):
                    self._advance()
                    self._advance()
                    return Comment(self._collect_until('-->'))
                return Doctype(self._collect_until('>'))
            if self._pos < len(self._src) and self._src[self._pos] == '/':
                self._advance()
                name = self._collect_name()
                self._skip_ws()
                if self._pos < len(self._src) and self._src[self._pos] == '>':
                    self._advance()
                return TagClose(name)
            tag_name = self._collect_name()
            self._in_tag = True
            return TagOpen(tag_name)

        buf: list[str] = []
        while self._pos < len(self._src) and self._src[self._pos] != '<':
            buf.append(self._advance())
        return Text(''.join(buf))

    # -----------------------------------------------------------------------

    def _peek(self, off: int = 0) -> str:
        i = self._pos + off
        return self._src[i] if i < len(self._src) else '\0'

    def _advance(self) -> str:
        if self._pos >= len(self._src):
            return '\0'
        c = self._src[self._pos]
        self._pos += 1
        if c == '\n':
            self._line += 1
            self._col = 1
        else:
            self._col += 1
        return c

    def _skip_ws(self) -> None:
        while self._pos < len(self._src) and self._src[self._pos].isspace():
            self._advance()

    def _collect_name(self) -> str:
        buf: list[str] = []
        while self._pos < len(self._src):
            c = self._src[self._pos]
            if c.isalnum() or c in '-_:.':
                buf.append(self._advance())
            else:
                break
        return ''.join(buf)

    def _collect_until(self, stop: str) -> str:
        buf: list[str] = []
        n = len(stop)
        while self._pos < len(self._src):
            if self._src[self._pos:self._pos + n] == stop:
                for _ in stop:
                    self._advance()
                break
            buf.append(self._advance())
        return ''.join(buf)

    def _scan_in_tag(self) -> Token:
        self._skip_ws()
        if self._pos >= len(self._src) or self._src[self._pos] == '>':
            if self._pos < len(self._src):
                self._advance()
            self._in_tag = False
            return TagEnd()
        if self._src[self._pos] == '/' and self._peek(1) == '>':
            self._advance()
            self._advance()
            self._in_tag = False
            return SelfClose()
        name = self._collect_name()
        if not name:
            self._advance()
            return self._scan_in_tag()
        self._skip_ws()
        if self._peek() != '=':
            return AttrName(name)
        self._advance()  # '='
        self._skip_ws()
        val_pos = (self._line, self._col)
        q = self._peek()
        if q in ('"', "'"):
            self._advance()  # opening quote
            val: list[str] = []
            while self._pos < len(self._src) and self._src[self._pos] != q:
                val.append(self._advance())
            if self._pos < len(self._src):
                self._advance()  # closing quote
            self._pending = (AttrValue(''.join(val)), val_pos)
        else:
            val = []
            while self._pos < len(self._src):
                c = self._src[self._pos]
                if c.isspace() or c in '>/':
                    break
                val.append(self._advance())
            self._pending = (AttrUnquoted(''.join(val)), val_pos)
        return AttrName(name)
