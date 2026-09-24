# integration_tests.py - drives the assembled program end to end, covering the Entry binary

import ast
import os
import subprocess
import sys
import tempfile
import unittest

HERE = os.path.dirname(os.path.abspath(__file__))
IMPLEMENTATION = os.path.dirname(HERE)
FIXTURE = os.path.join(os.path.dirname(IMPLEMENTATION), "Fixture")
FLOOR = (3, 10)

SOURCE_FOLDERS = [
    os.path.join(IMPLEMENTATION, component, "src")
    for component in ("Python_Spec_driven_Cmdline", "Python_Spec_driven_Dirnav",
                      "Python_Spec_driven_Output",
                      "Python_Spec_driven_TextFinder_Entry")
]

SCRATCH_TREE = {
    "one.txt": b"alpha\nbeta\n",
    "two.txt": b"gamma\n",
    "sub/three.txt": b"alpha\n",
    "build/skipped.txt": b"alpha\n",
}

NINE_OPTIONS = ("/P .\n/p\n/r .\n/s true\n/h true\n/v false\n"
                "/H false\n/n false\n/L false\n")


class Result:
    def __init__(self, completed):
        self.code = completed.returncode
        self.out_bytes = completed.stdout
        self.err_bytes = completed.stderr
        self.out = completed.stdout.decode("utf-8")
        self.err = completed.stderr.decode("utf-8")

    def out_lines(self):
        return self.out.split("\n")[:-1] if self.out else []


def textfinder(*arguments, cwd=None):
    completed = subprocess.run(
        [sys.executable, "-m", "python_textfinder_entry", *arguments],
        capture_output=True, cwd=cwd, env=os.environ.copy())
    return Result(completed)


def write_tree(base, files):
    for name, content in files.items():
        path = os.path.join(base, name.replace("/", os.sep))
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "wb") as target:
            target.write(content)


class TreeFixture(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.holder = tempfile.TemporaryDirectory()
        cls.base = cls.holder.name
        write_tree(os.path.join(cls.base, "tree"), SCRATCH_TREE)

    @classmethod
    def tearDownClass(cls):
        cls.holder.cleanup()

    def run_in_tree(self, *arguments):
        return textfinder(*arguments, cwd=self.base)


class BareCommandLine(TreeFixture):
    def test_lists_the_resolved_options_and_exits_zero(self):
        result = self.run_in_tree()
        self.assertEqual(result.code, 0)
        self.assertEqual(result.out, NINE_OPTIONS)
        self.assertEqual(result.err, "")

    def test_traverses_nothing(self):
        self.assertNotIn("accessed ", self.run_in_tree().out)


class Help(TreeFixture):
    def test_prints_help_and_exits_zero(self):
        result = self.run_in_tree("/H", "true")
        self.assertEqual(result.code, 0)
        self.assertTrue(result.out.startswith("usage: Python_TextFinder "))
        self.assertEqual(result.err, "")

    def test_traverses_nothing(self):
        self.assertNotIn("accessed ", self.run_in_tree("/H", "true").out)

    def test_dash_introducer_is_equivalent(self):
        self.assertEqual(self.run_in_tree("-H", "true").out,
                         self.run_in_tree("/H", "true").out)


class UsageDiagnostics(TreeFixture):
    def test_unrecognized_switch_exits_one_with_an_empty_stdout(self):
        result = self.run_in_tree("/Z", "x")
        self.assertEqual(result.code, 1)
        self.assertEqual(result.out, "")
        self.assertEqual(result.err.split("\n")[0], "unrecognized switch: /Z")

    def test_diagnostic_ends_with_the_usage_line(self):
        result = self.run_in_tree("/Z", "x")
        self.assertEqual(result.err.split("\n")[1],
                         self.run_in_tree("/H", "true").out.split("\n")[0])

    def test_not_a_switch(self):
        result = self.run_in_tree("tree")
        self.assertEqual(result.code, 1)
        self.assertEqual(result.err.split("\n")[0], "not a switch: tree")

    def test_missing_argument(self):
        result = self.run_in_tree("/r")
        self.assertEqual(result.code, 1)
        self.assertEqual(result.err.split("\n")[0],
                         "missing argument for switch: /r")

    def test_invalid_boolean(self):
        result = self.run_in_tree("/s", "yes")
        self.assertEqual(result.code, 1)
        self.assertEqual(result.err.split("\n")[0], "invalid boolean for /s: yes")


class InvalidExpression(TreeFixture):
    def test_exits_one_and_puts_the_option_listing_on_stdout(self):
        result = self.run_in_tree("/r", "(")
        self.assertEqual(result.code, 1)
        self.assertIn("/r (\n", result.out)
        self.assertEqual(result.err.split("\n")[0],
                         "invalid regex for switch: /r")

    def test_listing_precedes_the_diagnostic_and_traversal_never_begins(self):
        result = self.run_in_tree("/r", "(")
        self.assertEqual(len(result.out_lines()), 9)
        self.assertNotIn("accessed ", result.out)

    def test_listing_is_not_repeated_when_verbose_already_wrote_it(self):
        result = self.run_in_tree("/v", "true", "/r", "(")
        self.assertEqual(result.code, 1)
        self.assertEqual(len([line for line in result.out_lines()
                              if line.startswith("/r ")]), 1)

    def test_the_interpreter_message_is_not_written(self):
        self.assertEqual(len(self.run_in_tree("/r", "(").err.split("\n")), 3)


class Search(TreeFixture):
    def test_default_run_reports_every_file_and_ends_with_the_summary(self):
        result = self.run_in_tree("/P", "tree")
        self.assertEqual(result.code, 0)
        lines = result.out_lines()
        self.assertIn("tree/one.txt", lines)
        self.assertIn("tree/sub/three.txt", lines)
        self.assertNotIn("tree/build/skipped.txt", lines)
        self.assertEqual(lines[-1], "accessed 3 files, 2 directories")

    def test_expression_and_detail_switches(self):
        result = self.run_in_tree("/P", "tree", "/r", "alpha",
                                  "/n", "true", "/L", "true")
        lines = result.out_lines()
        self.assertIn("tree/one.txt", lines)
        self.assertIn("  1 - alpha", lines)
        self.assertNotIn("tree/two.txt", lines)

    def test_extension_filter(self):
        result = self.run_in_tree("/P", "tree", "/p", "md")
        self.assertEqual(result.out_lines(), ["accessed 0 files, 2 directories"])

    def test_recursion_off(self):
        result = self.run_in_tree("/P", "tree", "/s", "false")
        self.assertEqual(result.out_lines()[-1], "accessed 2 files, 1 directories")

    def test_verbose_listing_precedes_the_search_output(self):
        result = self.run_in_tree("/P", "tree", "/v", "true")
        lines = result.out_lines()
        self.assertEqual(lines[0], "/P tree")
        self.assertEqual(lines[8], "/L false")
        self.assertTrue(lines[9].startswith("tree/"))

    def test_two_roots_are_traversed_in_order_under_one_summary(self):
        result = self.run_in_tree("/P", "tree/sub", "/P", "tree/build")
        lines = result.out_lines()
        self.assertEqual(lines[0], "tree/sub/three.txt")
        self.assertEqual(lines[1], "tree/build/skipped.txt")
        self.assertEqual(lines[2], "accessed 2 files, 2 directories")

    def test_an_unopenable_root_is_announced_and_does_not_change_the_code(self):
        result = self.run_in_tree("/P", "tree/absent")
        self.assertEqual(result.code, 0)
        self.assertEqual(result.out_lines(),
                         ["cannot open tree/absent",
                          "accessed 0 files, 0 directories"])

    def test_a_search_that_matched_nothing_still_exits_zero(self):
        result = self.run_in_tree("/P", "tree", "/r", "no-such-text")
        self.assertEqual(result.code, 0)
        self.assertEqual(result.out_lines(), ["accessed 3 files, 2 directories"])


class StreamBytes(TreeFixture):
    def test_stdout_carries_line_feed_and_never_a_carriage_return(self):
        for arguments in ((), ("/H", "true"), ("/P", "tree"),
                          ("/P", "tree", "/v", "true")):
            with self.subTest(arguments=arguments):
                result = self.run_in_tree(*arguments)
                self.assertNotIn(b"\r", result.out_bytes)
                self.assertTrue(result.out_bytes.endswith(b"\n"))

    def test_stderr_carries_line_feed_and_never_a_carriage_return(self):
        result = self.run_in_tree("/Z", "x")
        self.assertNotIn(b"\r", result.err_bytes)
        self.assertTrue(result.err_bytes.endswith(b"\n"))

    def test_stdout_opens_with_no_byte_order_mark(self):
        self.assertFalse(self.run_in_tree().out_bytes.startswith(b"\xef\xbb\xbf"))

    def test_output_is_utf_eight(self):
        with tempfile.TemporaryDirectory() as base:
            write_tree(base, {"u.txt": "café\n".encode("utf-8")})
            result = textfinder("/P", "u.txt", "/r", "caf", "/L", "true",
                                cwd=base)
        self.assertIn("café\n".encode("utf-8"), result.out_bytes)


class ExitCodes(TreeFixture):
    def test_the_three_codes_and_no_other(self):
        self.assertEqual(self.run_in_tree().code, 0)
        self.assertEqual(self.run_in_tree("/H", "true").code, 0)
        self.assertEqual(self.run_in_tree("/P", "tree").code, 0)
        self.assertEqual(self.run_in_tree("/Z", "x").code, 1)
        self.assertEqual(self.run_in_tree("/r", "(").code, 1)

    def test_no_traceback_reaches_stderr(self):
        for arguments in ((), ("/H", "true"), ("/P", "tree"), ("/Z", "x"),
                          ("/r", "("), ("/P", "tree/absent")):
            with self.subTest(arguments=arguments):
                self.assertNotIn("Traceback", self.run_in_tree(*arguments).err)


class InterpreterFloor(unittest.TestCase):
    """Python_TextFinder_Structure.md fixes CPython 3.10 as the minimum."""

    def sources(self):
        for folder in SOURCE_FOLDERS:
            for base, _, names in os.walk(folder):
                if "__pycache__" in base:
                    continue
                for name in names:
                    if name.endswith(".py"):
                        yield os.path.join(base, name)

    def test_the_running_interpreter_meets_the_declared_floor(self):
        self.assertGreaterEqual(sys.version_info[:2], FLOOR)

    def test_every_source_file_parses_under_the_declared_floor(self):
        checked = 0
        for path in self.sources():
            with open(path, "rb") as source:
                text = source.read().decode("utf-8")
            with self.subTest(path=os.path.relpath(path, IMPLEMENTATION)):
                ast.parse(text, filename=path, feature_version=FLOOR)
            checked += 1
        self.assertEqual(checked, 11)

    def test_no_source_file_carries_a_carriage_return(self):
        for path in self.sources():
            with open(path, "rb") as source:
                with self.subTest(path=os.path.relpath(path, IMPLEMENTATION)):
                    self.assertNotIn(b"\r", source.read())


class SharedFixture(unittest.TestCase):
    """Fixture/Fixture.md - one artifact all four implementations must agree with."""

    @classmethod
    def setUpClass(cls):
        cls.cases = []
        with open(os.path.join(FIXTURE, "cases.txt"), encoding="utf-8") as source:
            for line in source:
                line = line.rstrip("\n")
                if not line or line.startswith("#"):
                    continue
                name, mode, code, arguments = line.split("|")
                cls.cases.append((name, mode, int(code),
                                  arguments.split() if arguments else []))

    def expected(self, name):
        with open(os.path.join(FIXTURE, "expected", name + ".txt"), "rb") as source:
            return source.read()

    def test_the_case_list_is_not_empty(self):
        self.assertGreaterEqual(len(self.cases), 31)

    def test_every_case_matches_its_expected_stdout_and_exit_code(self):
        for name, mode, code, arguments in self.cases:
            with self.subTest(case=name):
                result = textfinder(*arguments, cwd=FIXTURE)
                self.assertEqual(result.code, code, "exit code")
                self.assertNotIn(b"\r", result.out_bytes, "CR on stdout")
                expected = self.expected(name)
                if mode == "ordered":
                    self.assertEqual(result.out_bytes, expected)
                    continue
                lines = result.out_lines()
                self.assertEqual(
                    ("\n".join(sorted(lines)) + "\n").encode("utf-8") if lines
                    else b"", expected)
                self.assertTrue(lines[-1].startswith("accessed "),
                                "summary must be the last line emitted")

    def test_help_outranks_a_bad_regex_and_a_verbose_listing(self):
        plain = self.expected("help")
        self.assertEqual(self.expected("help-outranks-bad-regex"), plain)
        self.assertEqual(self.expected("help-outranks-verbose"), plain)


if __name__ == "__main__":
    result = unittest.main(exit=False, verbosity=1).result
    sys.exit(len(result.failures) + len(result.errors))
