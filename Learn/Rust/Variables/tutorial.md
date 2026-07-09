# Variables and Types

## 2.0 What This Teaches

This tutorial covers how Rust handles variables and the primitive types you will use in almost
every program:

- Immutable and mutable bindings
- Type inference and explicit annotations
- Primitive types: integers, floats, booleans, characters
- Shadowing

---

## 2.1 Bindings, Not Variables

Rust uses the word *binding* intentionally. `let x = 5` does not declare a variable in the
traditional sense - it binds the name `x` to the value `5`. The distinction matters because
bindings are immutable by default. Trying to change `x` after binding it is a compile error,
not a runtime error.

```rust
let x = 5;
x = 10;  // compile error: cannot assign twice to immutable variable
```

Immutability by default is a deliberate design choice. It makes it easier to reason about
where values change, which becomes critical when you add concurrency later.

---

## 2.2 Mutable Bindings

When you do need to change a value, add `mut`:

```rust
let mut count = 0;
count += 1;
println!("count = {count}");  // prints: count = 1
```

`mut` is explicit and visible at the declaration site. Any reader of the code immediately
knows `count` will change somewhere below.

---

## 2.3 Type Inference

Rust infers the type of a binding from the value you assign. You rarely need to write the
type explicitly:

```rust
let x = 5;        // inferred as i32
let ratio = 3.14; // inferred as f64
let flag = true;  // inferred as bool
```

When the inferred type is not what you want, annotate it explicitly:

```rust
let ratio: f64 = 3.14;
let small: i8  = 127;
```

The annotation sits between the name and the `=`, separated by `:`.

---

## 2.4 Integer Types

Rust provides signed and unsigned integers at several sizes:

| Type  | Size    | Range |
|-------|---------|-------|
| `i8`  | 8-bit   | -128 to 127 |
| `i16` | 16-bit  | -32,768 to 32,767 |
| `i32` | 32-bit  | -2,147,483,648 to 2,147,483,647 |
| `i64` | 64-bit  | ±9.2 × 10¹⁸ |
| `i128`| 128-bit | very large |
| `u8`  | 8-bit   | 0 to 255 |
| `u16` | 16-bit  | 0 to 65,535 |
| `u32` | 32-bit  | 0 to 4,294,967,295 |
| `u64` | 64-bit  | 0 to 1.8 × 10¹⁹ |
| `usize` | pointer-sized | platform-dependent |

The default integer type when Rust infers is `i32`. Use `usize` for array indices and
collection lengths - the standard library expects it.

You can use underscores in numeric literals for readability: `1_000_000` is the same as
`1000000`.

---

## 2.5 Floating-Point Types

Rust has two floating-point types:

| Type  | Size   | Precision |
|-------|--------|-----------|
| `f32` | 32-bit | ~7 decimal digits |
| `f64` | 64-bit | ~15 decimal digits |

The default inferred float type is `f64`. Prefer `f64` unless you have a specific reason
to use `f32` (memory pressure, hardware requirements).

---

## 2.6 Boolean

`bool` holds either `true` or `false`. It is the required type for `if` conditions -
Rust does not coerce integers to booleans the way C does.

```rust
let is_ready: bool = true;

if is_ready {
    println!("ready");
}
```

---

## 2.7 Character

`char` holds a single Unicode scalar value and occupies 4 bytes. That is broader than
ASCII - a `char` can hold any character from any human language.

```rust
let letter: char = 'R';
let emoji: char  = '🦀';  // the Rust mascot
```

Use single quotes for `char` literals. Double quotes are for string literals (`&str`).

---

## 2.8 Shadowing

Shadowing rebinds a name to a new value in the same scope. The old binding is hidden
but not mutated:

```rust
let x = 5;
let x = x * 2;  // new binding; shadows the first x
println!("x = {x}");  // prints: x = 10
```

Shadowing differs from `mut` in two ways:

1. The new binding can have a different type - useful when transforming a value through
   several steps.
2. Each `let` creates a fresh immutable binding; the original is gone from that point
   forward.

---

## 2.9 Example - All Together

```rust
fn main() {
    let x = 5;
    println!("x = {x}");

    let mut count = 0;
    count += 1;
    println!("count = {count}");

    let ratio: f64 = 3.14;
    println!("ratio = {ratio}");

    let is_ready: bool = true;
    println!("is_ready = {is_ready}");

    let letter: char = 'R';
    println!("letter = {letter}");

    let x = x * 2;
    println!("x after shadowing = {x}");

    let big: i64  = 1_000_000;
    let small: i8 = 127;
    println!("big = {big}, small = {small}");

    let index: usize = 42;
    println!("index = {index}");
}
```

Expected output:

```
x = 5
count = 1
ratio = 3.14
is_ready = true
letter = R
x after shadowing = 10
big = 1000000, small = 127
index = 42
```

---

## 2.10 Exercise

1. Declare an immutable binding for your age as `u8`. Print it.
2. Declare a mutable binding for a temperature as `f32`. Change it and print both values.
3. Shadow a string-count binding: first bind it to `3` (an integer), then shadow it with
   the string `"three"`. Print the shadowed value. Notice that shadowing allows a type change.

---

## 2.11 Common Mistakes

**Trying to mutate an immutable binding**

```rust
let x = 5;
x = 10;  // error: cannot assign twice to immutable variable `x`
```

Fix: add `mut` to the declaration.

**Mixing integer types without casting**

```rust
let a: i32 = 10;
let b: i64 = 20;
let c = a + b;  // error: mismatched types
```

Rust does not silently widen integer types. Fix: cast explicitly with `a as i64 + b`.

**Confusing `char` and `&str` literal syntax**

```rust
let c = "R";  // this is &str, not char
let c = 'R';  // this is char
```

Single quotes for `char`, double quotes for string slices.

**Assuming default integer is `i64`**

The default inferred integer type is `i32`, not `i64`. If you need a larger range without
annotating, the value will overflow at `i32::MAX` (2,147,483,647) and Rust will panic in
debug mode.

---

## 2.12 Key Terms

| Term | Meaning |
|------|---------|
| binding | A name bound to a value via `let` |
| immutable | Cannot be changed after binding (the default) |
| `mut` | Keyword that makes a binding mutable |
| type inference | Compiler deduces the type from the assigned value |
| shadowing | Rebinding a name in the same scope with a new `let` |
| `i32` | Default signed 32-bit integer |
| `f64` | Default 64-bit floating-point number |
| `usize` | Pointer-sized unsigned integer; used for indices and lengths |
| `char` | A single Unicode scalar value, 4 bytes |
