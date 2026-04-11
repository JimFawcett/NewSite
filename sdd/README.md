# Spec-Driven Development (SDD)
Custom infrastructure for guiding Claude Code through structured feature development.

---

## Folder Layout

```
/NewSite/sdd/                        ← shared, not in any repo
  templates/
    constitution.template.md
    spec.template.md
    plan.template.md
    tasks.template.md
  sdd-init.ps1                       ← bootstrap a new or existing project

<project-root>/                      ← per-repo, committed to git
  .sdd/
    constitution.md                  ← filled in once per project
    features/
      <feature-name>/
        spec.md
        plan.md
        tasks.md
  .claude/
    commands/
      sdd:init.md
      sdd:feature.md
      sdd:plan.md
      sdd:implement.md
```

---

## Workflow

### Setting up a new or existing project

```powershell
# From anywhere in PowerShell:
/NewSite/sdd/sdd-init.ps1 -ProjectPath "C:\path\to\project"
```

Then open VS Code in the project and run:
```
/sdd:init
```
Claude Code will analyze the codebase and draft `.sdd/constitution.md`.  
Review it. Edit anything that doesn't match your intent. **This file governs everything else.**

---

### Starting a new feature

```
/sdd:feature search-by-regex
```
Claude drafts `.sdd/features/search-by-regex/spec.md`.  
Review it. Fill in any `<!-- to fill in -->` gaps. Mark status as **Approved** when ready.

---

### Planning the feature

```
/sdd:plan search-by-regex
```
Claude reads the approved spec and drafts `plan.md` and `tasks.md`.  
Review both. Mark plan.md status as **Approved** when ready.

---

### Implementing the feature

```
/clear
/sdd:implement search-by-regex
```
Claude loads constitution → spec → plan → tasks and works through the checklist top to bottom.  
It marks tasks `[x]` as it goes and stops at each checkpoint to verify the build.

---

## Slash Command Reference

| Command | What it does |
|---------|-------------|
| `/sdd:init` | Analyzes the repo, drafts `constitution.md` |
| `/sdd:feature <name>` | Creates feature folder, drafts `spec.md` |
| `/sdd:plan <name>` | Drafts `plan.md` and `tasks.md` from approved spec |
| `/sdd:implement <name>` | Implements feature by working through `tasks.md` |

---

## Key Principles

- **The constitution is law.** Every spec, plan, and implementation decision must be consistent with it.
- **Spec before plan. Plan before code.** Claude Code never writes source code until the spec is Approved.
- **Checkpoints are blockers.** A broken build between phases is not a warning — Claude stops and fixes it.
- **Stay in scope.** Out-of-scope ideas go in `spec.md` under Future Considerations, never into the implementation.
- **Small ceremony, real structure.** Each feature is three files. The overhead is intentionally low.

---

## Adding SDD to Another Project

```powershell
/NewSite/sdd/sdd-init.ps1 -ProjectPath "C:\path\to\other-project"
```

The script copies the constitution template and all four slash commands into the target project.  
Run `/sdd:init` in Claude Code to generate that project's constitution from its existing code.
