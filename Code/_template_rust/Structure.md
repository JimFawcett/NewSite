# Structure.md — {{PROJECT_NAME}}

*Rust/Cargo workspace layout document.*

---

## Language & Toolchain

- **Language:** Rust (2021 edition)
- **Build:** Cargo workspace — each component is a separate crate

---

## Directory Layout

```
{{PROJECT_NAME}}/
├── Constitution.md
├── Structure.md
├── Notes.md
├── README.md
├── Cargo.toml          ← workspace root
├── entry_point/
│   ├── Cargo.toml
│   ├── Spec.md
│   ├── Notes.md
│   └── src/
│       └── main.rs
└── part1/
    ├── Cargo.toml
    ├── Spec.md
    ├── Notes.md
    └── src/
        └── lib.rs
```

<!-- INPUT NEEDED: Rename part1 and add/remove crates to match your project. -->

---

## Workspace Cargo.toml

```toml
[workspace]
members = ["entry_point", "part1"]
resolver = "2"
```

---

## Library Crate Cargo.toml (part1 shown)

```toml
[package]
name = "part1"
version = "0.1.0"
edition = "2021"

[dependencies]
```

---

## Entry Point Cargo.toml

```toml
[package]
name = "{{project_name}}"
version = "0.1.0"
edition = "2021"

[[bin]]
name = "{{project_name}}"
path = "src/main.rs"

[dependencies]
part1 = { path = "../part1" }
```

---

## Build Steps

```bash
cargo build
cargo build --release
cargo test
cargo run -- --help
```

---

## Component Dependencies

```
part1   ...
   \     /
  entry_point
```

Library crates never depend on each other or on `entry_point`.

---

## External Dependencies

<!-- INPUT NEEDED: List crates.io dependencies here with a brief justification.
     Add them to each crate's Cargo.toml [dependencies] section. -->

---

## Testing

Each library crate has inline `#[cfg(test)]` unit tests in `src/lib.rs`.
Run all tests with `cargo test`.

---

*End of Structure.md*
