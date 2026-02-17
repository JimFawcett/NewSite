# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static educational web platform documenting multiple programming languages (Rust, C++, C#, Python) and software development practices. No build system — edit HTML/CSS/JS files and open in browser. The site also includes Python-based AI agent tools under `Code/AI/`.

## Architecture

### Iframe-Based Multi-Track Explorer

The site uses a two-level iframe architecture:

1. **PageHost.html** (top-level) — contains an iframe loading track explorers, plus a URL bar and status indicator
2. **Explore*.html** (per-track) — two-panel layout (`<x-two-panel>` web component) with left navigation tree and right content iframe
3. **Content pages** — loaded inside the right panel; if opened standalone, they redirect into their explorer via `ExploreCode.html?src=<page>`

### Tracks

Each track has its own explorer and theme: Site (`Site/Explore.html`), Code (`Code/ExploreCode.html`), Rust (`Rust/ExploreRust.html`), plus C++, Python, CSharp, WebDev, SWDev, Basics.

### PostMessage Communication

Iframes communicate via `postMessage()` with `{ key, value }` objects:
- Content → parent: `window.parent.postMessage(...)` for navigation (up/down/next/prev), menu clearing
- Content → top: `window.top.postMessage(...)` for URL display updates, loading status
- Handlers in `js/contentMessages.js`, `js/PageHost.js`, `js/ExplorerMsg.js`

### Cookie-Based UI State

Menu visibility (sections, pages, about, keys) persists via cookies using `js/cookies.js`. Cookies use `SameSite=Lax` and URI encoding.

### Theming

CSS variables defined in `css/reset.css` (`--light`, `--dark`, `--menu`, `--atten`, `--hover`) are overridden per-track by theme files (`css/ThemeCode.css`, `css/ThemeRust.css`, etc.).

### Web Components

Custom elements with Shadow DOM: `<x-two-panel>` (panel layout), `<splitter-container>` (resizable panes), `<content-block>`, `<image-viewer>`. Defined in `js/TwoPanelComponentRefactored.js`, `js/SplitterComponent.js`, etc.

## Key Conventions

- Content pages must call `buildPages()` and `createSiteNavMenu('goto')` on load — do not remove or rename these functions
- The filename `CodeBites_Useage_Examples.html` has intentional spelling ("Useage")
- Standard page CSS load order: `reset.css` → `ContentMenus.css` → `Content.css` → `Theme*.css`
- Standard page JS load order: `ScriptsWebComponents.js` → `Content.js` → `ContentMenus.js` → `SitePagesForTools.js` → cookies/elements/messages
- Code-track-specific JS lives in `Code/js/`, not the root `js/` folder

## Python AI Agent

- Entry point: `Code/AI/DemoAgent-Claude2/dev_agent.py`
- Run: `Code/AI/DemoAgent-Claude2/run_agent.bat` or `run_agent.ps1`
- Requires: `ANTHROPIC_API_KEY` env var, Python 3.7+, `pip install -r Code/AI/DemoAgent-Claude2/requirements.txt`
- Commands: `/analyze <file>`, `/improve`, `/readme`, `/tree`, `/files`, `/clear`, `/quit`
- Agent excludes: `__pycache__`, `node_modules`, `bin`, `obj` directories
- Code file extensions: `.py .js .jsx .ts .tsx .java .cpp .c .h .hpp .cs .rs .go .rb .php`

## .NET Tooling

`Code/CodeWebifier/CodeWebifier.sln` — build with Visual Studio or `dotnet build`.

## Git Conventions

Commit messages use lowercase action descriptions (e.g., "fixed bug in contentElements.js postMessage for clear", "added cli reference section").
