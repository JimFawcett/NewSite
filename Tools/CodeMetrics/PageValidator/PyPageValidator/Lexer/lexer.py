from __future__ import annotations
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Optional, Tuple

sys.path.insert(0, str(Path(__file__).parent.parent))
from Tokenizer.tokenizer import (
    Tokenizer, Token,
    TagOpen as TokTagOpen, TagClose as TokTagClose,
    AttrName, AttrValue, AttrUnquoted,
    SelfClose, TagEnd, Text, Comment, Doctype, Eof,
)


# ---------------------------------------------------------------------------
# Attr — a single attribute key/value pair with quoting status.
# ---------------------------------------------------------------------------

@dataclass
class Attr:
    key: str
    value: str
    quoted: bool


# ---------------------------------------------------------------------------
# Lexeme hierarchy — structured items produced by the Lexer.
# ---------------------------------------------------------------------------

class Lexeme:
    pass

@dataclass
class OpenTag(Lexeme):
    name: str
    attrs: list[Attr]
    pos: Tuple[int, int]

@dataclass
class SelfClosingTag(Lexeme):
    name: str
    attrs: list[Attr]
    pos: Tuple[int, int]

@dataclass
class CloseTag(Lexeme):
    name: str
    pos: Tuple[int, int]

@dataclass
class TextNode(Lexeme):
    content: str

@dataclass
class CommentNode(Lexeme):
    content: str

@dataclass
class DoctypeDecl(Lexeme):
    content: str


# ---------------------------------------------------------------------------
# Lexer
# ---------------------------------------------------------------------------

class Lexer:
    def __init__(self, src: str) -> None:
        self._tok = Tokenizer(src)
        self._buffered: Optional[Tuple[Token, Tuple[int, int]]] = None

    def next_lexeme(self) -> Optional[Lexeme]:
        while True:
            t, pos = self._next_tok()
            if isinstance(t, Eof):
                return None
            elif isinstance(t, TokTagOpen):
                attrs, self_close = self._collect_attrs()
                name = t.name.lower()
                if self_close:
                    return SelfClosingTag(name, attrs, pos)
                return OpenTag(name, attrs, pos)
            elif isinstance(t, TokTagClose):
                return CloseTag(t.name.lower(), pos)
            elif isinstance(t, Text):
                if any(not c.isspace() for c in t.content):
                    return TextNode(t.content)
            elif isinstance(t, Comment):
                return CommentNode(t.content)
            elif isinstance(t, Doctype):
                return DoctypeDecl(t.content)

    # -----------------------------------------------------------------------

    def _next_tok(self) -> Tuple[Token, Tuple[int, int]]:
        if self._buffered is not None:
            b = self._buffered
            self._buffered = None
            return b
        tok = self._tok.next_token()
        pos = self._tok.token_start
        return tok, pos

    def _push_back(self, tok: Token, pos: Tuple[int, int]) -> None:
        self._buffered = (tok, pos)

    def _collect_attrs(self) -> Tuple[list[Attr], bool]:
        attrs: list[Attr] = []
        while True:
            t, pos = self._next_tok()
            if isinstance(t, TagEnd):
                return attrs, False
            elif isinstance(t, SelfClose):
                return attrs, True
            elif isinstance(t, Eof):
                return attrs, False
            elif isinstance(t, AttrName):
                nxt, npos = self._next_tok()
                if isinstance(nxt, AttrValue):
                    attrs.append(Attr(t.name, nxt.value, True))
                elif isinstance(nxt, AttrUnquoted):
                    attrs.append(Attr(t.name, nxt.value, False))
                else:
                    attrs.append(Attr(t.name, '', True))  # boolean attr
                    self._push_back(nxt, npos)
