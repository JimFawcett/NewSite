# ClipFormatter

Formats code by adding line numbers and auto-indenting based on brace depth. Reads from the system clipboard, writes the formatted result back, and echoes to stdout.

Works with any brace-delimited language: Rust, C++, C#, Java, JavaScript, etc.

## How It Works

- Strips leading whitespace from each input line
- Tracks `{` / `}` depth to compute indentation
- Prepends a right-aligned line number to each output line

## Usage

### Clipboard version (primary)

```
Formatter.exe
```

No arguments. Reads the clipboard, formats, and returns the result to the clipboard.

Defaults: 2-character line number width, 2-space indent per level.

### File version (demo)

```
Formatter.exe <file_path> [line_number_width] [indent_spaces]
```

| Argument | Default | Description |
|---|---|---|
| `file_path` | required | Source file to format |
| `line_number_width` | 4 | Width of the line number column |
| `indent_spaces` | 4 | Spaces per indentation level |

### GUI wrapper

Run `executable\run_formatter.bat` to launch a Tkinter GUI (requires Python 3). The GUI lets you set line number width and indent size, displays the formatted output, and copies it back to the clipboard.

## Building

```
cargo build
```

Requires Rust 2021 edition. Single dependency: [`arboard`](https://crates.io/crates/arboard) for cross-platform clipboard access.

The compiled binary lands at `target/debug/Formatter.exe` (or `target/release/Formatter.exe` with `--release`).

## Source Layout

```
src/main.rs          clipboard version
demo/main.rs         file-based version
executable/          pre-built binaries and Python GUI wrappers
DemoOut.rs           example of formatted output
```
