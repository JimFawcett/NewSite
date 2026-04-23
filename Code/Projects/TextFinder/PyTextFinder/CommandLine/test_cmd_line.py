import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

import unittest
from CommandLine.cmd_line import CmdLine


class TestCmdLine(unittest.TestCase):

    def test_default_path(self):
        self.assertEqual(CmdLine([]).path, ".")

    def test_default_regex(self):
        self.assertEqual(CmdLine([]).regex, ".")

    def test_default_recurse(self):
        self.assertTrue(CmdLine([]).recurse)

    def test_default_hide(self):
        self.assertTrue(CmdLine([]).hide)

    def test_default_verbose_false(self):
        self.assertFalse(CmdLine([]).verbose)

    def test_default_help_false(self):
        self.assertFalse(CmdLine([]).help)

    def test_default_patterns_empty(self):
        self.assertEqual(CmdLine([]).patterns, [])

    def test_set_path(self):
        self.assertEqual(CmdLine(["-P", "/tmp"]).path, "/tmp")

    def test_set_regex(self):
        self.assertEqual(CmdLine(["-r", "foo"]).regex, "foo")

    def test_set_recurse_false(self):
        self.assertFalse(CmdLine(["-s", "false"]).recurse)

    def test_set_hide_false(self):
        self.assertFalse(CmdLine(["-H", "false"]).hide)

    def test_verbose_flag(self):
        self.assertTrue(CmdLine(["-v"]).verbose)

    def test_help_flag(self):
        self.assertTrue(CmdLine(["-h"]).help)

    def test_patterns_flag(self):
        cl = CmdLine(["-p", "py,txt"])
        self.assertEqual(len(cl.patterns), 2)
        self.assertEqual(cl.patterns[0], "py")
        self.assertEqual(cl.patterns[1], "txt")

    def test_implicit_true(self):
        self.assertTrue(CmdLine(["-v", "-h"]).verbose)

    def test_slash_prefix(self):
        self.assertTrue(CmdLine(["/h"]).help)

    def test_help_text_not_empty(self):
        self.assertGreater(len(CmdLine([]).help_text), 0)

    def test_unknown_token_ignored(self):
        self.assertEqual(CmdLine(["unknown"]).path, ".")


if __name__ == '__main__':
    unittest.main()
