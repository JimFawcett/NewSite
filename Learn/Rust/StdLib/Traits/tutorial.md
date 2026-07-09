# Traits

## S6.0 What This Teaches

Traits are Rust's mechanism for shared behavior - similar to interfaces in other
languages, but more powerful. This tutorial covers:

- Defining a trait with required and default methods
- Implementing a trait for a struct
- `impl Trait` and generic `<T: Trait>` bounds on function parameters
- Trait objects (`&dyn Trait`) for heterogeneous collections
- Multiple trait bounds with `+`

---

## S6.1 Defining a Trait

A trait declares a set of method signatures. Any type that implements all required
methods satisfies the trait:

```rust
trait Area {
    fn area(&self) -> f64;  // required: every implementor must provide this

    fn describe(&self) -> String {  // default: implementors inherit this for free
        format!("shape with area {:.2}", self.area())
    }
}
```

Default methods are useful for behavior that is naturally expressible in terms of the
required methods. Implementors can override defaults when they have a better version.

---

## S6.2 Implementing a Trait

```rust
struct Circle    { radius: f64 }
struct Rectangle { width: f64, height: f64 }

impl Area for Circle {
    fn area(&self) -> f64 {
        std::f64::consts::PI * self.radius * self.radius
    }
    // inherits the default describe()
}

impl Area for Rectangle {
    fn area(&self) -> f64 { self.width * self.height }

    fn describe(&self) -> String {   // overrides the default
        format!("rectangle {}x{} area={:.2}", self.width, self.height, self.area())
    }
}
```

---

## S6.3 Trait Bounds on Functions

**`impl Trait` syntax** - concise, best for simple cases:

```rust
fn print_area(shape: &impl Area) {
    println!("{}", shape.describe());
}
```

**Generic syntax** - equivalent, but required when the same type parameter appears
more than once or when you need a where clause:

```rust
fn largest_area<T: Area>(a: &T, b: &T) -> f64 {
    a.area().max(b.area())
}
```

Both tell the compiler "accept any type that implements `Area`." The concrete type is
resolved at compile time - no runtime overhead.

Note: `largest_area<T>` requires both arguments to be the *same* concrete type `T`.
To mix types, use trait objects (section S6.4).

---

## S6.4 Trait Objects - dyn Trait

A trait object (`&dyn Area`) erases the concrete type at compile time. The method call
goes through a vtable at runtime. This enables heterogeneous collections:

```rust
let shapes: Vec<&dyn Area> = vec![&c, &r, &s];
for shape in &shapes {
    println!("{}", shape.describe());
}
```

Use trait objects when you need a collection of mixed types, or when the concrete type
is not known until runtime. Use generics when performance matters and types are known
at compile time.

---

## S6.5 Multiple Trait Bounds

Combine bounds with `+`:

```rust
use std::fmt::Debug;

fn debug_area<T: Area + Debug>(shape: &T) {
    println!("{shape:?} => area {:.2}", shape.area());
}
```

`T` must implement both `Area` and `Debug`. This is common when you need to both use
a trait's methods and print the value during development.

---

## S6.6 Expected Output

```
--- impl Trait ---
shape with area 28.27
rectangle 4x5 area=20.00
--- generic bound ---
largest (same type): 28.27
largest (dyn):       28.27
--- dyn Trait ---
shape with area 28.27
rectangle 4x5 area=20.00
shape with area 36.00
--- multiple bounds ---
Square { side: 6.0 } => area 36.00
```

---

## S6.7 Exercise

1. Define a trait `Perimeter` with method `perimeter(&self) -> f64`. Implement it for
   `Circle` and `Rectangle`. Write a function `print_perimeter(shape: &impl Perimeter)`
   and call it for both.

2. Define a trait `Summary` with a required method `summarize(&self) -> String` and a
   default method `preview(&self) -> String` that returns the first 50 characters of
   `summarize`. Implement `Summary` for a `NewsArticle` struct with `title` and `body`
   fields.

3. Build a `Vec<Box<dyn Area>>` containing a mix of `Circle`, `Rectangle`, and `Square`
   values. Use `Box` (instead of `&`) so the vec owns them. Print each area.

---

## S6.8 Common Mistakes

**Forgetting to implement all required methods**

```rust
impl Area for Triangle {}   // error: not all trait items implemented
```

Every method without a default body must be implemented.

**Returning `impl Trait` from a branch with mixed types**

```rust
fn make_shape(big: bool) -> impl Area {
    if big { Circle { radius: 10.0 } } else { Rectangle { width: 2.0, height: 3.0 } }
    // error: mismatched types
}
```

`impl Trait` in return position means one concrete type chosen at compile time. If the
two branches return different types, use `Box<dyn Area>` instead.

**Calling a trait method on a type that has not implemented it**

```rust
print_area(&42_i32);   // error: i32 does not implement Area
```

Trait bounds are checked at compile time. Only types with `impl Area` can be passed.

---

## S6.9 Key Terms

| Term | Meaning |
|------|---------|
| trait | A named set of method signatures; defines shared behavior |
| required method | A trait method with no default body; every implementor must provide it |
| default method | A trait method with a body; implementors may override it |
| `impl Trait` | Bound syntax in function parameters: "accepts any type implementing Trait" |
| `<T: Trait>` | Generic bound syntax; equivalent to `impl Trait` for single occurrences |
| `&dyn Trait` | Trait object; erases concrete type; dispatch goes through a vtable at runtime |
| vtable | Runtime table of function pointers used for dynamic dispatch |
| `+` bound | Combines multiple trait requirements: `T: Area + Debug` |
