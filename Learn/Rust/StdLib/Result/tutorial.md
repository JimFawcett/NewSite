# Result\<T, E\> and Error Handling

## S4.0 What This Teaches

`Result<T, E>` is Rust's primary mechanism for expressing operations that can fail.
Unlike exceptions, errors are values - the type system forces you to handle them. This
tutorial covers:

- The `Ok` / `Err` variants
- `match` for explicit error handling
- The `?` operator for propagating errors up the call chain
- `unwrap`, `expect`, `unwrap_or`
- Transforming results with `map`, `map_err`, and `and_then`

---

## S4.1 The Result Type

`Result<T, E>` is a standard library enum:

```rust
enum Result<T, E> {
    Ok(T),
    Err(E),
}
```

A function that can fail returns `Result`. The caller must inspect the variant before
using the value - the compiler will not let you ignore it silently.

---

## S4.2 Returning Result from a Function

```rust
use std::num::ParseIntError;

fn parse_positive(s: &str) -> Result<u32, String> {
    let n: i32 = s.parse().map_err(|e: ParseIntError| e.to_string())?;
    if n < 0 {
        Err(format!("{n} is negative"))
    } else {
        Ok(n as u32)
    }
}
```

The return type names both the success type (`u32`) and the error type (`String`). The
body uses `?` and returns `Ok(...)` or `Err(...)` explicitly.

---

## S4.3 Handling Result with match

`match` is the most explicit way to handle both outcomes:

```rust
match parse_positive("42") {
    Ok(n)  => println!("ok: {n}"),
    Err(e) => println!("err: {e}"),
}
```

The compiler requires both arms. You cannot accidentally use a value that might be an
error.

---

## S4.4 The ? Operator

Inside a function that returns `Result`, `?` propagates an `Err` to the caller
automatically. It eliminates repetitive `match` boilerplate when you want errors to
bubble up:

```rust
fn double_positive(s: &str) -> Result<u32, String> {
    let n = parse_positive(s)?;   // returns Err to caller if parse_positive fails
    Ok(n * 2)
}
```

`?` can only appear in functions whose return type is `Result` (or `Option`). Using it
in `main` requires `main` to return `Result<(), E>`.

---

## S4.5 unwrap and expect

When you are certain a `Result` is `Ok` - typically in tests or demos - `unwrap`
extracts the value or panics on `Err`:

```rust
let val = parse_positive("10").unwrap();
```

`expect` is the same but adds a custom message to the panic:

```rust
let val = parse_positive("10").expect("should always parse");
```

Do not use `unwrap` in production code where `Err` is a realistic outcome.

---

## S4.6 unwrap_or

`unwrap_or` returns the inner value on `Ok`, or a given default on `Err`:

```rust
let val = parse_positive("oops").unwrap_or(0);
println!("{val}");   // 0
```

---

## S4.7 map, map_err, and and_then

These methods transform `Result` values without unwrapping them, enabling pipelines:

**`map`** - applies a closure to the `Ok` value; passes `Err` through:

```rust
let doubled = parse_positive("8").map(|n| n * 2);
// Ok(16)
```

**`map_err`** - transforms the `Err` value; passes `Ok` through:

```rust
let result = parse_positive("xyz")
    .map_err(|e| format!("parse failed: {e}"));
// Err("parse failed: invalid digit found in string")
```

**`and_then`** - chains a second fallible operation; short-circuits on the first `Err`:

```rust
let result = parse_positive("20")
    .and_then(|n| if n < 100 { Ok(n) } else { Err(String::from("too large")) });
// Ok(20)
```

---

## S4.8 Expected Output

```
--- match ---
ok: 42
err: -5 is negative
err: invalid digit found in string
--- ? operator ---
Ok(14)
Err("invalid digit found in string")
--- unwrap_or ---
unwrap_or: 0
--- expect ---
expect: 10
--- map ---
map: Ok(16)
--- map_err ---
map_err: Err("parse failed: invalid digit found in string")
--- and_then ---
and_then: Ok(20)
--- is_ok / is_err ---
is_ok:  true
is_err: true
```

---

## S4.9 Exercise

1. Write a function `safe_sqrt(x: f64) -> Result<f64, String>` that returns
   `Err` when `x` is negative and `Ok(x.sqrt())` otherwise. Test it with positive,
   zero, and negative inputs.

2. Write a function `read_two_ints(a: &str, b: &str) -> Result<i32, String>` that
   parses both strings and returns their sum. Use `?` to propagate any parse error.

3. Chain `safe_sqrt` and a second function `safe_log(x: f64) -> Result<f64, String>`
   (returns `Err` for x <= 0) using `and_then`. Compute `log(sqrt(16.0))` and print
   the result.

---

## S4.10 Common Mistakes

**Using unwrap in code where Err is realistic**

```rust
let content = std::fs::read_to_string("config.txt").unwrap();
```

If the file does not exist, this panics with an unhelpful message. Use `?`, `match`,
or `.unwrap_or_else(|e| ...)` to handle the error meaningfully.

**Returning Err with the wrong type**

```rust
fn f() -> Result<u32, String> {
    let n: i32 = "x".parse()?;   // parse returns ParseIntError, not String
    Ok(n as u32)
}
```

`?` requires the error type to convert into the function's declared error type via
`From`. Either add `.map_err(|e| e.to_string())` before `?`, or use a boxed error
type for heterogeneous errors.

**Ignoring a Result**

```rust
std::fs::remove_file("tmp.txt");   // warning: unused Result
```

Rust warns when you discard a `Result`. If you truly do not care, write
`let _ = std::fs::remove_file("tmp.txt");` to silence the warning explicitly.

---

## S4.11 Key Terms

| Term | Meaning |
|------|---------|
| `Result<T, E>` | Enum representing success (`Ok(T)`) or failure (`Err(E)`) |
| `Ok(T)` | The success variant carrying a value of type `T` |
| `Err(E)` | The failure variant carrying an error of type `E` |
| `?` | Propagates `Err` to the caller; can only appear in `Result`-returning functions |
| `unwrap` | Extracts `Ok` value or panics on `Err` |
| `expect` | Like `unwrap` with a custom panic message |
| `unwrap_or` | Returns `Ok` value or a given default on `Err` |
| `map` | Transforms the `Ok` value via a closure; passes `Err` through |
| `map_err` | Transforms the `Err` value via a closure; passes `Ok` through |
| `and_then` | Chains a second `Result`-returning closure on `Ok`; short-circuits on `Err` |
