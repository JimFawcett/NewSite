# Context Prune

## Prompt

How can one prune irrelevant history from the Claude Code context

## Response

Given your work with CLAUDE.md hierarchies, here's the current toolkit for pruning irrelevant history in Claude Code:

**Core commands**
- **`/clear`** — hard reset, wipes the conversation entirely, no summary. Best when switching to genuinely unrelated work (e.g., jumping from your Rust tutorial repo to a website CSS fix). CLAUDE.md files still reload automatically after this.
- **`/compact`** — replaces conversation history with a structured summary rather than deleting it. You can steer it: `/compact focus on the auth bug fix` keeps what you choose instead of what the automatic pass guesses matters. Best used proactively (before context gets crowded) rather than waiting for auto-compact, since Claude summarizes better with full recall and more headroom.
- **`/context`** — shows a live breakdown of what's actually consuming your context window (CLAUDE.md size, memory, MCP tool schemas, skills, conversation), with optimization suggestions. This is the first thing to run when a session feels sluggish, since sometimes it's not conversation history but bloated CLAUDE.md or too many MCP servers.

**What survives `/compact`** (relevant since you use path-scoped rules and nested CLAUDE.md):
- Project-root CLAUDE.md and unscoped rules: reloaded from disk
- Auto memory: reloaded from disk
- Rules with `paths:` frontmatter: **lost** until a matching file is read again — if you need one to persist, drop the `paths:` frontmatter or move it to root CLAUDE.md
- Nested CLAUDE.md in subdirectories (like your `Learn/` subfolder setup): **lost** until a file in that subdirectory is touched again
- Invoked skill bodies: reloaded but capped at 5,000 tokens/skill and 25,000 total, oldest dropped first — put critical instructions near the top of SKILL.md

**Other levers**
- **Subagents** keep large file reads out of your main context entirely — only the final summary comes back. Useful if you're doing broad exploration across your NewSite repo before deciding what to actually change.
- **`/rewind`** — undoes recent turns without accumulating corrective back-and-forth in history, better than piling on "no, actually do X instead" messages.

For your SDD workflow specifically, since you're already structuring `sdd_plan`/`sdd_implement` as discrete phases, `/compact` with a focused prompt between phases (or `/clear` between features) probably fits your existing `/clear` → load context → work pattern well.

---
*Source: [Claude Code — Explore the context window](https://code.claude.com/docs/en/context-window)*
