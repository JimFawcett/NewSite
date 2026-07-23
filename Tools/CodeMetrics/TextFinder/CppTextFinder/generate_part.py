#!/usr/bin/env python3
"""
generate_part.py  —  generate source files for one CppTextFinder part.

Usage:
    python generate_part.py <PartName>

PartName must be one of: CommandLine  DirNav  Output  EntryPoint

For each library part the script generates:
    <Part>/src/<Name>.ixx      C++23 named module
    <Part>/src/test.cpp        hand-written unit tests
    <Part>/CMakeLists.txt      per-part build file

For EntryPoint it generates:
    EntryPoint/src/main.cpp    wiring entry point (imports the three modules)
    EntryPoint/src/test.cpp    integration-level tests
    EntryPoint/CMakeLists.txt  per-part build file

Each generation step is a separate Claude API call.  The shared spec files
(Constitution.md, Structure.md) are sent with cache_control so they are only
tokenised once per session.  Generated files are written to disk and a dated
entry is appended to the part's Notes.md.

Requires:
    pip install anthropic
    ANTHROPIC_API_KEY environment variable
"""

import re
import sys
from datetime import date
from pathlib import Path

import anthropic

# ---------------------------------------------------------------------------
# Project layout
# ---------------------------------------------------------------------------

PROJECT_ROOT = Path(__file__).parent

PARTS = {"CommandLine", "DirNav", "Output", "EntryPoint"}
LIBRARY_PARTS = {"CommandLine", "DirNav", "Output"}

PART_CONFIG = {
    "CommandLine": {"module": "cmd_line", "ixx": "CmdLine.ixx", "lib": "cmd_line"},
    "DirNav":      {"module": "dir_nav",  "ixx": "DirNav.ixx",  "lib": "dir_nav"},
    "Output":      {"module": "output",   "ixx": "Output.ixx",  "lib": "output"},
    "EntryPoint":  {"module": None,       "ixx": None,          "lib": None},
}

MODEL = "claude-sonnet-4-6"

# ---------------------------------------------------------------------------
# File I/O helpers
# ---------------------------------------------------------------------------

def read_md(rel: str) -> str:
    return (PROJECT_ROOT / rel).read_text(encoding="utf-8")

def write_file(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")
    print(f"  wrote  {path.relative_to(PROJECT_ROOT)}")

def strip_fence(text: str) -> str:
    """Remove leading and/or trailing markdown code fence lines if present."""
    text = text.strip()
    text = re.sub(r"^```[^\n]*\n", "", text)   # strip leading ```<lang>
    text = re.sub(r"\n```\s*$", "", text)       # strip trailing ```
    return text.strip()

# ---------------------------------------------------------------------------
# Claude API call with cached shared context
# ---------------------------------------------------------------------------

SYSTEM_PROMPT = (
    "You are a precise C++ code generator. "
    "Output only the requested file content — no explanations, no markdown "
    "prose, no commentary before or after the code. "
    "Wrap the output in exactly one code fence."
)

def call_claude(
    client: anthropic.Anthropic,
    cached_blocks: list[dict],
    user_text: str,
) -> str:
    """
    Make one API call.  cached_blocks are sent as a user message with
    cache_control so they are reused across calls within the same session.
    user_text is the actual instruction appended after the cached blocks.
    """
    messages = [
        {
            "role": "user",
            "content": cached_blocks + [{"type": "text", "text": user_text}],
        }
    ]
    response = client.messages.create(
        model=MODEL,
        max_tokens=8096,
        system=SYSTEM_PROMPT,
        messages=messages,
    )
    return response.content[0].text

# ---------------------------------------------------------------------------
# Build the cached context blocks (reused across all calls for one part)
# ---------------------------------------------------------------------------

def make_cached_blocks(constitution: str, structure: str, spec: str, part: str) -> list[dict]:
    """
    Three text blocks marked ephemeral so Claude caches them.
    The last block in the list is the one Claude pins in the cache.
    """
    return [
        {
            "type": "text",
            "text": f"=== Constitution.md ===\n{constitution}",
            "cache_control": {"type": "ephemeral"},
        },
        {
            "type": "text",
            "text": f"=== Structure.md ===\n{structure}",
            "cache_control": {"type": "ephemeral"},
        },
        {
            "type": "text",
            "text": f"=== {part}/Spec.md ===\n{spec}",
            "cache_control": {"type": "ephemeral"},
        },
    ]

# ---------------------------------------------------------------------------
# Per-file generation prompts
# ---------------------------------------------------------------------------

def gen_ixx(client: anthropic.Anthropic, part: str, cached: list[dict]) -> tuple[str, str]:
    cfg = PART_CONFIG[part]
    prompt = (
        f"Implement `{part}/src/{cfg['ixx']}` as a C++23 named module "
        f"(`export module {cfg['module']};`). "
        f"Follow the Spec.md, Structure.md, and Constitution.md provided above exactly. "
        f"Output only the complete content of `{cfg['ixx']}`."
    )
    result = strip_fence(call_claude(client, cached, prompt))
    return result, prompt


def gen_main(
    client: anthropic.Anthropic,
    cached: list[dict],
    library_sources: dict[str, str],
) -> tuple[str, str]:
    lib_section = "\n".join(
        f"=== {part}/src/{PART_CONFIG[part]['ixx']} ===\n{src}"
        for part, src in library_sources.items()
    )
    extra = f"\n\nLibrary modules already generated (for import reference):\n{lib_section}" if lib_section else ""
    prompt = (
        "Implement `EntryPoint/src/main.cpp`. "
        "Wire CommandLine, DirNav, and Output together using the lambda pattern "
        "described in EntryPoint/Spec.md. "
        "Import the three modules at the top of the file." + extra + "\n\n"
        "Output only the complete content of `main.cpp`."
    )
    result = strip_fence(call_claude(client, cached, prompt))
    return result, prompt


def gen_test(
    client: anthropic.Anthropic,
    part: str,
    cached: list[dict],
    impl_content: str,
) -> tuple[str, str]:
    cfg = PART_CONFIG[part]
    if part in LIBRARY_PARTS:
        impl_label = f"{part}/src/{cfg['ixx']}"
        import_line = f"import {cfg['module']};"
        scope = "unit tests that exercise every public method described in the Spec"
    else:
        impl_label = "EntryPoint/src/main.cpp"
        import_line = "import cmd_line; import dir_nav; import output;"
        scope = (
            "integration-level tests for the wiring: verify callbacks are invoked, "
            "verify help flag causes clean exit, verify summary counts are correct"
        )

    prompt = (
        f"Implement `{part}/src/test.cpp` — {scope}.\n\n"
        f"Testing conventions from Structure.md:\n"
        f"  - Each test is a bool-returning free function.\n"
        f"  - main() calls every test in sequence, prints \"PASS\" or \"FAIL\" "
        f"plus the test name, exits 0 on all-pass or 1 on any failure.\n"
        f"  - No external test framework; file is self-contained.\n"
        f"  - Begin with `{import_line}`\n"
        f"  - Do NOT use `stderr` (not in scope with `import std;`); use `std::cerr` instead.\n\n"
        f"=== {impl_label} ===\n{impl_content}\n\n"
        f"Output only the complete content of `test.cpp`."
    )
    result = strip_fence(call_claude(client, cached, prompt))
    return result, prompt


def gen_cmake(
    client: anthropic.Anthropic,
    part: str,
    cached: list[dict],
) -> tuple[str, str]:
    cfg = PART_CONFIG[part]
    if part in LIBRARY_PARTS:
        hint = (
            f"Library target: `{cfg['lib']}` (STATIC). "
            f"Module interface file: `src/{cfg['ixx']}`. "
            f"Test executable: `test_{cfg['lib']}` built from `src/test.cpp`. "
            f"CTest registration name: `{cfg['lib']}_tests`. "
            f"No target_include_directories — consumers use import, not headers."
        )
    else:
        hint = (
            "Executable target: `text_finder` built from `src/main.cpp`. "
            "Links privately against `cmd_line`, `dir_nav`, `output`. "
            "Test executable: `test_entry_point` built from `src/test.cpp`, "
            "also links privately against the three libraries. "
            "CTest registration name: `entry_point_tests`."
        )
    prompt = (
        f"Implement `{part}/CMakeLists.txt`.\n\n"
        f"{hint}\n\n"
        f"Follow the CMakeLists.txt sketches in Structure.md exactly. "
        f"Output only the complete content of `CMakeLists.txt`."
    )
    result = strip_fence(call_claude(client, cached, prompt))
    return result, prompt

# ---------------------------------------------------------------------------
# Notes.md update
# ---------------------------------------------------------------------------

def append_notes(part: str, entries: list[tuple[str, str]]) -> None:
    notes_path = PROJECT_ROOT / part / "Notes.md"
    today = date.today().isoformat()
    lines = [f"\n### {today} — Generated source files via generate_part.py\n"]
    labels = {
        "ixx":   f"Generate {PART_CONFIG[part]['ixx'] or 'main.cpp'}",
        "main":  "Generate main.cpp",
        "test":  "Generate test.cpp",
        "cmake": "Generate CMakeLists.txt",
    }
    for tag, (prompt, response) in entries:
        label = labels.get(tag, tag)
        preview = response[:300].strip().replace("\n", " ")
        if len(response) > 300:
            preview += " ..."
        lines += [
            f"**{label}**\n",
            f"*Prompt:* {prompt.strip()}\n",
            f"*Response preview:* `{preview}`\n",
        ]
    lines.append("---\n")
    with notes_path.open("a", encoding="utf-8") as f:
        f.write("\n".join(lines))
    print(f"  updated {notes_path.relative_to(PROJECT_ROOT)}")

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    if len(sys.argv) != 2 or sys.argv[1] not in PARTS:
        print(f"Usage: python generate_part.py <PartName>")
        print(f"PartName must be one of: {', '.join(sorted(PARTS))}")
        sys.exit(1)

    part = sys.argv[1]
    part_dir = PROJECT_ROOT / part

    print(f"\n=== Generating {part} ===\n")

    constitution = read_md("Constitution.md")
    structure    = read_md("Structure.md")
    spec         = read_md(f"{part}/Spec.md")
    cached       = make_cached_blocks(constitution, structure, spec, part)

    client = anthropic.Anthropic()
    log: list[tuple[str, tuple[str, str]]] = []

    if part in LIBRARY_PARTS:
        cfg = PART_CONFIG[part]

        print(f"1/3  {cfg['ixx']} ...")
        ixx, p = gen_ixx(client, part, cached)
        write_file(part_dir / "src" / cfg["ixx"], ixx)
        log.append(("ixx", (p, ixx)))

        print("2/3  test.cpp ...")
        test, p = gen_test(client, part, cached, ixx)
        write_file(part_dir / "src" / "test.cpp", test)
        log.append(("test", (p, test)))

        print("3/3  CMakeLists.txt ...")
        cmake, p = gen_cmake(client, part, cached)
        write_file(part_dir / "CMakeLists.txt", cmake)
        log.append(("cmake", (p, cmake)))

    else:  # EntryPoint
        # Collect already-generated library sources for context (optional)
        library_sources: dict[str, str] = {}
        for lib in ["CommandLine", "DirNav", "Output"]:
            ixx_path = PROJECT_ROOT / lib / "src" / PART_CONFIG[lib]["ixx"]
            if ixx_path.exists():
                library_sources[lib] = ixx_path.read_text(encoding="utf-8")
        if library_sources:
            print(f"  (found {len(library_sources)} library module(s) to include as context)")

        print("1/3  main.cpp ...")
        main_src, p = gen_main(client, cached, library_sources)
        write_file(part_dir / "src" / "main.cpp", main_src)
        log.append(("main", (p, main_src)))

        print("2/3  test.cpp ...")
        test, p = gen_test(client, part, cached, main_src)
        write_file(part_dir / "src" / "test.cpp", test)
        log.append(("test", (p, test)))

        print("3/3  CMakeLists.txt ...")
        cmake, p = gen_cmake(client, part, cached)
        write_file(part_dir / "CMakeLists.txt", cmake)
        log.append(("cmake", (p, cmake)))

    append_notes(part, log)
    print(f"\nDone.\n")


if __name__ == "__main__":
    main()
