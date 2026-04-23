# RsPageValidator

Validates HTML files for structural correctness.

## Build

```bash
cargo build
cargo build --release
cargo test
```

## Usage

```bash
# Validate a single file
cargo run -- index.html

# Validate a directory tree, quiet mode
cargo run -- -r -q ./site

# Validate with summary
cargo run -- -r -s ./site
```

## Rules checked

`doctype` · `root-element` · `head-required` · `body-required` ·
`tag-nesting` · `void-elements` · `attr-quotes` · `duplicate-id`

Exit status `0` = all files pass.  Exit status `1` = one or more files fail.
