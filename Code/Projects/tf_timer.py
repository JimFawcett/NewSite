#!/usr/bin/env python3
"""
tf_timer.py — time a TextFinder run and report file counts + elapsed time.

Usage:
    python tf_timer.py <program> [TextFinder options ...]

<program>: PyTextFinder | CsTextFinder | CppTextFinder | RustTextFinder | RustTextFinderOpt
All remaining arguments are forwarded to the chosen program.

Example:
    python tf_timer.py PyTextFinder /P . /p py /r "def "
"""

import re
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).parent

KNOWN = ["PyTextFinder", "CsTextFinder", "CppTextFinder", "RustTextFinder", "RustTextFinderOpt"]


def _dash_to_slash(args):
    """Convert -X flag tokens to /X for programs that only accept slash prefixes.
    Safe to call for subprocess args because subprocess.run bypasses the shell,
    so /X reaches the binary literally without MSYS2 path conversion."""
    result = []
    for a in args:
        if len(a) == 2 and a[0] == "-" and a[1].isalpha():
            result.append("/" + a[1])
        else:
            result.append(a)
    return result


def _first_existing(*paths):
    for p in paths:
        if Path(p).exists():
            return Path(p)
    return None


def resolve_command(prog_name, tf_args):
    """Return (cmd_list, warning_or_None). cmd_list is None on hard error."""

    if prog_name == "PyTextFinder":
        entry = ROOT / "PyTextFinder" / "EntryPoint" / "PyTextFinder.py"
        return ["python", str(entry)] + tf_args, None

    if prog_name == "CsTextFinder":
        exe = _first_existing(
            ROOT / "CsTextFinder/EntryPoint/bin/Release/net10.0/CsTextFinder.exe",
            ROOT / "CsTextFinder/EntryPoint/bin/Debug/net10.0/CsTextFinder.exe",
        )
        if exe:
            return [str(exe)] + tf_args, None
        return (
            ["dotnet", "run", "--project",
             str(ROOT / "CsTextFinder" / "EntryPoint"), "--"] + tf_args,
            "no pre-built exe found — using 'dotnet run' (includes JIT warmup)",
        )

    if prog_name == "CppTextFinder":
        exe = _first_existing(
            ROOT / "CppTextFinder/build/EntryPoint/Release/text_finder.exe",
            ROOT / "CppTextFinder/build/EntryPoint/Release/text_finder",
            ROOT / "CppTextFinder/build/EntryPoint/Debug/text_finder.exe",
            ROOT / "CppTextFinder/build/EntryPoint/Debug/text_finder",
        )
        if exe:
            return [str(exe)] + tf_args, None
        return None, "no built executable found — run 'cmake --build' inside CppTextFinder/build first"

    if prog_name == "RustTextFinder":
        exe = _first_existing(
            ROOT / "rs_textfinder/RustTextFinder/target/release/text_finder.exe",
            ROOT / "rs_textfinder/RustTextFinder/target/release/text_finder",
            ROOT / "rs_textfinder/RustTextFinder/target/debug/text_finder.exe",
            ROOT / "rs_textfinder/RustTextFinder/target/debug/text_finder",
        )
        if exe:
            return [str(exe)] + _dash_to_slash(tf_args), None
        manifest = ROOT / "rs_textfinder" / "RustTextFinder" / "Cargo.toml"
        return (
            ["cargo", "run", "--release",
             "--manifest-path", str(manifest), "--"] + tf_args,
            "no pre-built exe — using 'cargo run --release' (includes compile check)",
        )

    if prog_name == "RustTextFinderOpt":
        exe = _first_existing(
            ROOT / "rs_textfinder_opt/RustTextFinder/target/release/text_finder.exe",
            ROOT / "rs_textfinder_opt/RustTextFinder/target/release/text_finder",
            ROOT / "rs_textfinder_opt/RustTextFinder/target/debug/text_finder.exe",
            ROOT / "rs_textfinder_opt/RustTextFinder/target/debug/text_finder",
        )
        if exe:
            return [str(exe)] + _dash_to_slash(tf_args), None
        manifest = ROOT / "rs_textfinder_opt" / "RustTextFinder" / "Cargo.toml"
        return (
            ["cargo", "run", "--release",
             "--manifest-path", str(manifest), "--"] + tf_args,
            "no pre-built exe — using 'cargo run --release' (includes compile check)",
        )

    return None, f"unknown program '{prog_name}' — choose from: {', '.join(KNOWN)}"


def main():
    if len(sys.argv) < 2 or sys.argv[1] in ("-h", "--help"):
        print("usage: python tf_timer.py <program> [options ...]")
        print(f"  program : {' | '.join(KNOWN)}")
        print("  options : any TextFinder flags, e.g. /P . /p py /r \"def \"")
        sys.exit(0)

    prog_name = sys.argv[1]
    tf_args   = sys.argv[2:]

    cmd, warn = resolve_command(prog_name, tf_args)
    if cmd is None:
        print(f"error: {warn}")
        sys.exit(1)
    if warn:
        print(f"note: {warn}")

    t0 = time.perf_counter()
    result = subprocess.run(cmd, capture_output=True, text=True)
    elapsed = time.perf_counter() - t0

    combined = (result.stdout or "") + (result.stderr or "")
    m = re.search(r"(\d+)\s+file\(s\)\s+visited,\s+(\d+)\s+file\(s\)\s+matched", combined)
    if m:
        print(f"files visited : {m.group(1)}")
        print(f"files matched : {m.group(2)}")
    else:
        # Rust TextFinder format: "processed N files in M dirs"
        # Matched files are each listed on their own quoted line, e.g.  "foo.rs"
        m2 = re.search(r"processed\s+(\d+)\s+files?\s+in\s+\d+\s+dirs?", combined)
        if m2:
            matched = len(re.findall(r'^\s+"[^"]+"\s*$', combined, re.MULTILINE))
            print(f"files visited : {m2.group(1)}")
            print(f"files matched : {matched}")
        else:
            print("(could not parse file counts from output)")
            if combined.strip():
                print(combined.strip())

    print(f"elapsed       : {elapsed:.4f} s")

    if result.returncode != 0:
        sys.exit(result.returncode)


if __name__ == "__main__":
    main()
