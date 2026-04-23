# Structure.md — CppPageValidator

*Language- and toolchain-specific layout document for the C++ HTML page validator.*

---

## Language & Toolchain

- **Language:** C++23 (named modules, `import std;`)
- **Build:** CMake 3.28+ / MSVC 19.38+ or Clang 18+
- **Purpose:** Examine HTML files for valid structural composition

---

## Directory Layout

```
CppPageValidator/
├── Constitution.md
├── Structure.md
├── README.md
├── CMakeLists.txt              ← top-level: sets C++23, adds subdirectories
├── tokenizer/
│   ├── CMakeLists.txt          ← static library: tokenizer
│   ├── Spec.md
│   └── src/
│       ├── Tokenizer.ixx       ← export module tokenizer;
│       └── test.cpp
├── lexer/
│   ├── CMakeLists.txt          ← static library: lexer; links tokenizer
│   ├── Spec.md
│   └── src/
│       ├── Lexer.ixx           ← export module lexer;
│       └── test.cpp
├── validator/
│   ├── CMakeLists.txt          ← static library: validator; links lexer
│   ├── Spec.md
│   └── src/
│       ├── Validator.ixx       ← export module validator;
│       └── test.cpp
└── entry_point/
    ├── CMakeLists.txt          ← executable: page_validator; links validator
    ├── Spec.md
    └── src/
        └── main.cpp
```

---

## Component Responsibilities

### tokenizer

Reads raw HTML source text and splits it into a flat stream of `Token` values.
`Token` is a `std::variant` over:

```cpp
tok::TagOpen, tok::TagClose, tok::AttrName,
tok::AttrValue, tok::AttrUnquoted, tok::SelfClose,
tok::TagEnd, tok::Text, tok::Comment, tok::Doctype, tok::Eof
```

The tokenizer holds no HTML grammar knowledge — it only recognises `<`, `>`,
`=`, `"`, `'`, and `!` as delimiters.

### lexer

Consumes the `Token` stream and groups tokens into `Lexeme` values.  `Lexeme`
is a `std::variant` over:

```cpp
lex::OpenTag, lex::SelfClosingTag, lex::CloseTag,
lex::TextNode, lex::CommentNode, lex::DoctypeDecl
```

`OpenTag` and `SelfClosingTag` carry a `std::vector<Attr>` with key, value, and
quoting status.  All tag names are lowercased.

### validator

Drives the `Lexer` and applies HTML structural rules.  Uses a
`std::vector<std::pair<std::string, Pos>>` element stack to track open tags.
Returns a `Report` containing all `ValidationError` items found.  Never
short-circuits on the first failure.

### entry_point

Parses command-line flags manually (no external dependency), iterates over
the specified HTML files with optional recursive directory search, calls
`Validator::validate` for each file, and prints a human-readable report.

---

## Component Dependencies

```
tokenizer
    |
  lexer
    |
validator
    |
entry_point
```

Each library depends only on the library directly above it.  `entry_point`
links `validator`; `validator` links `lexer`; `lexer` links `tokenizer`.
The `PUBLIC` link keyword ensures CMake propagates compile-time module
scan dependencies transitively.

---

## Build Steps

```bash
# Configure (Debug or Release)
cmake -B build -G "Visual Studio 17 2022"
cmake --build build --config Release

# Run all unit tests
ctest --test-dir build --build-config Release --output-on-failure

# Run the release binary
build\entry_point\Release\page_validator -r -s .\some\site
```

---

## External Dependencies

None.  Only the C++23 standard library (`import std;`) is used.

---

## Testing

Each component has a `test.cpp` that follows the same pattern as
`CppTextFinder`: a table of `{name, fn}` pairs, each function returns `bool`,
and the runner prints `PASS`/`FAIL` to stdout.

```bash
ctest --test-dir build --build-config Release --output-on-failure
```

---

*End of Structure.md*
