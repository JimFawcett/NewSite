#!/usr/bin/env python3
"""
Scaffold a new C# project from this template.

Usage:
    python new_project.py <ProjectName> [destination]

Arguments:
    ProjectName   PascalCase name, e.g. MyTool
    destination   Parent directory for the new project
                  (default: ../Projects relative to this script)

The script:
  1. Creates <destination>/<ProjectName>/
  2. Copies and substitutes the spec .md files
  3. Runs: dotnet new sln -n <ProjectName>
  4. Runs: dotnet new console  -n EntryPoint --output EntryPoint
  5. Runs: dotnet new classlib -n Part1      --output Part1
  6. Adds both projects to the solution and wires the reference
"""
import os
import re
import subprocess
import sys


def to_snake(name: str) -> str:
    s = re.sub(r'(?<=[a-z0-9])(?=[A-Z])', '_', name)
    return s.lower().replace('-', '_').replace(' ', '_')


def substitute(text: str, project_name: str, project_snake: str) -> str:
    return (text
            .replace('{{PROJECT_NAME}}', project_name)
            .replace('{{project_name}}', project_snake))


def copy_md(src_dir: str, dst_dir: str, rel_path: str,
            project_name: str, project_snake: str) -> None:
    src = os.path.join(src_dir, rel_path)
    dst = os.path.join(dst_dir, rel_path)
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    if os.path.exists(src):
        with open(src, encoding='utf-8') as fh:
            content = fh.read()
        with open(dst, 'w', encoding='utf-8') as fh:
            fh.write(substitute(content, project_name, project_snake))


def run(cmd: list[str], cwd: str) -> None:
    result = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"error running: {' '.join(cmd)}", file=sys.stderr)
        print(result.stderr, file=sys.stderr)
        sys.exit(1)


def main() -> None:
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    project_name = sys.argv[1]
    project_snake = to_snake(project_name)

    script_dir = os.path.dirname(os.path.abspath(__file__))
    dest_parent = sys.argv[2] if len(sys.argv) > 2 else os.path.join(script_dir, '..', 'Projects')
    dest = os.path.normpath(os.path.join(dest_parent, project_name))

    if os.path.exists(dest):
        print(f"error: destination already exists: {dest}", file=sys.stderr)
        sys.exit(1)

    os.makedirs(dest, exist_ok=True)

    # Copy spec md files with substitution.
    for rel in ('Constitution.md', 'Structure.md', 'Notes.md', 'README.md',
                'EntryPoint/Spec.md', 'EntryPoint/Notes.md',
                'Part1/Spec.md',      'Part1/Notes.md'):
        copy_md(script_dir, dest, rel, project_name, project_snake)

    # dotnet scaffold.
    run(['dotnet', 'new', 'sln', '-n', project_name], cwd=dest)
    run(['dotnet', 'new', 'console',  '-n', 'EntryPoint', '--output', 'EntryPoint'], cwd=dest)
    run(['dotnet', 'new', 'classlib', '-n', 'Part1',      '--output', 'Part1'],      cwd=dest)
    run(['dotnet', 'sln', 'add', 'EntryPoint/EntryPoint.csproj'], cwd=dest)
    run(['dotnet', 'sln', 'add', 'Part1/Part1.csproj'],           cwd=dest)
    run(['dotnet', 'add', 'EntryPoint/EntryPoint.csproj',
         'reference', 'Part1/Part1.csproj'], cwd=dest)

    print(f"Created {project_name} at {dest}")
    print(f"  snake_case name : {project_snake}")
    print(f"  Build           : dotnet build")
    print(f"  Next            : fill in <!-- INPUT NEEDED --> sections in the .md files")


if __name__ == '__main__':
    main()
