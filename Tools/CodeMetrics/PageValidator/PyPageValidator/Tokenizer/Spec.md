# Spec.md — Tokenizer

*Specifies the HTML tokenizer package.*

---

## Responsibility

Tokenizer reads raw HTML source text and emits a flat stream of coarse `Token`
values.  It recognises only the characters `<`, `>`, `=`, `"`, `'`, `!`, `/`,
and `-` as structurally significant.  It has no HTML grammar knowledge.

---

## Source File

```
Tokenizer/
└── tokenizer.py
```

---

## Token Hierarchy

```python
class Token: pass                       # base — never instantiated directly

@dataclass class TagOpen(Token):      name: str    # <name
@dataclass class TagClose(Token):     name: str    # </name>
@dataclass class AttrName(Token):     name: str    # key
@dataclass class AttrValue(Token):    value: str   # "value" or 'value' (quoted)
@dataclass class AttrUnquoted(Token): value: str   # value (unquoted)
class SelfClose(Token): pass                       # />
class TagEnd(Token):    pass                       # > (ends a start tag)
@dataclass class Text(Token):    content: str      # raw text between tags
@dataclass class Comment(Token): content: str      # <!-- ... -->
@dataclass class Doctype(Token): content: str      # <!...>
class Eof(Token): pass
```

`SelfClose`, `TagEnd`, and `Eof` carry no data.

---

## Class `Tokenizer`

### Constructor

```python
def __init__(self, src: str) -> None
```

### Members

```python
@property
def token_start(self) -> tuple[int, int]: ...  # position of last returned token

def next_token(self) -> Token: ...
```

`token_start` returns the `(line, col)` position where the last returned token
began.  Lines and columns are 1-based.

---

## Algorithm

`next_token()`:
1. If `_pending` is set, clear it and return it (restoring its recorded position
   into `_last_start`).
2. Record `_last_start = (_line, _col)`.
3. If `_in_tag` is `True`, delegate to `_scan_in_tag()`.
4. If `_pos >= len(_src)`, return `Eof()`.
5. If current char is `'<'`:
   - Advance past `<`.
   - If next char is `'!'`:
     - Advance.  If the two chars that follow are `--`, advance twice and
       return `Comment(_collect_until('-->'))`.
     - Otherwise return `Doctype(_collect_until('>'))`.
   - If next char is `'/'`: advance, `_collect_name()`, skip whitespace,
     consume `>`, return `TagClose(name)`.
   - Otherwise: `_collect_name()`, set `_in_tag = True`, return `TagOpen(name)`.
6. Otherwise: collect characters until `'<'` and return `Text(text)`.

`_scan_in_tag()`:
1. Skip whitespace.
2. If EOF or `'>'`: advance if `'>'`, clear `_in_tag`, return `TagEnd()`.
3. If `'/'` followed by `'>'`: advance twice, clear `_in_tag`, return `SelfClose()`.
4. `_collect_name()` — if empty, advance and recurse.
5. Skip whitespace.  If next char is not `'='`: return `AttrName(name)`.
6. Advance past `'='`, skip whitespace, record `val_pos = (_line, _col)`.
7. If next char is `'"'` or `"'"`:
   - Advance past opening quote, collect until matching closing quote, advance.
   - Store `AttrValue(val)` in `_pending` at `val_pos`.
8. Otherwise: collect until whitespace, `'>'`, or `'/'`.
   - Store `AttrUnquoted(val)` in `_pending` at `val_pos`.
9. Return `AttrName(name)`.

The `_pending` field buffers one token.  `next_token()` checks `_pending` before
any other work, allowing `_scan_in_tag()` to emit an `AttrName` and queue the
corresponding `AttrValue` or `AttrUnquoted` for the next call.

---

## Invariants

- `next_token()` never raises an exception.
- `token_start` always reflects the position of the most recently returned token.
- Unrecognised sequences are emitted as `Text` or consumed silently; parsing
  never aborts.

---

*End of Spec.md*
