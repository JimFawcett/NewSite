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


def make_temp_dir() -> str:
    return tempfile.mkdtemp()


class TestOutput(unittest.TestCase):

    def test_default_match_count_zero(self):
        self.assertEqual(Output().match_count, 0)

    def test_match_count_increments(self):
        d = make_temp_dir()
        try:
            path = os.path.join(d, "f.txt")
            with open(path, "w") as fh:
                fh.write("hello world")
            out = Output()
            out.set_regex("hello")
            with contextlib.redirect_stdout(io.StringIO()):
                out.on_dir(d.replace("\\", "/"))
                out.on_file("f.txt")
            self.assertEqual(out.match_count, 1)
        finally:
            shutil.rmtree(d)

    def test_no_match_no_count(self):
        d = make_temp_dir()
        try:
            path = os.path.join(d, "f.txt")
            with open(path, "w") as fh:
                fh.write("hello world")
            out = Output()
            out.set_regex("zzz_nomatch_zzz")
            with contextlib.redirect_stdout(io.StringIO()):
                out.on_dir(d.replace("\\", "/"))
                out.on_file("f.txt")
            self.assertEqual(out.match_count, 0)
        finally:
            shutil.rmtree(d)

    def test_regex_filters_files(self):
        d = make_temp_dir()
        try:
            with open(os.path.join(d, "a.txt"), "w") as fh:
                fh.write("apple")
            with open(os.path.join(d, "b.txt"), "w") as fh:
                fh.write("banana")
            out = Output()
            out.set_regex("apple")
            with contextlib.redirect_stdout(io.StringIO()):
                out.on_dir(d.replace("\\", "/"))
                out.on_file("a.txt")
                out.on_file("b.txt")
            self.assertEqual(out.match_count, 1)
        finally:
            shutil.rmtree(d)

    def test_on_dir_resets_across_dirs(self):
        d1 = make_temp_dir()
        d2 = make_temp_dir()
        try:
            with open(os.path.join(d1, "f1.txt"), "w") as fh:
                fh.write("match")
            with open(os.path.join(d2, "f2.txt"), "w") as fh:
                fh.write("match")
            out = Output()
            out.set_regex("match")
            with contextlib.redirect_stdout(io.StringIO()):
                out.on_dir(d1.replace("\\", "/"))
                out.on_file("f1.txt")
                out.on_dir(d2.replace("\\", "/"))
                out.on_file("f2.txt")
            self.assertEqual(out.match_count, 2)
        finally:
            shutil.rmtree(d1)
            shutil.rmtree(d2)

    def test_unreadable_file_skipped(self):
        out = Output()
        out.set_regex(".")
        with contextlib.redirect_stdout(io.StringIO()):
            out.on_dir("C:/")
            out.on_file("___nonexistent_xyz.txt")
        self.assertEqual(out.match_count, 0)

    def test_invalid_regex_falls_back(self):
        d = make_temp_dir()
        try:
            with open(os.path.join(d, "f.txt"), "w") as fh:
                fh.write("hello")
            out = Output()
            out.set_regex("[invalid")
            with contextlib.redirect_stdout(io.StringIO()):
                out.on_dir(d.replace("\\", "/"))
                out.on_file("f.txt")
            self.assertEqual(out.match_count, 1)
        finally:
            shutil.rmtree(d)


if __name__ == '__main__':
    unittest.main()
