# Vec\<T\>

## S2.0 What This Teaches

`Vec<T>` is Rust's growable array - the most commonly used collection. This tutorial
covers:

- Constructing a `Vec`
- Adding and removing elements
- Indexing, slicing, and safe access with `get`
- Sorting, deduplication, and filtering with `retain`
- Iterating and extending

---

## S2.1 Construction

```rust
let v1: Vec<i32> = Vec::new();         // empty, type must be annotated
let v2 = vec![1, 2, 3, 4, 5];         // macro shorthand
let v3: Vec<i32> = Vec::with_capacity(10); // reserves heap space; len stays 0
println!("v1 len={}, v3 capacity={}", v1.len(), v3.capacity());
```

`with_capacity` avoids repeated reallocations when you know the approximate final size.
The `vec![]` macro is idiomatic for small, known-at-compile-time values.

---

## S2.2 push and pop

`push` appends to the end; `pop` removes and returns the last element as `Option<T>`:

```rust
let mut v = vec![1, 2, 3];
v.push(4);
v.push(5);
println!("{v:?}");          // [1, 2, 3, 4, 5]

let last = v.pop();
println!("{last:?}");       // Some(5)
println!("{v:?}");          // [1, 2, 3, 4]
```

`pop` on an empty `Vec` returns `None` rather than panicking.

---

## S2.3 insert and remove

`insert(index, value)` shifts elements right; `remove(index)` shifts left:

```rust
v.insert(1, 99);   // [1, 99, 2, 3, 4]
v.remove(1);       // [1, 2, 3, 4]
```

Both are O(n) because they move elements. For frequent insertions in the middle,
consider `VecDeque` from `std::collections`.

---

## S2.4 Indexing and Safe Access

`v[i]` panics if `i` is out of bounds. `v.get(i)` returns `Option<&T>` - safe for
untrusted indices:

```rust
println!("{}", v[0]);           // 1
println!("{:?}", v.get(10));    // None
```

Use `get` whenever the index comes from user input or an iterator where you are not
certain it is in range.

---

## S2.5 Slicing

A slice `&v[a..b]` borrows a contiguous subsequence without copying:

```rust
let slice = &v[1..3];
println!("{slice:?}");   // [2, 3]
```

Slices are `&[T]` - the same type accepted by most standard library functions that
process sequences. Writing functions that take `&[T]` instead of `&Vec<T>` makes them
usable with arrays and slices too.

---

## S2.6 Sorting and Deduplication

`sort` uses an in-place stable sort. `dedup` removes consecutive duplicate elements -
most effective immediately after sorting:

```rust
let mut nums = vec![3, 1, 4, 1, 5, 9, 2, 6, 5, 3];
nums.sort();
println!("{nums:?}");   // [1, 1, 2, 3, 3, 4, 5, 5, 6, 9]
nums.dedup();
println!("{nums:?}");   // [1, 2, 3, 4, 5, 6, 9]
```

For floating-point values use `sort_by(|a, b| a.partial_cmp(b).unwrap())` because
`f32`/`f64` do not implement `Ord` (NaN breaks total ordering).

---

## S2.7 retain

`retain` removes every element for which the predicate returns `false`, in place:

```rust
let mut v = vec![1, 2, 3, 4, 5, 6];
v.retain(|n| n % 2 == 0);
println!("{v:?}");   // [2, 4, 6]
```

---

## S2.8 extend, contains, position

```rust
let mut base = vec![1, 2, 3];
base.extend([4, 5, 6]);
println!("{base:?}");                                // [1, 2, 3, 4, 5, 6]
println!("{}", base.contains(&3));                   // true
println!("{:?}", base.iter().position(|n| *n == 3)); // Some(2)
```

---

## S2.9 Expected Output

```
--- construction ---
v1 len=0, v2=[1, 2, 3, 4, 5], v3 capacity=10
--- push / pop ---
after push: [1, 2, 3, 4, 5]
popped: Some(5), remaining: [1, 2, 3, 4]
--- insert / remove ---
after insert: [1, 99, 2, 3, 4]
after remove: [1, 2, 3, 4]
--- index / get ---
v[0] = 1
v.get(10) = None
--- slice ---
slice [1..3]: [2, 3]
--- iteration ---
1 2 3 4 
--- sort / dedup ---
sorted: [1, 1, 2, 3, 3, 4, 5, 5, 6, 9]
deduped: [1, 2, 3, 4, 5, 6, 9]
--- retain ---
evens: [2, 4, 6]
--- extend ---
extended: [1, 2, 3, 4, 5, 6]
--- contains / position ---
contains 3: true
position of 3: Some(2)
--- len / clear ---
len: 6
after clear, is_empty: true
```

---

## S2.10 Exercise

1. Build a `Vec<i32>` from the range `1..=20`. Use `retain` to keep only values
   divisible by 3. Print the result.

2. Write a function `median(v: &mut Vec<f64>) -> Option<f64>` that sorts the vec
   and returns the middle element (or the average of the two middle elements for even
   length). Return `None` for an empty vec.

3. Write a function `deduplicate<T: Eq + Ord>(v: &mut Vec<T>)` that sorts and
   deduplicates a vec in one step. Test it on `vec!["b","a","b","c","a"]`.

---

## S2.11 Common Mistakes

**Indexing out of bounds**

```rust
let v = vec![1, 2, 3];
println!("{}", v[5]);   // panics at runtime
```

Use `v.get(5)` to get `None` instead of a panic.

**Iterating with index mutation**

```rust
for i in 0..v.len() {
    v.push(i);   // error: cannot borrow `v` as mutable because it is borrowed
}
```

You cannot mutate a `Vec` while it is borrowed for `.len()` in a range loop. Collect
indices first, or restructure the loop.

**Calling sort on f64**

```rust
let mut floats = vec![3.0_f64, 1.0, 2.0];
floats.sort();   // error: f64 does not implement Ord
```

Use `sort_by(|a, b| a.partial_cmp(b).unwrap())` for floating-point slices.

---

## S2.12 Key Terms

| Term | Meaning |
|------|---------|
| `Vec<T>` | Heap-allocated growable array of `T` values |
| `vec![]` | Macro that creates a `Vec` from a literal list |
| `push` / `pop` | Append / remove-and-return the last element |
| `insert` / `remove` | Add or remove at an arbitrary index; O(n) |
| `get(i)` | Returns `Option<&T>`; safe alternative to `v[i]` |
| `&[T]` | Slice: a borrowed view of a contiguous sequence |
| `retain` | In-place filter: keeps elements matching a predicate |
| `dedup` | Removes consecutive duplicates; call after sort for full dedup |
| `with_capacity` | Pre-allocates heap space to avoid repeated reallocation |
