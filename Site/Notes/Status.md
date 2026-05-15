# Project Status

_Last updated: 2026-05-15 10:29_

## Site Overview

Static educational web platform documenting multiple programming languages and software-development practices. No build system — HTML/CSS/JS edited directly and viewed in a browser. Track explorers built on a two-level iframe architecture (`PageHost.html` → per-track `Explore*.html` → content pages) with `postMessage`-based navigation and cookie-persisted UI state.

## Tracks

| Track   | Explorer              | Home page         | Status |
|---------|-----------------------|-------------------|--------|
| Site    | `Site/Explore.html`         | `Site/SiteHome.html`     | active — site landing/overview |
| Rust    | `Rust/ExploreRust.html`     | `Rust/RustHome.html`     | active — repos and stories |
| Cpp     | `Cpp/ExploreCpp.html`       | `Cpp/CppHome.html`       | active — Bites, Story chapters, repo demos |
| CSharp  | `CSharp/ExploreCSharp.html` | `CSharp/CSharpHome.html` | active — Bites, Story chapters, WCF/WPF demos |
| Python  | `Python/ExplorePython.html` | `Python/PythonHome.html` | active — Bites, Story chapters, repo prototype |
| WebDev  | `WebDev/ExploreWebDev.html` | `WebDev/WebDevHome.html` | active |
| SWDev   | `SWDev/ExploreSWDev.html`   | `SWDev/SWDevHome.html`   | active — `SWDevStory` added recently |
| Basics  | `Basics/ExploreBasics.html` | `Basics/BasicsHome.html` | active — story + repos pages populated |
| Code    | `Code/ExploreCode.html`     | `Code/CodeHome.html`     | active — large AI-focused content set, repo summaries, CodeStory chapters |

## Tooling

- **AI agents** (`Code/AI/`)
  - `DemoAgent-Claude2/` — current Python agent; entry `dev_agent.py`, run via `run_agent.bat` / `run_agent.ps1`. Requires `ANTHROPIC_API_KEY` and `requirements.txt`.
  - Older / parallel agents: `DemoAgent-Claude`, `DemoAIConsole-Gemini`, `DemoCode-Claude`, `DemoCode-Gemini`, `ReadmeAgent-Claude`, `RustDemoAgent-Claude`, `CppCodeAnalysis`, `RustCodeAnalysis`, `DemoLibraryAgent-Claude`.
- **CodeWebifier** (`Code/CodeWebifier/CodeWebifier.sln`) — .NET tool, build via Visual Studio or `dotnet build`.
- **Solution / workspace files**: `NewSite.sln`, `NewSite.code-workspace`.

## Recent Activity (last ~20 commits)

| Date / Time       | Activity |
|-------------------|----------|
| 2026-05-15 10:29  | Added Hardware, CPUs, and GPUs chapters to Basics Story; renumbered all chapters |
| 2026-05-14 22:05  | Fixed bug in extracting page address in PageHost |
| 2026-05-14 21:30  | Added many new C++ Bites; C++ track now rivals Rust track in coverage |
| 2026-05-14 11:07  | Added HTML, JavaScript, and CSS chapters to WebDev Story |
| 2026-05-14 10:17  | Added new entries to WebDev, Basics, and Python glossaries |
| 2026-05-14 09:10  | Added new entries to C# Glossary |
| 2026-05-14 08:36  | Added new entries to C++ Glossary |
| 2026-05-14 08:30  | Added new entries to Rust Glossary |
| 2026-05-13 22:47  | Added glossary links to Rust Bites pages and Site Glossary |
| 2026-05-13 20:36  | Fixed link in SitePages.js |
| 2026-05-13 20:14  | Added Basics_Threads.html; clarifying text in Basics_IO.html |
| 2026-05-13 13:40  | Text fixes and clarification in SiteDesign and SiteDemo pages |
| 2026-05-13 12:06  | Added more information to Basics Story and Code AI Story |
| 2026-05-11 10:38  | Added BasicsCodeStory and BasicsDecCodeStory pages |
| 2026-05-10 22:08  | Fixed Basics Repo Explorer and several links |
| 2026-05-10 20:29  | Added new WebDev Repo docs |
| 2026-05-10 14:10  | Added AI Story (12-chapter sequence in Code track) |
| 2026-05-08 22:20  | Added notes ideas |
| 2026-05-08 18:45  | Minor text corrections |
| 2026-05-08 15:19  | Added bookmarks; moved Notes from NewSite to NewSite/Site |

## Conventions (reminders)

- Page-specific stylesheets must be the **last** `<link>` in `<head>` to win the cascade.
- Content pages must call `buildPages()` and `createSiteNavMenu('goto')` on load.
- Standard CSS load order: `reset.css` → `ContentMenus.css` → `Content.css` → `Theme*.css`.
- Standard JS load order: `ScriptsWebComponents.js` → `Content.js` → `ContentMenus.js` → `SitePagesForTools.js` → cookies/elements/messages.
- The filename `CodeBites_Useage_Examples.html` keeps its intentional spelling.
- Code-track-specific JS lives in `Code/js/`, not the root `js/`.

## Open / Watch Items

- Working tree currently shows uncommitted changes under `Code/C#/Hello/obj/Debug/net10.0/` (build artifacts - likely gitignore candidates rather than intentional changes).
- ~~No tracked TODO/issue list inside the repo; future status updates should capture in-flight content work and any outstanding link/index fixes here.~~
