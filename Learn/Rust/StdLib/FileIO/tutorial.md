# File I/O

## S5.0 What This Teaches

Rust's file I/O lives in `std::fs` and `std::io`. Every file operation returns
`Result`, making error handling explicit. This tutorial covers:

- Writing a file with `File::create` and `writeln!`
- Reading an entire file with `fs::read_to_string`
- Reading line by line with `BufReader`
- Appending to an existing file
- Checking existence and deleting a file

---

## S5.1 Writing a File

`File::create` creates or truncates a file. `writeln!` writes a line with a trailing
newline. Both return `Result` - use `?` to propagate errors:

```rust
use std::fs::File;
use std::io::{self, Write};

fn write_sample(path: &str) -> io::Result<()> {
    let mut file = File::create(path)?;
    writeln!(file, "line one")?;
    writeln!(file, "line two")?;
    writeln!(file, "line three")?;
    Ok(())
}
```

`io::Result<()>` is shorthand for `Result<(), io::Error>`. The `?` operator converts
`io::Error` values and returns them to the caller automatically.

---

## S5.2 Reading an Entire File

`fs::read_to_string` is the simplest approach when the file fits in memory:

```rust
use std::fs;

let content = fs::read_to_string("sample.txt")?;
print!("{content}");
```

It returns `Result<String, io::Error>`. Use it when you need the whole file at once.

---

## S5.3 Reading Line by Line

For large files or when you process lines incrementally, `BufReader` avoids loading
everything into memory:

```rust
use std::fs::File;
use std::io::{BufRead, BufReader};

fn read_lines(path: &str) -> io::Result<Vec<String>> {
    let file   = File::open(path)?;
    let reader = BufReader::new(file);
    reader.lines().collect()
}
```

`reader.lines()` is an iterator of `io::Result<String>`. `.collect()` with return
type `io::Result<Vec<String>>` short-circuits on the first error.

---

## S5.4 Appending to a File

`OpenOptions` controls how a file is opened. `append(true)` moves the write cursor
to the end without truncating:

```rust
use std::fs;

let mut file = fs::OpenOptions::new()
    .append(true)
    .open("sample.txt")?;
writeln!(file, "line four")?;
```

---

## S5.5 Checking Existence and Deleting

`fs::metadata` returns `Ok` if the path exists and the process can stat it:

```rust
println!("exists: {}", fs::metadata("sample.txt").is_ok());
fs::remove_file("sample.txt")?;
println!("exists: {}", fs::metadata("sample.txt").is_ok());
```

---

## S5.6 Expected Output

```
--- write ---
wrote sample.txt
--- read_to_string ---
line one
line two
line three
--- read lines ---
0: line one
1: line two
2: line three
--- append ---
line count: 4
--- exists / remove ---
exists: true
exists after remove: false
```

---

## S5.7 Exercise

1. Write a program that creates `numbers.txt` with the integers 1 through 10, one per
   line. Read it back and print the sum.

2. Write a function `copy_file(src: &str, dst: &str) -> io::Result<()>` using
   `read_to_string` and `fs::write`. Verify the copy is identical by reading both back.

3. Read a text file line by line, filter out blank lines, and write the non-blank lines
   to a second file. Use `BufReader` for reading and `BufWriter` for writing.

---

## S5.8 Common Mistakes

**Not propagating errors from file operations**

```rust
let content = fs::read_to_string("file.txt").unwrap();
```

If the file is missing, this panics. Functions that do I/O should return `io::Result`
and use `?` so the caller decides how to handle failure.

**Opening with File::create when you meant to append**

`File::create` truncates the file if it exists. Use `OpenOptions::new().append(true).open(path)`
when you want to add to an existing file.

**Forgetting to flush a BufWriter**

`BufWriter` holds data in memory and flushes in chunks. If you drop it without
flushing, the last partial buffer may not be written. Drop order handles this
automatically in Rust (flush on drop), but an early `return Err(...)` before the
drop can leave data unwritten - call `.flush()?` explicitly when in doubt.

**Using relative paths and being surprised by the working directory**

Relative paths resolve from the process's current working directory, which for
`cargo run` is the crate root (where `Cargo.toml` lives). In tests it may differ.
Use `std::env::current_dir()` to inspect it when paths do not resolve as expected.

---

## S5.9 Key Terms

| Term | Meaning |
|------|---------|
| `File::create` | Opens a file for writing; creates it if absent, truncates if present |
| `File::open` | Opens a file for reading; returns `Err` if not found |
| `OpenOptions` | Builder for fine-grained file open modes (read, write, append, create) |
| `BufReader` | Wraps a reader with buffering; reduces system calls on line-by-line reads |
| `BufWriter` | Wraps a writer with buffering; flushes in chunks |
| `writeln!` | Macro that writes a formatted string followed by a newline |
| `fs::read_to_string` | Reads an entire file into a `String` in one call |
| `fs::remove_file` | Deletes a file |
| `io::Result<T>` | Shorthand for `Result<T, io::Error>` |
