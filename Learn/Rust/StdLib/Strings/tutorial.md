# String and &str

## S1.0 What This Teaches

Rust has two string types that serve different purposes. Understanding both - and when
to use each - is essential for almost every Rust program. This tutorial covers:

- `&str` vs `String`: what each is and why both exist
- Constructing and concatenating `String` values
- Common query and transformation methods
- Splitting, iterating over characters, and parsing

---

## S1.1 Two String Types

**`&str`** (string slice) is a reference to a sequence of UTF-8 bytes stored somewhere
else - usually in the program's read-only binary or in a `String` on the heap. It is
borrowed: you cannot grow it or own it.

**`String`** is an owned, heap-allocated, growable buffer of UTF-8 bytes. You can
append to it, modify it, and pass ownership of it.

```rust
let s: &str   = "hello";          // lives in read-only memory; borrowed
let t: String = String::from(s);  // heap-allocated copy; owned
```

Function parameters that only need to read a string should take `&str` - it accepts
both `&str` literals and `&String` (via deref coercion). Parameters that need to own
or grow the string take `String`.

---

## S1.2 Constructing a String

```rust
let a = String::from("Rust");
let b = "world".to_string();
let c = format!("{a} {b}");   // format! never moves its arguments
println!("{c}");               // Rust world
```

`format!` is the most flexible constructor - it composes values of any type without
allocating intermediate strings.

---

## S1.3 Concatenation

The `+` operator appends a `&str` to a `String`. It moves the left operand, so the
original binding becomes invalid:

```rust
let s1 = String::from("Hello, ");
let s2 = String::from("world!");
let s3 = s1 + &s2;   // s1 is moved; s2 is borrowed
// s1 is no longer usable here
println!("{s3}");     // Hello, world!
```

When you need to combine many strings, prefer `format!` - it does not move any of
its arguments and produces a fresh `String`.

---

## S1.4 Query Methods

```rust
let msg = String::from("  Hello, Rust!  ");
println!("{}", msg.len());                     // 16 (byte count, not char count)
println!("{}", msg.contains("Rust"));          // true
println!("{}", msg.trim().starts_with("Hello")); // true
println!("{}", msg.trim().ends_with("!"));     // true
```

`len()` returns byte length. For ASCII strings that equals character count, but for
multi-byte Unicode characters they differ. Use `.chars().count()` for character count.

---

## S1.5 Transformation Methods

These methods return new values - they do not modify the original:

```rust
let msg = "  Hello, Rust!  ";
println!("{}", msg.trim());                  // "Hello, Rust!"
println!("{}", msg.trim().to_uppercase());   // "HELLO, RUST!"
println!("{}", msg.trim().to_lowercase());   // "hello, rust!"
println!("{}", msg.trim().replace("Rust", "World")); // "Hello, World!"
```

---

## S1.6 Splitting

`split` returns an iterator of `&str` slices. Call `.collect()` to gather them:

```rust
let csv = "one,two,three,four";
let parts: Vec<&str> = csv.split(',').collect();
println!("{parts:?}");   // ["one", "two", "three", "four"]
```

Other useful splitting methods: `split_whitespace()`, `splitn(n, pat)`, `lines()`.

---

## S1.7 Characters

Rust strings are UTF-8. Indexing by byte position is not always meaningful, so Rust
does not allow `s[0]`. Instead, iterate over Unicode scalar values with `.chars()`:

```rust
for ch in "Rust".chars() { print!("{ch} "); }
println!();
println!("{}", "Rust".chars().count());   // 4
```

---

## S1.8 Conversion and Parsing

`&String` coerces to `&str` automatically (deref coercion):

```rust
let owned   = String::from("owned");
let borrowed: &str = &owned;   // no copy; just a reference into owned's buffer
```

Parse a `&str` into a numeric type with `.parse()`:

```rust
let n: i32 = "42".parse().unwrap();
println!("{n}");   // 42
```

`.parse()` returns `Result` - use `?` in a function or `.unwrap()` in a demo.

---

## S1.9 Expected Output

```
--- String vs &str ---
&str: hello, String: hello
--- construction ---
Rust world
--- concatenation ---
Hello, world!
--- query methods ---
len:         16
contains:    true
starts_with: true
ends_with:   true
--- transform ---
trim:         'Hello, Rust!'
to_uppercase: HELLO, RUST!
to_lowercase: hello, rust!
replace:      Hello, World!
--- split ---
["one", "two", "three", "four"]
--- chars ---
R u s t 
char count: 4
--- conversion ---
borrowed: owned
--- parse ---
parsed: 42
```

---

## S1.10 Exercise

1. Write a function `word_count(s: &str) -> usize` that returns the number of
   whitespace-delimited words. Test it on a sentence.

2. Write a function `capitalize(s: &str) -> String` that returns a new `String` with
   the first character uppercased and the rest unchanged. Use `.chars()` to get the
   first character and `[1..]` for the remainder.

3. Split `"2024-07-09"` on `'-'` and parse each part to `u32`. Print year, month, day
   on separate lines.

---

## S1.11 Common Mistakes

**Indexing a String with `[]`**

```rust
let s = String::from("hello");
let c = s[0];   // error: String cannot be indexed by integer
```

Use `.chars().nth(0)` for a character or `&s[0..1]` for a byte slice (safe only for
ASCII).

**Treating len() as character count**

`len()` counts bytes. `"café".len()` returns 5 (the `é` is two bytes), but
`"café".chars().count()` returns 4.

**Moving a String into `+` unexpectedly**

```rust
let s1 = String::from("a");
let s2 = String::from("b");
let s3 = s1 + &s2;
println!("{s1}");   // error: s1 was moved
```

Use `format!("{s1}{s2}")` to avoid moving either operand.

---

## S1.12 Key Terms

| Term | Meaning |
|------|---------|
| `&str` | Borrowed string slice; reference to UTF-8 bytes stored elsewhere |
| `String` | Owned, heap-allocated, growable UTF-8 string |
| deref coercion | Automatic conversion of `&String` to `&str` by the compiler |
| `.chars()` | Iterator over Unicode scalar values (`char`), not bytes |
| `.parse()` | Converts a `&str` to another type; returns `Result` |
| `format!` | Macro that builds a `String` from a format template without moving args |
