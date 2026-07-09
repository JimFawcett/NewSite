# Notes2 - Prompts and Responses

## Prompt

Create a Rust project and tutorial for Variables and Types in Rust/

## Response

Created binary crate `Learn/Rust/Variables/` with:

- `src/main.rs` - demonstrates immutable and mutable bindings, explicit type annotations,
  integer types (`i8`, `i32`, `i64`, `usize`), `f64`, `bool`, `char`, and shadowing
- `tutorial.md` - covers sections: bindings, mutability, type inference, integer types,
  floating-point types, boolean, character, shadowing, a complete runnable example,
  an exercise, common mistakes, and a key-terms table

The crate builds and runs cleanly via `cargo run`.

---

## Prompt

In view of Claude.md line 22, why doesn't the latest main.rs have a title comment?

## Response

Line 22 requires a minimum of a title comment on every code example. Both `src/main.rs`
files were missing it. Fixed:

- `Learn/Rust/Hello/src/main.rs` - opening comment updated to include "Hello - " as title prefix
- `Learn/Rust/Variables/src/main.rs` - title comment added as first line before `fn main()`

Saved a memory entry so future sessions apply the title comment rule automatically.

---

## Prompt

Add all the prompts and responses after those in Notes1.md to Notes2.md

## Response

Created this file, `Learn/Rust/Notes2.md`, containing the three prompt/response pairs
that followed the creation of Notes1.md.
