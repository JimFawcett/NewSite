# Demonstrations Using the examples/ Folder

## D1.0 What This Teaches

Cargo has built-in support for runnable demonstration programs in an `examples/`
directory. They are separate from the main binary and from tests - each is a focused,
standalone program that shows one concept or use-case. This tutorial covers:

- Why `examples/` exists and when to use it
- Single-file examples (`examples/name.rs`)
- Multi-file examples (`examples/name/main.rs` with local modules)
- How examples access the crate's public library
- Running, building, and listing examples with cargo commands

---

## D1.1 Why examples/?

A crate's `src/main.rs` is the application entry point - one binary for the whole
program. When you want to demonstrate several independent features, cramming everything
into `main` makes it cluttered and hard to follow.

The `examples/` directory solves this:

- Each file is its own `main` function compiled into its own binary.
- Examples are excluded from the normal `cargo build` and `cargo test` output.
- They use the crate's public library API exactly as an external user would.
- They serve as living documentation - if the API changes and an example breaks, the
  compiler tells you.

Examples are the right place for "here is how to use this feature" code. Unit tests
are for "this function returns the correct value." The two have different audiences
and different purposes.

---

## D1.2 Project Layout

This tutorial uses a crate that has both a library (`src/lib.rs`) and a binary
(`src/main.rs`). The library exposes the public API that examples import:

```
Demonstrations/
  Cargo.toml
  src/
    lib.rs                         <- public API
    main.rs                        <- "run cargo run --example <name>" reminder
  examples/
    basic.rs                       <- single-file example
    words.rs                       <- single-file example
    shapes.rs                      <- single-file example
    shapes_multifile/
      main.rs                      <- multi-file example entry point
      geometry.rs                  <- local helper module
```

---

## D1.3 Single-File Examples

A file at `examples/name.rs` is a complete example. It must contain a `fn main()`.
It imports the crate's public library by the crate name (from `Cargo.toml`):

```rust
// examples/basic.rs
use demonstrations::{add, clamp};

fn main() {
    let sum = add(7, 3);
    println!("add(7, 3) = {sum}");

    println!("clamp(25, 0, 20) = {}", clamp(25, 0, 20));
    println!("clamp(-5, 0, 20) = {}", clamp(-5, 0, 20));
}
```

Run it:

```
cargo run --example basic
```

Output:

```
=== basic example ===
add(7, 3)         = 10
clamp(25, 0, 20)  = 20
clamp(-5, 0, 20)  = 0
clamp(10, 0, 20)  = 10
```

The example name is the filename without `.rs`. Cargo compiles only the requested
example, so build times stay short.

---

## D1.4 Single-File Example: words

```rust
// examples/words.rs
use demonstrations::{word_count, unique_words};

fn main() {
    let text = "the quick brown fox jumps over the lazy dog the fox";

    println!("word_count:   {}", word_count(text));
    println!("unique words: {:?}", unique_words(text));
}
```

```
cargo run --example words
```

Output:

```
=== words example ===
text:         "the quick brown fox jumps over the lazy dog the fox"
word_count:   11
unique words: ["brown", "dog", "fox", "jumps", "lazy", "over", "quick", "the"]
```

---

## D1.5 Single-File Example: shapes

```rust
// examples/shapes.rs
use demonstrations::{Circle, Rectangle};

fn main() {
    let c = Circle::new(5.0);
    println!("Circle r=5  area={:.4}  circumference={:.4}",
             c.area(), c.circumference());

    let r = Rectangle::new(4.0, 6.0);
    println!("Rectangle 4x6  area={:.1}  perimeter={:.1}  square={}",
             r.area(), r.perimeter(), r.is_square());
}
```

```
cargo run --example shapes
```

---

## D1.6 Multi-File Examples

When an example grows large enough to need helper modules, use the directory form.
Create a folder under `examples/` with the example name, containing `main.rs` and any
supporting files:

```
examples/
  shapes_multifile/
    main.rs        <- entry point; fn main() lives here
    geometry.rs    <- local module; imported with `mod geometry;`
```

`main.rs` references the local module with `mod geometry;` exactly as in a normal
crate:

```rust
// examples/shapes_multifile/main.rs
mod geometry;

use demonstrations::{Circle, Rectangle};

fn main() {
    let circles = vec![Circle::new(1.0), Circle::new(3.0), Circle::new(5.0)];
    for c in &circles {
        geometry::print_circle_report(c);
    }
}
```

```rust
// examples/shapes_multifile/geometry.rs
use demonstrations::Circle;

pub fn print_circle_report(c: &Circle) {
    println!("{:?}  area={:.4}  circ={:.4}", c, c.area(), c.circumference());
}
```

Run it the same way:

```
cargo run --example shapes_multifile
```

The example name is the directory name, not the filename.

---

## D1.7 cargo Commands for Examples

```
cargo run --example basic              # build and run one example
cargo build --example shapes           # build without running; binary goes to target/debug/examples/
cargo build --examples                 # build all examples
cargo run --example basic -- arg1      # pass arguments to the example's main
```

To see all available examples in a project, look at the `examples/` directory or
run:

```
cargo run --example          # cargo lists available examples when the name is omitted
```

---

## D1.8 How Examples Access the Library

An example is a separate compilation unit. It sees the crate as an external dependency,
just like code in `tests/`. Only `pub` items from `src/lib.rs` are accessible.

The `use` statement uses the crate name from `Cargo.toml`:

```toml
# Cargo.toml
[package]
name = "demonstrations"
```

```rust
// examples/basic.rs
use demonstrations::add;   // "demonstrations" matches the package name
```

If the crate has no `src/lib.rs` - only `src/main.rs` - examples cannot import any
functions from it. The library file is required to share code with examples.

---

## D1.9 Examples vs. Tests vs. main.rs

| | `src/main.rs` | `examples/` | `tests/` |
|--|--------------|-------------|---------|
| Purpose | The application | Focused demonstrations | Correctness verification |
| Entry point | One `main` | One `main` per file or directory | `#[test]` functions |
| Run with | `cargo run` | `cargo run --example name` | `cargo test` |
| Access | Full crate | Public API only | Public API only |
| In release build | Yes | Only if `--example` is used | No |

---

## D1.10 Expected Outputs

**basic:**
```
=== basic example ===
add(7, 3)         = 10
clamp(25, 0, 20)  = 20
clamp(-5, 0, 20)  = 0
clamp(10, 0, 20)  = 10
```

**words:**
```
=== words example ===
text:         "the quick brown fox jumps over the lazy dog the fox"
word_count:   11
unique words: ["brown", "dog", "fox", "jumps", "lazy", "over", "quick", "the"]
```

**shapes:**
```
=== shapes example ===
Circle r=5:
  area          = 78.5398
  circumference = 31.4159
Rectangle 4x6:
  area          = 24.0
  perimeter     = 20.0
  is_square     = false
Rectangle 5x5:
  is_square     = true
```

**shapes_multifile:**
```
=== shapes_multifile example ===
Circles:
  Circle { radius: 1.0 }
    area          = 3.1416
    circumference = 6.2832
  ...
Rectangles:
  Rectangle { width: 2.0, height: 8.0 }
    area          = 16.00
    perimeter     = 20.00
    is_square     = false
  ...
```

---

## D1.11 Exercise

1. Add a function `pub fn fibonacci(n: u64) -> u64` to `src/lib.rs`. Create
   `examples/fibonacci.rs` that prints the first 10 Fibonacci numbers. Run it with
   `cargo run --example fibonacci`.

2. Create a multi-file example `examples/stats/` with:
   - `main.rs` that drives the demonstration
   - `compute.rs` with helper functions `mean(data: &[f64]) -> f64` and
     `std_dev(data: &[f64]) -> f64`
   Test it with a small data set and print the results.

3. Add a command-line argument to `examples/basic.rs`: if the user passes a number
   as an argument, use it as the value for `clamp`. Use `std::env::args()` to read
   it. Run with `cargo run --example basic -- 15`.

---

## D1.12 Common Mistakes

**Missing src/lib.rs**

If the crate only has `src/main.rs`, examples cannot import anything from it:

```rust
use my_crate::some_function;   // error: unresolved import
```

Move shared code into `src/lib.rs` and mark it `pub`.

**Using the wrong crate name in use**

The name in `use` must match the `name` field in `Cargo.toml`, with hyphens replaced
by underscores. A crate named `"my-tools"` in Cargo.toml is imported as `my_tools`:

```rust
use my_tools::helper;   // correct for name = "my-tools"
```

**Naming the directory example the same as a .rs file**

If `examples/shapes.rs` and `examples/shapes/main.rs` both exist, Cargo reports an
ambiguity error. Use distinct names for single-file and directory examples.

**Expecting examples to run during cargo test**

`cargo test` does not run examples. Add `cargo build --examples` to CI to catch
compilation errors in examples without running them.

---

## D1.13 Key Terms

| Term | Meaning |
|------|---------|
| `examples/` | Cargo-recognized directory for standalone demonstration programs |
| single-file example | A `examples/name.rs` file with its own `fn main()` |
| multi-file example | A `examples/name/` directory with `main.rs` and optional helper modules |
| `cargo run --example name` | Builds and runs the named example |
| `cargo build --examples` | Compiles all examples without running them |
| `src/lib.rs` | The library file whose `pub` items are accessible to examples and tests |
| crate name | The `name` field in `Cargo.toml`; used in `use` statements by examples |
