import sys
from pathlib import Path
import unittest

sys.path.insert(0, str(Path(__file__).parent.parent))
from Validator.validator import Validator

VALID = (
    '<!DOCTYPE html>'
    '<html><head><title>T</title></head>'
    '<body><p>Hello</p></body></html>'
)


def has_rule(report, rule: str) -> bool:
    return any(e.rule == rule for e in report.errors)


class TestValidator(unittest.TestCase):

    def test_valid_document(self):
        self.assertTrue(Validator.validate(VALID, 't.html').is_valid)

    def test_missing_doctype(self):
        html = '<html><head><title>T</title></head><body></body></html>'
        self.assertTrue(has_rule(Validator.validate(html, 't.html'), 'doctype'))

    def test_tag_nesting_mismatch(self):
        html = (
            '<!DOCTYPE html><html><head><title>T</title></head>'
            '<body><div><p></div></p></body></html>'
        )
        self.assertTrue(has_rule(Validator.validate(html, 't.html'), 'tag-nesting'))

    def test_unclosed_tag(self):
        html = (
            '<!DOCTYPE html><html><head><title>T</title></head>'
            '<body><div></body></html>'
        )
        self.assertTrue(has_rule(Validator.validate(html, 't.html'), 'tag-nesting'))

    def test_void_element_close_tag(self):
        html = (
            '<!DOCTYPE html><html><head><title>T</title></head>'
            '<body><br></br></body></html>'
        )
        self.assertTrue(has_rule(Validator.validate(html, 't.html'), 'void-elements'))

    def test_duplicate_id(self):
        html = (
            '<!DOCTYPE html><html><head><title>T</title></head>'
            '<body><div id="a"></div><div id="a"></div></body></html>'
        )
        self.assertTrue(has_rule(Validator.validate(html, 't.html'), 'duplicate-id'))

    def test_unquoted_attr(self):
        html = (
            '<!DOCTYPE html><html><head><title>T</title></head>'
            '<body><div class=foo></div></body></html>'
        )
        self.assertTrue(has_rule(Validator.validate(html, 't.html'), 'attr-quotes'))

    def test_missing_head(self):
        html = '<!DOCTYPE html><html><body></body></html>'
        self.assertTrue(has_rule(Validator.validate(html, 't.html'), 'head-required'))

    def test_missing_title(self):
        html = '<!DOCTYPE html><html><head></head><body></body></html>'
        self.assertTrue(has_rule(Validator.validate(html, 't.html'), 'head-required'))

    def test_missing_body(self):
        html = '<!DOCTYPE html><html><head><title>T</title></head></html>'
        self.assertTrue(has_rule(Validator.validate(html, 't.html'), 'body-required'))

    def test_multiple_html_elements(self):
        html = (
            '<!DOCTYPE html><html><head><title>T</title></head><body></body></html>'
            '<html></html>'
        )
        self.assertTrue(has_rule(Validator.validate(html, 't.html'), 'root-element'))

    def test_void_self_close_ok(self):
        html = (
            '<!DOCTYPE html><html><head><title>T</title></head>'
            '<body><br /></body></html>'
        )
        self.assertTrue(Validator.validate(html, 't.html').is_valid)


if __name__ == '__main__':
    unittest.main()
