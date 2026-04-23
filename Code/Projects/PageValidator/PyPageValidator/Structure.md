# Structure.md — PyPageValidator

*Language- and toolchain-specific layout document for the Python HTML page validator.*

---

## Language & Toolchain

- **Language:** Python 3.10+
- **Build:** no build step — run directly with `python`
- **Purpose:** Examine HTML files for valid structural composition

---

## Directory Layout

```
PyPageValidator/
├── Constitution.md
├── Structure.md
├── Tokenizer/
│   ├── __init__.py
│   ├── tokenizer.py        ← Token hierarchy and Tokenizer class
│   ├── test_tokenizer.py
│   └── Spec.md
├── Lexer/
│   ├── __init__.py
│   ├── lexer.py            ← Attr, Lexeme hierarchy, and Lexer class
│   ├── test_lexer.py
│   └── Spec.md
├── Validator/
│   ├── __init__.py
│   ├── validator.py        ← ValidationError, Report, and Validator class
│   ├── test_validator.py
│   └── Spec.md
└── EntryPoint/
    ├── __init__.py
    ├── page_validator.py   ← CLI entry point; wires Validator
    └── Spec.md
```

---

## Component Responsibilities

### Tokenizer

Reads raw HTML source text and splits it into a flat stream of `Token` values.
`Token` is a plain base class with dataclass subtypes:

```python
class Token: pass

@dataclass class TagOpen(Token):      name: str
@dataclass class TagClose(Token):     name: str
@dataclass class AttrName(Token):     name: str
@dataclass class AttrValue(Token):    value: str   # quoted
@dataclass class AttrUnquoted(Token): value: str   # unquoted
class SelfClose(Token): pass
class TagEnd(Token):    pass
@dataclass class Text(Token):    content: str
@dataclass class Comment(Token): content: str
@dataclass class Doctype(Token): content: str
class Eof(Token): pass
```

The tokenizer holds no HTML grammar knowledge — it only recognises `<`, `>`,
`=`, `"`, `'`, `!`, `/`, and `-` as structurally significant.

### Lexer

Consumes the `Token` stream and groups tokens into `Lexeme` values.  `Lexeme`
is a plain base class with dataclass subtypes:

```python
class Lexeme: pass

@dataclass class OpenTag(Lexeme):       name: str; attrs: list[Attr]; pos: tuple[int,int]
@dataclass class SelfClosingTag(Lexeme):name: str; attrs: list[Attr]; pos: tuple[int,int]
@dataclass class CloseTag(Lexeme):      name: str; pos: tuple[int,int]
@dataclass class TextNode(Lexeme):      content: str
@dataclass class CommentNode(Lexeme):   content: str
@dataclass class DoctypeDecl(Lexeme):   content: str
```

`OpenTag` and `SelfClosingTag` carry a `list[Attr]` with key, value, and
quoting status.  All tag names are lowercased.

### Validator

Drives the `Lexer` and applies HTML structural rules.  Uses a
`list[tuple[str, tuple[int, int]]]` element stack to track open tags.  Returns
a `Report` containing all `ValidationError` items found.  Never short-circuits
on the first failure.

### EntryPoint

`page_validator.py` uses a standard `main(argv)` function and `if __name__ == '__main__'`
guard.  Parses command-line flags manually (no external dependency), iterates
over the specified HTML files with optional recursive directory search, calls
`Validator.validate` for each file, and prints a human-readable report.

---

## Component Dependencies

```
Tokenizer
    |
  Lexer
    |
Validator
    |
EntryPoint
```

Each module prepends its parent directory to `sys.path` so sibling packages
are importable without installation:

```python
sys.path.insert(0, str(Path(__file__).parent.parent))
```

---

## Running

```bash
# Validate a single file
python EntryPoint/page_validator.py index.html

# Validate a directory tree, quiet mode
python EntryPoint/page_validator.py -r -q ./site

# Validate with summary
python EntryPoint/page_validator.py -r -s ./site
```

---

## External Dependencies

None beyond the Python 3.10+ standard library.

---

## Testing

Each component has a `test_*.py` in its package directory using the standard
`unittest` framework.

```bash
# Run one component's tests
python -m unittest Tokenizer/test_tokenizer.py
python -m unittest Lexer/test_lexer.py
python -m unittest Validator/test_validator.py

# Run all tests via discovery (from PyPageValidator/)
python -m unittest discover -s . -p "test_*.py"
```

---

*End of Structure.md*
