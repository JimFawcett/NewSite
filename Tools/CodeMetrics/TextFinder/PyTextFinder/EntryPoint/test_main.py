import sys
import io
import os
import tempfile
import shutil
import contextlib
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

import unittest
from Output.output import Output
from DirNav.dir_nav import DirNav


def make_temp_dir() -> str:
    return tempfile.mkdtemp()


def _run(root: str, regex: str, pattern: str | None = None,
         recurse: bool = True) -> tuple[int, int]:
    output = Output(hide=True)
    output.set_regex(regex)
    dn = DirNav(recurse)
    dn.dir_handler = output.on_dir
    dn.file_handler = output.on_file
    if pattern is not None:
        dn.add_pattern(pattern)
    with contextlib.redirect_stdout(io.StringIO()):
        dn.visit(root)
    return (dn.file_count, output.match_count)


class TestIntegration(unittest.TestCase):

    def test_find_matching_files(self):
        root = make_temp_dir()
        try:
            with open(os.path.join(root, "a.py"), "w") as f:
                f.write("needle")
            with open(os.path.join(root, "b.py"), "w") as f:
                f.write("haystack")
            visited, matched = _run(root, "needle")
            self.assertEqual(visited, 2)
            self.assertEqual(matched, 1)
        finally:
            shutil.rmtree(root)

    def test_pattern_filters_extensions(self):
        root = make_temp_dir()
        try:
            with open(os.path.join(root, "code.py"), "w") as f:
                f.write("needle")
            with open(os.path.join(root, "notes.md"), "w") as f:
                f.write("needle")
            visited, matched = _run(root, "needle", pattern="py")
            self.assertEqual(visited, 1)
            self.assertEqual(matched, 1)
        finally:
            shutil.rmtree(root)

    def test_no_match_yields_zero(self):
        root = make_temp_dir()
        try:
            with open(os.path.join(root, "a.txt"), "w") as f:
                f.write("nothing here")
            _, matched = _run(root, "zzz_nomatch_zzz")
            self.assertEqual(matched, 0)
        finally:
            shutil.rmtree(root)

    def test_no_recurse_stays_shallow(self):
        root = make_temp_dir()
        try:
            sub = os.path.join(root, "sub")
            os.makedirs(sub)
            with open(os.path.join(root, "top.py"), "w") as f:
                f.write("needle")
            with open(os.path.join(sub, "deep.py"), "w") as f:
                f.write("needle")
            visited, matched = _run(root, "needle", recurse=False)
            self.assertEqual(visited, 1)
            self.assertEqual(matched, 1)
        finally:
            shutil.rmtree(root)

    def test_default_skips_applied(self):
        root = make_temp_dir()
        try:
            bin_dir = os.path.join(root, "bin")
            os.makedirs(bin_dir)
            with open(os.path.join(bin_dir, "hidden.py"), "w") as f:
                f.write("needle")
            with open(os.path.join(root, "visible.py"), "w") as f:
                f.write("needle")
            visited, matched = _run(root, "needle")
            self.assertEqual(visited, 1)
            self.assertEqual(matched, 1)
        finally:
            shutil.rmtree(root)

    def test_multiple_matches_accumulate(self):
        root = make_temp_dir()
        try:
            for i in range(4):
                with open(os.path.join(root, f"f{i}.txt"), "w") as f:
                    f.write("needle")
            visited, matched = _run(root, "needle")
            self.assertEqual(visited, 4)
            self.assertEqual(matched, 4)
        finally:
            shutil.rmtree(root)


if __name__ == '__main__':
    unittest.main()
