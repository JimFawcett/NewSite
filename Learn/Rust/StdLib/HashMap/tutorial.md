# HashMap\<K, V\>

## S3.0 What This Teaches

`HashMap<K, V>` stores key-value pairs with O(1) average lookup. This tutorial covers:

- Constructing a `HashMap` and inserting entries
- Looking up values with `get`
- The entry API for conditional insertion and in-place mutation
- Iterating over keys, values, and pairs
- A practical word-frequency example

---

## S3.1 Construction and Insertion

`HashMap` is in `std::collections`, so bring it into scope with `use`:

```rust
use std::collections::HashMap;

let mut scores: HashMap<String, u32> = HashMap::new();
scores.insert(String::from("Alice"), 90);
scores.insert(String::from("Bob"),   75);
```

`insert` returns `Option<V>` - `Some(old_value)` if the key already existed, `None`
if it was new. A second `insert` with the same key overwrites the value.

---

## S3.2 get and contains_key

`get` returns `Option<&V>` - a reference to the value, or `None` if the key is absent:

```rust
if let Some(s) = scores.get("Alice") {
    println!("Alice: {s}");
}
println!("{:?}", scores.get("Dave"));  // None
println!("{}", scores.contains_key("Bob")); // true
```

Use `scores["Alice"]` for direct access when you are certain the key exists - it panics
if it does not.

---

## S3.3 remove

```rust
scores.remove("Bob");
```

`remove` returns `Option<V>` - the removed value, or `None` if the key was absent.

---

## S3.4 The Entry API

The entry API handles the "insert if absent, otherwise leave alone" pattern in one
operation - no double lookup:

```rust
scores.entry(String::from("Dave")).or_insert(70);  // adds Dave: 70
scores.entry(String::from("Alice")).or_insert(0);  // Alice already exists; ignored
```

`or_insert` returns a mutable reference to the value (existing or newly inserted). Use
it directly to modify the value in place:

```rust
let alice = scores.entry(String::from("Alice")).or_insert(0);
*alice += 5;
```

This pattern is the idiomatic way to build a frequency counter:

```rust
let text = "the quick brown fox jumps over the lazy dog the fox";
let mut freq: HashMap<&str, u32> = HashMap::new();
for word in text.split_whitespace() {
    *freq.entry(word).or_insert(0) += 1;
}
```

---

## S3.5 Iteration

`HashMap` does not guarantee order. Sort before printing when you need stable output:

```rust
let mut pairs: Vec<(&String, &u32)> = scores.iter().collect();
pairs.sort_by_key(|(k, _)| k.as_str());
for (name, score) in pairs {
    println!("{name}: {score}");
}
```

Other iteration forms: `.keys()`, `.values()`, `.into_iter()` (consumes the map).

---

## S3.6 Expected Output

```
--- construction ---
{"Bob": 75, "Carol": 88, "Alice": 90}
--- get ---
Alice: 90
Dave: None
--- contains_key ---
has Bob: true
--- remove ---
after remove Bob: 2 entries
--- entry or_insert ---
Dave: 70, Alice: 90
--- entry modify ---
Alice after +5: 95
--- iteration ---
Alice: 95
Carol: 88
Dave: 70
--- word count ---
  brown: 1
  dog: 1
  fox: 2
  jumps: 1
  lazy: 1
  over: 1
  quick: 1
  the: 3
```

---

## S3.7 Exercise

1. Build a `HashMap<&str, Vec<i32>>` that groups numbers by a label. Insert
   `"odd"` -> `[1,3,5]` and `"even"` -> `[2,4,6]`. Print both groups.

2. Write a function `char_frequency(s: &str) -> HashMap<char, usize>` that counts
   how often each character appears. Test it on `"mississippi"` and print results
   in alphabetical order.

3. Given two `HashMap<String, u32>` maps, write a function that merges the second
   into the first, summing values for keys that appear in both.

---

## S3.8 Common Mistakes

**Indexing with a key that may not exist**

```rust
println!("{}", scores["Dave"]);   // panics if Dave is absent
```

Use `scores.get("Dave")` and handle the `Option`.

**Inserting a `String` key and then looking up with `&str`**

```rust
scores.insert(String::from("Alice"), 90);
scores.get("Alice")   // works - &str implements Borrow<str>, as does String
```

This actually works correctly because `HashMap` accepts any type that implements
`Borrow<K>`. Knowing this avoids unnecessary `.to_string()` allocations on lookup.

**Assuming iteration order**

`HashMap` uses a random hash seed. The order of `iter()` is not insertion order and
varies between runs. Use `sort` on collected pairs for consistent output.

---

## S3.9 Key Terms

| Term | Meaning |
|------|---------|
| `HashMap<K, V>` | Hash table mapping keys of type `K` to values of type `V` |
| `insert` | Adds or overwrites a key-value pair; returns the old value as `Option<V>` |
| `get` | Returns `Option<&V>` for a given key |
| `remove` | Removes a key and returns its value as `Option<V>` |
| entry API | `entry(key).or_insert(val)` - insert-if-absent with one lookup |
| `or_insert` | Returns `&mut V` to the existing or newly inserted value |
| `Borrow` | Trait that lets `String` keys be looked up via `&str` references |
