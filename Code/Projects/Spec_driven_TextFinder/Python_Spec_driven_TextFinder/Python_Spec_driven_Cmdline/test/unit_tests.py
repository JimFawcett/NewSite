# unit_tests.py - unit suite for python_textfinder_cmdline, per Spec_Python_TextFinder_Cmdline.md

import sys
import unittest

from python_textfinder_cmdline import (ParseFailure, ProgramCommands, help_text,
                                       options_text, parse, usage_line)

BARE = ["Python_TextFinder"]


def parsed(*tokens):
    result = parse(BARE + list(tokens))
    if isinstance(result, ParseFailure):
        return None, result.diagnostic
    return result, None


class ResultType(unittest.TestCase):
    def test_success_returns_the_commands_unwrapped(self):
        self.assertIsInstance(parse(BARE), ProgramCommands)

    def test_failure_returns_a_parse_failure_carrying_the_diagnostic(self):
        result = parse(BARE + ["bad"])
        self.assertIsInstance(result, ParseFailure)
        self.assertTrue(result.diagnostic.startswith("not a switch: bad\n"))

    def test_the_failure_is_frozen(self):
        result = parse(BARE + ["bad"])
        with self.assertRaises(Exception):
            result.diagnostic = "changed"

    def test_the_two_outcomes_are_distinct_types(self):
        self.assertNotIsInstance(parse(BARE), ParseFailure)
        self.assertNotIsInstance(parse(BARE + ["bad"]), ProgramCommands)


class Defaults(unittest.TestCase):
    def test_bare_command_line_equals_constructed_defaults(self):
        commands, diagnostic = parsed()
        self.assertIsNone(diagnostic)
        self.assertEqual(commands, ProgramCommands())

    def test_defaults_match_spec_table(self):
        commands = ProgramCommands()
        self.assertEqual(commands.root_paths, ["."])
        self.assertEqual(commands.extensions, [])
        self.assertEqual(commands.regex_text, ".")
        self.assertTrue(commands.recurse)
        self.assertTrue(commands.suppress_on_no_match)
        self.assertFalse(commands.verbose)
        self.assertFalse(commands.help)
        self.assertFalse(commands.line_numbers)
        self.assertFalse(commands.matched_line)

    def test_two_instances_do_not_share_their_lists(self):
        first = ProgramCommands()
        second = ProgramCommands()
        first.root_paths.append("src")
        self.assertEqual(second.root_paths, ["."])


class SwitchParsing(unittest.TestCase):
    def test_both_introducers_are_equivalent(self):
        slashed, _ = parsed("/s", "false")
        dashed, _ = parsed("-s", "false")
        self.assertEqual(slashed, dashed)

    def test_every_switch_reaches_its_attribute(self):
        commands, diagnostic = parsed("/P", "src", "/p", "py", "/r", "x",
                                      "/s", "false", "/h", "false", "/v", "true",
                                      "/H", "true", "/n", "true", "/L", "true")
        self.assertIsNone(diagnostic)
        self.assertEqual(commands.root_paths, ["src"])
        self.assertEqual(commands.extensions, ["py"])
        self.assertEqual(commands.regex_text, "x")
        self.assertFalse(commands.recurse)
        self.assertFalse(commands.suppress_on_no_match)
        self.assertTrue(commands.verbose)
        self.assertTrue(commands.help)
        self.assertTrue(commands.line_numbers)
        self.assertTrue(commands.matched_line)

    def test_switch_letters_are_case_sensitive(self):
        hide, _ = parsed("/h", "false")
        show, _ = parsed("/H", "true")
        self.assertFalse(hide.suppress_on_no_match)
        self.assertTrue(hide.help is False)
        self.assertTrue(show.help)
        self.assertTrue(show.suppress_on_no_match)

    def test_boolean_values_are_case_insensitive(self):
        for token in ("TRUE", "True", "true", "tRuE"):
            commands, diagnostic = parsed("/n", token)
            self.assertIsNone(diagnostic)
            self.assertTrue(commands.line_numbers)
        for token in ("FALSE", "False", "false"):
            commands, diagnostic = parsed("/s", token)
            self.assertIsNone(diagnostic)
            self.assertFalse(commands.recurse)

    def test_argument_beginning_with_an_introducer_is_taken_verbatim(self):
        commands, diagnostic = parsed("/r", "-x")
        self.assertIsNone(diagnostic)
        self.assertEqual(commands.regex_text, "-x")

    def test_first_root_clears_the_default_and_later_roots_append(self):
        commands, _ = parsed("/P", "a", "/P", "b", "/P", "c")
        self.assertEqual(commands.root_paths, ["a", "b", "c"])

    def test_single_dot_root_replaces_the_default_rather_than_doubling_it(self):
        commands, _ = parsed("/P", ".", "/P", "src")
        self.assertEqual(commands.root_paths, [".", "src"])

    def test_last_occurrence_wins_for_every_other_switch(self):
        commands, _ = parsed("/r", "first", "/r", "second",
                             "/s", "false", "/s", "true")
        self.assertEqual(commands.regex_text, "second")
        self.assertTrue(commands.recurse)

    def test_parser_skips_element_zero(self):
        commands = parse(["/not/a/switch/at/all", "/n", "true"])
        self.assertIsInstance(commands, ProgramCommands)
        self.assertTrue(commands.line_numbers)


class Diagnostics(unittest.TestCase):
    def reason(self, *tokens):
        commands, diagnostic = parsed(*tokens)
        self.assertIsNone(commands)
        self.assertIsNotNone(diagnostic)
        return diagnostic.split("\n")[0]

    def test_shape_is_reason_newline_usage_line(self):
        _, diagnostic = parsed("bad")
        self.assertEqual(diagnostic, "not a switch: bad\n" + usage_line())
        self.assertTrue(diagnostic.endswith("\n"))
        self.assertNotIn("\r", diagnostic)

    def test_not_a_switch(self):
        self.assertEqual(self.reason("bad"), "not a switch: bad")

    def test_empty_token_in_switch_position_is_not_a_switch(self):
        self.assertEqual(self.reason(""), "not a switch: ")

    def test_unrecognized_switch(self):
        self.assertEqual(self.reason("/Z", "x"), "unrecognized switch: /Z")

    def test_bare_introducer_is_unrecognized(self):
        self.assertEqual(self.reason("/"), "unrecognized switch: /")
        self.assertEqual(self.reason("-"), "unrecognized switch: -")

    def test_long_introducer_led_token_is_unrecognized(self):
        self.assertEqual(self.reason("--help"), "unrecognized switch: --help")

    def test_missing_argument(self):
        self.assertEqual(self.reason("/r"), "missing argument for switch: /r")

    def test_invalid_boolean(self):
        self.assertEqual(self.reason("/s", "yes"), "invalid boolean for /s: yes")

    def test_invalid_boolean_rejects_a_truthy_string(self):
        self.assertEqual(self.reason("/n", "1"), "invalid boolean for /n: 1")

    def test_invalid_boolean_rejects_surrounding_whitespace(self):
        self.assertEqual(self.reason("/n", " true "),
                         "invalid boolean for /n:  true ")

    def test_empty_root_path(self):
        self.assertEqual(self.reason("/P", ""), "empty root path for switch: /P")

    def test_empty_expression(self):
        self.assertEqual(self.reason("/r", ""), "empty expression for switch: /r")

    def test_introducer_is_preserved_in_the_reason_line(self):
        self.assertEqual(self.reason("-r"), "missing argument for switch: -r")

    def test_scan_stops_at_the_first_violation(self):
        self.assertEqual(self.reason("/Z", "x", "/Q", "y"),
                         "unrecognized switch: /Z")

    def test_no_diagnostic_for_a_duplicated_switch_or_an_empty_extension_list(self):
        commands, diagnostic = parsed("/p", "", "/p", "")
        self.assertIsNone(diagnostic)
        self.assertEqual(commands.extensions, [])


class ExtensionNormalization(unittest.TestCase):
    def normalized(self, token):
        commands, diagnostic = parsed("/p", token)
        self.assertIsNone(diagnostic)
        return commands.extensions

    def test_splits_on_commas_and_trims(self):
        self.assertEqual(self.normalized("cpp, rs, h"), ["cpp", "rs", "h"])

    def test_strips_one_leading_dot(self):
        self.assertEqual(self.normalized(".cpp"), ["cpp"])
        self.assertEqual(self.normalized("..cpp"), [".cpp"])

    def test_discards_empty_items(self):
        self.assertEqual(self.normalized("cpp,,rs"), ["cpp", "rs"])
        self.assertEqual(self.normalized("cpp, rs"), ["cpp", "rs"])
        self.assertEqual(self.normalized("."), [])

    def test_preserves_order_and_duplicates(self):
        self.assertEqual(self.normalized("b, a, b"), ["b", "a", "b"])

    def test_trims_exactly_the_six_characters_spec_fixes(self):
        self.assertEqual(self.normalized(" \t\n\v\f\rcpp \t\n\v\f\r"), ["cpp"])

    def test_trims_again_after_stripping_the_dot(self):
        self.assertEqual(self.normalized(". cpp"), ["cpp"])
        self.assertEqual(self.normalized(" .\tcpp "), ["cpp"])

    def test_an_item_that_is_only_a_dot_and_whitespace_is_discarded(self):
        self.assertEqual(self.normalized(". "), [])

    def test_the_second_trim_keeps_whitespace_out_of_the_listing(self):
        commands, _ = parsed("/p", ". cpp")
        self.assertIn("/p cpp\n", options_text(commands))

    def test_does_not_trim_other_unicode_whitespace(self):
        self.assertEqual(self.normalized(" cpp"), [" cpp"])
        self.assertEqual(self.normalized(" cpp"), [" cpp"])

    def test_does_not_fold_case(self):
        self.assertEqual(self.normalized("CPP"), ["CPP"])


class HelpAndOptions(unittest.TestCase):
    def test_usage_line_is_the_first_line_of_help(self):
        self.assertEqual(help_text().split("\n")[0], usage_line().rstrip("\n"))

    def test_usage_line_names_the_executable(self):
        self.assertTrue(usage_line().startswith("usage: Python_TextFinder "))

    def test_help_text_carries_no_carriage_return_and_ends_with_lf(self):
        text = help_text()
        self.assertNotIn("\r", text)
        self.assertTrue(text.endswith("\n"))

    def test_help_text_line_count(self):
        self.assertEqual(len(help_text().split("\n")), 23)

    def test_help_text_lists_all_nine_switches(self):
        text = help_text()
        for switch in ("/P", "/p", "/r", "/s", "/h", "/v", "/H", "/n", "/L"):
            self.assertIn("\n  " + switch + "  ", text)

    def test_bare_verbose_listing_is_the_nine_lines_spec_fixes(self):
        commands, _ = parsed("-v", "true")
        self.assertEqual(options_text(commands),
                         "/P .\n/p\n/r .\n/s true\n/h true\n/v true\n"
                         "/H false\n/n false\n/L false\n")

    def test_bare_listing_reads_v_false(self):
        self.assertEqual(options_text(ProgramCommands()),
                         "/P .\n/p\n/r .\n/s true\n/h true\n/v false\n"
                         "/H false\n/n false\n/L false\n")

    def test_no_line_ends_in_whitespace(self):
        commands, _ = parsed("-v", "true")
        for line in options_text(commands).split("\n"):
            self.assertEqual(line, line.rstrip())

    def test_one_line_per_root_path_in_traversal_order(self):
        commands, _ = parsed("/P", "a", "/P", "b")
        self.assertEqual(options_text(commands).split("\n")[:2], ["/P a", "/P b"])

    def test_extension_list_is_joined_with_comma_space(self):
        commands, _ = parsed("/p", ".cpp, rs")
        self.assertIn("/p cpp, rs\n", options_text(commands))

    def test_expression_renders_verbatim(self):
        commands, _ = parsed("/r", r"int\s+main")
        self.assertIn("/r int\\s+main\n", options_text(commands))

    def test_booleans_render_in_lower_case(self):
        commands, _ = parsed("/H", "TRUE")
        self.assertIn("/H true\n", options_text(commands))
        self.assertNotIn("True", options_text(commands))


if __name__ == "__main__":
    result = unittest.main(exit=False, verbosity=1).result
    sys.exit(len(result.failures) + len(result.errors))
