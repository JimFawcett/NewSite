# Structs

## 7.0 What This Teaches

Structs are Rust's primary tool for grouping related data under a named type. This
tutorial covers:

- Defining a struct and creating instances
- Field access and mutation
- `impl` blocks: methods and associated functions
- Derived traits: `Debug`, `Clone`, `PartialEq`
- Struct update syntax
- Tuple structs

---

## 7.1 Defining a Struct

A struct declaration names the type and lists its fields, each with a name and type:

```rust
struct Point {
    x: f64,
    y: f64,
}
```

By convention, struct names use `UpperCamelCase`. Fields use `snake_case`.

To create an instance, supply a value for every field:

```rust
let p = Point { x: 3.0, y: 4.0 };
println!("x = {}, y = {}", p.x, p.y);
```

Fields are accessed with `.`. Instances are immutable by default; add `mut` to the
binding to allow field mutation:

```rust
let mut p = Point { x: 0.0, y: 0.0 };
p.x = 5.0;
```

Rust does not allow marking individual fields `mut` - mutability applies to the whole
instance through its binding.

---

## 7.2 impl Blocks

An `impl` block attaches functions to a struct. There are two kinds:

- **Methods** take `self`, `&self`, or `&mut self` as the first parameter. They are
  called on an instance with `.` syntax.
- **Associated functions** do not take `self`. They are called on the type with `::`.
  `new` is the conventional name for a constructor.

```rust
impl Point {
    fn new(x: f64, y: f64) -> Point {
        Point { x, y }   // field init shorthand: x means x: x
    }

    fn distance_from_origin(&self) -> f64 {
        (self.x * self.x + self.y * self.y).sqrt()
    }

    fn translate(&self, dx: f64, dy: f64) -> Point {
        Point { x: self.x + dx, y: self.y + dy }
    }
}
```

`Point::new(3.0, 4.0)` calls the associated function.
`p.distance_from_origin()` calls a method - Rust automatically passes `&p` as `self`.

---

## 7.3 Field Init Shorthand

When a variable name matches the field name, you can omit the repetition:

```rust
fn new(x: f64, y: f64) -> Point {
    Point { x, y }   // same as Point { x: x, y: y }
}
```

This is purely a convenience - the generated code is identical.

---

## 7.4 Derived Traits

Rust can automatically implement common traits for a struct by adding a `#[derive]`
attribute. The three most useful for beginners are:

| Trait | What it provides |
|-------|-----------------|
| `Debug` | `{:?}` and `{:#?}` formatting for `println!` |
| `Clone` | `.clone()` method for explicit deep copy |
| `PartialEq` | `==` and `!=` comparison between instances |

```rust
#[derive(Debug, Clone, PartialEq)]
struct Point {
    x: f64,
    y: f64,
}
```

With `Debug` derived:

```rust
let p = Point::new(3.0, 4.0);
println!("{:?}",  p);   // Point { x: 3.0, y: 4.0 }
println!("{:#?}", p);   // pretty-printed, one field per line
```

`{:#?}` is useful during debugging when a struct has many fields.

---

## 7.5 Clone and PartialEq

With `Clone` derived, `.clone()` produces an independent copy:

```rust
let p1 = Point::new(3.0, 4.0);
let p2 = p1.clone();
```

With `PartialEq` derived, `==` compares all fields:

```rust
println!("p1 == p2: {}", p1 == p2);  // true
```

Derive only the traits your struct actually needs - each one adds a small compile-time
cost and makes promises about your type's behavior.

---

## 7.6 Struct Update Syntax

To create a new instance that differs from an existing one in only a few fields, use
`..` to fill in the rest:

```rust
let p1 = Point::new(3.0, 4.0);
let p3 = Point { x: 1.0, ..p1 };   // y is copied from p1
println!("{:?}", p3);               // Point { x: 1.0, y: 4.0 }
```

The `..instance` part must come last. For fields that are not `Copy`, this moves them
out of `p1`, leaving `p1` partially invalid. Here `f64` is `Copy`, so `p1` remains
usable.

---

## 7.7 Tuple Structs

A tuple struct names the type but not the fields. Fields are accessed by position
(`self.0`, `self.1`, ...). Use them when the field names would add no information:

```rust
#[derive(Debug)]
struct Color(u8, u8, u8);

impl Color {
    fn new(r: u8, g: u8, b: u8) -> Color {
        Color(r, g, b)
    }

    fn is_gray(&self) -> bool {
        self.0 == self.1 && self.1 == self.2
    }
}

let red  = Color::new(255, 0, 0);
let gray = Color::new(128, 128, 128);
println!("{:?}, is_gray: {}", red,  red.is_gray());   // Color(255, 0, 0), is_gray: false
println!("{:?}, is_gray: {}", gray, gray.is_gray());  // Color(128, 128, 128), is_gray: true
```

---

## 7.8 Example - All Together

```rust
#[derive(Debug, Clone, PartialEq)]
struct Point {
    x: f64,
    y: f64,
}

impl Point {
    fn new(x: f64, y: f64) -> Point { Point { x, y } }
    fn distance_from_origin(&self) -> f64 {
        (self.x * self.x + self.y * self.y).sqrt()
    }
    fn translate(&self, dx: f64, dy: f64) -> Point {
        Point { x: self.x + dx, y: self.y + dy }
    }
}

#[derive(Debug)]
struct Color(u8, u8, u8);

impl Color {
    fn new(r: u8, g: u8, b: u8) -> Color { Color(r, g, b) }
    fn is_gray(&self) -> bool { self.0 == self.1 && self.1 == self.2 }
}

fn main() {
    let p1 = Point::new(3.0, 4.0);
    println!("{:?}, distance = {:.2}", p1, p1.distance_from_origin());

    let p2 = p1.clone();
    println!("p1 == p2: {}", p1 == p2);

    let p3 = Point { x: 1.0, ..p1 };
    println!("{:?}", p3);

    let mut p4 = Point::new(5.0, 12.0);
    println!("{:?}, distance = {:.2}", p4, p4.distance_from_origin());
    p4.x = 0.0;
    println!("{:?}", p4);

    let p5 = p4.translate(1.0, -2.0);
    println!("{:?}", p5);

    let red  = Color::new(255, 0, 0);
    let gray = Color::new(128, 128, 128);
    println!("{:?} is_gray: {}", red,  red.is_gray());
    println!("{:?} is_gray: {}", gray, gray.is_gray());
}
```

Expected output:

```
Point { x: 3.0, y: 4.0 }, distance = 5.00
p1 == p2: true
Point { x: 1.0, y: 4.0 }
Point { x: 5.0, y: 12.0 }, distance = 13.00
Point { x: 0.0, y: 12.0 }
Point { x: 1.0, y: 10.0 }
Color(255, 0, 0) is_gray: false
Color(128, 128, 128) is_gray: true
```

---

## 7.9 Exercise

1. Define a `Rectangle` struct with `width: f64` and `height: f64`. Add an `impl` block
   with:
   - `new(width, height) -> Rectangle`
   - `area(&self) -> f64`
   - `perimeter(&self) -> f64`
   - `is_square(&self) -> bool`

   Derive `Debug` and print an instance with `{:?}`.

2. Add a `scale(&self, factor: f64) -> Rectangle` method that returns a new rectangle
   with both dimensions multiplied by `factor`.

3. Define a tuple struct `Meters(f64)` and a tuple struct `Feet(f64)`. Add a
   `to_feet(&self) -> Feet` method to `Meters` (1 meter = 3.28084 feet). Print a
   conversion.

---

## 7.10 Common Mistakes

**Trying to mutate a field on an immutable binding**

```rust
let p = Point::new(1.0, 2.0);
p.x = 5.0;  // error: cannot assign to `p.x`, as `p` is not declared as mutable
```

Fix: declare `let mut p = ...`.

**Forgetting `&self` and accidentally moving self**

```rust
fn distance(self) -> f64 { ... }  // consumes the instance
```

A method that takes `self` (not `&self`) moves the instance into the method. After
calling it, the original binding is invalid. Use `&self` for read-only methods and
`&mut self` for mutating methods.

**Deriving `PartialEq` on a struct containing `f64`**

Floating-point equality is unreliable due to rounding. `derive(PartialEq)` compares
bits directly, which can produce surprising results:

```rust
let a = Point::new(0.1 + 0.2, 0.0);
let b = Point::new(0.3, 0.0);
println!("{}", a == b);  // may print false
```

For geometry, compare with an epsilon tolerance rather than `==`.

**Missing all fields in the struct literal**

```rust
let p = Point { x: 1.0 };  // error: missing field `y`
```

Every field must be supplied unless you use struct update syntax (`..other`).

---

## 7.11 Key Terms

| Term | Meaning |
|------|---------|
| struct | A named type grouping one or more fields |
| field | A named, typed component of a struct |
| `impl` block | Attaches methods and associated functions to a struct |
| method | A function in an `impl` block that takes `self`, `&self`, or `&mut self` |
| associated function | A function in an `impl` block with no `self` parameter; called with `::` |
| `#[derive]` | Attribute that auto-implements traits like `Debug`, `Clone`, `PartialEq` |
| field init shorthand | `Point { x, y }` when variable names match field names |
| struct update syntax | `Point { x: 1.0, ..other }` to fill remaining fields from another instance |
| tuple struct | A struct with unnamed, positionally accessed fields |
