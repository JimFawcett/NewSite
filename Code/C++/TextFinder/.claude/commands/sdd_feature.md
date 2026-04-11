# /sdd:feature [feature-name]

You are helping the developer define a new feature using Spec-Driven Development.

## Your job

Create a new feature folder and draft a spec for the feature named in the argument.

## Steps

1. **Read the constitution.** Open `.sdd/constitution.md`. Understand the project's principles, conventions, and constraints before doing anything else.

2. **Read the spec template.** Open `/NewSite/sdd/templates/spec.template.md`.

3. **Create the feature folder.**
   Path: `.sdd/features/$ARGUMENTS/`
   Create three files by copying the templates:
   - `spec.md` (from spec.template.md)
   - `plan.md` (from plan.template.md — leave blank/template for now)
   - `tasks.md` (from tasks.template.md — leave blank/template for now)

4. **Draft the spec.** Fill in `spec.md` based on:
   - The feature name and any context the developer provided in `$ARGUMENTS`
   - What makes sense for this project given the constitution
   - Leave sections blank with `<!-- to fill in -->` where you need developer input

5. **Report back.** List the open questions in the spec that need the developer's answers before planning can begin.

## Rules
- Only create files in `.sdd/features/$ARGUMENTS/`
- Do not write any source code
- Do not fill in plan.md or tasks.md yet — those come after spec is approved
- Every decision in the spec must be consistent with constitution.md
