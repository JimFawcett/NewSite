# Plotting Notes

---

## 2026-04-30

**Prompt:** Survey plotting apps and libs including Javascript and webassem

**Response:**

## Survey: Plotting Apps and Libraries

### JavaScript — General Purpose

| Library | Strengths | Best For |
|---|---|---|
| **D3.js** | Maximum control, SVG-based, huge ecosystem | Custom interactive visualizations, anything non-standard |
| **Chart.js** | Simple API, Canvas-based, responsive | Standard charts (bar, line, pie) with minimal setup |
| **Plotly.js** | Rich chart types, built-in interactivity, WebGL support | Scientific and statistical plots, dashboards |
| **Vega / Vega-Lite** | Declarative grammar, JSON spec-driven | Reproducible charts, data journalism |
| **Observable Plot** | Concise, composable, modern API | Exploratory data analysis in notebooks or web |
| **ECharts** (Apache) | High performance, large datasets, wide chart variety | Dashboards, geospatial, real-time data |
| **Highcharts** | Polished, well-documented, commercial | Business dashboards (requires license for commercial use) |
| **Recharts** | React-native, composable components | React apps needing standard chart types |
| **Victory** | React and React Native, consistent API | Cross-platform React charts |
| **uPlot** | Extremely fast, tiny (~45KB), Canvas-based | Real-time time-series with massive datasets |

---

### JavaScript — Specialized

| Library | Focus |
|---|---|
| **Leaflet / Mapbox GL JS** | Geographic / map-based visualization |
| **Deck.gl** | Large-scale geospatial WebGL rendering |
| **Three.js** | 3D scene rendering, custom 3D plots |
| **Sigma.js / Cytoscape.js** | Graph and network visualization |
| **Vis.js** | Network graphs, timelines, 2D grids |
| **Billboard.js** | D3-based, drop-in Chart.js alternative |
| **ApexCharts** | Interactive, animated, good React/Vue/Angular support |

---

### WebAssembly-Powered Plotting

| Tool | What It Does |
|---|---|
| **Rerun** | High-performance multimodal data visualization; Wasm viewer runs in browser |
| **DuckDB-Wasm + Observable Plot** | Query data in-browser with DuckDB, render with Plot — full analytics pipeline client-side |
| **Perspective** (JP Morgan) | Wasm-accelerated streaming pivot tables and charts; handles millions of rows in-browser |
| **ONNX Runtime Web** | Run ML models in Wasm/WebGL and plot inference results in-browser |
| **Pyodide + Matplotlib** | Python + Matplotlib compiled to Wasm via Pyodide; renders plots in browser without a server |
| **Panel / HoloViews (via Pyodide)** | Holoviz stack running client-side in Wasm-powered Python environments |
| **Bokeh (server + BokehJS)** | Python defines plots, BokehJS renders in browser; experimental Wasm backend in progress |

---

### Python Libraries (Server-Side or Notebook)

| Library | Strengths |
|---|---|
| **Matplotlib** | Foundational, publication-quality static plots |
| **Seaborn** | Statistical plots built on Matplotlib, cleaner defaults |
| **Plotly (Python)** | Interactive HTML output, pairs with Dash for web apps |
| **Bokeh** | Interactive browser plots, streaming data support |
| **Altair** | Declarative, Vega-Lite backed, concise syntax |
| **HoloViews / hvPlot** | High-level, integrates with Pandas/Xarray, renders to Bokeh or Plotly |

---

### Desktop / Standalone Apps

| App | Platform | Best For |
|---|---|---|
| **Grafana** | Web (self-hosted) | Metrics dashboards, time-series, observability |
| **Tableau Public** | Desktop + Web | Business BI, drag-and-drop, no code |
| **Power BI** | Desktop + Web | Microsoft ecosystem BI and dashboards |
| **Gnuplot** | Desktop CLI | Scriptable, publication plots, legacy scientific use |
| **Origin** | Desktop | Scientific/engineering data, advanced stats |
| **Datawrapper** | Web | Embeddable charts for journalism and reports |

---

### How to Choose

```
Need maximum flexibility?          → D3.js
Standard charts, quick setup?      → Chart.js or ApexCharts
Scientific / statistical?          → Plotly.js or Observable Plot
React app?                         → Recharts or Victory
Massive real-time dataset?         → uPlot or Perspective (Wasm)
Geographic data?                   → Deck.gl or Mapbox GL JS
Python notebook?                   → Matplotlib, Seaborn, or Altair
Python → browser, no server?       → Pyodide + Matplotlib or Plotly
In-browser SQL + charts?           → DuckDB-Wasm + Observable Plot
```

---

## 2026-04-30

**Topic:** Libraries and apps that produce line charts and surfaces written to SVG files

### Line Charts → SVG Output

| Tool | Language / Platform | Notes |
|---|---|---|
| **Matplotlib** | Python | `fig.savefig('out.svg')` — most common path for scripted SVG output |
| **Plotly (Python)** | Python | `fig.write_image('out.svg')` via kaleido; also exports from the browser UI |
| **D3.js** | JavaScript | Renders directly to SVG DOM; serialize with `XMLSerializer` or server-side with jsdom |
| **Vega / Vega-Lite** | JavaScript | Declarative spec renders to SVG; CLI tool `vg2svg` writes files directly |
| **Observable Plot** | JavaScript | SVG-based; serialize the returned SVG node to a file in Node.js |
| **Recharts** | JavaScript (React) | SVG-based; capture via `innerHTML` or a React ref |
| **Victory** | JavaScript (React) | SVG-based; supports `VictoryChart` serialization |
| **Billboard.js** | JavaScript | D3-backed SVG; export via `.export()` method |
| **ApexCharts** | JavaScript | SVG renderer; built-in `exportToSVG()` method |
| **Highcharts** | JavaScript | SVG renderer; `chart.getSVG()` returns SVG string |
| **ECharts** | JavaScript | SVG renderer mode (`renderer: 'svg'`); serialize the SVG node |
| **Altair** | Python | `chart.save('out.svg')` via vl-convert |
| **Bokeh** | Python | `export_svg(plot, filename='out.svg')` via selenium backend |
| **Gnuplot** | CLI | `set terminal svg; set output 'out.svg'` — scriptable, no runtime dependency |
| **Inkscape** | Desktop App | Draw or import data-driven charts; export to plain SVG |
| **R ggplot2** | R | `ggsave('out.svg', device='svg')` — publication-quality output |

### Surfaces → SVG Output

3D surfaces are inherently 2D-projected when written to SVG (a flat format). Options vary by how much true 3D fidelity they preserve:

| Tool | Language / Platform | Notes |
|---|---|---|
| **Matplotlib** | Python | `plot_surface()` with `fig.savefig('out.svg')` — projects 3D to 2D SVG; no interactivity |
| **Plotly (Python)** | Python | `write_image('out.svg')` via kaleido; captures the current 3D camera angle as a flat SVG |
| **D3.js + d3-contour** | JavaScript | Renders contour/heatmap surfaces as SVG; true 3D projection requires custom math |
| **Vega-Lite** | JavaScript | Supports heatmap/filled contour as a 2D surface proxy; exports to SVG |
| **Gnuplot** | CLI | `set terminal svg; splot` renders 3D surfaces projected to SVG — scriptable and precise |
| **R ggplot2 + rayshader** | R | Rayshader renders 3D; ggplot2 saves 2D surface projections to SVG |
| **Asymptote** | CLI / DSL | Vector graphics language designed for scientific figures; true 3D-to-SVG projection |
| **PGFPlots (LaTeX)** | LaTeX | Generates 3D surface SVG via `\addplot3`; output via `dvisvgm` |

---

## 2026-04-30

**Topic:** Libraries and apps that generate UML diagrams

### Text / Code → UML (Diagram-as-Code)

| Tool | Input Format | Diagram Types | Output |
|---|---|---|---|
| **PlantUML** | `.puml` text DSL | Class, sequence, component, state, use case, activity, ER | PNG, SVG, PDF |
| **Mermaid** | Markdown-style DSL | Class, sequence, flowchart, state, ER, Gantt, Git graph | SVG (browser/CLI) |
| **Structurizr DSL** | `.dsl` text | C4 model (context, container, component, code) | SVG, PNG, PlantUML |
| **D2** | `.d2` text DSL | Class, sequence, flowchart, ER, network | SVG, PNG, PDF |
| **Kroki** | Any DSL via API | Aggregates PlantUML, Mermaid, D2, Graphviz, and 20+ others | SVG, PNG |
| **Graphviz (dot)** | `.dot` text | Dependency graphs, class hierarchies, state machines | SVG, PNG, PDF |
| **NClass** | GUI + XML | Class, object diagrams | PNG, SVG |

### IDE and Editor Plugins

| Tool | Platform | Notes |
|---|---|---|
| **PlantUML plugin** | VS Code, IntelliJ, Eclipse | Live preview of `.puml` files; most popular IDE UML integration |
| **Mermaid Preview** | VS Code | Renders Mermaid blocks in Markdown live |
| **Draw.io (diagrams.net) extension** | VS Code | Full GUI diagram editor embedded in VS Code; saves `.drawio` or SVG |
| **UML Designer** | Eclipse | Full UML 2.x modeling with Obeo Designer; round-trip with Java |
| **ArgoUML** | Standalone Java app | Open-source, supports full UML 2; exports to SVG, PNG, GIF |

### Desktop Apps

| App | Platform | Strengths |
|---|---|---|
| **Draw.io (diagrams.net)** | Web / Desktop | Free, no account needed, exports SVG/PNG; huge shape library |
| **Lucidchart** | Web | Collaborative, polished; import/export Visio; free tier limited |
| **Visio** | Windows | Microsoft ecosystem standard; full UML support; expensive |
| **StarUML** | Desktop (Mac/Win/Linux) | Code reverse engineering, UML 2, exports SVG/PNG/PDF |
| **Enterprise Architect** | Windows | Full-lifecycle modeling, round-trip engineering, large teams |
| **Umbrello** | Linux (KDE) | Open-source UML tool; code generation for C++, Java, Python |
| **Modelio** | Desktop | Open-source, UML + BPMN, Java reverse engineering |

### Code → UML (Reverse Engineering)

| Tool | Language | What It Generates |
|---|---|---|
| **Pyreverse** (part of pylint) | Python | Class and package diagrams from source; outputs to Graphviz or PlantUML |
| **JavaParser + PlantUML** | Java | Parse source → emit PlantUML class diagrams |
| **Doxygen** | C, C++, C#, Java | Extracts class hierarchies and call graphs; outputs Graphviz dot → SVG |
| **rustdoc + cargo-depgraph** | Rust | Dependency and module graphs; dot format |
| **NDepend** | .NET / C# | Detailed class, dependency, and coupling diagrams |
| **SketchIt** | .NET | Generates PlantUML class diagrams from compiled assemblies |

### How to Choose

```
Quick diagram in Markdown/docs?        → Mermaid
Complex multi-diagram project?         → PlantUML
C4 architecture diagrams?              → Structurizr DSL
Modern clean syntax?                   → D2
GUI drag-and-drop, free?               → Draw.io
Reverse-engineer Python code?          → Pyreverse
Reverse-engineer C++ code?             → Doxygen
Enterprise / team modeling?            → Enterprise Architect or Lucidchart
VS Code integration?                   → PlantUML plugin or Draw.io extension
```

---

## 2026-04-30

**Prompt:** can I save app.diagrams.net diagrams as svg images locally

**Response:**

Yes. Draw.io (app.diagrams.net) has straightforward SVG export:

### Export to SVG File

**From the menu:**
1. `File` → `Export As` → `SVG…`
2. A dialog appears with options:
   - **Zoom** — scale factor
   - **Fit Page** — crop to diagram bounds
   - **Include a copy of my diagram** — embeds the editable XML inside the SVG (lets you re-open it in Draw.io later)
   - **Transparent Background**
3. Click **Export**, then **Download** — saves a `.svg` file locally.

### Key Option: Editable SVG

If you check **"Include a copy of my diagram"**, the SVG file is both:
- A valid SVG renderable in any browser or vector editor
- A fully editable Draw.io file — drag it back into app.diagrams.net or the VS Code extension to keep editing

### Other Ways to Get SVG Locally

| Method | How |
|---|---|
| **Save as `.drawio.svg`** | `File → Save As`, choose format `.drawio.svg` — the working file is already an SVG |
| **Copy as SVG** | `Edit → Copy As → SVG` — pastes SVG markup into clipboard |
| **Print → Save as PDF → convert** | Less direct; use Export instead |

### Using the Desktop App

The Draw.io desktop app (available for Mac/Windows/Linux) saves files locally by default — no browser download dialog needed. Same export options apply.

**Bottom line:** `File → Export As → SVG → Download` is the direct path. Checking "Include a copy of my diagram" is recommended if you want to keep editing the file later.
