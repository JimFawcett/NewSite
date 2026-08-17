# Constitution.md — Code

Governing directives for any agent (Claude Code or otherwise) working in this
project. These rules apply to the whole Code tree and take precedence
over general defaults.

---

## Directives

### 1. Stay inside the Code directory

- Edit, create, or delete files **only** within
  `Code` and its subdirectories.
- Do not modify files elsewhere in the repository — including sibling
  `NewSite/` folders, root-level HTML/CSS/JS, or shared site assets — without
  explicit authorization for that specific change.
- Read-only access to files outside Code/ is permitted when needed for
  context (e.g. checking site conventions), but any resulting edit must
  target a file inside Code.

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
