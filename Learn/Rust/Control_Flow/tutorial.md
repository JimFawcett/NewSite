# Control Flow

## 4.0 What This Teaches

This tutorial covers every construct Rust provides for directing the order of execution:

- `if` / `else` as both a statement and an expression
- `loop` with `break` carrying a value
- `while` for condition-driven repetition
- `for` over ranges and slices
- `match` for exhaustive pattern matching

---

## 4.1 if / else

`if` selects a branch based on a boolean condition. Rust does not coerce integers or
other types to `bool` - the condition must be exactly `bool`.

```rust
let temp = 72;

if temp > 80 {
    println!("hot");
} else if temp > 60 {
    println!("comfortable");
} else {
    println!("cold");
}
```

---

## 4.2 if as an Expression

Because `if` is an expression in Rust, it can produce a value. Both arms must evaluate
to the same type - the compiler enforces this at compile time.

```rust
let description = if temp > 60 { "warm" } else { "cool" };
println!("temp is {description}");
```

This is more direct than declaring a mutable variable and reassigning it inside each
branch. Use it whenever you are choosing between two values of the same type.

---

## 4.3 loop

`loop` runs its body forever. You exit it with `break`. Unlike `while true`, `loop`
signals intent clearly: "this runs until I explicitly stop it."

`break` can carry a value out of the loop, making `loop` usable as an expression:

```rust
let mut n = 0;
let result = loop {
    n += 1;
    if n == 5 {
        break n * 2;  // result receives 10
    }
};
println!("loop result = {result}");
```

This pattern is useful when computing a value requires retrying - for example, reading
user input or waiting for a condition to become true.

---

## 4.4 while

`while` checks a condition before each iteration and stops when it becomes `false`.

```rust
let mut count = 3;
while count > 0 {
    println!("count = {count}");
    count -= 1;
}
```

Use `while` when the number of iterations depends on a condition that changes inside
the loop body. Use `for` when iterating over a known sequence.

---

## 4.5 for over a Range

Ranges give a concise way to iterate over integers. `0..4` is exclusive of the upper
bound (produces 0, 1, 2, 3). `1..=3` is inclusive (produces 1, 2, 3).

```rust
for i in 0..4 {
    print!("{i} ");
}
println!();  // flush the line
```

```rust
for i in 1..=3 {
    print!("{i} ");
}
println!();
```

`print!` (without `ln`) writes without a trailing newline. The final `println!()` with
no arguments writes just a newline, completing the line.

---

## 4.6 for over a Slice

`for` works over any iterator, including slices. The `&` before the array name borrows
it - you are reading the elements, not consuming or moving them.

```rust
let words = ["alpha", "beta", "gamma"];
for word in &words {
    println!("{word}");
}
```

If you need the index alongside the value, use `.iter().enumerate()`:

```rust
for (i, word) in words.iter().enumerate() {
    println!("{i}: {word}");
}
```

---

## 4.7 match

`match` compares a value against a list of patterns and runs the first arm that matches.
It is *exhaustive* - the compiler requires every possible value to be covered. The
wildcard `_` catches anything not matched by an earlier arm.

```rust
let score = 85;
let grade = match score {
    90..=100 => "A",
    80..=89  => "B",
    70..=79  => "C",
    _        => "below C",
};
println!("grade = {grade}");
```

Each arm is `pattern => expression`. A comma ends each arm (the last comma is optional).
`match` is an expression - here the matched string slice is assigned directly to `grade`.

`match` is preferred over long `if/else if` chains when testing a single value against
multiple cases. The compiler can warn about unreachable arms and will error if any value
is unhandled.

---

## 4.8 Example - All Together

```rust
fn main() {
    let temp = 72;
    if temp > 80 {
        println!("hot");
    } else if temp > 60 {
        println!("comfortable");
    } else {
        println!("cold");
    }

    let description = if temp > 60 { "warm" } else { "cool" };
    println!("temp is {description}");

    let mut n = 0;
    let result = loop {
        n += 1;
        if n == 5 { break n * 2; }
    };
    println!("loop result = {result}");

    let mut count = 3;
    while count > 0 {
        println!("count = {count}");
        count -= 1;
    }

    for i in 0..4 { print!("{i} "); }
    println!();

    for i in 1..=3 { print!("{i} "); }
    println!();

    let words = ["alpha", "beta", "gamma"];
    for word in &words { println!("{word}"); }

    let score = 85;
    let grade = match score {
        90..=100 => "A",
        80..=89  => "B",
        70..=79  => "C",
        _        => "below C",
    };
    println!("grade = {grade}");
}
```

Expected output:

```
comfortable
temp is warm
loop result = 10
count = 3
count = 2
count = 1
0 1 2 3 
1 2 3 
alpha
beta
gamma
grade = B
```

---

## 4.9 Exercise

1. Write a `for` loop over the range `1..=10` that prints each number, but prints
   "fizz" instead when the number is divisible by 3 and "buzz" when divisible by 5.
   Use `if`/`else if`/`else` inside the loop body.

2. Use `loop` and `break` to find the first integer greater than 100 that is divisible
   by 7. Print it. Assign the result using `break value` so you do not need a separate
   variable.

3. Rewrite the grade computation from section 4.7 using `if`/`else if`/`else` as an
   expression instead of `match`. Which reads more clearly for this case?

---

## 4.10 Common Mistakes

**Non-boolean condition in if**

```rust
let x = 1;
if x { ... }  // error: expected bool, found integer
```

Rust does not treat non-zero as true. Write `if x != 0 { ... }`.

**Mismatched types in if expression arms**

```rust
let v = if condition { 1 } else { "one" };  // error: mismatched types
```

Both arms must produce the same type. Here `1` is `i32` and `"one"` is `&str`.

**Exclusive vs. inclusive range confusion**

```rust
for i in 0..5 { ... }   // iterates 0, 1, 2, 3, 4  (5 is excluded)
for i in 0..=5 { ... }  // iterates 0, 1, 2, 3, 4, 5
```

`..` excludes the upper bound; `..=` includes it.

**Non-exhaustive match**

```rust
let x: i32 = 3;
match x {
    1 => println!("one"),
    2 => println!("two"),
    // error: pattern `i32::MIN..=0_i32` and more not covered
}
```

Add a `_ => ...` arm or cover every possible value.

**Forgetting & when iterating a slice**

```rust
let nums = [1, 2, 3];
for n in nums { ... }   // moves the array; fine for Copy types like i32
for n in &nums { ... }  // borrows; works for any type and is more general
```

For non-`Copy` types (like `String`), iterating without `&` moves the elements out of
the array, which is usually not what you want.

---

## 4.11 Key Terms

| Term | Meaning |
|------|---------|
| `if` expression | A branch construct that can produce a value when both arms have the same type |
| `loop` | An unconditional loop that runs until `break` |
| `break value` | Exits a `loop` and delivers `value` as the loop expression's result |
| `while` | A loop that checks a boolean condition before each iteration |
| `for` | Iterates over a range or any other iterator |
| range `0..n` | Produces integers from 0 up to but not including n |
| range `0..=n` | Produces integers from 0 through n inclusive |
| `match` | Exhaustive pattern matching; every possible value must be handled |
| wildcard `_` | A match arm pattern that matches anything not covered by earlier arms |
| `.enumerate()` | Iterator adapter that pairs each element with its index |
