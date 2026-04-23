#!/usr/bin/env python3
"""
generate_part.py — Create a new part directory inside a PyTextFinder-style project.

Usage:
    python generate_part.py <PartName> [project_dir]

    PartName    Name of the new part in CamelCase (e.g. TextScanner, FileWalker)
    project_dir Path to the project root (default: current directory)

Creates:
    <project_dir>/<PartName>/
        __init__.py
        <snake_name>.py
        test_<snake_name>.py
        Notes.md
        Spec.md
"""

import sys
import os
import re
from pathlib import Path


INIT_TEMPLATE = ""

MODULE_TEMPLATE = """\
class {class_name}:
    pass
"""

TEST_TEMPLATE = """\
import unittest


class Test{class_name}(unittest.TestCase):
    pass


if __name__ == '__main__':
    unittest.main()
"""

NOTES_TEMPLATE = """\
# Notes.md — PyTextFinder/{part}

*Record of prompts submitted and responses received while designing and
implementing the {part} component.*

---

## How to use this file

Add an entry for each significant prompt/response exchange.  Include enough
context so that the conversation can be reconstructed or handed off.

---

## Entry template

```
### YYYY-MM-DD — <short topic>

**Prompt**
<paste the prompt you sent>

**Response summary**
<paste or summarise the response>

**Decisions / follow-up**
<note any decisions made or items deferred>
```

---

*End of Notes.md*
"""

SPEC_TEMPLATE = """\
# Spec.md — PyTextFinder/{part}

*Responsibility: <!-- INPUT NEEDED: one sentence. -->*

---

## Interface

<!-- INPUT NEEDED: Describe the public API — classes, functions, callables. -->

## Behaviour

<!-- INPUT NEEDED: Describe what {part} does when called correctly. -->

## Error Handling

<!-- INPUT NEEDED: Describe how {part} signals failure (return value, exception,
     callable invocation, etc.). -->

## Constraints

<!-- INPUT NEEDED: List invariants, thread-safety assumptions, resource limits. -->

---

*End of Spec.md*
"""


def camel_to_snake(name: str) -> str:
    s = re.sub(r'([A-Z]+)([A-Z][a-z])', r'\1_\2', name)
    s = re.sub(r'([a-z\d])([A-Z])', r'\1_\2', s)
    return s.lower()


def main() -> None:
    if len(sys.argv) < 2:
        print("Usage: python generate_part.py <PartName> [project_dir]")
        sys.exit(1)

    part = sys.argv[1]
    project_dir = Path(sys.argv[2]).resolve() if len(sys.argv) > 2 else Path.cwd()

    if not project_dir.is_dir():
        print(f"Error: project directory '{project_dir}' does not exist.")
        sys.exit(1)

    part_dir = project_dir / part
    if part_dir.exists():
        print(f"Error: '{part_dir}' already exists.")
        sys.exit(1)

    snake_name = camel_to_snake(part)

    part_dir.mkdir()
    (part_dir / "__init__.py").write_text(INIT_TEMPLATE, encoding="utf-8")
    (part_dir / f"{snake_name}.py").write_text(
        MODULE_TEMPLATE.format(class_name=part), encoding="utf-8"
    )
    (part_dir / f"test_{snake_name}.py").write_text(
        TEST_TEMPLATE.format(class_name=part), encoding="utf-8"
    )
    (part_dir / "Notes.md").write_text(
        NOTES_TEMPLATE.format(part=part), encoding="utf-8"
    )
    (part_dir / "Spec.md").write_text(
        SPEC_TEMPLATE.format(part=part), encoding="utf-8"
    )

    print(f"Created {part_dir}/")
    for f in sorted(part_dir.iterdir()):
        print(f"  {f.name}")


if __name__ == "__main__":
    main()
