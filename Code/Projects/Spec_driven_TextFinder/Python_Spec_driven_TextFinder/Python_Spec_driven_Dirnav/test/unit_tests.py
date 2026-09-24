# unit_tests.py - unit suite for python_textfinder_dirnav, per Spec_Python_TextFinder_Dirnav.md

import os
import re
import sys
import tempfile
import unittest

from python_textfinder_cmdline import ProgramCommands
from python_textfinder_dirnav import Dirnav, Output

SKIPS = ("archive", ".git", ".svn", ".hg", "build", "out", "target",
         "bin", "obj", "__pycache__", "node_modules")

TREE = {
    "a.txt": b"alpha\nbeta\ngamma\n",
    "b.py": b"def one():\r\n    pass\r\n",
    "c.md": b"cr-one\rcr-two",
    "empty.txt": b"",
    "bom.txt": b"\xef\xbb\xbfwith bom\n",
    "binary.bin": b"\x00\x01\x02",
    "latin.txt": b"\xff\xfe not utf eight",
    ".gitignore": b"ignored\n",
    "noext": b"plain\n",
    "sub/d.txt": b"deep\n",
    "build/hidden.txt": b"pruned\n",
}


class Recorder:
    def __init__(self):
        self.lines = []

    def output(self, text: str) -> None:
        self.lines.append(text)


def write_tree(base, files):
    for name, content in files.items():
        path = os.path.join(base, name.replace("/", os.sep))
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "wb") as target:
            target.write(content)


def run(roots, **options):
    commands = ProgramCommands(**options)
    recorder = Recorder()
    dirnav = Dirnav(recorder, SKIPS, commands)
    for root in roots:
        dirnav.search(root)
    dirnav.emit_run_summary()
    return recorder.lines


def run_on_bytes(content, name="f.txt", **options):
    with tempfile.TemporaryDirectory() as base:
        write_tree(base, {name: content})
        return run([os.path.join(base, name)], **options)


class Protocol(unittest.TestCase):
    def test_recorder_satisfies_output_structurally(self):
        self.assertIsInstance(Recorder(), Output)

    def test_an_object_without_the_method_does_not(self):
        self.assertNotIsInstance(object(), Output)


class Construction(unittest.TestCase):
    def test_bad_expression_raises_re_error(self):
        with self.assertRaises(re.error):
            Dirnav(Recorder(), SKIPS, ProgramCommands(regex_text="("))

    def test_expression_is_compiled_once_and_reused(self):
        lines = run_on_bytes(b"one\ntwo\n", regex_text="o",
                             line_numbers=True)
        self.assertEqual(lines[1:3], ["  1", "  2"])


class Traversal(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.holder = tempfile.TemporaryDirectory()
        cls.base = cls.holder.name
        write_tree(os.path.join(cls.base, "tree"), TREE)
        cls.origin = os.getcwd()
        os.chdir(cls.base)

    @classmethod
    def tearDownClass(cls):
        os.chdir(cls.origin)
        cls.holder.cleanup()

    def test_default_run_reports_every_non_empty_file_and_prunes_build(self):
        lines = run(["tree"])
        self.assertIn("tree/a.txt", lines)
        self.assertIn("tree/sub/d.txt", lines)
        self.assertNotIn("tree/build/hidden.txt", lines)
        self.assertNotIn("tree/empty.txt", lines)
        self.assertEqual(lines[-1], "accessed 10 files, 2 directories")

    def test_no_content_case_opens_nothing_so_a_binary_file_still_matches(self):
        lines = run(["tree"])
        self.assertIn("tree/binary.bin", lines)
        self.assertIn("tree/latin.txt", lines)

    def test_no_content_case_emits_no_file_announcement(self):
        lines = run(["tree"], suppress_on_no_match=False)
        self.assertFalse([line for line in lines
                          if line.startswith(("searched ", "skipped "))])

    def test_recursion_off_stops_at_the_root(self):
        lines = run(["tree"], recurse=False)
        self.assertIn("tree/a.txt", lines)
        self.assertNotIn("tree/sub/d.txt", lines)
        self.assertEqual(lines[-1], "accessed 9 files, 1 directories")

    def test_extension_filter_selects_by_last_dot_suffix(self):
        lines = run(["tree"], extensions=["txt"])
        self.assertIn("tree/a.txt", lines)
        self.assertNotIn("tree/b.py", lines)
        self.assertNotIn("tree/noext", lines)
        self.assertEqual(lines[-1], "accessed 5 files, 2 directories")

    def test_dot_file_extension_is_the_text_after_the_dot(self):
        lines = run(["tree"], extensions=["gitignore"])
        self.assertIn("tree/.gitignore", lines)
        self.assertEqual(lines[-1], "accessed 1 files, 2 directories")

    def test_empty_extension_list_searches_files_with_no_extension(self):
        lines = run(["tree"], extensions=[], regex_text="plain",
                    suppress_on_no_match=True)
        self.assertIn("tree/noext", lines)

    def test_skip_list_prunes_the_subtree_and_does_not_count_it(self):
        lines = run(["tree"], extensions=["txt"], recurse=True)
        self.assertNotIn("tree/build/hidden.txt", lines)
        self.assertEqual(lines[-1], "accessed 5 files, 2 directories")

    def test_skip_list_never_applies_to_a_root(self):
        lines = run(["tree/build"])
        self.assertIn("tree/build/hidden.txt", lines)
        self.assertEqual(lines[-1], "accessed 1 files, 1 directories")

    def test_root_of_dot_contributes_no_leading_prefix(self):
        os.chdir(os.path.join(self.base, "tree"))
        try:
            lines = run(["."], extensions=["txt"])
        finally:
            os.chdir(self.base)
        self.assertIn("a.txt", lines)
        self.assertIn("sub/d.txt", lines)

    def test_backslash_in_a_root_renders_as_a_slash(self):
        lines = run([r"tree\sub"])
        self.assertIn("tree/sub/d.txt", lines)

    def test_root_that_is_a_regular_file_is_searched_and_filtered(self):
        self.assertIn("tree/a.txt", run(["tree/a.txt"]))
        self.assertNotIn("tree/a.txt", run(["tree/a.txt"], extensions=["py"]))

    def test_counts_accumulate_over_roots_and_are_written_once(self):
        lines = run(["tree/sub", "tree/sub"])
        self.assertEqual(len([line for line in lines
                              if line.startswith("accessed ")]), 1)
        self.assertEqual(lines[-1], "accessed 2 files, 2 directories")

    def test_missing_root_is_announced_and_counted_as_nothing(self):
        lines = run(["tree/absent"])
        self.assertEqual(lines, ["cannot open tree/absent",
                                 "accessed 0 files, 0 directories"])

    def test_root_carrying_a_surrogate_is_announced_with_replacement(self):
        lines = run(["tree/\udc80bad"])
        self.assertEqual(lines, ["cannot open tree/�bad",
                                 "accessed 0 files, 0 directories"])

    def test_announcements_and_summary_ignore_the_hide_switch(self):
        lines = run(["tree/absent"], suppress_on_no_match=True)
        self.assertIn("cannot open tree/absent", lines)


class Announcements(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.holder = tempfile.TemporaryDirectory()
        cls.base = cls.holder.name
        write_tree(os.path.join(cls.base, "tree"), TREE)
        cls.origin = os.getcwd()
        os.chdir(cls.base)

    @classmethod
    def tearDownClass(cls):
        os.chdir(cls.origin)
        cls.holder.cleanup()

    def test_hide_true_leaves_only_blocks(self):
        lines = run(["tree"], regex_text="alpha", extensions=["txt"])
        self.assertEqual(lines, ["tree/a.txt", "accessed 5 files, 2 directories"])

    def test_hide_false_announces_every_examined_file_exactly_once(self):
        lines = run(["tree"], regex_text="alpha", extensions=["txt"],
                    suppress_on_no_match=False)
        self.assertIn("tree/a.txt", lines)
        self.assertIn("searched tree/bom.txt", lines)
        self.assertIn("searched tree/empty.txt", lines)
        self.assertIn("searched tree/sub/d.txt", lines)
        self.assertIn("skipped tree/latin.txt", lines)
        self.assertEqual(len(lines), 6)

    def test_a_matching_file_is_never_also_announced(self):
        lines = run(["tree"], regex_text="alpha", extensions=["txt"],
                    suppress_on_no_match=False)
        self.assertNotIn("searched tree/a.txt", lines)

    def test_binary_file_is_skipped_by_the_nul_test(self):
        lines = run(["tree/binary.bin"], regex_text="x",
                    suppress_on_no_match=False)
        self.assertEqual(lines[0], "skipped tree/binary.bin")

    def test_invalid_utf8_without_a_nul_is_skipped_by_the_utf8_test(self):
        lines = run(["tree/latin.txt"], regex_text="x",
                    suppress_on_no_match=False)
        self.assertEqual(lines[0], "skipped tree/latin.txt")

    def test_file_above_the_size_limit_is_announced_and_counted(self):
        with tempfile.TemporaryDirectory() as base:
            path = os.path.join(base, "big.txt")
            with open(path, "wb") as target:
                target.write(b"x" * 10_485_761)
            lines = run([path], regex_text="x")
        self.assertTrue(lines[0].startswith("too large "))
        self.assertEqual(lines[-1], "accessed 1 files, 0 directories")

    def test_file_at_the_size_limit_is_searched(self):
        with tempfile.TemporaryDirectory() as base:
            path = os.path.join(base, "big.txt")
            with open(path, "wb") as target:
                target.write(b"x" * 10_485_760)
            lines = run([path], regex_text="x")
        self.assertFalse(lines[0].startswith("too large "))


class LineSplitting(unittest.TestCase):
    def numbers(self, content, pattern="."):
        lines = run_on_bytes(content, regex_text=pattern,
                             line_numbers=True, matched_line=True)
        return lines[1:-1]

    def test_line_feed(self):
        self.assertEqual(self.numbers(b"one\ntwo\n"), ["  1 - one", "  2 - two"])

    def test_carriage_return_line_feed_is_one_terminator(self):
        self.assertEqual(self.numbers(b"one\r\ntwo\r\n"),
                         ["  1 - one", "  2 - two"])

    def test_bare_carriage_return(self):
        self.assertEqual(self.numbers(b"one\rtwo\r"),
                         ["  1 - one", "  2 - two"])

    def test_final_line_without_a_terminator_is_a_line(self):
        self.assertEqual(self.numbers(b"one\ntwo"), ["  1 - one", "  2 - two"])

    def test_mixed_terminators(self):
        self.assertEqual(self.numbers(b"one\rtwo\r\nthree\nfour"),
                         ["  1 - one", "  2 - two", "  3 - three", "  4 - four"])

    def test_an_empty_line_is_a_line(self):
        self.assertEqual(self.numbers(b"one\n\ntwo\n", pattern="^"),
                         ["  1 - one", "  2 - ", "  3 - two"])

    def test_form_feed_does_not_terminate_a_line(self):
        self.assertEqual(self.numbers(b"one\x0ctwo\n"), ["  1 - one\x0ctwo"])

    def test_next_line_does_not_terminate_a_line(self):
        self.assertEqual(self.numbers("one\u0085two\n".encode()),
                         ["  1 - one\u0085two"])

    def test_line_separator_does_not_terminate_a_line(self):
        self.assertEqual(self.numbers("one two\n".encode()),
                         ["  1 - one two"])

    def test_empty_file_yields_no_lines(self):
        lines = run_on_bytes(b"", regex_text="^", suppress_on_no_match=False)
        self.assertTrue(lines[0].startswith("searched "))

    def test_line_numbers_count_lines_that_do_not_match(self):
        self.assertEqual(self.numbers(b"no\nyes\nno\n", pattern="yes"),
                         ["  2 - yes"])

    def test_leading_bom_is_not_part_of_the_first_line(self):
        self.assertEqual(self.numbers(b"\xef\xbb\xbfone\n"), ["  1 - one"])

    def test_bom_further_in_is_kept(self):
        self.assertEqual(self.numbers(b"one\n\xef\xbb\xbftwo\n"),
                         ["  1 - one", "  2 - ﻿two"])


class BlockForm(unittest.TestCase):
    def test_no_detail_switch_gives_the_path_line_alone(self):
        lines = run_on_bytes(b"x\nx\nx\n", regex_text="x")
        self.assertEqual(len(lines), 2)
        self.assertTrue(lines[0].endswith("f.txt"))

    def test_line_numbers_alone(self):
        lines = run_on_bytes(b"x\ny\nx\n", regex_text="x", line_numbers=True)
        self.assertEqual(lines[1:-1], ["  1", "  3"])

    def test_matched_line_alone(self):
        lines = run_on_bytes(b"ax\nb\ncx\n", regex_text="x", matched_line=True)
        self.assertEqual(lines[1:-1], ["  ax", "  cx"])

    def test_both_fields_are_joined_by_space_hyphen_space(self):
        lines = run_on_bytes(b"ax\n", regex_text="x",
                             line_numbers=True, matched_line=True)
        self.assertEqual(lines[1], "  1 - ax")

    def test_detail_line_is_indented_exactly_two_spaces(self):
        lines = run_on_bytes(b"ax\n", regex_text="x", matched_line=True)
        self.assertEqual(lines[1][:3], "  a")

    def test_one_detail_line_per_matching_line_however_many_occurrences(self):
        lines = run_on_bytes(b"xxx\n", regex_text="x", line_numbers=True)
        self.assertEqual(lines[1:-1], ["  1"])

    def test_path_is_written_once_for_many_matches(self):
        lines = run_on_bytes(b"x\nx\n", regex_text="x", line_numbers=True)
        self.assertEqual(len([line for line in lines
                              if line.endswith("f.txt")]), 1)

    def test_search_is_anywhere_in_the_line_not_anchored(self):
        lines = run_on_bytes(b"prefix-target-suffix\n", regex_text="target")
        self.assertEqual(len(lines), 2)

    def test_summary_is_the_last_line(self):
        lines = run_on_bytes(b"x\n", regex_text="x")
        self.assertEqual(lines[-1], "accessed 1 files, 0 directories")

    def test_summary_inflects_neither_noun(self):
        lines = run_on_bytes(b"x\n", regex_text="x")
        self.assertIn(" files, ", lines[-1])
        self.assertTrue(lines[-1].endswith(" directories"))

    def test_summary_carries_no_grouping_separator(self):
        lines = run_on_bytes(b"x\n", regex_text="x")
        self.assertNotIn(",", lines[-1].replace(" files,", ""))


if __name__ == "__main__":
    result = unittest.main(exit=False, verbosity=1).result
    sys.exit(len(result.failures) + len(result.errors))
