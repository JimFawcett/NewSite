# Iterators

## 5.0 What This Teaches

This tutorial covers Rust's iterator system - the primary way to process sequences
of values without writing manual index loops:

- What an iterator is and how Rust defines it
- Creating iterators from collections with `.iter()`
- Adapters: `map`, `filter`, `enumerate`, `zip`
- Chaining adapters into pipelines
- Consumers: `collect`, `sum`, `fold`, `count`, `any`, `all`
- Ranges as iterators

---

## 5.1 What an Iterator Is

An iterator is any type that implements the `Iterator` trait. That trait requires one
method:

```rust
fn next(&mut self) -> Option<Self::Item>
```

Each call to `next` returns `Some(value)` for the next element, or `None` when the
sequence is exhausted. You rarely call `next` directly - `for` loops and adapter methods
do it for you - but knowing this is the foundation explains why every iterator method
works the same way regardless of the underlying collection.

---

## 5.2 Creating Iterators from a Vec

A `Vec` offers three iterator entry points, each with different ownership semantics:

| Method | What it yields | Ownership effect |
|--------|---------------|-----------------|
| `.iter()` | `&T` - shared references | vec remains usable |
| `.iter_mut()` | `&mut T` - mutable references | vec remains usable, elements mutable |
| `.into_iter()` | `T` - owned values | vec is consumed |

For read-only work, always start with `.iter()`:

```rust
let nums = vec![1, 2, 3, 4, 5];

for n in nums.iter() {
    print!("{n} ");
}
// nums is still usable here
println!();
```

A `for` loop over `&nums` is shorthand for `.iter()` and behaves identically.

---

## 5.3 map - Transform Each Element

`map` takes a closure and applies it to every element, producing a new iterator of
transformed values. It does not allocate or compute anything until the iterator is
consumed - this is called *lazy evaluation*.

```rust
let doubled: Vec<i32> = nums.iter().map(|n| n * 2).collect();
println!("{doubled:?}");  // [2, 4, 6, 8, 10]
```

The closure `|n| n * 2` is an anonymous function. `n` here is `&i32` because `.iter()`
yields references. The `*` dereference is not needed for arithmetic because Rust
auto-derefs in this context, but you will see `|n| *n * 2` in some code - both work.

`.collect()` drives the iterator to completion and gathers results into a collection.
The type annotation on `doubled` tells `collect` what to build.

---

## 5.4 filter - Keep Matching Elements

`filter` takes a predicate closure and passes through only the elements for which the
predicate returns `true`.

```rust
let evens: Vec<&i32> = nums.iter().filter(|n| *n % 2 == 0).collect();
println!("{evens:?}");  // [2, 4]
```

The predicate receives `&&i32` (a reference to a reference) because `filter` passes a
reference to the element the iterator already holds. The `*n` dereferences once to get
`&i32`, which is enough for `%` to work. This double-reference is a common source of
confusion - section 5.10 covers it under common mistakes.

---

## 5.5 Chaining Adapters

Adapters chain directly because each one returns an iterator. The pipeline reads left to
right: take the source, apply transformations in order, consume at the end.

```rust
let result: Vec<i32> = nums.iter()
    .filter(|n| *n % 2 != 0)   // keep odd numbers
    .map(|n| n * n)             // square each
    .collect();
println!("{result:?}");  // [1, 9, 25]
```

No intermediate `Vec` is allocated between `filter` and `map`. The chain pulls one
element at a time from the source, passes it through each adapter, and hands it to
`collect` only when it survives all filters. This is why lazy evaluation matters for
performance.

---

## 5.6 enumerate - Index + Value

`.enumerate()` wraps each element in a tuple `(index, element)`, where the index starts
at 0 and counts up.

```rust
let words = vec!["alpha", "beta", "gamma"];
for (i, w) in words.iter().enumerate() {
    println!("{i}: {w}");
}
```

Output:
```
0: alpha
1: beta
2: gamma
```

Use `.enumerate()` any time you need the position alongside the value. It is cleaner
than maintaining a manual counter variable.

---

## 5.7 zip - Pair Two Iterators

`.zip()` combines two iterators into one iterator of pairs. It stops when either source
is exhausted.

```rust
let keys   = vec!["a", "b", "c"];
let values = vec![1, 2, 3];
let pairs: Vec<_> = keys.iter().zip(values.iter()).collect();
for (k, v) in &pairs {
    println!("{k} -> {v}");
}
```

Output:
```
a -> 1
b -> 2
c -> 3
```

`zip` is useful for correlating two parallel sequences without managing indices manually.

---

## 5.8 Consumers

Consumers drive the iterator to completion and return a single result rather than
another iterator.

**sum** - accumulates all elements by addition:

```rust
let total: i32 = nums.iter().sum();
println!("sum = {total}");  // 15
```

**fold** - general accumulator; you supply the initial value and a combining closure:

```rust
let product: i32 = nums.iter().fold(1, |acc, n| acc * n);
println!("product = {product}");  // 120
```

`fold` is the most general consumer - `sum`, `count`, and others are implemented in
terms of it internally.

**count** - returns the number of elements:

```rust
let n_evens = nums.iter().filter(|n| *n % 2 == 0).count();
println!("even count = {n_evens}");  // 2
```

**any / all** - short-circuit boolean tests:

```rust
let has_large = nums.iter().any(|n| *n > 4);   // true
let all_pos   = nums.iter().all(|n| *n > 0);   // true
```

`any` stops at the first `true`; `all` stops at the first `false`. Neither reads more
elements than necessary.

---

## 5.9 Ranges as Iterators

Ranges implement `Iterator` directly, so you can chain adapters onto them without a
collection:

```rust
let squares: Vec<i32> = (1..=5).map(|n| n * n).collect();
println!("{squares:?}");  // [1, 4, 9, 16, 25]
```

This is the idiomatic way to generate a sequence of computed values in Rust.

---

## 5.10 Example - All Together

```rust
fn main() {
    let nums = vec![1, 2, 3, 4, 5];

    for n in nums.iter() { print!("{n} "); }
    println!();

    let doubled: Vec<i32> = nums.iter().map(|n| n * 2).collect();
    println!("{doubled:?}");

    let evens: Vec<&i32> = nums.iter().filter(|n| *n % 2 == 0).collect();
    println!("{evens:?}");

    let result: Vec<i32> = nums.iter()
        .filter(|n| *n % 2 != 0)
        .map(|n| n * n)
        .collect();
    println!("{result:?}");

    let words = vec!["alpha", "beta", "gamma"];
    for (i, w) in words.iter().enumerate() {
        println!("{i}: {w}");
    }

    let total: i32   = nums.iter().sum();
    let product: i32 = nums.iter().fold(1, |acc, n| acc * n);
    println!("sum = {total}, product = {product}");

    let squares: Vec<i32> = (1..=5).map(|n| n * n).collect();
    println!("{squares:?}");
}
```

Expected output:

```
1 2 3 4 5 
[2, 4, 6, 8, 10]
[2, 4]
[1, 9, 25]
0: alpha
1: beta
2: gamma
sum = 15, product = 120
[1, 4, 9, 16, 25]
```

---

## 5.11 Exercise

1. Given `let words = vec!["rust", "is", "fast", "and", "safe"];`, use a chained
   iterator to collect only the words longer than 3 characters into a `Vec<&&str>`.
   Print the result.

2. Use `.enumerate()` and `.map()` to produce a `Vec<String>` where each string is
   formatted as `"item 0: rust"`, `"item 1: is"`, etc. from the same `words` vec.

3. Use `(1..=10).filter(...).fold(...)` to compute the sum of all odd numbers from
   1 to 10 inclusive.

---

## 5.12 Common Mistakes

**Forgetting to consume the iterator**

```rust
let doubled = nums.iter().map(|n| n * 2);
// doubled is an iterator, not a Vec - nothing has run yet
```

Adapters are lazy. Without `.collect()`, `.sum()`, or another consumer at the end,
no work is done and the result is an iterator type, not a collection.

**Missing type annotation on collect**

```rust
let evens = nums.iter().filter(|n| *n % 2 == 0).collect();
// error: type annotations needed
```

`collect` can build many different collection types. The compiler needs a hint. Write
the type on the binding: `let evens: Vec<_> = ...` where `_` lets Rust infer the
element type.

**Double-reference confusion in filter**

```rust
nums.iter().filter(|n| n % 2 == 0)   // n is &&i32 here
nums.iter().filter(|n| *n % 2 == 0)  // dereference once to get &i32
```

`.iter()` yields `&i32`. `filter` gives the closure a reference to that, so the closure
receives `&&i32`. One `*` dereference resolves it. Alternatively, use `.copied()` before
`.filter()` to convert `&i32` to `i32` and avoid the double reference entirely:

```rust
nums.iter().copied().filter(|n| n % 2 == 0).collect::<Vec<i32>>()
```

**Using into_iter() when you need the collection afterward**

```rust
let nums = vec![1, 2, 3];
let doubled: Vec<i32> = nums.into_iter().map(|n| n * 2).collect();
println!("{nums:?}");  // error: value used after move
```

`.into_iter()` consumes `nums`. Use `.iter()` if you need `nums` again after the chain.

---

## 5.13 Key Terms

| Term | Meaning |
|------|---------|
| `Iterator` trait | Rust's standard interface for sequences; requires `next()` |
| `.iter()` | Borrows elements as `&T`; collection remains usable |
| `.into_iter()` | Consumes the collection, yielding owned `T` values |
| `.iter_mut()` | Borrows elements as `&mut T` for in-place mutation |
| adapter | A method that takes an iterator and returns a new iterator (lazy) |
| consumer | A method that drives an iterator to completion and returns a result |
| lazy evaluation | Adapters do no work until a consumer pulls elements through |
| `map` | Adapter that transforms each element via a closure |
| `filter` | Adapter that drops elements for which the predicate returns false |
| `enumerate` | Adapter that pairs each element with its zero-based index |
| `zip` | Adapter that pairs elements from two iterators |
| `collect` | Consumer that gathers iterator output into a collection |
| `fold` | Consumer that accumulates elements with an initial value and a closure |
| `.copied()` | Adapter that converts `&T` to `T` for `Copy` types, removing one layer of reference |
