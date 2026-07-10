# Formatting and Display

## S10.0 What This Teaches

Rust's formatting system is built around traits and the `format_args!` infrastructure.
Understanding it lets you control exactly how your types appear in output. This tutorial
covers:

- `Display` vs `Debug` - when to implement each
- Implementing `std::fmt::Display` for a custom type
- Format specifiers for numbers, alignment, and width
- Named arguments in format strings
- `format!`, `print!`, `println!`, `eprintln!`

---

## S10.1 Display vs Debug

Rust has two main formatting traits:

| Trait | Format spec | Intended audience |
|-------|-------------|-------------------|
| `Debug` | `{:?}` / `{:#?}` | Developers during debugging |
| `Display` | `{}` | End users; human-readable output |

`Debug` is usually derived with `#[derive(Debug)]`. `Display` must be implemented
manually because "human-readable" depends on the type's purpose.

If you try to print a type with `{}` and it does not implement `Display`, the compiler
gives an error at compile time - not a runtime surprise.

---

## S10.2 Implementing Display

```rust
use std::fmt;

struct Point { x: f64, y: f64 }

impl fmt::Display for Point {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "({}, {})", self.x, self.y)
    }
}
```

`fmt::Result` is `Result<(), fmt::Error>`. Return it from `write!` or `writeln!` -
they already produce the right type. The `?` operator works inside `fmt` functions.

Once `Display` is implemented, `{}` works in any format string and `to_string()` is
automatically available.

---

## S10.3 Implementing Debug Manually

Derive `Debug` whenever you can. Write a manual `impl fmt::Debug` only when the
derived output is wrong or confusing:

```rust
impl fmt::Debug for Point {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "Point \\{{ x: {}, y: {} }}\\", self.x, self.y)
    }
}
```

The `{{` and `}}` inside format strings are escaped braces - they produce literal
`{` and `}` in the output.

---

## S10.4 Numeric Format Specifiers

```rust
let n = 42;
let f = 3.14159_f64;

println!("{n}");     // 42       decimal (default)
println!("{n:b}");   // 101010   binary
println!("{n:o}");   // 52       octal
println!("{n:x}");   // 2a       hex lowercase
println!("{n:X}");   // 2A       hex uppercase
println!("{f:.2}");  // 3.14     two decimal places
println!("{f:e}");   // 3.14159e0  scientific notation
```

---

## S10.5 Width and Alignment

```rust
let n = 42;
println!("'{n:>8}'");   // '      42'   right-align in 8 chars
println!("'{n:<8}'");   // '42      '   left-align
println!("'{n:^8}'");   // '   42   '   center
println!("'{n:08}'");   // '00000042'   zero-pad to 8 digits
```

The format `:{fill}{align}{width}` where `fill` is any character, `align` is `<`, `>`,
or `^`, and `width` is a number.

---

## S10.6 Named Arguments

Variables in scope can be used directly by name inside format strings:

```rust
let name = "Rust";
let edition = 2021;
println!("language={name}, edition={edition}");
```

This is cleaner than positional `{}` placeholders when the format string is long or
has many arguments.

---

## S10.7 format!, print!, println!, eprintln!

| Macro | Destination | Trailing newline |
|-------|-------------|-----------------|
| `format!` | returns a `String` | no |
| `print!` | stdout | no |
| `println!` | stdout | yes |
| `eprintln!` | stderr | yes |

```rust
let s = format!("point is {p}");   // builds a String
print!("no newline");
println!("with newline");
eprintln!("error message to stderr");
```

Use `eprintln!` for error messages and diagnostic output so they appear on stderr and
can be redirected separately from normal program output.

---

## S10.8 Expected Output

```
--- Display vs Debug ---
Display: (3, 4)
Debug:   Point { x: 3, y: 4 }
--- numeric ---
decimal:  42
binary:   101010
octal:    52
hex:      2a
float 2dp:3.14
sci:      3.14159e0
--- alignment ---
right:  '      42'
left:   '42      '
center: '   42   '
zero:   '00000042'
--- named args ---
language=Rust, edition=2021
--- format! ---
point is (3, 4), debug: Point { x: 3, y: 4 }
```

(The `eprintln!` line goes to stderr and may not appear in captured output.)

---

## S10.9 Exercise

1. Define a struct `Color(u8, u8, u8)` and implement `Display` to print it as
   `#RRGGBB` hex (e.g., `Color(255, 128, 0)` prints `#FF8000`). Use `{:02X}` for each
   channel.

2. Implement `Display` for a `Fraction { num: i32, den: i32 }` struct that prints as
   `"3/4"`. Also implement `Debug` to print as `"Fraction { num: 3, den: 4 }"`.

3. Write a function `table(headers: &[&str], rows: &[Vec<String>])` that prints a
   left-aligned table with each column padded to the width of its longest entry.

---

## S10.10 Common Mistakes

**Using {} on a type that only implements Debug**

```rust
println!("{}", my_struct);   // error: my_struct doesn't implement Display
```

Either implement `Display`, or use `{:?}` for the `Debug` output.

**Forgetting to escape braces**

```rust
println!("set: {1, 2, 3}");   // error: invalid format string
println!("set: {{1, 2, 3}}"); // correct: {{ and }} produce literal braces
```

**Calling to_string() before Display is implemented**

`to_string()` is automatically available for any type implementing `Display`. Calling
it before the `impl` exists gives a compile error, not a silent empty string.

**Using print! when println! is needed**

`print!` does not flush stdout automatically. On some platforms, output may not appear
until a newline or an explicit `std::io::stdout().flush()` call. Prefer `println!`
for interactive output.

---

## S10.11 Key Terms

| Term | Meaning |
|------|---------|
| `Display` | Trait for human-readable `{}` formatting; must be implemented manually |
| `Debug` | Trait for developer `{:?}` formatting; usually derived with `#[derive(Debug)]` |
| `fmt::Formatter` | Context object passed to `fmt` methods; carries alignment, width, precision |
| `{:?}` | Debug format specifier |
| `{:#?}` | Pretty-printed Debug format (indented, one field per line) |
| `{:.N}` | Floating-point precision: N decimal places |
| `{:>N}`, `{:<N}`, `{:^N}` | Right-, left-, center-align in N characters |
| `{:0N}` | Zero-pad to N digits |
| `format!` | Macro that builds a `String` from a format template |
| `eprintln!` | Prints to stderr with a trailing newline |
