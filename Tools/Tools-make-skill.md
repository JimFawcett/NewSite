# Tools-make-skill.md
**2026-07-19 08:19**

## Prompt

We've built several md files, e.g., analysis.md, pytools.md, etc. Does it make sense to convert these to skills and what are the pros and cons?

## Response

Having read all three, the honest answer is: mostly no, with one exception.

**Skills are for repeatable workflows you invoke with `/skill-name`.** These files fall into two different categories:

**`analysis.md` and `codeorg.md`** - one-time task briefs, not skills. They're scoped to specific targets (`rs_textfinder/`, `NewSite/Code/`) at a point in time. Converting them would let you type `/analysis` but the content would go stale immediately. These are better kept as reference files or discarded once the task is done.

**`pytools.md`** - the strongest candidate. It describes reusable conventions (no hardcoded paths, stdlib only, print to stdout, etc.) that apply any time you're writing a Python tool in this project. But even here, a skill is probably overkill - this content belongs in `CLAUDE.md` under a "Python Tools" section, where it's automatically in context without you having to invoke anything.

**When skills do make sense:**
- Multi-step workflows you repeat often (`/analyze-page`, `/add-content-page`)
- Tasks with a clear trigger and defined output format
- Work that spans multiple files with a predictable pattern

**Pros of converting:**
- Explicit `/command` invocation - clear intent
- Can include agent instructions, not just context

**Cons:**
- Adds to skills list clutter
- Context docs (what to do) aren't the same as workflow scripts (how to do it)
- `CLAUDE.md` or memory handles the "always apply this context" case better

**Recommendation:** move `pytools.md` content into `CLAUDE.md` under a Python tools section, and leave the analysis files as-is or delete them when the tasks are complete.

---

## Prompt

How do you convert an md file to a Claude skill? Don't do any conversions, just tell me how.

## Response

There are two levels, depending on what you mean by "skill":

**Simple slash command** (the common case):
1. Create `.claude/commands/` in your project root (or `~\.claude\commands\` for user-level)
2. Drop a `.md` file there - the filename becomes the command name
3. The file's markdown content becomes the prompt Claude runs when you type `/filename`

**Full skill** (with auto-triggering and reference docs):
1. Create a directory under `.claude/plugins/<plugin-name>/skills/<skill-name>/`
2. Add a `SKILL.md` with frontmatter that declares a `description` and optional `triggers` - Claude loads it automatically when the context matches
3. Optionally add a `references/` subfolder with supporting docs the skill can draw on

The key difference: slash commands are manually invoked; skills with trigger conditions are loaded automatically when Claude detects a matching context (e.g., the `claude-api` skill triggers when it sees `import anthropic`).

For the `analysis.md` / `pytools.md` use case, a slash command in `.claude/commands/` is almost certainly sufficient.

---

## Prompt

Based on my workflows over the last several months, create a list of useful custom skills.

## Response

Your `plans.md` already maps this out clearly. Here's the list organized by how repeatable and well-defined each workflow is:

**High value - repeatable with clear inputs/outputs:**

| Skill | Purpose | Already have |
|---|---|---|
| `/pytools` | Build a Python CLI tool with project conventions | `pytools.md` |
| `/analyze` | Trace data flow, find failure points, cite file:line | `analysis.md` |
| `/codeorg` | Survey directory/file organization, flag issues | `codeorg.md` |
| `/spec` | Spec-driven implementation from a spec.md | planned |
| `/testspec` | Generate tests from a test spec | planned |
| `/refactor` | Focused refactor with scope constraints | planned |
| `/vuln` | Security/vulnerability scan, cite file:line | planned |
| `/depend` | Dependency analysis across a codebase | planned |

**Moderate value - more situational:**

| Skill | Purpose |
|---|---|
| `/add-page` | Add a new HTML content page following site conventions (you do this constantly per git log) |
| `/pub` | Pre-publish checklist: readme, git review, push |
| `/managetext` | Text editing pass: active voice, clarity, audience fit |
| `/review` | Review Claude's own changes before commit |

**Lower value - too variable to template well:**
- Error triage (compiler errors vary too much)
- Link fixing (one-off)

The git log shows `/add-page` would likely be your highest-use skill - you've added dozens of content pages and the conventions are stable enough to template.
