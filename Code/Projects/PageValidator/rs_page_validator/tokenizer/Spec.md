# Spec.md — tokenizer

Reads raw HTML source text and emits a flat stream of `Token` values.

---

## Token enum

| Variant | Emitted when |
|---------|-------------|
| `TagOpen(String)` | `<tagname` is encountered; `in_tag` mode begins |
| `TagClose(String)` | `</tagname>` is fully consumed |
| `AttrName(String)` | An attribute name is scanned inside a tag |
| `AttrValue(String)` | A quoted attribute value (content between the quotes) |
| `AttrValueUnquoted(String)` | An attribute value with no surrounding quotes |
| `SelfClose` | `/>` sequence ends a tag |
| `TagEnd` | `>` ends an open tag |
| `Text(String)` | Characters between tags |
| `Comment(String)` | Content between `<!--` and `-->` |
| `Doctype(String)` | Content inside `<!...>` that is not a comment |
| `Eof` | Source is exhausted |

`AttrName` followed immediately by `AttrValue` or `AttrValueUnquoted` represents
a key=value pair.  An `AttrName` not followed by a value token represents a
boolean attribute.

---

## Tokenizer struct

```rust
pub struct Tokenizer { /* opaque */ }

impl Tokenizer {
    pub fn new(src: &str) -> Self;
    pub fn next_token(&mut self) -> Token;
    pub fn token_start(&self) -> (usize, usize);  // (line, col) of last emitted token
}
```

`next_token` is the sole production point.  Calling it repeatedly until `Eof`
yields the complete token stream.  `token_start` returns the source position
at which the most recently emitted token began.

---

## Responsibilities

- Track line and column numbers.
- Hold at most one pending token (the `AttrValue`/`AttrValueUnquoted` that
  follows an `AttrName` when a `=` is present).
- Never abort; unrecognised characters inside a tag are skipped silently.

---

## Out of scope

- HTML grammar knowledge — no nesting, no element model.
- Encoding conversion — source must be valid UTF-8.

---

*End of Spec.md*
