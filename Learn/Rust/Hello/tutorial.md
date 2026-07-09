# Hello - Your First Rust Program

## 1.0 What This Teaches

This tutorial introduces the smallest useful Rust binary crate. It covers:

- The structure of a binary crate
- The `main` function as the program entry point
- The `println!` macro for writing to the console
- How to build and run with Cargo

---

## 1.1 What a Binary Crate Is

Rust projects are organized as *crates*. A binary crate compiles to an executable - a program you can run.
A library crate compiles to a `.rlib` file that other crates can use. This project is a binary crate.

Cargo, Rust's build tool and package manager, created this crate for you when you ran:

```
cargo new Hello --bin
```

The `--bin` flag tells Cargo to generate a binary crate. Cargo created two things:

- `Cargo.toml` - the project manifest (name, version, dependencies)
- `src/main.rs` - the source file where execution begins

---

## 1.2 The Entry Point

Every Rust binary crate must have exactly one `main` function. The runtime calls `main` when the
program starts. There is no return value from `main` unless you explicitly declare one for error
reporting - for now, the default (returning nothing) is correct.

```rust
fn main() {
    println!("Hello, world!");
}
```

The keyword `fn` declares a function. The empty parentheses `()` mean `main` takes no parameters.
The body is enclosed in `{ }`.

---

## 1.3 The `println!` Macro

`println!` ends with `!`, which means it is a macro, not a regular function. Rust macros look
like function calls but expand into more code at compile time. You use `println!` instead of a
plain function because it handles a variable number of arguments and format specifiers - something
Rust's type system makes difficult for ordinary functions.

```rust
println!("Hello, world!");
```

The string literal `"Hello, world!"` has type `&str` - a reference to a UTF-8 encoded string
stored in the program's read-only memory. `println!` appends a newline after printing.

If you want to print without a newline, use `print!` instead.

---

## 1.4 Building and Running

Cargo handles compiling and linking. From the `Hello/` directory, run:

```
cargo run
```

Cargo compiles the code and immediately runs the resulting executable. You will see:

```
Hello, world!
```

To only build without running:

```
cargo build
```

The executable lands in `target/debug/Hello.exe` (Windows) or `target/debug/Hello` (Linux/macOS).
The `debug` folder indicates a debug build - fast to compile, includes debug symbols, not optimized.
For a release build, add `--release`:

```
cargo build --release
```

---

## 1.5 Example - Adding a Second Line

Before the exercise, here is a slightly extended version showing multiple `println!` calls:

```rust
fn main() {
    println!("Hello, world!");
    println!("Rust version: {}", env!("CARGO_PKG_RUST_VERSION"));
}
```

`env!("CARGO_PKG_RUST_VERSION")` reads a value from the Cargo manifest at compile time. The `{}`
inside the format string is a placeholder - `println!` substitutes the next argument in its place.

---

## 1.6 Exercise

Modify `src/main.rs` so it prints your name and the current year, each on its own line. Use two
separate `println!` calls. Build and run to confirm the output.

---

## 1.7 Common Mistakes

**Forgetting the `!` on `println`**

Writing `println(...)` instead of `println!(...)` causes a compile error. `println` without `!`
is not a defined function - only the macro form exists.

**Missing semicolons**

Rust statements end with `;`. Omitting it changes the meaning of the line - the expression
becomes a return value, which is only valid as the last line of a function body.

**Mismatched placeholder count**

If the number of `{}` placeholders in the format string does not match the number of extra
arguments, Rust refuses to compile. The check happens at compile time, not at runtime.

---

## 1.8 Key Terms

| Term | Meaning |
|------|---------|
| crate | A compilation unit in Rust - either a binary or a library |
| Cargo | Rust's build tool and package manager |
| `main` | The function the runtime calls to start a binary program |
| macro | Code that expands into more code at compile time; identified by `!` |
| `&str` | A reference to a UTF-8 string slice stored in read-only memory |
| format string | A string literal with `{}` placeholders that `println!` fills in |
