# Notes.md — CppTextFinder

*Top-level record of prompts and responses for the project as a whole.
Component-specific conversations belong in each part's own Notes.md.*

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

### 2026-04-16 — Initial project prompt

**Prompt**
I want to build a spec driven infrastracture tuned to small projects. Each project
is likely to have a few parts, constructed as libraries.  I want each part to have
its own folder as siblings to the entry point folder. Each library and the entry
point folder will have a Spec.md file.  The entry point Spec.md should not reproduce
content of its parts. I also want a Constitution.md and Structure.md in the project
folder which contains all the other folders. I also want a Notes.md in each of the
folders that captures the prompts and responses for that part.  This project is a
TextFinder with EntryPoint, CommandLine, DirNav, and Output code files. The Spec,
and Constitution should be programming language agnostic.  The Structure part
contains information that depends on the language, e.g., use cargo or CMake. Please
build the files with comments where input is needed from me.
I want the user to see program output during its execution based on the /H argument.
I want a black list of directories that DirNav should not enter including target,
build, .git, also a public method to add another directory.  That should work for
multiple calls.

**Response summary**
Created the full spec infrastructure: `Constitution.md`, `Structure.md`, and
per-part `Spec.md` + `Notes.md` files for EntryPoint, CommandLine, DirNav, and
Output.  All design-decision gaps were marked with `<!-- INPUT NEEDED -->` comments.

**Decisions / follow-up**
- Language-agnostic: Constitution.md and per-part Spec.md files
- Language-specific: Structure.md (C++23, CMake 3.28, named modules, `.ixx`)
- DirNav skip list seeded with `target`, `build`, `.git`; public `add_skip()` method
- `/H` flag: `true` = clean output (dir printed only on first match); `false` = real-time (dir printed on entry)

---

### 2026-04-16 — Code generation workflow

**Prompt**
What is the work flow needed to use this infrastructure to generate all the
project code — don't execute, just tell me.

**Response**

1. **Resolve all INPUT NEEDED items first.**  Read Constitution.md, Structure.md,
   and each Spec.md and answer every `<!-- INPUT NEEDED -->` comment.  Those are
   decision points that affect generated code (summary line format, regex
   library choice, extension case sensitivity, etc.).  Fill them in or delete
   them before generating anything.

2. **Generate the three libraries in dependency order.**  Because EntryPoint
   depends on all three libraries but the libraries are independent of each
   other, build them first — in any order.  For each one (CommandLine, then
   DirNav, then Output):
   - *Prompt 1 — module file*: Attach Constitution.md, Structure.md, and the
     component's Spec.md.  Ask Claude to implement `<Name>.ixx` exactly as
     specified.
   - *Prompt 2 — test file*: Using the same context plus the just-generated
     `.ixx`, ask Claude to implement `test.cpp` with hand-written tests covering
     the cases in the Spec.
   - *Prompt 3 — CMakeLists*: Attach Structure.md's per-library sketch and ask
     Claude to produce the component's `CMakeLists.txt` for the specific target
     name.
   - *Record*: Paste each prompt and a response summary into the component's
     `Notes.md`.

3. **Generate EntryPoint last.**
   - *Prompt 1 — main.cpp*: Attach Constitution.md, Structure.md,
     EntryPoint/Spec.md, and all three `.ixx` files as context.  Ask Claude to
     implement `main.cpp` using the lambda-wiring flow in the spec.
   - *Prompt 2 — test.cpp*: Attach the same context and ask for
     integration-level tests for the wiring (verify callbacks fire, verify help
     exits 0).
   - *Prompt 3 — CMakeLists*: Attach Structure.md's EntryPoint sketch and ask
     Claude to produce `EntryPoint/CMakeLists.txt`.
   - *Record* in `EntryPoint/Notes.md`.

4. **Generate the top-level CMakeLists.txt.**  Attach Structure.md only.  Ask
   Claude to produce the top-level `CMakeLists.txt` matching the sketch exactly
   (C++23, `enable_testing()`, four `add_subdirectory` calls in the right
   order).

5. **Build incrementally to catch spec gaps.**
   ```
   cmake -S . -B build
   cmake --build build
   ctest --test-dir build --output-on-failure
   ```
   Compile errors or test failures usually mean the spec was ambiguous or
   contradictory.  Fix the spec first, record the correction in the relevant
   `Notes.md`, then re-prompt for just the affected file — do not silently patch
   the code.

6. **Update specs for any deviations found during build.**  If the
   implementation had to deviate from a spec to compile or pass tests, update
   the Spec.md to match reality, note why in Notes.md, and keep spec and code
   in sync.

**Key discipline**: always supply the Spec.md as the primary prompt context —
not the previously generated code.  The spec is the source of truth; the code
is derived from it.

**Decisions / follow-up**
- All INPUT NEEDED items must be resolved before starting step 2.
- Order within step 2 (CommandLine / DirNav / Output) is flexible; they have
  no inter-dependencies.
- EntryPoint must be last.

---

### 2026-04-17 — TextFinder cleanup

1. **Search for codesmells and fix**<br>  Fixed in all code files

2. **Search for non-idiomatic code and fix**<br>  Fixed in all code files

---

### 2026-04-17 - New Project Infrastructure

1. **Created and saved (NewSite/Code/_template_[language])**
    
    a. Constitution.md

    b. Structure.md
    
    c. Notes.md
    
    d. README.md
    
    e. new_project.py

*End of Notes.md*
