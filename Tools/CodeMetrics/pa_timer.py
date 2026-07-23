#!/usr/bin/env python3
"""
pa_timer.py — benchmark the four PageValidator implementations.

Runs each validator against an HTML directory tree, discards the first
(warm-up) run, then reports min / median / max over the remaining runs.

Usage:
    python pa_timer.py [--site PATH] [--runs N]

Options:
    --site PATH  Root directory to scan for HTML files
                 (default: two levels above this script = NewSite root)
    --runs N     Number of timed runs per validator (default: 20)
"""

import argparse
import re
import statistics
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent
BASE = ROOT / "PageValidator"
DEFAULT_SITE = ROOT.parent.parent   # …/NewSite/Code/Projects/../../ = NewSite


def build_validators(site: Path) -> list[tuple[str, list[str]]]:
    return [
        (
            "Rust (Release)",
            [
                str(BASE / "rs_page_validator/target/release/rs_page_validator.exe"),
                "-r", "-q", "-s", str(site),
            ],
        ),
        (
            "C++ (Release)",
            [
                str(BASE / "CppPageValidator/build/entry_point/Release/page_validator.exe"),
                "-r", "-q", "-s", str(site),
            ],
        ),
        (
            "C# (Release)",
            [
                str(BASE / "CsPageValidator/EntryPoint/bin/Release/net10.0/page_validator.exe"),
                "-r", "-q", "-s", str(site),
            ],
        ),
        (
            "Python",
            [
                sys.executable,
                str(BASE / "PyPageValidator/EntryPoint/page_validator.py"),
                "-r", "-q", "-s", str(site),
            ],
        ),
    ]


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Benchmark the four PageValidator implementations."
    )
    parser.add_argument(
        "--site", default=str(DEFAULT_SITE),
        help=f"Root directory to scan for HTML files (default: {DEFAULT_SITE})"
    )
    parser.add_argument(
        "--runs", type=int, default=20,
        help="Number of timed runs per validator (default: 20)"
    )
    args = parser.parse_args()

    site = Path(args.site).resolve()
    runs = args.runs

    if not site.is_dir():
        print(f"error: {site} is not a directory", file=sys.stderr)
        sys.exit(1)

    print(f"Site: {site}")
    print(f"Runs: {runs}  (first discarded as warm-up)\n")
    print(f"{'Validator':<18}  {'min':>7}  {'median':>7}  {'max':>7}  {'files':>6}  {'failed':>7}")
    print("-" * 62)

    for label, cmd in build_validators(site):
        exe = Path(cmd[0])
        if not exe.exists():
            print(f"{label:<18}  executable not found: {cmd[0]}")
            continue

        times: list[float] = []
        files = failed = 0

        for i in range(runs + 1):          # run 0 is the discard warm-up
            t0 = time.perf_counter()
            result = subprocess.run(cmd, capture_output=True, text=True)
            elapsed = time.perf_counter() - t0
            if i == 0:
                continue                   # discard warm-up run
            times.append(elapsed)
            if files == 0:
                m = re.search(
                    r"(\d+)\s+passed,\s+(\d+)\s+failed",
                    result.stdout + result.stderr,
                )
                if m:
                    files  = int(m.group(1)) + int(m.group(2))
                    failed = int(m.group(2))

        mn  = min(times)
        med = statistics.median(times)
        mx  = max(times)
        print(
            f"{label:<18}  {mn:>6.3f}s  {med:>6.3f}s  {mx:>6.3f}s"
            f"  {files:>6}  {failed:>7}"
        )


if __name__ == "__main__":
    main()
