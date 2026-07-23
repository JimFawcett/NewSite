# Spec.md — Validator

*Specifies the HTML structural validator package.*

---

## Responsibility

Validator drives the `Lexer` and applies structural rules to verify that an
HTML document is correctly formed.  It collects all errors before returning;
it never short-circuits on the first failure.

---

## Source File

```
Validator/
└── validator.py
```

---

## Exported Types

### `ValidationError`

```python
@dataclass
class ValidationError:
    rule:    str   # rule identifier, e.g. "tag-nesting"
    message: str   # human-readable description
    line:    int   # 1-based
    col:     int   # 1-based
```

### `Report`

```python
class Report:
    file:   str
    errors: list[ValidationError]

    @property
    def is_valid(self) -> bool: ...   # True when errors is empty
```

---

## Class `Validator`

All state lives in local variables within `validate()`.

```python
class Validator:
    @staticmethod
    def validate(src: str, file: str) -> Report: ...
```

---

## Validation Algorithm

1. Construct a `Lexer` over `src`.
2. Initialise state: `stack` (`list[tuple[str, tuple[int,int]]]`),
   `ids` (`set[str]`), and flags
   (`seen_doctype`, `html_count`, `seen_head`, `seen_title`, `seen_body`, `in_head`).
3. Loop over `lexer.next_lexeme()`:
   - `DoctypeDecl` → set `seen_doctype = True`.
   - `OpenTag`:
     - Call `_check_attrs(attrs, pos, errors, ids)`.
     - Update flags: `html_count` for `'html'`, `seen_head`/`in_head` for
       `'head'`, `seen_title` (only when `in_head`) for `'title'`,
       `seen_body` for `'body'`.
     - If `name` not in `_VOID_ELEMENTS`, push `(name, pos)` onto `stack`.
   - `SelfClosingTag` → call `_check_attrs`.
   - `CloseTag`:
     - If `name` in `_VOID_ELEMENTS`: emit `void-elements` error; continue.
     - If `name == 'head'`: clear `in_head`.
     - If `stack[-1][0] == name`: `stack.pop()`.
     - Else if stack non-empty: emit `tag-nesting` mismatch error.
     - Else: emit `tag-nesting` no-open-tag error.
   - `TextNode`, `CommentNode` → no action.
4. Post-loop checks:
   - `not seen_doctype` → `doctype` error at (1, 1).
   - `html_count != 1` → `root-element` error at (1, 1).
   - `not seen_head` → `head-required` error at (1, 1); else if
     `not seen_title` → `head-required` error at (1, 1).
   - `not seen_body` → `body-required` error at (1, 1).
   - Each remaining entry in `stack` → `tag-nesting` unclosed-tag error at
     the entry's recorded position.
5. Return `Report(file, errors)`.

`_check_attrs(attrs, pos, errors, ids)` (module-level helper):
- For each attr where `not attr.quoted and attr.value`: emit `attr-quotes` error.
- For each attr where `attr.key == 'id' and attr.value`: check `ids`; if
  duplicate emit `duplicate-id` error, otherwise `ids.add(attr.value)`.

---

## Void Elements

```
area  base  br  col  embed  hr  img  input  link  meta  param  source  track  wbr
```

Stored as `_VOID_ELEMENTS: frozenset[str]` (module-level constant).

---

## Invariants

- `validate()` never raises an exception.
- All errors for a document are collected before `Report` is returned.
- A `SelfClosingTag` for a void element is not an error.
- A `CloseTag` for a void element is always an error.

---

*End of Spec.md*
