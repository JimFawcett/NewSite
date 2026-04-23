# Spec.md — Tokenizer

*Specifies the HTML tokenizer library.*

---

## Responsibility

Tokenizer reads raw HTML source text and emits a flat stream of coarse `Token`
values.  It recognises only the characters `<`, `>`, `=`, `"`, `'`, `!`, `/`,
and `-` as structurally significant.  It has no HTML grammar knowledge.

---

## Source File

```
tokenizer/src/
└── Tokenizer.ixx      ← export module tokenizer;
```

---

## Token Variant

```cpp
using Token = std::variant<
    tok::TagOpen,      // <name            — emitted before attribute scan
    tok::TagClose,     // </name>
    tok::AttrName,     // key
    tok::AttrValue,    // "value" or 'value'  (quoted)
    tok::AttrUnquoted, // value              (unquoted)
    tok::SelfClose,    // />
    tok::TagEnd,       // >  (ends a start tag)
    tok::Text,         // raw text between tags
    tok::Comment,      // <!-- ... -->
    tok::Doctype,      // <!...>
    tok::Eof
>;
```

Each alternative that carries content holds a `std::string` field.  `SelfClose`,
`TagEnd`, and `Eof` hold no data.

---

## Class `Tokenizer`

### Constructor

```cpp
explicit Tokenizer(std::string src);
```

### Methods

```cpp
Token next_token();
std::pair<std::size_t, std::size_t> token_start() const;
```

`token_start()` returns the `(line, col)` position where the last returned
token began.  Lines and columns are 1-based.

---

## Tokenizer Algorithm

`next_token()`:
1. If a `pending_` token is stored, return it (and its recorded position).
2. Record `last_start_ = {line_, col_}`.
3. If `in_tag_` is `true`, delegate to `scan_in_tag()`.
4. If EOF: return `tok::Eof`.
5. If `'<'`:
   - Advance past `<`.
   - If `'!'`: advance; if next two chars are `--` advance twice →
     `Comment(collect_until("-->"))`; else `Doctype(collect_until(">"))`.
   - If `'/'`: advance → `collect_name()` → skip whitespace → consume `>` →
     return `TagClose{name}`.
   - Else: `collect_name()` → set `in_tag_ = true` → return `TagOpen{name}`.
6. Else: collect characters until `'<'` → return `Text{text}`.

`scan_in_tag()`:
1. Skip whitespace.
2. If EOF or `'>'`: advance if `'>'`, clear `in_tag_`, return `TagEnd`.
3. If `'/'` followed by `'>'`: advance twice, clear `in_tag_`, return `SelfClose`.
4. `collect_name()` → if empty: advance, recurse.
5. Skip whitespace.  If next char is not `'='`: return `AttrName{name}`.
6. Advance past `'='`, skip whitespace, record `val_pos`.
7. If next char is `'"'` or `'\''`:
   - advance past opening quote, collect until matching closing quote, advance.
   - Store `tok::AttrValue{val}` in `pending_` at `val_pos`.
8. Else: collect until whitespace, `'>'`, or `'/'`.
   - Store `tok::AttrUnquoted{val}` in `pending_` at `val_pos`.
9. Return `tok::AttrName{name}`.

The `pending_` mechanism allows one token to be buffered.  `next_token()` checks
`pending_` before doing any other work.

---

## Invariants

- `next_token()` never throws.
- `token_start()` always reflects the position of the most recently returned token.
- Unrecognised sequences are emitted as `Text` or consumed silently; parsing
  never aborts.

---

*End of Spec.md*
