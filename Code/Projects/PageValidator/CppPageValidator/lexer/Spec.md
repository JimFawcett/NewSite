# Spec.md — Lexer

*Specifies the HTML lexer library.*

---

## Responsibility

Lexer wraps a `Tokenizer` and groups its flat `Token` stream into structured
`Lexeme` values that carry tag names, attribute key/value pairs, and source
positions.  It has no validation logic.

---

## Source File

```
lexer/src/
└── Lexer.ixx      ← export module lexer;
```

---

## Exported Types

### `Attr`

```cpp
struct Attr {
    std::string key;
    std::string value;
    bool        quoted;  // false when source had no surrounding quotes
};
```

### `Lexeme` Variant

```cpp
using Lexeme = std::variant<
    lex::OpenTag,        // <name attrs>
    lex::SelfClosingTag, // <name attrs/>
    lex::CloseTag,       // </name>
    lex::TextNode,       // non-whitespace text content
    lex::CommentNode,    // <!-- ... -->
    lex::DoctypeDecl     // <!DOCTYPE ...>
>;
```

`OpenTag` and `SelfClosingTag` carry `name`, `std::vector<Attr> attrs`, and
`std::pair<std::size_t, std::size_t> pos`.  `CloseTag` carries `name` and `pos`.
`TextNode`, `CommentNode`, and `DoctypeDecl` carry `std::string text`.

All tag names are lowercased by the lexer.

---

## Class `Lexer`

### Constructor

```cpp
explicit Lexer(std::string src);
```

### Methods

```cpp
std::optional<Lexeme> next_lexeme();
```

Returns `std::nullopt` at end of input.  Whitespace-only `Text` tokens are
consumed silently; they do not produce a `TextNode`.

---

## Lexer Algorithm

`next_lexeme()` loops until it returns a value or `nullopt`:

1. Call `next_tok()` — returns `(Token, Pos)`, checking `buffered_` first.
2. `tok::Eof` → return `std::nullopt`.
3. `tok::TagOpen{name}`:
   - Call `collect_attrs()` → `(attrs, self_closing)`.
   - Lowercase `name`.
   - Return `lex::SelfClosingTag` or `lex::OpenTag`.
4. `tok::TagClose{name}` → lowercase `name` → return `lex::CloseTag`.
5. `tok::Text{s}` → if `s` contains any non-whitespace: return `lex::TextNode`;
   else continue.
6. `tok::Comment{s}` → return `lex::CommentNode`.
7. `tok::Doctype{s}` → return `lex::DoctypeDecl`.

`collect_attrs()` loops:
- `TagEnd` → return `(attrs, false)`.
- `SelfClose` → return `(attrs, true)`.
- `Eof` → return `(attrs, false)`.
- `AttrName{key}`: peek next token.
  - `AttrValue{val}` → `Attr{key, val, true}`.
  - `AttrUnquoted{val}` → `Attr{key, val, false}`.
  - Other (boolean attr) → `Attr{key, "", true}`; push other back via `push_back()`.

---

## Invariants

- `next_lexeme()` never throws.
- Whitespace-only text content is never returned to the caller.
- The `buffered_` field holds at most one token at a time.

---

*End of Spec.md*
