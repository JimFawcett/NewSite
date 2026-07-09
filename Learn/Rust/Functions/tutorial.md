# Functions

## 3.0 What This Teaches

This tutorial covers how Rust defines and calls functions:

- Declaring functions with `fn`
- Parameters and required type annotations
- Return values and the `->` syntax
- Expressions vs. statements - the key to Rust's implicit return
- Early return with `return`
- Returning multiple values via tuples

---

## 3.1 Declaring a Function

The `fn` keyword declares a function. The body is enclosed in `{ }`.

```rust
fn greet() {
    println!("Hello from greet()");
}
```

This function takes no parameters and returns no value. Calling it:

```rust
greet();
```

When a function returns nothing, Rust says it returns the *unit type*, written `()`. You
rarely write `()` explicitly - omitting the return type annotation means unit is assumed.

---

## 3.2 Parameters

Parameters are declared inside the parentheses. Every parameter requires an explicit type
annotation. Rust does not infer parameter types - the function signature is a public
contract and must be unambiguous without looking at the body.

```rust
fn add(a: i32, b: i32) -> i32 {
    a + b
}
```

The `->` introduces the return type. Here both parameters are `i32` and the function
returns `i32`.

Multiple parameters are separated by commas. Each one is an independent `name: Type` pair -
you cannot write `a, b: i32` to share a type across two names.

---

## 3.3 Expressions vs. Statements

This is the most important distinction for writing idiomatic Rust functions.

A *statement* performs an action and produces no value. It ends with `;`.
An *expression* evaluates to a value. It has no `;`.

In Rust, the last expression in a function body is its return value. No `return` keyword
needed:

```rust
fn add(a: i32, b: i32) -> i32 {
    a + b   // expression - becomes the return value
}
```

Adding a semicolon changes `a + b` into a statement, which produces `()`. If the declared
return type is `i32`, the compiler rejects it:

```rust
fn add(a: i32, b: i32) -> i32 {
    a + b;  // now a statement - returns (), not i32 - compile error
}
```

This rule applies inside `if`, `loop`, and `match` blocks too, not just function bodies.

---

## 3.4 Early Return

Use `return` to exit before reaching the end of the function. This is common when you
find a result inside a loop or want to handle an error condition immediately:

```rust
fn first_positive(values: &[i32]) -> i32 {
    for &v in values {
        if v > 0 {
            return v;
        }
    }
    -1   // tail expression: reached only if the loop found nothing
}
```

The `&[i32]` parameter type is a *slice* - a reference to a sequence of `i32` values.
Slices let you pass arrays and vectors to the same function without copying them.

Reserve `return` for early exits. At the natural end of a function, prefer the tail
expression style - it is more idiomatic and easier to read.

---

## 3.5 Returning Multiple Values

Rust functions return exactly one value, but that value can be a tuple - a fixed-length
collection of values with potentially different types:

```rust
fn min_max(a: i32, b: i32) -> (i32, i32) {
    if a < b { (a, b) } else { (b, a) }
}
```

The caller unpacks the tuple with destructuring:

```rust
let (lo, hi) = min_max(9, 3);
println!("min = {lo}, max = {hi}");
```

The `if` here is an expression - both arms produce `(i32, i32)` tuples, and the whole
`if` expression is the function's return value.

---

## 3.6 Example - All Together

```rust
fn greet() {
    println!("Hello from greet()");
}

fn add(a: i32, b: i32) -> i32 {
    a + b
}

fn first_positive(values: &[i32]) -> i32 {
    for &v in values {
        if v > 0 {
            return v;
        }
    }
    -1
}

fn min_max(a: i32, b: i32) -> (i32, i32) {
    if a < b { (a, b) } else { (b, a) }
}

fn main() {
    greet();

    let sum = add(3, 4);
    println!("add(3, 4) = {sum}");

    let nums = [-2, -1, 5, 8];
    println!("first_positive = {}", first_positive(&nums));

    let (lo, hi) = min_max(9, 3);
    println!("min = {lo}, max = {hi}");
}
```

Expected output:

```
Hello from greet()
add(3, 4) = 7
first_positive = 5
min = 3, max = 9
```

---

## 3.7 Exercise

1. Write a function `square(n: i32) -> i32` that returns `n` multiplied by itself.
   Use a tail expression, not `return`.

2. Write a function `clamp(value: i32, lo: i32, hi: i32) -> i32` that returns `value`
   clamped to the range `[lo, hi]`. Use early `return` for at least one of the boundary
   checks.

3. Write a function `swap(a: i32, b: i32) -> (i32, i32)` that returns the two values
   in reversed order. Call it in `main` and destructure the result.

---

## 3.8 Common Mistakes

**Semicolon on the tail expression**

```rust
fn double(x: i32) -> i32 {
    x * 2;   // error: expected i32, found ()
}
```

Remove the semicolon. The expression `x * 2` must remain an expression, not a statement.

**Missing parameter type**

```rust
fn add(a, b: i32) -> i32 { ... }  // error: expected `:`
```

Each parameter needs its own type. Write `a: i32, b: i32`.

**Forgetting `->` for the return type**

```rust
fn add(a: i32, b: i32) i32 { ... }  // syntax error
```

The arrow `->` is required between the parameter list and the return type.

**Treating `return` as required**

Using `return` at the end of every function works, but it is not idiomatic Rust. The
tail expression form is preferred because it reads as "this function evaluates to X"
rather than "exit this function carrying X."

---

## 3.9 Key Terms

| Term | Meaning |
|------|---------|
| `fn` | Keyword that declares a function |
| parameter | A named input to a function; always requires a type annotation |
| `->` | Separates the parameter list from the return type |
| expression | Code that evaluates to a value; no trailing `;` |
| statement | Code that performs an action; ends with `;`; produces `()` |
| tail expression | The final expression in a block; becomes the block's value |
| `return` | Exits the function early, carrying the given value |
| unit type `()` | The type returned by functions that produce no meaningful value |
| tuple | A fixed-size ordered collection of values, possibly of different types |
| slice `&[T]` | A reference to a contiguous sequence of `T` values |
