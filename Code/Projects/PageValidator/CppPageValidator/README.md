# CppPageValidator

Validates HTML files for structural correctness.  C++23 port of
[rs_page_validator](../rs_page_validator/).

## Build

```bash
# From CppPageValidator/ using MSVC (Windows)
cmake -B build -G "Visual Studio 17 2022"
cmake --build build --config Release

# Run all unit tests
ctest --test-dir build --build-config Release --output-on-failure
```

## Usage

```bash
# Validate a single file
build\EntryPoint\Release\page_validator index.html

# Validate a directory tree, quiet mode
build\EntryPoint\Release\page_validator -r -q .\site

# Validate with summary
build\EntryPoint\Release\page_validator -r -s .\site
```

## Options

| Flag | Meaning | Default |
|------|---------|---------|
| `-r`, `--recursive` | Descend into subdirectories | off |
| `-q`, `--quiet`     | Print only files with errors | off |
| `-s`, `--summary`   | Print a pass/fail count line | off |
| `-h`, `--help`      | Print help and exit | off |

## Rules checked

`doctype` · `root-element` · `head-required` · `body-required` ·
`tag-nesting` · `void-elements` · `attr-quotes` · `duplicate-id`

Exit status `0` = all files pass.  Exit status `1` = one or more files fail.
