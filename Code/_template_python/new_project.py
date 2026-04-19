#!/usr/bin/env python3
"""
Scaffold a new Python project from this template.

Usage:
    python new_project.py <ProjectName> [destination]

Arguments:
    ProjectName   PascalCase name, e.g. MyTool
    destination   Parent directory for the new project
                  (default: ../Projects relative to this script)

Substitutions performed in all file names and file contents:
    {{PROJECT_NAME}}  ->  ProjectName  (as supplied)
    {{project_name}}  ->  project_name (snake_case derived)

After scaffolding:
    cd <destination>/<ProjectName>
    python -m venv .venv && .venv/Scripts/activate   # Windows
    python -m venv .venv && source .venv/bin/activate # Linux/macOS
    pip install -e .
    <project_name> --help
"""
import os
import re
import shutil
import sys


def to_snake(name: str) -> str:
    s = re.sub(r'(?<=[a-z0-9])(?=[A-Z])', '_', name)
    return s.lower().replace('-', '_').replace(' ', '_')


def substitute(text: str, project_name: str, project_snake: str) -> str:
    return (text
            .replace('{{PROJECT_NAME}}', project_name)
            .replace('{{project_name}}', project_snake))


def copy_and_substitute(src: str, dst: str, project_name: str, project_snake: str) -> None:
    shutil.copytree(
        src, dst,
        ignore=shutil.ignore_patterns('new_project.py', '__pycache__', '*.pyc', '.venv'),
    )

    for root, dirs, files in os.walk(dst, topdown=False):
        for fname in files:
            new_fname = substitute(fname, project_name, project_snake)
            if new_fname != fname:
                os.rename(os.path.join(root, fname), os.path.join(root, new_fname))
        for dname in dirs:
            new_dname = substitute(dname, project_name, project_snake)
            if new_dname != dname:
                os.rename(os.path.join(root, dname), os.path.join(root, new_dname))

    for root, _dirs, files in os.walk(dst):
        for fname in files:
            fpath = os.path.join(root, fname)
            try:
                with open(fpath, encoding='utf-8') as fh:
                    content = fh.read()
                new_content = substitute(content, project_name, project_snake)
                if new_content != content:
                    with open(fpath, 'w', encoding='utf-8') as fh:
                        fh.write(new_content)
            except (UnicodeDecodeError, OSError):
                pass


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

    os.makedirs(dest_parent, exist_ok=True)
    copy_and_substitute(script_dir, dest, project_name, project_snake)

    # The src/ package folder needs to be renamed to match the snake_case name.
    old_pkg = os.path.join(dest, 'src', project_snake if project_snake != 'src' else '_src')
    # Already handled by the rename pass above if the template uses {{project_name}} in the path.
    # If the template folder is literally named 'src/' (not {{project_name}}), remind the user.

    print(f"Created {project_name} at {dest}")
    print(f"  snake_case name : {project_snake}")
    print(f"  Install         : pip install -e .")
    print(f"  Run             : {project_snake} --help")
    print(f"  Next            : fill in <!-- INPUT NEEDED --> sections in the .md files")


if __name__ == '__main__':
    main()
