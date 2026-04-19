# Constitution.md — {{PROJECT_NAME}}

*Language-agnostic governing document for the {{PROJECT_NAME}} project.*

---

## Purpose

<!-- INPUT NEEDED: Describe what {{PROJECT_NAME}} does in 2-4 sentences.
     Focus on the user-visible behaviour, not the implementation. -->

---

## Scope

The project is intentionally small.  Every component fits in a single source
file.  No component should grow beyond the responsibility described in its own
Spec.md.

---

## Components

| Component   | Responsibility |
|-------------|----------------|
| EntryPoint  | Parses the command line, wires the other components together, and drives execution. |
| Part1       | <!-- INPUT NEEDED: Describe Part1's single responsibility in one sentence. --> |

Each component is specified in its own `Spec.md` and has a `Notes.md` that
records the conversation history used to build it.

<!-- INPUT NEEDED: Add or remove rows to match your actual components.
     Rename Part1 to reflect its real responsibility. -->

---

## Design Principles

1. **Single responsibility** — each component does exactly one thing.
2. **Dependency direction** — EntryPoint depends on all libraries; libraries do
   not depend on each other or on EntryPoint.
3. **Caller-defined interfaces** — when one component needs a service from
   another, the *caller* expresses that need as a callback or interface.
   Libraries never import each other.
4. **No reproduction** — EntryPoint's Spec.md describes only the wiring and
   flow; it does not re-state the details already captured in library Specs.
5. **Spec-first** — implementation follows the Spec.  When the implementation
   must deviate, update the Spec first.
6. **Fail-safe** — errors at the boundary (bad input, missing file) are
   reported gracefully; they never cause unhandled crashes.

<!-- INPUT NEEDED: Add, remove, or reword any principles that do not match your
     preferred style, e.g. error-reporting philosophy, logging policy. -->

---

## Command-Line Interface (abstract)

<!-- INPUT NEEDED: List the command-line options your tool will accept. -->

| Option | Meaning | Default |
|--------|---------|---------|
| `-h`   | Print help and exit | off |
| `-v`   | Verbose output | off |

---

## Invariants

1. Running with no arguments displays help and exits cleanly.
2. A missing or invalid required argument is reported and the program exits
   with a non-zero status.

<!-- INPUT NEEDED: Add any other invariants specific to your project. -->

---

## Versioning

<!-- INPUT NEEDED: Provide an initial version string, e.g. "1.0.0". -->

---

*End of Constitution.md*
