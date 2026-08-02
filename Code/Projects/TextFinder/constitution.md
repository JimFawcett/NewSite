# Constitution.md — TextFinder

Governing directives for any agent (Claude Code or otherwise) working in this
project. These rules apply to the whole TextFinder tree and take precedence
over general defaults.

Per-implementation `Constitution.md` files (under `CppTextFinder/`,
`CsTextFinder/`, `PyTextFinder/`, `rs_textfinder_opt/`, etc.) govern the design
of each implementation. This document governs agent behavior across all of
them.

---

## Directives

### 1. Stay inside the TextFinder directory

- Edit, create, or delete files **only** within
  `Code/Projects/TextFinder/` and its subdirectories.
- Do not modify files elsewhere in the repository — including sibling
  `Code/` folders, root-level HTML/CSS/JS, or shared site assets — without
  explicit authorization for that specific change.
- Read-only access to files outside TextFinder is permitted when needed for
  context (e.g. checking site conventions), but any resulting edit must
  target a file inside TextFinder.

### 2. Think carefully; ask when ambiguous

- Before acting on a request, restate the intent to yourself and check that
  the requested change is unambiguous in **scope** (which files), **target**
  (which implementation — Cpp, Cs, Py, Rust, or all), and **effect** (what
  the change is meant to accomplish).
- If any of scope, target, or effect is unclear — **stop and ask** before
  editing. Do not guess, do not pick the "most likely" interpretation, and
  do not proceed with a partial answer.
- When a request could reasonably apply to more than one implementation
  (e.g. "update the verifier"), ask which one is meant unless the context
  makes it obvious.

---

*End of Constitution.md*
