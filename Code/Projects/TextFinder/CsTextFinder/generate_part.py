#!/usr/bin/env python3
"""
generate_part.py — Create a new library part directory inside a CsTextFinder-style project.

Usage:
    python generate_part.py <PartName> [project_dir]

    PartName    Name of the new part (e.g. TextScanner, FileWalker)
    project_dir Path to the project root containing the .sln file
                (default: current directory)

Creates:
    <project_dir>/<PartName>/
        <PartName>.csproj
        Class1.cs
        Notes.md
        Spec.md

Then runs:
    dotnet sln add <PartName>/<PartName>.csproj
"""

import sys
import os
import subprocess
from pathlib import Path


CSPROJ_TEMPLATE = """\
<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <TargetFramework>net10.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
  </PropertyGroup>

</Project>
"""

CLASS1_TEMPLATE = """\
namespace {part};

public class Class1
{{

}}
"""

NOTES_TEMPLATE = """\
# Notes.md — {sln}/{part}

*Record of prompts and responses for this component.*

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
# Spec.md — {sln}/{part}

*Responsibility: <!-- INPUT NEEDED: one sentence. -->*

---

## Interface

<!-- INPUT NEEDED: Describe the public API — classes, functions, callbacks. -->

## Behaviour

<!-- INPUT NEEDED: Describe what {part} does when called correctly. -->

## Error Handling

<!-- INPUT NEEDED: Describe how {part} signals failure (return value, exception,
     callback, etc.). -->

## Constraints

<!-- INPUT NEEDED: List invariants, thread-safety assumptions, resource limits. -->

---

*End of Spec.md*
"""


def find_sln(project_dir: Path) -> Path | None:
    slns = list(project_dir.glob("*.sln"))
    return slns[0] if slns else None


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

    sln_path = find_sln(project_dir)
    sln_name = sln_path.stem if sln_path else project_dir.name

    part_dir.mkdir()
    (part_dir / f"{part}.csproj").write_text(CSPROJ_TEMPLATE, encoding="utf-8")
    (part_dir / "Class1.cs").write_text(CLASS1_TEMPLATE.format(part=part), encoding="utf-8")
    (part_dir / "Notes.md").write_text(NOTES_TEMPLATE.format(sln=sln_name, part=part), encoding="utf-8")
    (part_dir / "Spec.md").write_text(SPEC_TEMPLATE.format(sln=sln_name, part=part), encoding="utf-8")

    print(f"Created {part_dir}/")
    for f in sorted(part_dir.iterdir()):
        print(f"  {f.name}")

    if sln_path:
        csproj_rel = Path(part) / f"{part}.csproj"
        result = subprocess.run(
            ["dotnet", "sln", str(sln_path), "add", str(csproj_rel)],
            cwd=project_dir,
            capture_output=True,
            text=True,
        )
        if result.returncode == 0:
            print(f"\nAdded to solution: {sln_path.name}")
        else:
            print(f"\nWarning: could not add to solution:\n{result.stderr.strip()}")
    else:
        print("\nNo .sln file found — skipped 'dotnet sln add'.")


if __name__ == "__main__":
    main()
