# Spec.md — Validator

*Specifies the HTML structural validator library.*

---

## Responsibility

Validator drives the `Lexer` and applies structural rules to verify that an
HTML document is correctly formed.  It collects all errors before returning;
it never short-circuits on the first failure.

---

## Source File

```
validator/src/
└── Validator.ixx      ← export module validator;
```

---

## Exported Types

### `ValidationError`

```cpp
struct ValidationError {
    const char* rule;     // rule identifier, e.g. "tag-nesting"
    std::string message;  // human-readable description
    std::size_t line;
    std::size_t col;
};
```

### `Report`

```cpp
struct Report {
    std::filesystem::path        file;
    std::vector<ValidationError> errors;

    bool is_valid() const;  // true when errors is empty
};
```

---

## Class `Validator`

All state lives in local variables within `validate()`.

```cpp
class Validator {
public:
    static Report validate(std::string_view src,
                           const std::filesystem::path& file);
};
```

---

## Validation Algorithm

1. Construct a `Lexer` over `src`.
2. Initialise state: `stack`, `ids`, flags (`seen_doctype`, `html_count`,
   `seen_head`, `seen_title`, `seen_body`, `in_head`).
3. Loop over `lexer.next_lexeme()`:
   - `DoctypeDecl` → set `seen_doctype = true`.
   - `OpenTag{name, attrs, pos}`:
     - Call `check_attrs(attrs, pos, errors, ids)`.
     - Update flags: `html_count`, `seen_head`/`in_head`, `seen_title`, `seen_body`.
     - If `name` is not a void element, push `(name, pos)` onto `stack`.
   - `SelfClosingTag{attrs, pos}` → call `check_attrs`.
   - `CloseTag{name, pos}`:
     - If `name` is a void element: emit `void-elements` error; skip stack check.
     - If `name == "head"`: clear `in_head`.
     - If `stack.back().name == name`: `stack.pop_back()`.
     - Else if stack non-empty: emit `tag-nesting` mismatch error.
     - Else: emit `tag-nesting` no-open-tag error.
   - `TextNode`, `CommentNode` → no action.
4. Post-loop checks:
   - `!seen_doctype` → `doctype` error at (1, 1).
   - `html_count != 1` → `root-element` error at (1, 1).
   - `!seen_head` → `head-required` error; else if `!seen_title` → `head-required` error.
   - `!seen_body` → `body-required` error at (1, 1).
   - Each remaining entry in `stack` → `tag-nesting` unclosed-tag error at the
     entry's recorded position.
5. Return `Report{file, errors}`.

`check_attrs(attrs, pos, errors, ids)`:
- For each attr with `!quoted && !value.empty()`: emit `attr-quotes` error.
- For each attr with `key == "id" && !value.empty()`: attempt `ids.insert(value)`;
  on failure emit `duplicate-id` error.

---

## Void Elements

```
area  base  br  col  embed  hr  img  input  link  meta  param  source  track  wbr
```

---

## Invariants

- `validate()` never throws; all variant dispatch is exhaustive.
- All errors for a document are collected before `Report` is returned.
- A `SelfClosingTag` for a void element is not an error.
- A `CloseTag` for a void element is always an error.

---

*End of Spec.md*
