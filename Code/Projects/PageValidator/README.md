# PageValidator

A family of four HTML structural validators — each implementing the same
design in a different language.  All four share a common architecture,
identical validation rules, and a uniform command-line interface.  The project
is a reference for how the same problem looks across Rust, C++, C#, and Python.

---

## Projects

| Project | Language | Toolchain | Entry point |
|---------|----------|-----------|-------------|
| [rs_page_validator](rs_page_validator/) | Rust 2021 | Cargo workspace | `cargo run --` |
| [CppPageValidator](CppPageValidator/) | C++23 | CMake + MSVC/Clang | `page_validator` |
| [CsPageValidator](CsPageValidator/) | C# 12 / .NET 10 | dotnet SDK | `dotnet run --project EntryPoint --` |
| [PyPageValidator](PyPageValidator/) | Python 3.10+ | none (run directly) | `python EntryPoint/page_validator.py` |

Every project has its own `Constitution.md` (language-agnostic governing
document), `Structure.md` (language-specific layout and toolchain), and a
`Spec.md` per component.

---

## Architecture

Each implementation is a four-component pipeline with a strictly linear
dependency chain.  No component depends on anything to its right.

```
Tokenizer ← Lexer ← Validator ← EntryPoint
```

| Component | Responsibility |
|-----------|----------------|
| **Tokenizer** | Reads raw HTML source and emits a flat stream of coarse tokens.  Knows only `<`, `>`, `=`, `"`, `'`, `!`, `/`, `-`.  No HTML grammar. |
| **Lexer** | Consumes the token stream and groups tokens into structured lexemes (open tags, close tags, attributes, text, comments, doctype) with source positions.  Lowercases all tag names. |
| **Validator** | Drives the lexer, maintains an open-tag stack, applies the eight structural rules, and returns a report containing every error found.  Never short-circuits. |
| **EntryPoint** | Parses command-line flags, iterates HTML files, calls the validator, and prints a human-readable pass/fail report. |

---

## Validation Rules

| Rule ID | Description |
|---------|-------------|
| `doctype` | Document begins with `<!DOCTYPE html>` |
| `root-element` | Exactly one `<html>` element wraps the entire document |
| `head-required` | `<head>` is present and contains at least one `<title>` |
| `body-required` | `<body>` is present |
| `tag-nesting` | Every open tag has a matching close tag in the correct stack order |
| `void-elements` | Void elements (`br`, `hr`, `img`, `input`, `link`, `meta`, …) carry no close tag |
| `attr-quotes` | All attribute values are enclosed in single or double quotes |
| `duplicate-id` | The `id` attribute value is unique within the document |

---

## Command-Line Interface

All four implementations share the same flags and output format.

```
page_validator [options] <path>...

Options:
  -r, --recursive    Descend into subdirectories
  -q, --quiet        Print only files with errors
  -s, --summary      Print a pass/fail count after all files
  -h, --help         Print help and exit
```

**Output:**
```
PASS  path/to/good.html
FAIL  path/to/bad.html
      [tag-nesting] 14:3 — </div> does not match open <p>
      [attr-quotes] 22:9 — attribute 'class' value 'hero' is not quoted
```

Exit status `0` = all files pass.  Exit status `1` = one or more files fail
or could not be read.

---

## Quick Start

### Rust
```bash
cd rs_page_validator
cargo build --release
cargo test
./target/release/rs_page_validator -r -s path/to/site
```

### C++
```bash
cd CppPageValidator
cmake -B build -G "Visual Studio 17 2022"
cmake --build build --config Release
ctest --test-dir build --build-config Release --output-on-failure
build\entry_point\Release\page_validator -r -s path\to\site
```

### C#
```bash
cd CsPageValidator
dotnet build CsPageValidator.sln
dotnet run --project EntryPoint -- -r -s path/to/site
```

### Python
```bash
cd PyPageValidator
python -m unittest discover -s . -p "test_*.py"
python EntryPoint/page_validator.py -r -s path/to/site
```

---

## Design Principles

1. **Single responsibility** — each component does exactly one thing.
2. **Non-failing parse** — Tokenizer and Lexer never abort on malformed input; every
   problem is forwarded to the Validator as an opaque token.
3. **Complete reporting** — the Validator collects all errors before returning;
   it never stops at the first failure.
4. **Fail-safe reads** — a file that cannot be opened is reported as a single
   read-error and skipped; it never aborts the overall run.
5. **Excluded directories** — `bin`, `obj`, `target`, `build`, `out`,
   `__pycache__`, `.venv`, `venv`, `dist`, `.git`, `.vs`, `.idea`, `archive`
   are always skipped during recursive traversal.

---

## Language Comparison

| Aspect | Rust | C++ | C# | Python |
|--------|------|-----|----|--------|
| Token type | `enum Token` | `std::variant` | `abstract record` | base class + `@dataclass` |
| Lexeme type | `enum Lexeme` | `std::variant` | `abstract record` | base class + `@dataclass` |
| Null / absence | `Option<Lexeme>` | `std::optional<Lexeme>` | `Lexeme?` | `Lexeme \| None` |
| Test runner | `cargo test` | custom `test.cpp` runner | custom `Exe` runner | `unittest` |
| External deps | none (std only) | none (std only) | none (BCL only) | none (stdlib only) |

---

*See each project's `Constitution.md` for the language-agnostic specification
and `Structure.md` for language-specific build and layout details.*

---

## Code Metrics

Generated by `code_metrics.py` from the `Projects/` directory.
**Lines** = total line count (code + comments + blanks).
**Scopes** = scope-opening tokens: `{` count for brace languages; lines ending
with `:` for Python.

### Rust — rs\_page\_validator

| File | Lines | Scopes |
|------|------:|-------:|
| entry_point/src/main.rs | 135 | 42 |
| lexer/src/lib.rs | 185 | 62 |
| tokenizer/src/lib.rs | 312 | 65 |
| validator/src/lib.rs | 270 | 64 |
| **TOTAL** | **902** | **233** |

### C++ — CppPageValidator

| File | Lines | Scopes |
|------|------:|-------:|
| entry_point/src/main.cpp | 161 | 20 |
| lexer/src/Lexer.ixx | 144 | 41 |
| lexer/src/test.cpp | 138 | 29 |
| tokenizer/src/test.cpp | 157 | 28 |
| tokenizer/src/Tokenizer.ixx | 185 | 58 |
| validator/src/test.cpp | 137 | 29 |
| validator/src/Validator.ixx | 176 | 30 |
| **TOTAL** | **1098** | **235** |

### C# — CsPageValidator

| File | Lines | Scopes |
|------|------:|-------:|
| EntryPoint/Program.cs | 170 | 31 |
| Lexer/Lexer.cs | 129 | 12 |
| Lexer.Tests/Tests.cs | 115 | 29 |
| Tokenizer/Tokenizer.cs | 195 | 25 |
| Tokenizer.Tests/Tests.cs | 133 | 32 |
| Validator/Validator.cs | 151 | 23 |
| Validator.Tests/Tests.cs | 129 | 18 |
| **TOTAL** | **1022** | **170** |

### Python — PyPageValidator

| File | Lines | Scopes |
|------|------:|-------:|
| EntryPoint/page_validator.py | 155 | 39 |
| Lexer/lexer.py | 126 | 32 |
| Lexer/test_lexer.py | 83 | 13 |
| Tokenizer/tokenizer.py | 197 | 52 |
| Tokenizer/test_tokenizer.py | 108 | 15 |
| Validator/validator.py | 159 | 34 |
| Validator/test_validator.py | 91 | 15 |
| **TOTAL** | **919** | **200** |

---

## Performance

Generated by `pa_timer.py` from the `Projects/` directory (default `--site` scans the NewSite root).
20 timed runs per validator against the full NewSite HTML tree;
first run discarded as warm-up to eliminate cold-cache effects.
**min** = best observed; **median** = typical; **max** = worst observed.

| Validator | min | median | max | files | failed |
|-----------|----:|-------:|----:|------:|-------:|
| Rust (Release) | 0.901 s | 0.936 s | 1.972 s | 664 | 425 |
| C++ (Release) | 0.521 s | 0.645 s | 2.729 s | 664 | 425 |
| C# (Release) | 1.127 s | 1.290 s | 1.538 s | 664 | 425 |
| Python | 2.766 s | 2.846 s | 3.029 s | 664 | 425 |
