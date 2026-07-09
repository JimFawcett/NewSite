# Rust Tooling

## T1.0 What This Teaches

Rust's toolchain is tightly integrated and consistent across platforms. This tutorial
covers the tools you use every day:

- **rustup** - installing and managing Rust versions and components
- **cargo** - build system, package manager, and task runner
- **rustfmt** - automatic code formatting
- **clippy** - linting and best-practice suggestions
- **rustdoc** - documentation generation from doc comments
- **cargo test** - the built-in test harness

---

## T1.1 rustup - Managing the Toolchain

`rustup` installs Rust and keeps it up to date.

```
rustup update                   # update to the latest stable Rust
rustup show                     # show the active toolchain and installed versions
rustup toolchain list            # list all installed toolchains
rustup toolchain install nightly # install the nightly channel
rustup default stable            # switch the default back to stable
```

`rustup` also manages **components** - optional parts of the toolchain:

```
rustup component add rustfmt     # code formatter
rustup component add clippy      # linter
rustup component add rust-docs   # offline documentation
```

You will need `rustfmt` and `clippy` for the sections below. Check what is installed:

```
rustup component list --installed
```

---

## T1.2 cargo - Build System and Package Manager

`cargo` is the single entry point for nearly all project tasks.

### Creating a project

```
cargo new my_project --bin    # binary crate (has main.rs)
cargo new my_lib --lib        # library crate (has lib.rs)
cargo init .                  # initialize cargo in an existing directory
```

### Building

```
cargo build                   # debug build -> target/debug/
cargo build --release         # optimized build -> target/release/
cargo check                   # type-check without producing a binary (fast)
```

`cargo check` is faster than `cargo build` and catches type errors immediately.
Use it while editing; use `cargo build` when you need the executable.

### Running

```
cargo run                     # build (if needed) and run the binary
cargo run -- arg1 arg2        # pass arguments to the program
```

### Cleaning

```
cargo clean                   # delete the target/ directory
```

---

## T1.3 Cargo.toml - The Project Manifest

`Cargo.toml` controls the project name, version, dependencies, and build profiles.
Every crate has one.

```toml
[package]
name    = "my_project"
version = "0.1.0"
edition = "2021"

[dependencies]
serde = { version = "1", features = ["derive"] }
rand  = "0.8"

[dev-dependencies]
# dependencies only used in tests
pretty_assertions = "1"

[profile.release]
opt-level = 3     # maximum optimization
```

### Adding a dependency

```
cargo add serde --features derive   # adds to [dependencies] automatically
cargo add --dev pretty_assertions   # adds to [dev-dependencies]
```

`cargo add` requires cargo 1.62+. Alternatively, edit `Cargo.toml` directly and run
`cargo build` to fetch the crate.

### Updating dependencies

```
cargo update          # update all dependencies to the latest compatible versions
cargo update serde    # update only serde
```

`Cargo.lock` records the exact version of every dependency used in the build.
Check it into version control for binaries; omit it (via `.gitignore`) for libraries.

---

## T1.4 rustfmt - Automatic Formatting

`rustfmt` reformats Rust code to the community standard style. It is non-negotiable
in most Rust projects - consistent formatting eliminates a whole category of code
review comments.

```
cargo fmt             # format all source files in the crate
cargo fmt --check     # exit with an error if any file is not formatted (CI use)
```

Configure formatting in `rustfmt.toml` at the project root:

```toml
max_width = 100
tab_spaces = 4
```

The defaults are almost always correct. The main setting worth adjusting is
`max_width` if your team uses a wider line limit.

---

## T1.5 clippy - Linting

`clippy` catches common mistakes and suggests more idiomatic code. It goes well beyond
what the compiler warns about.

```
cargo clippy                          # lint the crate
cargo clippy -- -D warnings           # treat all warnings as errors (CI use)
cargo clippy --fix                    # automatically apply safe suggestions
```

Example - clippy catches an inefficient range check:

```rust
// clippy warns: use x.is_empty() instead
if x.len() == 0 { ... }

// idiomatic
if x.is_empty() { ... }
```

Suppress a specific lint for one item with an attribute:

```rust
#[allow(clippy::needless_range_loop)]
for i in 0..v.len() { ... }
```

Run `cargo clippy` regularly - ideally in CI alongside `cargo fmt --check`.

---

## T1.6 cargo test - The Test Harness

Rust has a built-in test framework. Write tests in a `#[cfg(test)]` module in the
same file as the code, or in the `tests/` directory for integration tests.

### Unit tests

```rust
pub fn add(a: i32, b: i32) -> i32 { a + b }

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_add() {
        assert_eq!(add(2, 3), 5);
    }

    #[test]
    fn test_add_negative() {
        assert_eq!(add(-1, 1), 0);
    }

    #[test]
    #[should_panic]
    fn test_out_of_bounds() {
        let v = vec![1, 2, 3];
        let _ = v[99];
    }
}
```

`#[cfg(test)]` ensures the module is compiled only when running tests, not in release
builds. `#[should_panic]` marks a test that is expected to panic - the test fails if
it does not.

### Running tests

```
cargo test                    # run all tests
cargo test test_add           # run tests whose name contains "test_add"
cargo test -- --nocapture     # show println! output during tests
cargo test -- --test-thread=1 # run tests sequentially (useful for I/O tests)
```

### Assertions

| Macro | Checks |
|-------|--------|
| `assert!(expr)` | `expr` is true |
| `assert_eq!(a, b)` | `a == b`; prints both values on failure |
| `assert_ne!(a, b)` | `a != b` |
| `panic!("msg")` | unconditionally fails the test |

### Doc tests

Examples in `///` doc comments are compiled and run as tests:

```rust
/// Adds two integers.
///
/// ```
/// assert_eq!(my_crate::add(2, 3), 5);
/// ```
pub fn add(a: i32, b: i32) -> i32 { a + b }
```

```
cargo test --doc    # run only the doc tests
```

Doc tests enforce that examples in documentation actually work.

---

## T1.7 rustdoc - Documentation Generation

`rustdoc` converts `///` doc comments into browsable HTML documentation.

```
cargo doc                     # generate docs for the crate and all dependencies
cargo doc --open              # generate and open in a browser
cargo doc --no-deps           # generate only for the crate (faster)
```

Doc comment format:

```rust
/// One-line summary.
///
/// Longer description goes here. Supports **Markdown**.
///
/// # Panics
///
/// Describe conditions that cause a panic.
///
/// # Examples
///
/// ```
/// let x = my_func(42);
/// assert_eq!(x, 84);
/// ```
pub fn my_func(n: i32) -> i32 { n * 2 }
```

Use `//!` (note the `!`) for module-level or crate-level documentation at the top of
`lib.rs` or `main.rs`:

```rust
//! # My Crate
//!
//! This crate provides utilities for...
```

---

## T1.8 This Tutorial's Source

The `src/main.rs` in this folder demonstrates doc comments, unit tests, and
`#[should_panic]` in a small working example. Run it:

```
cargo run      # see program output
cargo test     # run all 4 unit tests
cargo doc --open  # browse generated documentation
```

Expected test output:

```
running 4 tests
test tests::test_clamp ... ok
test tests::test_add ... ok
test tests::test_is_even ... ok
test tests::test_index_out_of_bounds - should panic ... ok

test result: ok. 4 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out
```

---

## T1.9 Recommended Workflow

For daily development:

1. `cargo check` - fast type-checking while writing code
2. `cargo test` - run tests after every meaningful change
3. `cargo clippy` - lint before committing
4. `cargo fmt` - format before committing
5. `cargo build --release` - for the final binary

For CI pipelines, a minimal quality gate is:

```
cargo fmt --check && cargo clippy -- -D warnings && cargo test
```

This catches formatting drift, linter violations, and test failures in one command.

---

## T1.10 Exercise

1. Add a function `factorial(n: u64) -> u64` to `src/main.rs`. Write at least three
   unit tests: `factorial(0)`, `factorial(1)`, and `factorial(5)`. Run `cargo test`
   to verify they pass.

2. Add a doc comment with an `# Examples` section to `factorial`. Run `cargo test --doc`
   to confirm the example compiles and passes.

3. Run `cargo clippy` on the crate. If clippy suggests any changes, apply them and
   confirm the tests still pass.

4. Run `cargo fmt --check`. If it reports differences, run `cargo fmt` and inspect
   what changed.

---

## T1.11 Common Mistakes

**Running tests without seeing println! output**

```
cargo test
```

Rust captures stdout from passing tests by default. Add `-- --nocapture` to see it:

```
cargo test -- --nocapture
```

**Putting tests outside #[cfg(test)]**

```rust
#[test]
fn my_test() { ... }   // outside a cfg(test) module
```

This compiles the test code into your release binary unnecessarily. Wrap tests in
`#[cfg(test)] mod tests { ... }`.

**Forgetting to use pub on functions tested from another file**

Integration tests in the `tests/` directory are separate crates. They can only call
`pub` functions from your crate. Unit tests in `#[cfg(test)]` live inside the module
and can access private functions.

**Not checking Cargo.lock into version control for binaries**

`Cargo.lock` pins every dependency to an exact version. Committing it makes builds
reproducible. For library crates, omit it so users get the latest compatible versions.

---

## T1.12 Key Terms

| Term | Meaning |
|------|---------|
| `rustup` | Tool for installing and managing Rust toolchains and components |
| `cargo` | Rust's build system, package manager, and task runner |
| `Cargo.toml` | Project manifest: name, version, dependencies, build configuration |
| `Cargo.lock` | Exact pinned versions of every dependency; generated by cargo |
| `cargo check` | Type-checks the crate without building a binary; faster than `cargo build` |
| `rustfmt` | Automatic code formatter; enforces the community style |
| `clippy` | Linter that catches common mistakes and suggests idiomatic alternatives |
| `#[test]` | Attribute marking a function as a unit test |
| `#[cfg(test)]` | Attribute making a module compile only during `cargo test` |
| `#[should_panic]` | Marks a test that is expected to panic; fails if it does not |
| doc test | An example in a `///` comment compiled and run by `cargo test --doc` |
| `rustdoc` | Tool that generates HTML documentation from `///` comments |
