# Constitution.md — RsPageValidator

*Language-agnostic governing document for the PageValidator project.*

---

## Purpose

PageValidator examines HTML files for valid structural composition.  It reads
one or more HTML files (or a directory tree), parses each file into a token
and lexeme stream, and applies a set of structural rules to verify correct
nesting, required elements, attribute quoting, and document-level invariants.
Each file receives a pass/fail verdict with annotated error locations.

---

## Scope

The project is intentionally small.  Every component fits in a single source
file.  No component should grow beyond the responsibility described in its own
Spec.md.

---

## Components

| Component   | Responsibility |
|-------------|----------------|
| EntryPoint  | Parses the command line, iterates target files, calls Validator for each, and writes the report to stdout.  Exits with status 1 if any file fails. |
| Tokenizer   | Reads raw HTML source text and emits a flat stream of coarse tokens — tag delimiters, attribute fragments, text, comments, and doctype declarations. |
| Lexer       | Consumes the Token stream and groups tokens into structured Lexeme values that carry tag names, attribute key/value pairs, and source positions. |
| Validator   | Drives the Lexer, maintains an element stack, applies structural rules, and returns a Report containing all ValidationError items found. |

Each component is specified in its own `Spec.md` and has a `Notes.md` that
records the conversation history used to build it.

---

## Design Principles

1. **Single responsibility** — each component does exactly one thing.
2. **Dependency direction** — the chain is strictly linear:
   `Tokenizer ← Lexer ← Validator ← EntryPoint`.  No component depends on
   anything to its right in this chain.
3. **Non-failing parse** — neither Tokenizer nor Lexer aborts on malformed
   input.  Unrecognised sequences are emitted as opaque tokens so the
   Validator can report every problem rather than stopping at the first one.
4. **Complete reporting** — the Validator collects all errors before
   returning.  It never short-circuits on the first failure.
5. **No reproduction** — EntryPoint's Spec.md describes only the wiring and
   CLI surface; it does not re-state details already captured in library Specs.
6. **Spec-first** — implementation follows the Spec.  When the implementation
   must deviate, update the Spec first.
7. **Fail-safe reads** — a file that cannot be opened or decoded is reported
   as a single read-error and skipped; it never aborts the overall run.

---

## Command-Line Interface (abstract)

| Option            | Meaning                                                  | Default         |
|-------------------|----------------------------------------------------------|-----------------|
| `<path>...`       | One or more HTML files or directories to validate        | *(required)*    |
| `-r, --recursive` | Descend into subdirectories when a path is a directory   | off             |
| `-q, --quiet`     | Print only files that contain errors                     | off             |
| `-s, --summary`   | Print a pass/fail count line after all files are checked | off             |
| `-h, --help`      | Print help and exit                                      | *(off)*         |

---

## Structural Rules

| Rule ID         | Description |
|-----------------|-------------|
| `doctype`       | Document begins with `<!DOCTYPE html>` |
| `root-element`  | Exactly one `<html>` element wraps the entire document |
| `head-required` | `<head>` is present and contains at least one `<title>` |
| `body-required` | `<body>` is present as a direct child of `<html>` |
| `tag-nesting`   | Every open tag has a matching close tag in the correct stack order |
| `void-elements` | Void elements (`br`, `hr`, `img`, `input`, `link`, `meta`, …) carry no close tag |
| `attr-quotes`   | All attribute values are enclosed in single or double quotes |
| `duplicate-id`  | The `id` attribute value is unique within the document |

Additional rules may be added in Validator's Spec.md without amending this
document, provided they do not conflict with the principles above.

---

## Invariants

1. Running with no arguments displays help and exits cleanly.
2. A file that cannot be read is reported with a single `read-error` entry and
   does not cause the program to exit with failure on its own — only structural
   errors count toward the exit status.
3. Build output and tooling directories are always excluded from recursive
   traversal: `bin`, `obj` (C#), `target` (Rust), `build`, `out` (C++),
   `__pycache__`, `.venv`, `venv`, `dist` (Python),
   `.git`, `.vs`, `.idea` (VCS/IDE).
4. File extension filtering is fixed to `.html` and `.htm`; no other files are
   examined.

---

## Versioning

1.0.0

---

*End of Constitution.md*
