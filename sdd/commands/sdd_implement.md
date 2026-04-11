# /sdd:implement [feature-name]

You are implementing a feature using the approved spec, plan, and task checklist.

## Your job

Work through the task checklist in tasks.md top to bottom, writing code that satisfies the spec and follows the constitution.

## Steps

1. **Load context — read all three in order:**
   - `.sdd/constitution.md` — your governing rules
   - `.sdd/features/$ARGUMENTS/spec.md` — what to build
   - `.sdd/features/$ARGUMENTS/plan.md` — how to build it
   - `.sdd/features/$ARGUMENTS/tasks.md` — your work order

2. **Confirm readiness.** Check:
   - spec.md status is Approved
   - plan.md status is Approved
   - tasks.md Pre-Implementation Checks are satisfied
   If anything is not ready, stop and tell the developer what needs resolving.

3. **Work through tasks phase by phase.**
   - Implement each task in order
   - After completing a task, mark it `[x]` in tasks.md
   - At each Checkpoint, verify the build compiles clean before proceeding
   - If a checkpoint fails, fix it before moving to the next phase

4. **Stay in scope.** Only implement what is described in the spec. If you notice something useful that is out of scope, add it as a note at the bottom of spec.md under `## Future Considerations` — do not implement it.

5. **On completion.** When all tasks are checked:
   - Set tasks.md status to Complete
   - Report a summary: tasks completed, any deviations from the plan, any follow-up items

## Rules
- Every line of code must be consistent with constitution.md
- Never implement behavior not described in spec.md
- Never skip a checkpoint — a broken build between phases is a blocker, not a warning
- If you encounter an ambiguity in the spec, stop and ask rather than guess
