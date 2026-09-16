# Constitution

Rules for `Spec_driven_TextFinder/` and its children. Override defaults on conflict.

## Two Rules

1. **Spec-driven code.** All code creation and modification in this project must derive from `Spec*.md` and `*Structure.md` files (case-insensitive) in this directory or any subdirectory. To change code, change the spec or structure first. Do not copy, pattern-match, or draw from example code, sample implementations, or other projects outside this one. General language knowledge — idioms, standard libraries, toolchains — is fine; outside example code is not.

   **If requested by user prompt, a sibling implementation may serve as an example.** An implementation already in this project sits inside the boundary rule 2 draws, so a later language thread may be written from its own specifications alone, or — where a prompt asks for it — from those specifications with a sibling implementation in view. Both routes satisfy this rule, and the first is the default: absent such a request, the specifications are the only source.

   Two limits hold on the second route. The specifications remain the authority, so where a sibling and a specification disagree the specification wins and the sibling carries the defect. And an ambiguity is still a question to ask rather than a gap to fill from what the sibling did: copying a sibling's answer settles a specification question in code, where the next implementation cannot find it.

2. **Stay inside.** Do not modify any file outside `Spec_driven_TextFinder/` without an explicit user request naming the file. Reading outside is permitted only for: standard toolchains, project `CLAUDE.md`, auto-memory, and git status/history. Other outside reads require explicit permission, which lasts the session. Do not read any `archive` directory or its contents, wherever it sits, inside this directory or outside it, without an explicit user request naming it.

## Notes

- No code lives in this top directory; all code is in child directories.
- `Prompts_*.md` files document the design process; they are not inputs to code.
- If a `Spec*.md` or `*Structure.md` is ambiguous, ask — do not fill gaps from external sources.
- A thread written with a sibling implementation in view says so on its Process page. Which route a thread took is process evidence.
- If outside material is read in error, discard that context (do not use it to inform code or decisions) and disclose. The source files themselves are untouched.
