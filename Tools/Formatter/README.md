# Formatter

Formats source code by adding line numbers and auto-indenting based on brace depth. Reads from a file and writes to stdout.

Works with any brace-delimited language: Rust, C++, C#, Java, JavaScript, etc.

## How It Works

- Strips leading whitespace from each input line
- Tracks `{` / `}` depth to compute indentation
- Prepends a right-aligned line number to each output line

## Usage

### CLI

```
Formatter.exe <file_path> [line_number_width] [indent_spaces]
```

| Argument | Default | Description |
|---|---|---|
| `file_path` | required | Source file to format |
| `line_number_width` | 4 | Width of the line number column |
| `indent_spaces` | 4 | Spaces per indentation level |

**Examples:**

```
Formatter.exe mycode.rs
Formatter.exe mycode.rs 2 2
```

### GUI wrapper

Run `executable\run_formatter.bat` to launch a Tkinter GUI (requires Python 3). The GUI lets you browse for a file, set line number width and indent size, displays the formatted output, and copies it to the clipboard.

## Building

```
cargo build
```

Requires Rust 2021 edition. No external dependencies - uses the standard library only.

The compiled binary lands at `target/debug/Formatter.exe` (or `target/release/Formatter.exe` with `--release`).

## Source Layout

```
src/main.rs          formatter implementation
executable/          pre-built binary and Python GUI wrapper
DemoOut.rs           example of formatted output
```
