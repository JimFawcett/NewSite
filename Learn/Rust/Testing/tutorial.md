# Unit and Integration Testing

## 9.0 What This Teaches

Rust has a built-in test framework that requires no third-party libraries for most
needs. This tutorial covers:

- Unit tests inside `#[cfg(test)]` modules - including testing private functions
- Assertion macros: `assert!`, `assert_eq!`, `assert_ne!`
- `#[should_panic]` for expected failures
- `#[ignore]` for skipping slow or conditional tests
- Integration tests in the `tests/` directory
- Shared test helpers in `tests/common/mod.rs`
- Filtering and controlling test runs from the command line

---

## 9.1 Project Layout

This tutorial uses a crate that exposes a library (`src/lib.rs`) alongside a binary
(`src/main.rs`). Integration tests live in a separate `tests/` directory:

```
Testing/
  Cargo.toml
  src/
    lib.rs          <- public API + unit tests
    main.rs         <- binary entry point
  tests/
    common/
      mod.rs        <- shared helpers for integration tests
    integration_test.rs
```

Unit tests and integration tests serve different purposes:

| | Unit tests | Integration tests |
|--|-----------|------------------|
| Location | Inside `src/` (usually the same file as the code) | `tests/` directory |
| Crate boundary | Same crate - can test private functions | External crate - public API only |
| When to use | Test individual functions in isolation | Test that the public API works end-to-end |

---

## 9.2 Unit Tests

A unit test is any function annotated with `#[test]`. Group them in a
`#[cfg(test)]` module so they are excluded from release builds:

```rust
pub fn add(a: i32, b: i32) -> i32 {
    a + b
}

#[cfg(test)]
mod tests {
    use super::*;   // brings the parent module's items into scope

    #[test]
    fn add_positive_numbers() {
        assert_eq!(add(2, 3), 5);
    }

    #[test]
    fn add_with_negative() {
        assert_eq!(add(-4, 4), 0);
    }
}
```

`use super::*` imports everything from the module being tested. This is the standard
pattern - write it once at the top of the `tests` module.

---

## 9.3 Assertion Macros

| Macro | Passes when | On failure prints |
|-------|-------------|-------------------|
| `assert!(expr)` | `expr` is `true` | nothing extra |
| `assert_eq!(a, b)` | `a == b` | both values |
| `assert_ne!(a, b)` | `a != b` | both values |

All three accept an optional format string for a custom failure message:

```rust
assert_eq!(add(1, 2), 3, "1 + 2 should be 3, got {}", add(1, 2));
assert_ne!(add(1, 2), 0, "1 + 2 should never be zero");
```

`assert_eq!` and `assert_ne!` require the values to implement `Debug` (so they can
be printed) and `PartialEq` (so they can be compared).

---

## 9.4 Testing Private Functions

Unit tests that live inside a `#[cfg(test)]` module in the same file as the code can
access private functions. This is intentional - internal helpers deserve testing too:

```rust
impl Accumulator {
    pub fn add(&mut self, n: i32)  { self.total += n; }
    pub fn total(&self) -> i32     { self.total }

    fn reset(&mut self) { self.total = 0; }  // private
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn reset_clears_total() {
        let mut acc = Accumulator::new();
        acc.add(5);
        acc.reset();   // accessible here even though it is private
        assert_eq!(acc.total(), 0);
    }
}
```

Integration tests in `tests/` cannot call `reset` - it is not part of the public API.

---

## 9.5 \#[should_panic]

Mark a test with `#[should_panic]` when the correct behavior is a panic. The test
passes only if the code panics; it fails if the code runs without panicking.

```rust
#[test]
#[should_panic(expected = "index out of bounds")]
fn vec_index_panics() {
    let v: Vec<i32> = vec![];
    let _ = v[0];
}
```

The optional `expected = "..."` checks that the panic message contains the given
substring. This prevents the test from passing on a wrong panic from a different
location.

---

## 9.6 \#[ignore]

Mark tests that are too slow, require external resources, or are not ready yet with
`#[ignore]`. They are skipped in normal test runs:

```rust
#[test]
#[ignore = "slow: requires network"]
fn expensive_network_test() {
    // ...
}
```

Run ignored tests explicitly:

```
cargo test -- --ignored          # run only ignored tests
cargo test -- --include-ignored  # run all tests including ignored
```

---

## 9.7 Integration Tests

Files in the `tests/` directory are compiled as separate crates that import the
library under test. They can only call public functions:

```rust
// tests/integration_test.rs
use testing::{add, clamp, is_palindrome};

#[test]
fn integration_add_works() {
    assert_eq!(add(100, 200), 300);
}

#[test]
fn integration_palindrome_phrase() {
    assert!(is_palindrome("Never odd or even"));
}

#[test]
fn integration_clamp_boundaries() {
    assert_eq!(clamp(i32::MIN, 0, 100), 0);
    assert_eq!(clamp(i32::MAX, 0, 100), 100);
}
```

Each file in `tests/` becomes its own test binary. All `#[test]` functions in the
file are collected and run together.

---

## 9.8 Shared Test Helpers

When multiple integration test files need the same setup code, put it in
`tests/common/mod.rs`. Rust treats `common` as a module, not as a test binary:

```rust
// tests/common/mod.rs
use testing::Accumulator;

pub fn accumulator_with(values: &[i32]) -> Accumulator {
    let mut acc = Accumulator::new();
    for &v in values { acc.add(v); }
    acc
}
```

Import it in an integration test file with `mod common;`:

```rust
// tests/integration_test.rs
mod common;

#[test]
fn integration_accumulator_via_helper() {
    let acc = common::accumulator_with(&[1, 2, 3, 4, 5]);
    assert_eq!(acc.total(), 15);
}
```

Using `tests/common/mod.rs` (not `tests/common.rs`) prevents Cargo from treating
`common` as its own test binary.

---

## 9.9 Running Tests

```
cargo test                        # run all unit and integration tests
cargo test palindrome             # run tests whose name contains "palindrome"
cargo test -- --nocapture         # show println! output from passing tests
cargo test -- --test-threads=1   # run tests one at a time (useful for I/O)
cargo test --lib                  # run only unit tests (lib.rs)
cargo test --test integration_test  # run only the integration_test.rs file
cargo test -- --ignored           # run only #[ignore]d tests
```

Test names include the module path. Filter by any substring of the full name:

```
cargo test tests::add             # runs add_positive_numbers and add_with_negative
cargo test clamp_above            # runs only clamp_above_range
```

---

## 9.10 Expected Output

```
running 13 tests
test tests::accumulator_adds_values ... ok
test tests::accumulator_reset_is_private_but_testable_here ... ok
test tests::add_positive_numbers ... ok
test tests::add_returns_nonzero_for_nonzero_inputs ... ok
test tests::add_with_negative ... ok
test tests::clamp_above_range ... ok
test tests::clamp_below_range ... ok
test tests::clamp_within_range ... ok
test tests::not_a_palindrome ... ok
test tests::palindrome_ignores_case_and_spaces ... ok
test tests::palindrome_simple ... ok
test tests::slow_integration_placeholder ... ignored, slow: requires network
test tests::vec_index_panics - should panic ... ok

test result: ok. 12 passed; 0 failed; 1 ignored; 0 measured

running 4 tests
test integration_accumulator_via_helper ... ok
test integration_add_works ... ok
test integration_clamp_boundaries ... ok
test integration_palindrome_phrase ... ok

test result: ok. 4 passed; 0 failed; 0 ignored; 0 measured
```

---

## 9.11 Exercise

1. Add a function `pub fn factorial(n: u64) -> u64` to `src/lib.rs`. Write unit tests
   for `factorial(0)`, `factorial(1)`, `factorial(5)`, and `factorial(10)`. Run
   `cargo test factorial` to verify they pass.

2. Add an integration test in `tests/integration_test.rs` that calls `factorial(6)`
   and asserts it equals 720.

3. Add a function that intentionally panics on bad input (e.g., `factorial` of a
   number that would overflow `u64`). Write a `#[should_panic]` test with an
   `expected` substring to verify the panic message.

4. Mark one of your new tests with `#[ignore = "example of ignored test"]`. Run
   `cargo test` and confirm it is skipped, then run `cargo test -- --ignored` to run
   it explicitly.

---

## 9.12 Common Mistakes

**Putting test code outside #[cfg(test)]**

```rust
fn helper_for_tests() { ... }   // compiled into the release binary unnecessarily
```

Wrap test helpers in `#[cfg(test)]` so they are excluded from non-test builds.

**Using tests/common.rs instead of tests/common/mod.rs**

```
tests/common.rs            <- Cargo treats this as a test binary; runs zero tests
tests/common/mod.rs        <- Cargo treats this as a module; no test binary created
```

Always use the `mod.rs` form for shared integration test code.

**Forgetting use super::* in the test module**

```rust
#[cfg(test)]
mod tests {
    #[test]
    fn test_add() {
        assert_eq!(add(1, 2), 3);  // error: cannot find function `add`
    }
}
```

Add `use super::*;` as the first line inside `mod tests`.

**Expecting println! output to appear without --nocapture**

Rust captures stdout from passing tests by default. If you added `println!` to debug
a test and see nothing, pass `-- --nocapture` to the test runner.

**Using assert! instead of assert_eq! for equality**

```rust
assert!(add(1, 2) == 3);    // on failure: "assertion failed"
assert_eq!(add(1, 2), 3);   // on failure: "left: 4, right: 3"
```

`assert_eq!` prints both values on failure, making it far easier to diagnose what
went wrong.

---

## 9.13 Key Terms

| Term | Meaning |
|------|---------|
| `#[test]` | Marks a function as a test; collected and run by `cargo test` |
| `#[cfg(test)]` | Compiles the annotated item only during `cargo test` runs |
| `assert_eq!(a, b)` | Asserts equality; prints both values on failure |
| `assert_ne!(a, b)` | Asserts inequality; prints both values on failure |
| `#[should_panic]` | Test passes only if the body panics; fails if it does not |
| `#[ignore]` | Skips the test in normal runs; run explicitly with `--ignored` |
| unit test | A test in the same file as the code; can access private items |
| integration test | A test in `tests/`; treats the crate as an external user would |
| `tests/common/mod.rs` | Shared helper module for integration tests; not run as a test binary |
| `--nocapture` | Flag that shows `println!` output from passing tests |
