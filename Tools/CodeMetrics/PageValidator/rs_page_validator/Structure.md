# Structure.md — RsPageValidator

*Language- and toolchain-specific layout document for the Rust HTML page validator.*

---

## Language & Toolchain

- **Language:** Rust (edition 2021)
- **Build:** Cargo workspace — each component is a separate crate
- **Purpose:** Examine HTML files for valid structural composition

---

## Directory Layout

```
rs_page_validator/
├── Constitution.md
├── Structure.md
├── Notes.md
├── README.md
├── Cargo.toml              ← workspace root
├── tokenizer/
│   ├── Cargo.toml          ← library crate: tokenizer
│   ├── Spec.md
│   ├── Notes.md
│   └── src/
│       └── lib.rs          ← Tokenizer struct, Token enum
├── lexer/
│   ├── Cargo.toml          ← library crate: lexer
│   ├── Spec.md
│   ├── Notes.md
│   └── src/
│       └── lib.rs          ← Lexer struct, Lexeme enum
├── validator/
│   ├── Cargo.toml          ← library crate: validator
│   ├── Spec.md
│   ├── Notes.md
│   └── src/
│       └── lib.rs          ← Validator struct, ValidationError, Report
└── entry_point/
    ├── Cargo.toml          ← binary crate: rs_page_validator
    ├── Spec.md
    ├── Notes.md
    └── src/
        └── main.rs         ← CLI arg parsing, file iteration, output
```

---

## Workspace Cargo.toml

```toml
[workspace]
members = ["tokenizer", "lexer", "validator", "entry_point"]
resolver = "2"
```

---

## Cargo.toml — Library (tokenizer shown)

```toml
[package]
name = "tokenizer"
version = "0.1.0"
edition = "2021"

[lib]
name = "tokenizer"
path = "src/lib.rs"
doctest = false

[dependencies]
```

---

## Cargo.toml — Binary (entry_point)

```toml
[package]
name = "rs_page_validator"
version = "0.1.0"
edition = "2021"

[[bin]]
name = "rs_page_validator"
path = "src/main.rs"

[dependencies]
validator = { path = "../validator" }
```

---

## Component Responsibilities

### tokenizer

Reads raw HTML source text and splits it into a flat stream of `Token` values.
Tokens are coarse: `Text`, `TagOpen`, `TagClose`, `AttrName`, `AttrValue`,
`Comment`, `Doctype`, `Whitespace`, `Eof`.  The tokenizer holds no HTML
grammar knowledge — it only recognizes `<`, `>`, `=`, `"`, `'`, and `!`
as delimiters.

```rust
pub enum Token { TagOpen(String), TagClose(String), AttrName(String),
                 AttrValue(String), Text(String), Comment(String),
                 Doctype(String), Eof }

pub struct Tokenizer { /* source cursor state */ }
impl Tokenizer {
    pub fn new(src: &str) -> Self;
    pub fn next_token(&mut self) -> Token;
    pub fn position(&self) -> (usize, usize);  // (line, col)
}
```

### lexer

Consumes the `Token` stream from `tokenizer` and groups tokens into `Lexeme`
values that carry structural meaning: `OpenTag`, `SelfClosingTag`, `CloseTag`,
`Attribute`, `TextNode`, `CommentNode`, `DoctypeDecl`.  The lexer collects tag
names, attribute key/value pairs, and source positions for downstream use.

```rust
pub enum Lexeme { OpenTag { name: String, attrs: Vec<(String,String)>, pos: (usize,usize) },
                  SelfClosingTag { name: String, attrs: Vec<(String,String)>, pos: (usize,usize) },
                  CloseTag { name: String, pos: (usize,usize) },
                  Attribute { key: String, value: String },
                  TextNode(String),
                  CommentNode(String),
                  DoctypeDecl(String) }

pub struct Lexer { /* wraps Tokenizer */ }
impl Lexer {
    pub fn new(src: &str) -> Self;
    pub fn next_lexeme(&mut self) -> Option<Lexeme>;
}
```

### validator

Drives the `Lexer` and applies HTML structural rules.  Uses an element stack
to track open tags and verifies nesting, required elements, and attribute
constraints.  Collects `ValidationError` items rather than failing fast so the
caller receives a complete report.

Rules checked (representative set):

| Rule | Description |
|------|-------------|
| tag-nesting | Every open tag has a matching close tag in correct order |
| void-elements | Void elements (`br`, `hr`, `img`, `input`, …) carry no close tag |
| doctype | File begins with `<!DOCTYPE html>` |
| root-element | Exactly one `<html>` root wrapping `<head>` and `<body>` |
| head-required | `<head>` present and contains at least one `<title>` |
| attr-quotes | Attribute values are quoted |
| duplicate-id | `id` attribute values are unique within the document |

```rust
pub struct ValidationError { pub rule: &'static str, pub message: String,
                             pub line: usize, pub col: usize }

pub struct Report { pub file: PathBuf, pub errors: Vec<ValidationError> }
impl Report {
    pub fn is_valid(&self) -> bool { self.errors.is_empty() }
}

pub struct Validator;
impl Validator {
    pub fn validate(src: &str, file: &Path) -> Report;
}
```

### entry_point

Parses command-line arguments, iterates over the specified HTML files (with
optional recursive directory search), calls `Validator::validate` for each,
and prints a human-readable report.  Exits with status `0` if all files pass,
`1` if any file has errors.

Command-line interface:

```
rs_page_validator [OPTIONS] <path>...

Arguments:
  <path>...    HTML files or directories to validate

Options:
  -r, --recursive    Descend into subdirectories
  -q, --quiet        Print only files with errors
  -s, --summary      Print a one-line pass/fail count after all files
  -h, --help         Print help
```

---

## Component Dependencies

```
tokenizer
    |
  lexer
    |
validator
    |
entry_point
```

Each crate depends only on the crate directly above it.  `entry_point` links
`validator`; `validator` links `lexer`; `lexer` links `tokenizer`.
No library crate depends on `entry_point`.

---

## Build Steps

```bash
# From rs_page_validator/ (workspace root)
cargo build
cargo build --release
cargo test

# Run against a single file
cargo run -- index.html

# Run recursively, quiet mode
cargo run -- -r -q ./site

# Run the release binary directly
./target/release/rs_page_validator -r -s ./site
```

---

## External Dependencies

| Dependency | Crate | Purpose | How obtained |
|------------|-------|---------|--------------|
| `std` only | tokenizer, lexer, validator | All parsing and validation | Rust standard library |
| `clap` 4.x | entry_point | Argument parsing | crates.io |

---

## Testing

Each library crate contains `#[cfg(test)]` modules in its `src/lib.rs`.

```bash
# All tests
cargo test -- --show-output

# Single crate
cd tokenizer && cargo test -- --show-output
cd lexer     && cargo test -- --show-output
cd validator && cargo test -- --show-output
```

Typical test fixtures are inline HTML strings.  Integration tests in
`validator/tests/` cover multi-file scenarios using files under
`validator/tests/fixtures/`.

---

*End of Structure.md*
