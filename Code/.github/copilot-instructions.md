# Copilot / AI Agent Instructions for this Repository

Purpose: give AI coding assistants immediate, actionable context for working here.

- **Big picture:** This repo hosts a static documentation/site (HTML/CSS/JS) and small language demos under language folders (C++, Rust, C#, Python). The AI tooling lives under the `AI/` folder and is a Python-based Software Development Agent used to analyze and improve code.

- **Primary agent entrypoint:** `AI/DemoAgent-Claude2/dev_agent.py` — use this for interactive analysis (`/analyze`, `/improve`, `/readme`) or scripted runs. The agent expects an Anthropic API key and defaults to model `claude-sonnet-4-20250514`.

- **How to run locally (Windows):**
  - Use the launcher scripts: `AI/DemoAgent-Claude2/run_agent.bat` or `AI/DemoAgent-Claude2/run_agent.ps1`.
  - Ensure environment variable `ANTHROPIC_API_KEY` is set (or pass `--api-key`).
  - Install Python deps: `pip install -r AI/DemoAgent-Claude2/requirements.txt` (contains `anthropic>=0.39.0`).

- **Agent behaviors & repo conventions to preserve:**
  - The agent builds a directory tree and excludes `__pycache__`, `node_modules`, `bin`, `obj`. Avoid changing those exclusion rules without updating the agent.
  - File extensions the agent considers: `.py .js .jsx .ts .tsx .java .cpp .c .h .hpp .cs .rs .go .rb .php` (see `get_code_files`). Keep analyses focused to those types.
  - Interactive commands: `/analyze <file>`, `/improve`, `/readme`, `/tree`, `/files`, `/clear`, `/quit`.

- **Static site details (what the agent may modify):**
  - Primary site sources are HTML in the repo root and `Code/` folder; JS under `js/` (e.g., `js/SitePagesForTools.js`, `js/link-nav.js`) and CSS under `css/`.
  - Pages call `buildPages()` and `createSiteNavMenu('goto')` in client scripts; maintain those hooks when changing page generation.
  - Example page: `CodeBites_Useage_Examples.html` (contains examples and site-specific patterns; note intentional spelling `Useage` in filename).

- **Build & tooling hints (discoverable):**
  - .NET solution for tooling: `CodeWebifier/CodeWebifier.sln` — use Visual Studio / `dotnet` tools for that subproject.
  - No centralized build script for the static site; editing HTML/JS/CSS and opening in a browser is the primary workflow.

- **What to change in PRs (and how AI should behave):**
  - Keep edits minimal and localized; when changing agent behavior update `AI/DemoAgent-Claude2/requirements.txt` and `WINDOWS_SETUP.md` accordingly.
  - When modifying site JS/CSS, preserve public-facing functions `buildPages()` and `createSiteNavMenu` to avoid breaking navigation.

- **Files to inspect for context/examples:**
  - [AI/DemoAgent-Claude2/dev_agent.py](AI/DemoAgent-Claude2/dev_agent.py) — main agent logic and CLI
  - [AI/DemoAgent-Claude2/run_agent.bat](AI/DemoAgent-Claude2/run_agent.bat) and [AI/DemoAgent-Claude2/run_agent.ps1](AI/DemoAgent-Claude2/run_agent.ps1) — launchers
  - [AI/DemoAgent-Claude2/requirements.txt](AI/DemoAgent-Claude2/requirements.txt)
  - [CodeBites_Useage_Examples.html](CodeBites_Useage_Examples.html) — example content & site patterns
  - [js/SitePagesForTools.js](js/SitePagesForTools.js) and [js/link-nav.js](js/link-nav.js)
  - [CodeWebifier/CodeWebifier.sln](CodeWebifier/CodeWebifier.sln)

If anything here is unclear or you want the instructions to emphasize different workflows (e.g., other agent variants, CI steps, or preferred commit conventions), tell me which areas to expand and I will iterate.
