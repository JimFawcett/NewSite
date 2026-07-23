# Spec.md — Lexer

*Specifies the HTML lexer package.*

---

## Responsibility

Lexer wraps a `Tokenizer` and groups its flat `Token` stream into structured
`Lexeme` values that carry tag names, attribute key/value pairs, and source
positions.  It has no validation logic.

---

## Source File

```
Lexer/
└── lexer.py
```

---

## Exported Types

### `Attr`

```python
@dataclass
class Attr:
    key:    str
    value:  str
    quoted: bool  # False when the source had no surrounding quotes
```

### `Lexeme` Hierarchy

```python
class Lexeme: pass

@dataclass
class OpenTag(Lexeme):
    name:  str
    attrs: list[Attr]
    pos:   tuple[int, int]

@dataclass
class SelfClosingTag(Lexeme):
    name:  str
    attrs: list[Attr]
    pos:   tuple[int, int]

@dataclass
class CloseTag(Lexeme):
    name: str
    pos:  tuple[int, int]

@dataclass class TextNode(Lexeme):    content: str
@dataclass class CommentNode(Lexeme): content: str
@dataclass class DoctypeDecl(Lexeme): content: str
```

All tag names are lowercased by the lexer.

---

## Class `Lexer`

### Constructor

```python
def __init__(self, src: str) -> None
```

### Methods

```python
def next_lexeme(self) -> Lexeme | None
```

Returns `None` at end of input.  Whitespace-only `Text` tokens are consumed
silently; they do not produce a `TextNode`.

---

## Algorithm

`next_lexeme()` loops until it returns a value or `None`:

1. Call `_next_tok()` — returns `(Token, (int, int))`, checking `_buffered` first.
2. `Eof` → return `None`.
3. `TokTagOpen` → call `_collect_attrs()` → `(attrs, self_close)`, lowercase
   `name`, return `SelfClosingTag(...)` or `OpenTag(...)`.
4. `TokTagClose` → lowercase `name` → return `CloseTag(name, pos)`.
5. `Text` where content contains any non-whitespace → return `TextNode(content)`;
   otherwise continue.
6. `Comment` → return `CommentNode(content)`.
7. `Doctype` → return `DoctypeDecl(content)`.

`_collect_attrs()` loops:
- `TagEnd` → return `(attrs, False)`.
- `SelfClose` → return `(attrs, True)`.
- `Eof` → return `(attrs, False)`.
- `AttrName` → peek next token.
  - `AttrValue` → `Attr(key, value, True)`.
  - `AttrUnquoted` → `Attr(key, value, False)`.
  - Other (boolean attr) → `Attr(key, '', True)`; push other token back via
    `_push_back()`.

---

## Invariants

- `next_lexeme()` never raises an exception.
- Whitespace-only text content is never returned to the caller.
- `_buffered` holds at most one token at a time.

---

*End of Spec.md*
