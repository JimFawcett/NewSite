import sys
import os
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from CommandLine.cmd_line import CmdLine
from DirNav.dir_nav import DirNav
from Output.output import Output


def run_tests() -> None:
    import unittest
    loader = unittest.TestLoader()
    suite = unittest.TestSuite()
    root = str(Path(__file__).parent.parent)
    discovered = loader.discover(root, pattern="test_*.py")
    suite.addTests(discovered)
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    sys.exit(0 if result.wasSuccessful() else 1)


def main() -> None:
    args = sys.argv[1:]

    if "-T" in args or "/T" in args:
        run_tests()
        return

    cl = CmdLine(args)

    if not args or cl.help:
        print(cl.help_text, end="")
        return

    if cl.verbose:
        pats = ",".join(cl.patterns) if cl.patterns else "(all files)"
        print("Options:")
        print(f"  /P  {cl.path}")
        print(f"  /r  {cl.regex}")
        print(f"  /s  {cl.recurse}")
        print(f"  /H  {cl.hide}")
        print(f"  /p  {pats}")
        print()

    if not os.path.isdir(cl.path):
        print(f"error: path does not exist: {cl.path}", file=sys.stderr)
        sys.exit(1)

    output = Output(cl.hide)
    output.set_regex(cl.regex)

    dn = DirNav(cl.recurse)
    dn.dir_handler = output.on_dir
    dn.file_handler = output.on_file

    for pat in cl.patterns:
        dn.add_pattern(pat)

    ok = dn.visit(cl.path)
    if not ok:
        print(f"error: could not traverse: {cl.path}", file=sys.stderr)
        sys.exit(1)

    print(f"\n{dn.file_count} file(s) visited, {output.match_count} file(s) matched")


if __name__ == "__main__":
    main()
