# Spec.md — validator

Drives the `Lexer` and applies structural rules to the `Lexeme` stream.
Returns a `Report` containing every `ValidationError` found; never short-circuits.

---

## Public API

```rust
pub struct ValidationError {
    pub rule: &'static str,
    pub message: String,
    pub line: usize,
    pub col: usize,
}

pub struct Report {
    pub file: PathBuf,
    pub errors: Vec<ValidationError>,
}

impl Report {
    pub fn is_valid(&self) -> bool;
}

pub struct Validator;

impl Validator {
    pub fn validate(src: &str, file: &Path) -> Report;
}
```

---

## Rules checked

| Rule ID | How checked |
|---------|-------------|
| `doctype` | `DoctypeDecl` lexeme must appear; absence reported post-pass |
| `root-element` | Count of `<html>` open tags must equal 1; checked post-pass |
| `head-required` | `<head>` open tag must appear; `<title>` must appear while `in_head` is true |
| `body-required` | `<body>` open tag must appear; checked post-pass |
| `tag-nesting` | Element stack: `OpenTag` pushes, `CloseTag` pops and verifies match; unclosed tags reported post-pass |
| `void-elements` | `CloseTag` for a void element name is an immediate error |
| `attr-quotes` | `Attr::quoted == false` on any attribute with a non-empty value |
| `duplicate-id` | `id` attribute values collected in a `HashSet`; second insertion is an error |

Void element names: `area base br col embed hr img input link meta param source track wbr`.

---

## Responsibilities

- Maintain the open-element stack using owned `String` names (avoids borrow conflicts on pop).
- Track `in_head` flag to scope `<title>` detection.
- Delegate attribute checking to `check_attrs` helper to keep the main loop readable.

---

## Out of scope

- CSS or JavaScript validation.
- Attribute value semantics (URL validity, enum values, etc.).
- ARIA or accessibility rules.

---

*End of Spec.md*
