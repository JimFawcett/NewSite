# Project Status

_Last updated: 2026-05-08 15:19_

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
| 2026-05-08 15:19  | Added bookmarks; moved Notes from NewSite to NewSite/Site |
| 2026-05-08 09:33  | PageHost link fix in Page Controls > GoTo |
| 2026-05-08 09:10  | Windows messaging update |
| 2026-05-08 08:48  | Removed status links from explorers; clarifying text in SiteMap |
| 2026-05-07 21:18  | Repo-page indexing bug fixes; updated README for RustByteRecord |
| 2026-05-07 11:17  | Cookie page-counter fixes |
| 2026-05-06 21:28  | SiteMap link fixes; Copy URL bug fix |
| 2026-05-06 14:50  | Repository file access reworked |
| 2026-05-05 19:54  | Track summary subtitle changes |
| 2026-05-05 09:30  | Added Demo and Design pages |
| 2026-05-04 22:48  | Added code comparisons across repositories; added CodeStory |
| 2026-05-04 01:09  | New Code track summary |
| 2026-05-03 20:07  | Added SWDevStory |
| 2026-05-03 13:11  | Revised home pages for Rust, C++, C#, Python, WebDev tracks |

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
