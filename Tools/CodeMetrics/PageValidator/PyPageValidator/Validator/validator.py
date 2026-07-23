from __future__ import annotations
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import List, Set, Tuple

sys.path.insert(0, str(Path(__file__).parent.parent))
from Lexer.lexer import (
    Lexer, Attr, OpenTag, SelfClosingTag, CloseTag,
    TextNode, CommentNode, DoctypeDecl,
)


# ---------------------------------------------------------------------------
# ValidationError — one rule violation found in an HTML file.
# ---------------------------------------------------------------------------

@dataclass
class ValidationError:
    rule: str
    message: str
    line: int
    col: int


# ---------------------------------------------------------------------------
# Report — the complete result for a single file.
# ---------------------------------------------------------------------------

class Report:
    def __init__(self, file: str, errors: List[ValidationError]) -> None:
        self.file = file
        self.errors: List[ValidationError] = errors

    @property
    def is_valid(self) -> bool:
        return len(self.errors) == 0


# ---------------------------------------------------------------------------
# Validator — stateless; all state lives in validate()'s locals.
# ---------------------------------------------------------------------------

_VOID_ELEMENTS: frozenset[str] = frozenset({
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
    'link', 'meta', 'param', 'source', 'track', 'wbr',
})


class Validator:
    @staticmethod
    def validate(src: str, file: str) -> Report:
        lexer = Lexer(src)
        errors: List[ValidationError] = []
        stack: List[Tuple[str, Tuple[int, int]]] = []
        ids: Set[str] = set()

        seen_doctype = False
        html_count = 0
        seen_head = False
        seen_title = False
        seen_body = False
        in_head = False

        lexeme = lexer.next_lexeme()
        while lexeme is not None:
            if isinstance(lexeme, DoctypeDecl):
                seen_doctype = True

            elif isinstance(lexeme, OpenTag):
                _check_attrs(lexeme.attrs, lexeme.pos, errors, ids)
                if lexeme.name == 'html':
                    html_count += 1
                elif lexeme.name == 'head':
                    seen_head = True
                    in_head = True
                elif lexeme.name == 'title' and in_head:
                    seen_title = True
                elif lexeme.name == 'body':
                    seen_body = True
                if lexeme.name not in _VOID_ELEMENTS:
                    stack.append((lexeme.name, lexeme.pos))

            elif isinstance(lexeme, SelfClosingTag):
                _check_attrs(lexeme.attrs, lexeme.pos, errors, ids)

            elif isinstance(lexeme, CloseTag):
                if lexeme.name in _VOID_ELEMENTS:
                    errors.append(ValidationError(
                        'void-elements',
                        f'void element <{lexeme.name}> must not have a close tag',
                        lexeme.pos[0], lexeme.pos[1],
                    ))
                else:
                    if lexeme.name == 'head':
                        in_head = False
                    if stack and stack[-1][0] == lexeme.name:
                        stack.pop()
                    elif stack:
                        errors.append(ValidationError(
                            'tag-nesting',
                            f'</{lexeme.name}> does not match open <{stack[-1][0]}>',
                            lexeme.pos[0], lexeme.pos[1],
                        ))
                    else:
                        errors.append(ValidationError(
                            'tag-nesting',
                            f'</{lexeme.name}> has no matching open tag',
                            lexeme.pos[0], lexeme.pos[1],
                        ))

            lexeme = lexer.next_lexeme()

        # Post-loop structural checks
        if not seen_doctype:
            errors.append(ValidationError('doctype', 'document is missing <!DOCTYPE html>', 1, 1))
        if html_count != 1:
            errors.append(ValidationError(
                'root-element',
                f'expected exactly 1 <html> element, found {html_count}', 1, 1,
            ))
        if not seen_head:
            errors.append(ValidationError('head-required', 'document is missing a <head> element', 1, 1))
        elif not seen_title:
            errors.append(ValidationError('head-required', '<head> is missing a <title> element', 1, 1))
        if not seen_body:
            errors.append(ValidationError('body-required', 'document is missing a <body> element', 1, 1))
        for name, pos in stack:
            errors.append(ValidationError(
                'tag-nesting',
                f'<{name}> was opened but never closed',
                pos[0], pos[1],
            ))

        return Report(file, errors)


def _check_attrs(
    attrs: List[Attr],
    pos: Tuple[int, int],
    errors: List[ValidationError],
    ids: Set[str],
) -> None:
    for attr in attrs:
        if not attr.quoted and attr.value:
            errors.append(ValidationError(
                'attr-quotes',
                f"attribute '{attr.key}' value '{attr.value}' is not quoted",
                pos[0], pos[1],
            ))
        if attr.key == 'id' and attr.value:
            if attr.value in ids:
                errors.append(ValidationError(
                    'duplicate-id',
                    f"duplicate id '{attr.value}'",
                    pos[0], pos[1],
                ))
            else:
                ids.add(attr.value)
