# Constitution

Rules for `Spec_driven_TextFinder/` and its children. Override defaults on conflict.

## Two Rules

1. **Spec-driven code.** All code creation and modification in this project must derive from `Spec*.md` and `*Structure.md` files (case-insensitive) in this directory or any subdirectory. To change code, change the spec or structure first. Do not copy, pattern-match, or draw from example code, sample implementations, or other projects. General language knowledge — idioms, standard libraries, toolchains — is fine; example code is not.

2. **Stay inside.** Do not modify any file outside `Spec_driven_TextFinder/` without an explicit user request naming the file. Reading outside is permitted only for: standard toolchains, project `CLAUDE.md`, auto-memory, and git status/history. Other outside reads require explicit permission, which lasts the session.

## Notes

- No code lives in this top directory; all code is in child directories.
- `Prompts_*.md` files document the design process; they are not inputs to code.
- If a `Spec*.md` or `*Structure.md` is ambiguous, ask — do not fill gaps from external sources.
- If outside material is read in error, discard that context (do not use it to inform code or decisions) and disclose. The source files themselves are untouched.
