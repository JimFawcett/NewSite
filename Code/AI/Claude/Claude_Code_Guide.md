# Claude Code Guide 2026: 25 Features

Source: https://www.marktechpost.com/2026/06/14/claude-code-guide-2026-25-features-with-examples-demo/

Claude Code is Anthropic's agentic coding tool operating across terminal, desktop, and IDE
environments. It is a layered agentic system with distinct memory, hooks, skills, and plugin
layers that control what the model can access and execute.

---

## Official Anthropic Features (1-20)

### Architecture

1. **CLAUDE.md** - Repository constitution file anchoring conventions and commands.
2. **Skills** - Domain-specific logic files invoked via `/name` commands.
3. **Subagents** - Specialized isolated instances with separate context windows.
4. **Slash commands** - Typed shortcuts: `/init`, `/compact`, `/review`, `/security-review`.
5. **Hooks** - Deterministic scripts firing at lifecycle points; `PreToolUse` enforces security.
6. **MCP servers** - Model Context Protocol connecting to GitHub, databases, browsers.
7. **Plugins** - Versioned bundles packaging skills, subagents, commands, and hooks together.

### Operation

8. **Checkpoints** - Automatic state snapshots; pressing Escape twice rewinds changes.
9. **Plan mode** - Exploration and proposals without execution.
10. **Permission modes** - Default asks before actions; others trade oversight for speed.
11. **Auto Mode** - Research preview using a Sonnet 4.6 classifier reviewing actions.
12. **Context compaction** - `/compact` condenses sessions while preserving usable context.
13. **Background tasks** - Long commands run asynchronously with polling.

### Integration

14. **Agent SDK** - Programmatic loop access through the `query()` function.
15. **Headless CLI** - `claude -p "query"` one-shot execution for scripting.
16. **GitHub Actions** - CI integration, scheduled jobs, pre-commit hooks.
17. **Output styles** - Response formatting with custom statusLine renderers.
18. **Remote Control** - Mobile/web driving with push notifications.
19. **Away summary** - Context surfacing on session return.
20. **Sandboxing** - OS-level filesystem and network isolation.

---

## Community Techniques (21-23)

21. **Structured context folders** - Task-specific organization improving output relevance.
22. **Dynamic workflows** - Breaking complex tasks into smaller subagent steps.
23. **Modular skill pipelines** - Chaining reusable skills into end-to-end workflows.

---

## Third-Party Extensions (24-25)

24. **External memory layers** - Tools extending recall across long projects.
25. **Resilience techniques** - Resetting and retrying when output quality degrades.

---

## Architecture Summary

Claude Code is best understood as a stack of layers on top of the core model:

| Layer | Purpose |
|-------|---------|
| Memory | CLAUDE.md, Skills, external memory tools |
| Hooks | Lifecycle automation, security enforcement |
| Skills | Reusable domain logic invoked by slash commands |
| Plugins | Versioned bundles of skills + hooks + subagents |
