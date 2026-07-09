# Ownership and Borrowing

## 6.0 What This Teaches

Ownership is Rust's most distinctive feature. It enables memory safety without a garbage
collector by enforcing strict rules at compile time. This tutorial covers:

- The three ownership rules
- Move semantics - what happens when you assign or pass a value
- `Clone` for an explicit deep copy
- `Copy` types that duplicate automatically
- Shared references (`&T`) for read-only borrowing
- Mutable references (`&mut T`) for exclusive borrowing
- How scope controls when memory is freed

---

## 6.1 The Three Ownership Rules

Rust enforces these rules at compile time - violating any one of them is a compile error,
not a runtime crash:

1. Every value has exactly one owner.
2. When the owner goes out of scope, the value is dropped (memory freed).
3. There can only be one owner at a time.

These three rules together eliminate entire classes of bugs - use-after-free, double-free,
and data races - without a runtime garbage collector.

---

## 6.2 Move Semantics

When you assign a heap-allocated value to another binding, ownership *moves*. The original
binding becomes invalid. This is not a copy - no data is duplicated.

```rust
let a = String::from("hello");
let b = a;            // ownership moves from a to b
// println!("{a}");  // compile error: value moved
println!("{b}");      // fine
```

`String` allocates on the heap, so assigning it moves rather than copies. The compiler
rejects any attempt to use `a` after the move - there is no way to access freed memory.

The same transfer happens when you pass a value to a function:

```rust
fn take_ownership(s: String) {
    println!("taken: {s}");
}   // s is dropped here

let u = String::from("goodbye");
take_ownership(u);
// println!("{u}");  // compile error: u was moved into the function
```

---

## 6.3 Clone - Explicit Deep Copy

When you genuinely need two independent copies of a heap value, call `.clone()`. It
performs a full deep copy and both bindings remain valid:

```rust
let c = String::from("world");
let d = c.clone();
println!("c = {c}, d = {d}");  // both usable
```

`.clone()` is intentionally explicit. Rust does not silently copy expensive heap data -
you opt in so the cost is visible in the code.

---

## 6.4 Copy Types

Types that live entirely on the stack implement the `Copy` trait. Assigning or passing
them duplicates the bits automatically - no move, no clone required.

Common `Copy` types: all integer types, `f32`, `f64`, `bool`, `char`, and tuples or
arrays made up of `Copy` types.

```rust
let x = 42;
let y = x;           // x is copied, not moved
println!("x = {x}, y = {y}");  // both valid
```

`String` is not `Copy` because it owns heap memory. Copying it silently would mean two
owners for the same allocation - a double-free waiting to happen.

---

## 6.5 Shared References - Borrowing Read-Only

A reference lets you use a value without taking ownership. The `&` operator creates a
shared reference. Rust guarantees the referenced value will not be modified while the
reference exists.

```rust
fn print_len(s: &String) {
    println!("length = {}", s.len());
}

let s = String::from("Rust");
print_len(&s);               // lend s to the function
println!("still have s: {s}");  // s is still ours
```

`print_len` borrows `s` for its duration. When the function returns, the borrow ends
and full ownership returns to the caller. No memory is freed - the caller still owns `s`.

Multiple shared references to the same value are allowed simultaneously:

```rust
let r1 = &s;
let r2 = &s;
println!("r1 = {r1}, r2 = {r2}");  // fine - both just read
```

---

## 6.6 Mutable References - Borrowing for Mutation

A mutable reference (`&mut T`) lets a borrower modify the value. The rule is strict:
while a mutable reference exists, no other references - shared or mutable - may exist
for the same value. This prevents data races at compile time.

```rust
fn append_bang(s: &mut String) {
    s.push('!');
}

let mut t = String::from("hello");
append_bang(&mut t);
println!("{t}");   // hello!
```

The binding must be declared `mut` before you can take a `&mut` reference to it.

The borrow checker enforces two rules:
- At most one `&mut` reference at a time.
- No `&` references while a `&mut` reference is active.

```rust
let mut s = String::from("hi");
let r1 = &s;
let r2 = &mut s;   // compile error: cannot borrow as mutable because it is also borrowed as immutable
```

---

## 6.7 Scope Controls Lifetime

A value is dropped the moment its owner goes out of scope. For references, the borrow
ends when the reference last appears - not necessarily at the closing `}` of the block.

```rust
{
    let scoped = String::from("temporary");
    println!("{scoped}");
}   // scoped is dropped here; heap memory freed immediately
println!("scoped is gone");
```

This deterministic cleanup is why Rust does not need a garbage collector. The compiler
knows exactly when every value dies.

---

## 6.8 Example - All Together

```rust
fn print_len(s: &String) {
    println!("length = {}", s.len());
}

fn append_bang(s: &mut String) {
    s.push('!');
}

fn take_ownership(s: String) {
    println!("taken: {s}");
}

fn main() {
    // move
    let a = String::from("hello");
    let b = a;
    println!("{b}");

    // clone
    let c = String::from("world");
    let d = c.clone();
    println!("c = {c}, d = {d}");

    // Copy type
    let x = 42;
    let y = x;
    println!("x = {x}, y = {y}");

    // shared borrow
    let s = String::from("Rust");
    print_len(&s);
    println!("still have s: {s}");

    // mutable borrow
    let mut t = String::from("hello");
    append_bang(&mut t);
    println!("{t}");

    // move into function
    let u = String::from("goodbye");
    take_ownership(u);

    // scope drop
    {
        let scoped = String::from("temporary");
        println!("{scoped}");
    }
    println!("scoped is gone");
}
```

Expected output:

```
hello
c = world, d = world
x = 42, y = 42
length = 4
still have s: Rust
hello!
taken: goodbye
temporary
scoped is gone
```

---

## 6.9 Exercise

1. Write a function `first_word(s: &String) -> &str` that returns a reference to the
   first space-delimited word in `s`. Call it and print the result without moving `s`.
   Confirm you can still use `s` after the call.

2. Write a function `double_all(v: &mut Vec<i32>)` that multiplies every element in the
   vector by 2. Call it from `main` using a mutable reference. Print the vector before
   and after.

3. Declare two `String` bindings. Move one into a function that prints it, then confirm
   the compiler rejects a use of that binding after the call. Then repeat using `.clone()`
   so both uses succeed.

---

## 6.10 Common Mistakes

**Using a value after moving it**

```rust
let a = String::from("hi");
let b = a;
println!("{a}");  // error: value borrowed here after move
```

Once moved, `a` is gone. Use `a.clone()` if you need both.

**Taking a mutable and shared reference at the same time**

```rust
let mut s = String::from("hi");
let r = &s;
s.push('!');       // error: cannot borrow `s` as mutable because it is also borrowed as immutable
println!("{r}");
```

`r` is a shared reference that is still in use when `push` tries to mutate `s`. Either
drop `r` before mutating, or restructure so the borrow ends first.

**Forgetting `mut` on the binding before taking `&mut`**

```rust
let s = String::from("hi");
let r = &mut s;   // error: cannot borrow `s` as mutable, as it is not declared as mutable
```

Declare `let mut s` to allow mutable borrowing.

**Expecting `Clone` behavior from assignment**

Rust does not silently deep-copy heap data. If you expect `let b = a` to leave `a`
usable, you need `let b = a.clone()`. The assignment moves unless the type is `Copy`.

---

## 6.11 Key Terms

| Term | Meaning |
|------|---------|
| owner | The single binding responsible for a value; frees it when it goes out of scope |
| move | Transfer of ownership from one binding to another; original is invalidated |
| drop | Automatic freeing of a value when its owner goes out of scope |
| `Clone` | Trait enabling explicit deep copy via `.clone()` |
| `Copy` | Trait marking types that duplicate automatically on assignment (stack-only) |
| borrow | Temporary access to a value via a reference, without taking ownership |
| `&T` | Shared reference; allows reading; many can coexist |
| `&mut T` | Mutable reference; allows reading and writing; exclusive - no other references allowed |
| borrow checker | The compiler component that enforces ownership and reference rules |
| lifetime | The span of code during which a reference is valid; enforced at compile time |
