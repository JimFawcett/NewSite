# Notes.md — TextFinder

*Top-level record of prompts and AI conversations covering the TextFinder project as a
whole — architecture decisions, cross-language comparisons, and project-wide changes.
Language-specific conversations belong in each variant's own Notes.md.*

---

## Entry template

```
### YYYY-MM-DD — <short topic>

**Prompt**
<paste the prompt you sent>

**Response summary**
<paste or summarise the response>

**Decisions / follow-up**
<note any decisions made or items deferred>
```

---

## 2026-04-30 — initial project structure and constitution

**Prompt**
Create a multi-language TextFinder project that searches directory trees for files whose
content matches a regular expression. Implement it in Rust, C++23, C#, and Python with a
shared command-line interface and a three-component architecture (CommandLine, DirNav,
Output) wired by an EntryPoint. Use Constitution.md and Structure.md to drive spec-first
development in each language variant.

**Response summary**
Claude Code generated the initial Constitution.md, Structure.md, and per-component Spec.md
files for each language variant, then implemented all four variants. A fifth variant
(rs_textfinder_opt) was added to investigate Rust-specific performance optimisations.
The shared CLI accepted `/P`, `/p`, `/r`, `/s`, `/H`, `/v`, `/h` flags with both `/` and
`-` prefixes.

**Decisions / follow-up**
- All five variants share the same CLI and architecture so results are directly comparable.
- rs_textfinder_opt added after timing showed RustTextFinder slower than expected; three
  optimisation steps investigated — only switching `Path::is_dir()` to
  `DirEntry::file_type()` produced a measurable gain (~33% reduction in median elapsed).
- Performance measurements documented in README.md with analysis of why Python leads
  despite being interpreted (I/O-bound workload, C-extension hot path, DFA regex engine).

---

## 2026-04-30 — code quality review and test pass

**Prompt**
Check all five TextFinder variants for code smells and non-idiomatic usage, fix any issues
found, then build and run unit and integration tests.

**Response summary**
1. Checked code smells and fixed across all variants.
2. Checked for non-idiomatic code and fixed across all variants.
3. Built and ran unit and integration tests — all pass.

**Decisions / follow-up**
No deferred items.

---

*End of Notes.md*
