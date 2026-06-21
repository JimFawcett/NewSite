# Claude Code Context Levels

**User (Global)** - `~/.claude/CLAUDE.md`
Loaded once at startup, applies to every project. Holds response style, code conventions, and git rules that should be consistent everywhere.

**Project** - `<repo-root>/CLAUDE.md`
Loaded when Claude Code opens a git repo. Covers architecture, tech stack, key conventions, and entry points specific to that codebase. Applies to all files unless overridden by a subfolder.

**Folder** - `<subdirectory>/CLAUDE.md`
Loaded when work enters that directory. Narrows or overrides the project-level instructions for just that subtree - useful when a subproject (e.g., `Code/AI/`) has its own conventions.

**File** - active file contents or IDE selection
Read per-request. The most specific context; drives the actual task at hand.

**Precedence:** file > folder > project > user. More specific always wins.

**Memory** (`~/.claude/projects/<project-slug>/memory/`) is separate from CLAUDE.md - it persists facts learned across conversations (e.g., the CSS stylesheet-order lesson in your project). `settings.json` is separate still - it configures harness behavior (permissions, plugins), not instruction context.

---

## What Claude Code Writes and Where

**Locally written, nothing synced remotely:**

| File | Who writes it | Where |
|------|--------------|-------|
| `settings.json` | User/harness | `~/.claude/` or `.claude/` |
| `CLAUDE.md` | You | `~/.claude/`, repo root, or subdirs |
| `CLAUDE.local.md` | You | Project root (gitignored, personal) |
| `MEMORY.md` | **Claude** | `~/.claude/projects/<slug>/memory/` |
| `.claude.json` | Harness | `~/` (OAuth, MCP configs, caches) |

MEMORY.md is written by Claude during sessions as it learns preferences, not by the harness. Only the first ~200 lines load at session start; Claude creates additional topic files in the same folder as needed.

**All context management is local.** Your prompt and code are sent to Anthropic servers for inference, but settings, memory, and CLAUDE.md never leave your machine.

---

## Optional .md Files You Might Supply

Only **CLAUDE.md is formally recognized** - loaded automatically at startup. Everything else is manual convention:

- **`CLAUDE.md`** - the one file Claude Code actually reads at startup; put build commands, architecture notes, conventions here
- **`CLAUDE.local.md`** - project-local personal notes (gitignored); for things you don't want committed
- **`@AGENTS.md`** - if your repo already has an AGENTS.md (for other AI tools), reference it inside CLAUDE.md with `@AGENTS.md` so both tools share the same instructions
- **`Constitution.md`** - a user convention (not recognized by Claude Code) for capturing values, constraints, or principles; you'd ask Claude to read it explicitly
- **`Spec.md`, `CONVENTIONS.md`, `Notes.md`** - same: plain docs Claude won't load automatically but can read on request

The practical pattern: put anything you want Claude to *always know* in CLAUDE.md. Put reference material Claude should read *on demand* in separate files and ask it to read them when relevant.

---

## What Content Belongs in Each CLAUDE.md Level

The three CLAUDE.md levels map directly to content scope:

- **User `~/.claude/CLAUDE.md`** - universal content: response style, code conventions, git rules that apply everywhere regardless of project
- **Project `<repo-root>/CLAUDE.md`** - project content: architecture, tech stack, build commands, entry points, conventions specific to that repo
- **Folder `<subdir>/CLAUDE.md`** - folder content: overrides or additions for a subtree with distinct conventions (e.g., a Python agent subdirectory with different run commands or style rules than the rest of the repo)

The "always know" guidance applies at whichever level the knowledge belongs. Universal knowledge goes in user CLAUDE.md; repo-specific in project CLAUDE.md; subtree-specific in folder CLAUDE.md.

---

## Context - What Claude Sees and How You Control It

Claude accesses your full project directory, git state, terminal environment, and CLAUDE.md instructions. Control it with:

- **`@filename`** - mention a file to add it to context
- **`/add-dir`** - give Claude permanent access to additional directories
- **IDE selection** - highlight code and Claude reads it
- **CLAUDE.md** - persistent instructions load at every session start (first 25KB / 200 lines)
- **Auto memory** - Claude saves learnings to `~/.claude/projects/.../MEMORY.md`, loaded each session
- **`/context`** - shows what's consuming context window space
- **`/compact`** - summarizes conversation to free context when it fills

Use plan mode (`Shift+Tab`) for read-only context gathering before edits.

---

## Model - Select and Switch Models

**Switch models:**
- During session: `/model` (picker) or `/model <name>` (direct)
- At startup: `claude --model opus`
- Environment variable: `ANTHROPIC_MODEL=opus`
- Settings: `"model": "opus"` in `~/.claude/settings.json`

**Available aliases** (resolve to latest versions):
- `sonnet`, `opus`, `haiku` - latest stable releases
- `opus[1m]`, `sonnet[1m]` - 1M token context windows
- Default varies by plan (Opus on Max/Team/Enterprise, Sonnet on Pro)

**Effort levels** control reasoning depth; set with `/effort` or env var `CLAUDE_CODE_EFFORT_LEVEL`. Levels: `low`, `medium`, `high` (default), `xhigh`, `max`.

---

## Customize - Hooks, Settings, Keybindings, and Themes

**Settings files** (hierarchical priority, lowest to highest):
1. User global: `~/.claude/settings.json`
2. Team/project: `.claude/settings.json` (committed)
3. Local project: `.claude/settings.local.json` (gitignored)
4. Managed/MDM policies (enforced by IT)

**Key customizations:**
- `/config` - interactive UI for settings
- `/keybindings` - edit `~/.claude/keybindings.json` to rebind keys
- `/theme` - pick light/dark or create custom CSS overrides
- `/memory` - refine CLAUDE.md instructions
- `hooks` in settings - lifecycle scripts (pre/post command, on error, on complete)
- `permissions` - allow/ask/deny lists for tools and commands

---

## Slash Commands - Built-in and Custom

**Essential built-ins:**

| Command | Purpose |
|---------|---------|
| `/init` | Generate starter CLAUDE.md |
| `/model` | Switch models or open picker |
| `/memory` | Refine CLAUDE.md |
| `/context` | Show context window usage |
| `/compact` | Summarize conversation to free context |
| `/clear` | Start fresh session |
| `/resume` | Open session picker |
| `/permissions` | Adjust approval rules |
| `/mcp` | Configure MCP servers |
| `/doctor` | Diagnose issues |
| `/btw` | Quick side question without bloating history |

**Custom commands** come from:
- Skills - reusable workflows in `.claude/skills/` (markdown with frontmatter)
- MCP servers - remote tools connected via `.mcp.json`
- Plugins installed via `/plugins`

Type `/` to see the full filtered list.

---

## Settings - Configuration System

**File structure:**
```json
{
  "permissions": {
    "allow": ["Bash(npm run *)", "Read(./src/**)"],
    "ask":   ["Bash(git push)"],
    "deny":  ["Bash(rm -rf *)", "Read(./.env)"]
  },
  "env":   { "NODE_ENV": "development" },
  "model": "opus",
  "hooks": {
    "onPreCommand": "echo 'Starting...'",
    "onComplete":   "echo 'Done'"
  },
  "autoMemoryEnabled": true,
  "editorMode": "vim"
}
```

**Scope precedence** (highest to lowest): managed policies > CLI flags > local project > team/project > user global.

Permissions **merge** across scopes rather than override - managed policies can tighten but not loosen lower-level rules. Use glob patterns for specificity: `Bash(curl *)`, `Read(~/.env)`.

**When changes apply:** `permissions`, `hooks`, `env`, and `theme` reload immediately; `model` and `outputStyle` require restart.

---

## Phrases to Steer Claude's Output

### Reasoning Depth
- "Think carefully before answering"
- "Think step by step" / "Work through this methodically"
- "Reason through this out loud"
- "Consider all angles before responding"
- "Break this down"
- "Show your reasoning"

### Confidence and Speculation
- "Do not speculate - return only what you know"
- "If you're uncertain, say so explicitly"
- "Flag any assumptions you're making"
- "Only include information you're confident about"
- "If you don't know, say 'I don't know' rather than guessing"
- "Return facts, not opinions"
- "Do not infer - report only what is stated"

### Scope and Completeness
- "Be exhaustive" / "Cover all cases"
- "Answer only the question asked - nothing more"
- "Do not go beyond the scope of the request"
- "Focus only on X"
- "Do not omit edge cases"
- "Include everything relevant, leave out everything that isn't"

### Format and Length
- "Be concise" / "Be brief" / "In one sentence"
- "Use bullet points" / "Use a table" / "Use numbered steps"
- "Keep it under N words"
- "No preamble - start with the answer"
- "No trailing summary"
- "Plain prose, no markdown"
- "Use headers to organize"
- "Return only the code, no explanation"

### Directness and Hedging
- "Give a single recommendation, not options"
- "No caveats unless they materially change the answer"
- "No disclaimers"
- "Don't hedge - commit to an answer"
- "Be direct"
- "Skip the pleasantries"

### Tone and Audience
- "Write for an expert audience" / "Write for a beginner"
- "Use active voice"
- "Be formal" / "Be conversational"
- "No jargon" / "Use technical terminology"
- "Write in my voice" (after showing examples)

### Role and Perspective
- "Act as a senior software engineer"
- "You are an expert in X"
- "From the perspective of a security auditor..."
- "As a skeptic, identify weaknesses in..."

### Verification
- "Double-check your answer before responding"
- "Check for edge cases"
- "Verify correctness"
- "Review for logical consistency"
- "Are there any counterexamples?"

### Constraint on Approach
- "Without using X"
- "Using only standard library"
- "In fewer than N steps"
- "Without modifying Y"
- "Preserve existing behavior"

### Reconsideration
- "Reconsider" / "Think again"
- "Are you sure?" (prompts self-review)
- "What might be wrong with that answer?"
- "What did you miss?"
- "Play devil's advocate"

### Output Structure
- "Return a JSON object with fields X, Y, Z"
- "Use this template: ..."
- "Follow this format exactly: ..."
- "Match the style of the example below"

**Key insight:** specificity beats vagueness. "Return only the function signature, no body, no explanation" outperforms "be brief." Combining a scope phrase with a format phrase gives the tightest control: *"List only what you know for certain, one bullet per item, no elaboration."*
