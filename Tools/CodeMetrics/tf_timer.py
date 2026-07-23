#!/usr/bin/env python3
"""
tf_timer.py — benchmark a TextFinder run and report file counts + timing.

Discards the first (warm-up) run, then reports min / median / max over
the remaining timed runs.

Usage:
    python tf_timer.py <program> [--runs N] [TextFinder options ...]

<program>: PyTextFinder | CsTextFinder | CppTextFinder | RustTextFinder | RustTextFinderOpt
--runs N : number of timed runs after discarding warm-up (default: 20)
All remaining arguments are forwarded to the chosen program.

Example:
    python tf_timer.py PyTextFinder /P . /p py /r "def "
    python tf_timer.py CppTextFinder --runs 10 /P . /p cpp /r "class "
"""

import re
import statistics
import subprocess
import sys
import time
from pathlib import Path

ROOT  = Path(__file__).resolve().parent / "TextFinder"
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


def _parse_counts(combined: str) -> tuple[str, str] | None:
    """Return (visited, matched) strings, or None if unparseable."""
    m = re.search(r"(\d+)\s+file\(s\)\s+visited,\s+(\d+)\s+file\(s\)\s+matched", combined)
    if m:
        return m.group(1), m.group(2)
    m2 = re.search(r"processed\s+(\d+)\s+files?\s+in\s+\d+\s+dirs?", combined)
    if m2:
        matched = str(len(re.findall(r'^\s+"[^"]+"\s*$', combined, re.MULTILINE)))
        return m2.group(1), matched
    return None


def main():
    if len(sys.argv) < 2 or sys.argv[1] in ("-h", "--help"):
        print("usage: python tf_timer.py <program> [--runs N] [options ...]")
        print(f"  program : {' | '.join(KNOWN)}")
        print("  --runs N : timed runs after warm-up discard (default: 20)")
        print("  options : any TextFinder flags, e.g. /P . /p py /r \"def \"")
        sys.exit(0)

    prog_name = sys.argv[1]

    # Pull --runs N out of the remaining args before forwarding to the program
    runs = 20
    remaining: list[str] = []
    it = iter(sys.argv[2:])
    for a in it:
        if a == "--runs":
            try:
                runs = int(next(it))
            except (StopIteration, ValueError):
                print("error: --runs requires an integer argument", file=sys.stderr)
                sys.exit(1)
        else:
            remaining.append(a)
    tf_args = remaining

    cmd, warn = resolve_command(prog_name, tf_args)
    if cmd is None:
        print(f"error: {warn}")
        sys.exit(1)
    if warn:
        print(f"note: {warn}")

    times: list[float] = []
    counts: tuple[str, str] | None = None

    for i in range(runs + 1):              # run 0 is the discard warm-up
        t0     = time.perf_counter()
        result = subprocess.run(cmd, capture_output=True, text=True)
        elapsed = time.perf_counter() - t0
        if i == 0:
            continue                       # discard warm-up run
        times.append(elapsed)
        if counts is None:
            combined = (result.stdout or "") + (result.stderr or "")
            counts = _parse_counts(combined)

    if counts:
        print(f"files visited : {counts[0]}")
        print(f"files matched : {counts[1]}")
    else:
        print("(could not parse file counts from output)")

    print(f"runs          : {runs}  (first discarded as warm-up)")
    print(f"min           : {min(times):.4f} s")
    print(f"median        : {statistics.median(times):.4f} s")
    print(f"max           : {max(times):.4f} s")

    if result.returncode != 0:
        sys.exit(result.returncode)


if __name__ == "__main__":
    main()
