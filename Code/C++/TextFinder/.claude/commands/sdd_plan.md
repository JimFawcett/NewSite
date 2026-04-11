# /sdd:plan [feature-name]

You are helping the developer move from an approved spec to a concrete implementation plan and task list.

## Your job

Read the approved spec and draft a filled-in plan.md and tasks.md for the named feature.

## Steps

1. **Read the constitution.** Open `.sdd/constitution.md`.

2. **Read the spec.** Open `.sdd/features/$ARGUMENTS/spec.md`.
   - Confirm its status is `Approved`. If it is not, stop and tell the developer.
   - Note all Goals, Key Behaviors, Edge Cases, and Constraints.

3. **Read the plan template.** Open `/NewSite/sdd/templates/plan.template.md`.

4. **Draft plan.md.** Fill in `.sdd/features/$ARGUMENTS/plan.md` with:
   - A concrete approach that satisfies every Goal in the spec
   - Specific file names to create/modify (consistent with constitution folder layout)
   - Class and function names (consistent with constitution naming conventions)
   - Error handling consistent with the constitution
   - A test plan consistent with the constitution's testing approach

5. **Read the tasks template.** Open `/NewSite/sdd/templates/tasks.template.md`.

6. **Draft tasks.md.** Fill in `.sdd/features/$ARGUMENTS/tasks.md` with:
   - Concrete, specific tasks derived from the plan (not vague — name actual files and functions)
   - Tasks ordered so each one builds on the previous
   - Checkpoints after each phase that verify the build is clean

7. **Report back.** Summarize the plan in 3-5 sentences and flag any decisions that deviate from the constitution or any risks noted in the plan.

## Rules
- Do not write any source code
- Every file name and class name in the plan must follow constitution conventions
- If the spec has unresolved Open Questions, stop and ask the developer to resolve them first
- plan.md and tasks.md status should be set to Draft — developer reviews before approving
