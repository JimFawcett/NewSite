# Structure.md — RsTextFinder

*Language- and toolchain-specific layout document for the Rust implementation.*

---

## Language & Toolchain

- **Language:** Rust (edition 2018)
- **Build:** Cargo (each crate builds independently; no workspace manifest)
- **Minimum crate versions:** `rust_cmd_line` 1.1.0, `rust_dir_nav` 1.1.0, `rs_text_finder_opt` 1.2.0, `tf_verify` 1.0.0

---

## Directory Layout

```
rs_textfinder_opt/
├── CLAUDE.md
├── Constitution.md
├── Structure.md
├── Notes.md
├── docs/
├── archive/
├── RustCmdLine/
│   ├── Cargo.toml              ← library crate: rust_cmd_line
│   └── src/
│       └── cmd_line_lib.rs     ← CmdLineParse struct
├── RustDirNav/
│   ├── Cargo.toml              ← library crate: rust_dir_nav
│   └── src/
│       └── dir_nav_lib.rs      ← DirNav<App> struct + DirEvent trait
├── RustTextFinder/
│   ├── Cargo.toml              ← binary crate: rust_text_finder
│   └── src/
│       └── text_finder.rs      ← TextFinder, TfAppl structs + main()
└── RustTfVerify/
    ├── Cargo.toml              ← binary crate: tf_verify
    └── src/
        └── main.rs             ← integration verification harness
```

---

## Cargo.toml — Library (RustCmdLine shown)

```toml
[package]
name = "rust_cmd_line"
version = "1.1.0"
edition = "2018"

[lib]
name = "cmd_line_lib"
path = "src/cmd_line_lib.rs"
doctest = false

[dependencies]
```

---

## Cargo.toml — Binary (RustTextFinder)

```toml
[package]
name = "rs_text_finder_opt"
version = "1.2.0"
edition = "2018"

[[bin]]
name = "text_finder"
path = "src/text_finder.rs"

[dependencies]
dir_nav_lib = { package = "rust_dir_nav", path = "../RustDirNav" }
cmd_line_lib = { package = "rust_cmd_line", path = "../RustCmdLine" }
regex = "1.7.0"
```

---

## Component Dependencies

```
RustCmdLine   RustDirNav
     \            /
      \          /
    RustTextFinder

RustTfVerify  ──(subprocess)──►  text_finder binary
```

Library crates (`RustCmdLine`, `RustDirNav`) never reference each other or
the application binary.  `RustTfVerify` is a standalone verifier that spawns
the compiled `text_finder` binary as a child process.

---

## Command-Line Option Prefixes

Options are recognized with either a `/` or `-` prefix; both forms are
equivalent.  `/` is the traditional Windows style; `-` works in bash and
other Unix shells.

```
/P "."   ≡   -P "."
/r "abc" ≡   -r "abc"
```

---

## Build Steps

```bash
# Build and run the search tool (from RustTextFinder/)
cd RustTextFinder
cargo build
cargo run -- /P "." /p "rs,txt" /r "abc" /s /H   # Windows / PowerShell
cargo run -- -P "." -p "rs,txt" -r "abc" -s -H   # bash / Unix

# Build and run the verification harness (from RustTfVerify/)
# Requires text_finder already built in RustTextFinder/target/debug/
cd ../RustTfVerify
cargo run

# Pass an explicit binary path if needed
cargo run -- path/to/text_finder
```

---

## External Dependencies

| Dependency | Crate | Purpose | How obtained |
|------------|-------|---------|--------------|
| `regex` 1.7.0 | `rust_text_finder` | Content matching | crates.io |
| `std` only | `rust_cmd_line`, `rust_dir_nav`, `tf_verify` | All other I/O | Rust standard library |

---

## Testing

### Unit tests

Each library crate contains `#[cfg(test)]` modules in its single source file.

```bash
# RustDirNav — must run single-threaded (test_setup must precede test_walk)
cd RustDirNav
cargo test -- --test-threads=1 --show-output

# RustTextFinder — white-box tests for TextFinder and TfAppl structs
cd RustTextFinder
cargo test -- --show-output
```

### Integration verification (RustTfVerify)

`RustTfVerify` spawns the compiled `text_finder` binary and checks its stdout
against requirement assertions drawn from `Req_TextFinder.md`.

```bash
cd RustTextFinder && cargo build   # build the binary first
cd ../RustTfVerify && cargo run
```

Results are printed as `PASS`, `FAIL`, or `SKIP` per requirement ID.
The process exits with status 1 if any assertion fails.

---

*End of Structure.md*
