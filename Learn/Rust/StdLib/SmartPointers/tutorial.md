# Smart Pointers

## S8.0 What This Teaches

Rust's ownership model covers most cases, but some designs genuinely need heap
allocation, shared ownership, or interior mutability. Smart pointers provide these
capabilities without sacrificing safety. This tutorial covers:

- `Box<T>` for single-owner heap allocation and recursive types
- `Rc<T>` for shared ownership on a single thread
- `RefCell<T>` for interior mutability with runtime borrow checking
- `Rc<RefCell<T>>` for the combination of both

---

## S8.1 Box\<T\> - Heap Allocation

`Box<T>` stores a value on the heap and gives you a single owning pointer to it.
When the `Box` is dropped, the heap memory is freed.

```rust
let b = Box::new(42);
println!("{b}");    // 42 - Deref coercion lets you use it like a plain i32
println!("{}", *b); // explicit deref
```

The main practical use is enabling recursive types. Without `Box`, the compiler cannot
determine the size of a type that contains itself:

```rust
enum List {
    Cons(i32, Box<List>),  // Box breaks the infinite size cycle
    Nil,
}

let list = List::Cons(1, Box::new(List::Cons(2, Box::new(List::Nil))));
```

`Box<List>` has a known, fixed size (one pointer), so the compiler accepts it.

---

## S8.2 Rc\<T\> - Shared Ownership

`Rc<T>` (reference-counted pointer) allows multiple owners of the same heap value on
a single thread. Each `Rc::clone` increments a counter; when the counter reaches zero,
the value is freed.

```rust
use std::rc::Rc;

let shared = Rc::new(String::from("shared data"));
let c1 = Rc::clone(&shared);   // counter becomes 2; no heap copy
let c2 = Rc::clone(&shared);   // counter becomes 3

println!("count: {}", Rc::strong_count(&shared));  // 3
drop(c1);
println!("count: {}", Rc::strong_count(&shared));  // 2
```

`Rc` is read-only shared ownership. Every clone points to the same allocation; none
of them can mutate it through `Rc` alone.

`Rc` is not safe to send across threads. Use `Arc<T>` (atomic reference count) when
sharing across threads - the API is identical but uses atomic operations.

---

## S8.3 RefCell\<T\> - Interior Mutability

Rust's borrow rules are normally enforced at compile time. `RefCell<T>` defers those
checks to runtime, allowing mutation through a shared reference:

```rust
use std::cell::RefCell;

let data = RefCell::new(vec![1, 2, 3]);

{
    let mut v = data.borrow_mut();  // runtime check: panics if already borrowed
    v.push(4);
}   // mutable borrow released here

println!("{:?}", data.borrow());   // [1, 2, 3, 4]
```

The borrow rules still hold - you cannot have a `borrow_mut` and a `borrow` active at
the same time - but violations become runtime panics instead of compile errors. Use
`RefCell` only when the compiler's static analysis is too conservative and you can
reason that the rules are not violated at runtime.

---

## S8.4 Rc\<RefCell\<T\>\> - Shared Mutable State

Combine `Rc` and `RefCell` when multiple owners need to mutate a shared value:

```rust
use std::rc::Rc;
use std::cell::RefCell;

let counter = Rc::new(RefCell::new(0));
let c1 = Rc::clone(&counter);
let c2 = Rc::clone(&counter);

*c1.borrow_mut() += 1;
*c2.borrow_mut() += 1;

println!("{}", counter.borrow());   // 2
```

For multithreaded shared mutation, use `Arc<Mutex<T>>` instead (covered in the
Threads tutorial).

---

## S8.5 Expected Output

```
--- Box ---
boxed: 42, deref: 42
Cons(1, Cons(2, Nil))
--- Rc ---
value: shared data, ref count: 3
after drop c1, count: 2
after drop c2, count: 1
--- RefCell ---
[1, 2, 3, 4]
--- Rc<RefCell<T>> ---
counter: 2
```

---

## S8.6 Exercise

1. Define a recursive `Tree` enum using `Box`:
   ```
   Tree::Leaf(i32)
   Tree::Node(Box<Tree>, Box<Tree>)
   ```
   Build a small tree and write a function `sum(t: &Tree) -> i32` that sums all leaf
   values.

2. Create two `Rc<String>` clones of the same string. Confirm the reference count
   is 3 (original + 2 clones). Drop one and confirm it drops to 2.

3. Use `Rc<RefCell<Vec<i32>>>` to share a vec between two "owners" (two separate
   variables). Append a value through each and print the final vec through the third.

---

## S8.7 Common Mistakes

**Using Rc across threads**

```rust
use std::rc::Rc;
let r = Rc::new(42);
std::thread::spawn(move || println!("{r}"));  // error: Rc cannot be sent across threads
```

`Rc` is not `Send`. Use `Arc<T>` for cross-thread shared ownership.

**Calling borrow_mut twice without releasing**

```rust
let cell = RefCell::new(0);
let a = cell.borrow_mut();
let b = cell.borrow_mut();  // panics at runtime: already mutably borrowed
```

The first `borrow_mut` must be dropped before taking a second one. In practice this
usually means structuring code so borrows are short-lived within a `{ }` block.

**Boxing unnecessarily**

`Box<i32>` is almost never useful - `i32` is already small and `Copy`. Box values
that are large (to avoid stack overflow), that need a stable address, or that are
part of a recursive type. Do not Box as a default.

---

## S8.8 Key Terms

| Term | Meaning |
|------|---------|
| `Box<T>` | Single-owner heap pointer; frees memory when dropped |
| `Rc<T>` | Reference-counted shared ownership; single-threaded only |
| `Rc::clone` | Increments the reference count; does not copy the heap data |
| `Rc::strong_count` | Returns the current reference count |
| `RefCell<T>` | Enforces borrow rules at runtime instead of compile time |
| `borrow()` | Returns an immutable `Ref<T>` guard; panics if mutably borrowed |
| `borrow_mut()` | Returns a mutable `RefMut<T>` guard; panics if any borrow is active |
| interior mutability | Mutating data through a shared reference, enforced at runtime |
| `Arc<T>` | Atomic reference count; like `Rc` but safe across threads |
| `Mutex<T>` | Mutual exclusion lock; pairs with `Arc` for shared mutable state across threads |
