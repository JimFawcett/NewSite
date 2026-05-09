# ToDo

- **2026-05-08 11:08** — Create PWA that lists the most important tools, with run syntax and options

---

- **2026-05-08 11:09** — Create voice-activated note taker, probably using Python voice-to-text processing
    - uses wake and exit word

---

- **2026-05-08 13:16** — Voice-driven dev journal (extends voice note-taker above)
    - on stop, classify transcript into a track and append a stamped entry to `Notes/<Track>Changes.md` or `Notes/ToDo.md`
    - Whisper (local) + small Python classifier; no cloud round-trip required

---

- **2026-05-08 11:17** — Experiment with styles cleanup using container
    - would installing changes into non-container environment cause difficulties?
    - VM Workstation Pro might be a better alternative.
    - creating and opening new git branch would certainly work, but I'm cautions due to history of problems with branch merging

---

- **2026-05-08 13:16** — Container-queries refactor of `Content.css`
    - start with `<x-two-panel>`, `<splitter-container>`, `<content-block>` since they're reused across every track
    - try on a single sandbox page on a feature branch before touching shared CSS

---

- **2026-05-08 13:16** — Static-site search PWA across all tracks
    - Python crawler builds a lunr.js-style client-side index from the HTML files
    - same indexer can emit a JSON site map for SiteMap page to consume
    - deploy via GitHub Action that regenerates index on push to `main` (commit the JSON back, or publish via `actions-gh-pages`)
    - works from GitHub-hosted repo just as well as local — only requirement is that the index file is served from the same origin as the HTML
        - avoid run-time crawling from the browser (slow, hammers network, CORS-prone) — build the index, then query in browser
        - expect a few hundred KB gzipped for a site of this scale; measure once a draft index exists
        - mount the search UI at the explorer level so results can drive the right-panel iframe via `postMessage` rather than reload the chrome

---

- **2026-05-08 13:16** — Site-hygiene agent
    - crawl the static site, validate internal links, verify `Explore*.html?src=…` redirect targets resolve
    - confirm every content page calls `buildPages()` and `createSiteNavMenu('goto')` per CLAUDE.md
    - motivated by recent recurring fixes: PageHost links, sitemap links, repo-page indexing, cookie counters

---

- **2026-05-08 13:16** — Cross-language code comparator
    - render scroll-locked side-by-side samples from Rust / C++ / C# / Python / Code repos
    - reuse `CodeWebifier` for the HTML output
    - provides vertical offset slider for right panel
    - provides code picker based on bookmarks - very similar layout and functioning
    - implement as W3C Web Component?
