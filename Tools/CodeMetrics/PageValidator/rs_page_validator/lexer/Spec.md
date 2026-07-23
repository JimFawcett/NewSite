# Spec.md — lexer

Consumes the `Token` stream produced by `tokenizer` and groups tokens into
structured `Lexeme` values that carry semantic meaning.

---

## Attr struct

```rust
pub struct Attr {
    pub key: String,
    pub value: String,
    pub quoted: bool,   // false when AttrValueUnquoted was seen
}
```

Boolean attributes (no `=value`) have `value = ""` and `quoted = true`.

---

## Lexeme enum

| Variant | Fields | Produced when |
|---------|--------|---------------|
| `OpenTag` | `name`, `attrs`, `pos` | `TagOpen` … `TagEnd` |
| `SelfClosingTag` | `name`, `attrs`, `pos` | `TagOpen` … `SelfClose` |
| `CloseTag` | `name`, `pos` | `TagClose` |
| `TextNode` | `String` | `Text` (whitespace-only nodes are discarded) |
| `CommentNode` | `String` | `Comment` |
| `DoctypeDecl` | `String` | `Doctype` |

`name` is normalised to lowercase.  `pos` is the `(line, col)` of the opening
`<` character.

---

## Lexer struct

```rust
pub struct Lexer { /* opaque */ }

impl Lexer {
    pub fn new(src: &str) -> Self;
    pub fn next_lexeme(&mut self) -> Option<Lexeme>;
}
```

Returns `None` when the token stream is exhausted.

---

## Responsibilities

- Collect all `AttrName`/`AttrValue`/`AttrValueUnquoted` tokens between a
  `TagOpen` and its `TagEnd` or `SelfClose` into a `Vec<Attr>`.
- Preserve the `quoted` flag from `AttrValueUnquoted` for use by the Validator.
- Hold at most one lookahead token via an internal push-back buffer.

---

## Out of scope

- HTML grammar and nesting rules.
- Attribute value interpretation (e.g. URL resolution, entity decoding).

---

*End of Spec.md*
