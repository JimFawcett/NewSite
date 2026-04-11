# /sdd:init

You are helping the developer initialize Spec-Driven Development for this project.

## Your job

Analyze this codebase thoroughly, then draft a filled-in `.sdd/constitution.md` based on what you find.

## Steps

1. **Explore the project structure.** List all files and folders. Identify the language, build system, naming conventions, folder layout, and any existing patterns.

2. **Read key source files.** Look at enough code to understand:
   - Naming conventions actually in use (classes, functions, files, variables)
   - Error handling approach
   - Memory management style
   - How headers and source files are organized
   - Any existing tests or documentation

3. **Read the template.** Open `/NewSite/sdd/templates/constitution.template.md` and use it as your structure.

4. **Draft the constitution.** Write `.sdd/constitution.md` filling in every section based on what you observed. Where the project is new or sparse, make reasonable decisions consistent with modern C++ best practices and note them with `<!-- decided: reason -->`.

5. **Report back.** After writing the file, summarize:
   - What you found and inferred
   - Any sections you had to decide rather than observe
   - Any open questions for the developer to resolve

## Rules
- Do not invent features or behaviors that don't exist yet
- Do not modify any source files
- Only create `.sdd/constitution.md`
- If the project is new/empty, draft a constitution suited to a C++ command-line text search tool
