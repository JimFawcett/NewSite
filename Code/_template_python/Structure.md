# Structure.md — {{PROJECT_NAME}}

*Python packaging and layout document.*

---

## Language & Toolchain

- **Language:** Python 3.9+
- **Build:** pip / pyproject.toml (setuptools backend)

---

## Directory Layout

```
{{PROJECT_NAME}}/
├── Constitution.md
├── Structure.md
├── Notes.md
├── README.md
├── pyproject.toml
├── requirements.txt
├── EntryPoint/
│   ├── Spec.md
│   └── Notes.md
├── part1/
│   ├── Spec.md
│   └── Notes.md
└── src/
    └── {{project_name}}/
        ├── __init__.py
        ├── main.py         ← entry point; wires components
        └── part1.py        ← Part1 component
```

<!-- INPUT NEEDED: Rename part1 and add/remove modules to match your project. -->

---

## pyproject.toml

```toml
[build-system]
requires = ["setuptools>=68"]
build-backend = "setuptools.backends.legacy:build"

[project]
name = "{{project_name}}"
version = "0.1.0"
requires-python = ">=3.9"
dependencies = []

[project.scripts]
{{project_name}} = "{{project_name}}.main:main"
```

---

## Build / Install Steps

```bash
# Create and activate a virtual environment (recommended)
python -m venv .venv
source .venv/bin/activate       # Linux/macOS
.venv\Scripts\activate          # Windows

pip install -e .
{{project_name}} --help
```

---

## Running Tests

```bash
pip install pytest
pytest
```

---

## Component Dependencies

```
part1   ...
   \     /
  main.py
```

Modules never import each other except through `main.py`.

---

## External Dependencies

<!-- INPUT NEEDED: List pip packages here and add them to
     requirements.txt and pyproject.toml [project] dependencies. -->

---

*End of Structure.md*
