# Closures

## S7.0 What This Teaches

A closure is an anonymous function that can capture variables from its enclosing scope.
Closures are the backbone of Rust's iterator adapters, threading, and callbacks. This
tutorial covers:

- Closure syntax and type inference
- Capturing variables by reference, mutable reference, or value
- The three closure traits: `Fn`, `FnMut`, `FnOnce`
- Passing closures to functions with trait bounds
- Returning a closure from a function

---

## S7.1 Basic Closure Syntax

```rust
let double = |x: i32| x * 2;
println!("{}", double(5));   // 10
```

The parameters are between `|...|`. The body is a single expression (or a `{ }` block
for multiple statements). Rust infers parameter and return types from usage - explicit
annotations are rarely needed.

```rust
let clamp = |x: i32, lo: i32, hi: i32| {
    if x < lo { lo } else if x > hi { hi } else { x }
};
println!("{}", clamp(15, 0, 10));   // 10
```

---

## S7.2 Capturing Variables

Closures automatically capture variables from the surrounding scope. The capture mode
depends on how the variable is used:

**By shared reference** - the closure reads but does not mutate:

```rust
let threshold = 5;
let above = |x: i32| x > threshold;   // borrows threshold
println!("{}", above(7));              // true
```

**By mutable reference** - the closure mutates a variable in scope:

```rust
let mut count = 0;
let mut increment = || { count += 1; count };
println!("{}", increment());  // 1
println!("{}", increment());  // 2
```

**By value with `move`** - transfers ownership into the closure, useful when the
closure must outlive the scope where the variable was declared (required for threads):

```rust
let greeting = String::from("hello");
let consume = move || greeting.to_uppercase();
println!("{}", consume());   // HELLO
// greeting is gone here
```

---

## S7.3 The Three Closure Traits

Rust categorizes closures by how they use their captured environment:

| Trait | Callable | What it can do with captures |
|-------|----------|------------------------------|
| `FnOnce` | Once | May move out of captured values |
| `FnMut` | Many times | May mutate captured values |
| `Fn` | Many times | Only reads captured values |

Every closure implements at least `FnOnce`. Closures that do not move out of captures
also implement `FnMut`. Closures that do not mutate captures also implement `Fn`.

When writing a function that accepts a closure, choose the least restrictive bound
that satisfies your needs:

```rust
fn apply<F: Fn(i32) -> i32>(f: F, x: i32) -> i32 { f(x) }
fn apply_mut<F: FnMut() -> i32>(mut f: F) -> i32  { f() }
fn apply_once<F: FnOnce() -> String>(f: F) -> String { f() }
```

---

## S7.4 Returning a Closure

Functions can return closures. Use `impl Fn(...)` as the return type. The `move`
keyword is usually needed to move captured values into the returned closure:

```rust
fn make_adder(n: i32) -> impl Fn(i32) -> i32 {
    move |x| x + n
}

let add5  = make_adder(5);
let add10 = make_adder(10);
println!("{}", add5(3));   // 8
println!("{}", add10(3));  // 13
```

Each call to `make_adder` produces a distinct closure that owns its own copy of `n`.

---

## S7.5 Closures with Iterators

Closures and iterators are designed to work together. The iterator adapters `map`,
`filter`, `fold`, and others all take closures:

```rust
let nums = vec![1, 2, 3, 4, 5];
let sum: i32 = nums.iter()
    .filter(|&&x| x % 2 != 0)   // odd numbers
    .map(|&x| x * x)             // squared
    .sum();
println!("{sum}");   // 35
```

---

## S7.6 Expected Output

```
--- basic ---
double(5) = 10
clamp(15, 0, 10) = 10
--- Fn (shared ref) ---
above(3): false, above(7): true
--- FnMut (mut ref) ---
1
2
3
--- Fn bound ---
apply square: 49
--- FnMut bound ---
apply_mut: 10
--- FnOnce ---
once: HELLO
--- returning closure ---
add5(3)=8, add10(3)=13
--- closure + iterator ---
sum of odd squares: 35
```

---

## S7.7 Exercise

1. Write a function `apply_twice<F: Fn(i32) -> i32>(f: F, x: i32) -> i32` that
   applies `f` to `x` and then applies `f` again to the result. Call it with a
   doubling closure and print the result for input 3.

2. Write a function `make_multiplier(factor: i32) -> impl Fn(i32) -> i32` that
   returns a closure multiplying its input by `factor`. Create multipliers for 3 and 7
   and apply each to several values.

3. Use `fold` with a closure to compute the product of all even numbers in
   `vec![1,2,3,4,5,6]`. The result should be 48.

---

## S7.8 Common Mistakes

**Using a moved value after a move closure**

```rust
let s = String::from("hi");
let f = move || println!("{s}");
println!("{s}");   // error: s was moved into f
```

After `move`, `s` belongs to the closure. Either clone it first or restructure so
you do not need `s` after the closure is created.

**Calling an FnOnce closure more than once**

```rust
let consume = move || drop(s);
consume();
consume();   // error: cannot call FnOnce closure more than once
```

A closure that moves out of a capture can only run once. Use `Fn` or `FnMut` closures
when repeated calls are needed.

**Capturing a mutable reference in two closures at once**

```rust
let mut count = 0;
let inc = || count += 1;
let read = || println!("{count}");   // error: count already borrowed mutably by inc
```

Rust does not allow a mutable and any other borrow of the same variable to coexist.
Drop `inc` before creating `read`, or restructure to avoid the overlap.

---

## S7.9 Key Terms

| Term | Meaning |
|------|---------|
| closure | An anonymous function that captures variables from its enclosing scope |
| `\|x\|` | Closure parameter syntax; analogous to `fn(x)` but inlined |
| capture | A variable from the outer scope used inside the closure |
| `move` | Keyword that forces the closure to take ownership of all captured values |
| `Fn` | Closure trait: reads captures; callable many times |
| `FnMut` | Closure trait: mutates captures; callable many times |
| `FnOnce` | Closure trait: may move out of captures; callable only once |
| `impl Fn(T) -> R` | Return type syntax for a closure returned from a function |
