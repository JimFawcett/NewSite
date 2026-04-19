import sys
import os
import tempfile
import shutil
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

import unittest
from DirNav.dir_nav import DirNav


def make_temp_dir() -> str:
    return tempfile.mkdtemp()


class TestDirNav(unittest.TestCase):

    def test_visit_nonexistent(self):
        dn = DirNav()
        self.assertFalse(dn.visit(os.path.join(tempfile.gettempdir(), "___nonexistent___xyz_999")))

    def test_visit_existing_dir(self):
        root = make_temp_dir()
        try:
            self.assertTrue(DirNav().visit(root))
        finally:
            shutil.rmtree(root)

    def test_dir_handler_fires(self):
        root = make_temp_dir()
        try:
            dirs: list[str] = []
            dn = DirNav()
            dn.dir_handler = dirs.append
            dn.visit(root)
            self.assertEqual(len(dirs), 1)
            self.assertEqual(dirs[0], root.replace("\\", "/"))
        finally:
            shutil.rmtree(root)

    def test_file_handler_fires(self):
        root = make_temp_dir()
        try:
            Path(root, "a.txt").touch()
            Path(root, "b.txt").touch()
            files: list[str] = []
            dn = DirNav()
            dn.file_handler = files.append
            dn.visit(root)
            self.assertEqual(len(files), 2)
        finally:
            shutil.rmtree(root)

    def test_pattern_filtering(self):
        root = make_temp_dir()
        try:
            Path(root, "a.py").touch()
            Path(root, "b.txt").touch()
            Path(root, "c.md").touch()
            files: list[str] = []
            dn = DirNav()
            dn.file_handler = files.append
            dn.add_pattern("py")
            dn.visit(root)
            self.assertEqual(len(files), 1)
            self.assertEqual(files[0], "a.py")
        finally:
            shutil.rmtree(root)

    def test_default_skips_bin(self):
        self._assert_skips_dir("bin")

    def test_default_skips_target(self):
        self._assert_skips_dir("target")

    def test_default_skips_pycache(self):
        self._assert_skips_dir("__pycache__")

    def _assert_skips_dir(self, skip_name: str):
        root = make_temp_dir()
        try:
            skip_dir = os.path.join(root, skip_name)
            os.makedirs(skip_dir, exist_ok=True)
            Path(skip_dir, "hidden.py").touch()
            Path(root, "visible.py").touch()
            files: list[str] = []
            dn = DirNav()
            dn.file_handler = files.append
            dn.visit(root)
            self.assertEqual(len(files), 1)
            self.assertEqual(files[0], "visible.py")
        finally:
            shutil.rmtree(root)

    def test_add_skip_works(self):
        root = make_temp_dir()
        try:
            sub = os.path.join(root, "custom_skip")
            os.makedirs(sub)
            Path(sub, "hidden.py").touch()
            Path(root, "visible.py").touch()
            files: list[str] = []
            dn = DirNav()
            dn.file_handler = files.append
            dn.add_skip("custom_skip")
            dn.visit(root)
            self.assertEqual(len(files), 1)
            self.assertEqual(files[0], "visible.py")
        finally:
            shutil.rmtree(root)

    def test_no_recurse(self):
        root = make_temp_dir()
        try:
            sub = os.path.join(root, "sub")
            os.makedirs(sub)
            Path(sub, "deep.py").touch()
            Path(root, "top.py").touch()
            files: list[str] = []
            dn = DirNav(recurse=False)
            dn.file_handler = files.append
            dn.visit(root)
            self.assertEqual(len(files), 1)
            self.assertEqual(files[0], "top.py")
        finally:
            shutil.rmtree(root)

    def test_counters_are_reset(self):
        root = make_temp_dir()
        try:
            Path(root, "a.py").touch()
            dn = DirNav()
            dn.visit(root)
            first = dn.file_count
            dn.visit(root)
            self.assertEqual(dn.file_count, first)
        finally:
            shutil.rmtree(root)

    def test_file_count_correct(self):
        root = make_temp_dir()
        try:
            for i in range(5):
                Path(root, f"f{i}.txt").touch()
            dn = DirNav()
            dn.visit(root)
            self.assertEqual(dn.file_count, 5)
        finally:
            shutil.rmtree(root)


if __name__ == '__main__':
    unittest.main()
