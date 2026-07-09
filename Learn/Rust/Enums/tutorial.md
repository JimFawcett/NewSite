# Enums and Match

## 8.0 What This Teaches

Enums in Rust are far more powerful than in most languages - variants can carry data,
making them the right tool for expressing "one of several distinct things, each with its
own shape." This tutorial covers:

- Defining enums with plain and data-carrying variants
- `match` for exhaustive dispatch on an enum
- `impl` blocks on enums
- `Option<T>` - Rust's replacement for null
- `Option` methods: `unwrap_or`, `map`
- `if let` for single-variant matching
- Match guards for extra conditions inside arms

---

## 8.1 Basic Enum

An enum declares a type that is exactly one of a fixed set of variants at any given time:

```rust
#[derive(Debug)]
enum Direction {
    North,
    South,
    East,
    West,
}
```

Create a value by naming the enum and variant:

```rust
let dir = Direction::North;
```

`match` selects a branch based on which variant the value holds. The compiler requires
every variant to be covered - leave one out and it is a compile error:

```rust
let msg = match dir {
    Direction::North => "heading north",
    Direction::South => "heading south",
    Direction::East  => "heading east",
    Direction::West  => "heading west",
};
println!("{msg}");
```

Output:
```
heading north
```

This exhaustiveness guarantee is the key advantage of `match` over if/else chains. The
compiler tells you at build time when you have forgotten a case.

---

## 8.2 Data-Carrying Variants

Variants can hold data. Each variant in the same enum can have a completely different
shape - unlike a struct, which has the same fields for every instance.

```rust
#[derive(Debug)]
enum Shape {
    Circle(f64),                         // tuple variant: one field (radius)
    Rectangle(f64, f64),                 // tuple variant: two fields (width, height)
    Triangle { base: f64, height: f64 }, // struct variant: named fields
}
```

To create instances:

```rust
let c = Shape::Circle(3.0);
let r = Shape::Rectangle(4.0, 5.0);
let t = Shape::Triangle { base: 6.0, height: 4.0 };
```

Matching on a data-carrying variant binds the inner values to names:

```rust
match shape {
    Shape::Circle(r)                 => println!("circle, radius {r}"),
    Shape::Rectangle(w, h)           => println!("rect {w}x{h}"),
    Shape::Triangle { base, height } => println!("triangle, base {base}"),
}
```

---

## 8.3 impl Blocks on Enums

You can attach methods to enums just like structs. `match self` inside a method is the
standard pattern for dispatching on the variant:

```rust
impl Shape {
    fn area(&self) -> f64 {
        match self {
            Shape::Circle(r)                  => std::f64::consts::PI * r * r,
            Shape::Rectangle(w, h)            => w * h,
            Shape::Triangle { base, height }  => 0.5 * base * height,
        }
    }
}

let shapes = vec![
    Shape::Circle(3.0),
    Shape::Rectangle(4.0, 5.0),
    Shape::Triangle { base: 6.0, height: 4.0 },
];
for s in &shapes {
    println!("{:?} => area = {:.2}", s, s.area());
}
```

Output:
```
Circle(3.0) => area = 28.27
Rectangle(4.0, 5.0) => area = 20.00
Triangle { base: 6.0, height: 4.0 } => area = 12.00
```

---

## 8.4 Option\<T\> - No Null Pointers

`Option<T>` is a standard library enum defined as:

```rust
enum Option<T> {
    Some(T),
    None,
}
```

Rust has no null. Any value that might be absent is wrapped in `Option`. The compiler
forces you to handle both cases before using the inner value - a missing value can never
silently become a crash at runtime.

```rust
fn find_first_even(nums: &[i32]) -> Option<i32> {
    for &n in nums {
        if n % 2 == 0 { return Some(n); }
    }
    None
}
```

Use `match` to handle both outcomes:

```rust
match find_first_even(&[1, 3, 5, 8, 9]) {
    Some(n) => println!("first even: {n}"),
    None    => println!("no even number found"),
}
```

Output:
```
first even: 8
no even number found
```

---

## 8.5 Option Methods

`Option` provides several convenience methods so you do not always need a full `match`.

**`unwrap_or(default)`** - returns the inner value, or a default if `None`:

```rust
let val = find_first_even(&nums).unwrap_or(-1);
println!("{val}");  // 8 if found, -1 if not
```

**`map(closure)`** - transforms the inner value if `Some`, passes `None` through:

```rust
let doubled = find_first_even(&nums).map(|n| n * 2);
println!("{doubled:?}");  // Some(16) or None
```

**`is_some()` / `is_none()`** - boolean checks:

```rust
if find_first_even(&nums).is_some() {
    println!("found one");
}
```

These methods let you build short pipelines over optional values without nested `match`
expressions.

---

## 8.6 if let - Single-Variant Match

When you only care about one variant and want to ignore the rest, `if let` is more concise
than a full `match`:

```rust
if let Some(n) = find_first_even(&nums) {
    println!("found even: {n}");
}
// None is silently ignored
```

Pair it with `else` when you need to handle the other case:

```rust
if let Some(n) = find_first_even(&nums) {
    println!("found: {n}");
} else {
    println!("not found");
}
```

Use `if let` when the logic for one variant is the point and the other is trivial. Use
`match` when every variant carries meaningful logic.

---

## 8.7 Match Guards

A match arm can include an `if` condition called a guard. The arm only fires when both
the pattern matches and the guard is true:

```rust
let number = 7;
match number {
    n if n < 0  => println!("{n} is negative"),
    0           => println!("zero"),
    n if n < 10 => println!("{n} is a small positive"),
    n           => println!("{n} is large"),
}
```

Output:
```
7 is a small positive
```

Guards give you finer control than patterns alone, but use them sparingly - complex guards
can make arms harder to read.

---

## 8.8 Example - All Together

```rust
#[derive(Debug)]
#[allow(dead_code)]
enum Direction { North, South, East, West }

#[derive(Debug)]
enum Shape {
    Circle(f64),
    Rectangle(f64, f64),
    Triangle { base: f64, height: f64 },
}

impl Shape {
    fn area(&self) -> f64 {
        match self {
            Shape::Circle(r)                 => std::f64::consts::PI * r * r,
            Shape::Rectangle(w, h)           => w * h,
            Shape::Triangle { base, height } => 0.5 * base * height,
        }
    }
}

fn find_first_even(nums: &[i32]) -> Option<i32> {
    for &n in nums { if n % 2 == 0 { return Some(n); } }
    None
}

fn main() {
    let dir = Direction::North;
    let msg = match dir {
        Direction::North => "heading north",
        Direction::South => "heading south",
        Direction::East  => "heading east",
        Direction::West  => "heading west",
    };
    println!("{msg}");

    let shapes = vec![
        Shape::Circle(3.0),
        Shape::Rectangle(4.0, 5.0),
        Shape::Triangle { base: 6.0, height: 4.0 },
    ];
    for s in &shapes { println!("{:?} => area = {:.2}", s, s.area()); }

    let nums = vec![1, 3, 5, 8, 9];
    match find_first_even(&nums) {
        Some(n) => println!("first even: {n}"),
        None    => println!("not found"),
    }

    let val     = find_first_even(&nums).unwrap_or(-1);
    let doubled = find_first_even(&nums).map(|n| n * 2);
    println!("unwrap_or: {val}, map: {doubled:?}");

    if let Some(n) = find_first_even(&nums) {
        println!("if let found: {n}");
    }

    let number = 7;
    match number {
        n if n < 0  => println!("{n} is negative"),
        0           => println!("zero"),
        n if n < 10 => println!("{n} is a small positive"),
        n           => println!("{n} is large"),
    }
}
```

Expected output:

```
heading north
Circle(3.0) => area = 28.27
Rectangle(4.0, 5.0) => area = 20.00
Triangle { base: 6.0, height: 4.0 } => area = 12.00
first even: 8
unwrap_or: 8, map: Some(16)
if let found: 8
7 is a small positive
```

---

## 8.9 Exercise

1. Define an enum `Coin` with variants `Penny`, `Nickel`, `Dime`, `Quarter`. Write a
   function `value_in_cents(c: &Coin) -> u32` using `match`. Call it for each variant
   and print the results.

2. Add a variant `Dollar(String)` to `Coin` where the `String` holds the year of minting.
   Update `value_in_cents` to return 100 for `Dollar`, and add a match arm that also
   prints the year. Derive `Debug` and print a `Dollar` instance.

3. Write a function `safe_divide(a: f64, b: f64) -> Option<f64>` that returns `None`
   when `b` is zero and `Some(a / b)` otherwise. Use `if let` to print the result,
   and test both cases.

---

## 8.10 Common Mistakes

**Non-exhaustive match**

```rust
match dir {
    Direction::North => "north",
    Direction::South => "south",
    // error: patterns `East` and `West` not covered
}
```

Every variant must be handled. Add the missing arms or use `_` to catch the rest.

**Using unwrap() without checking**

```rust
let n = find_first_even(&nums).unwrap();  // panics at runtime if None
```

`.unwrap()` panics when called on `None`. Use `.unwrap_or(default)`, `match`, or
`if let` instead until you are certain the value is `Some`.

**Binding name shadows the variant name in match**

```rust
match shape {
    Circle => println!("circle"),  // wrong: Circle is a binding, not a variant path
    // ...
}
```

Variant names inside `match` require the full path `Shape::Circle` unless you bring
them into scope with `use Shape::*`. A bare name like `Circle` without `::` is treated
as a catch-all binding, not a variant, and the compiler will warn that subsequent arms
are unreachable.

**Forgetting to destructure data in a variant arm**

```rust
match shape {
    Shape::Circle => println!("circle"),  // error: expected tuple struct or tuple variant
}
```

`Shape::Circle` carries a `f64`. The arm must bind it: `Shape::Circle(r) => ...` or
`Shape::Circle(_) => ...` to discard it.

---

## 8.11 Key Terms

| Term | Meaning |
|------|---------|
| enum | A type whose value is exactly one of a fixed set of named variants |
| variant | One of the possible forms an enum value can take |
| tuple variant | A variant that carries unnamed positional fields: `Circle(f64)` |
| struct variant | A variant that carries named fields: `Triangle { base, height }` |
| `match` | Exhaustive pattern-matching expression; every variant must be covered |
| match guard | An `if` condition added to a match arm for extra filtering |
| `Option<T>` | Standard enum representing a value that may be absent: `Some(T)` or `None` |
| `if let` | Concise syntax for matching a single variant and binding its data |
| `unwrap_or` | Returns the inner value of `Some`, or a given default for `None` |
| `map` | Transforms the inner value of `Some` via a closure; passes `None` through |
