import sys
from pathlib import Path
import unittest

sys.path.insert(0, str(Path(__file__).parent.parent))
from Tokenizer.tokenizer import (
    Tokenizer, TagOpen, TagClose, AttrName, AttrValue, AttrUnquoted,
    SelfClose, TagEnd, Text, Comment, Doctype, Eof,
)


class TestTokenizer(unittest.TestCase):

    def test_simple_open_tag(self):
        t = Tokenizer('<div>')
        self.assertIsInstance(t.next_token(), TagOpen)
        self.assertIsInstance(t.next_token(), TagEnd)
        self.assertIsInstance(t.next_token(), Eof)

    def test_open_tag_name(self):
        t = Tokenizer('<div>')
        tok = t.next_token()
        self.assertIsInstance(tok, TagOpen)
        self.assertEqual(tok.name, 'div')

    def test_close_tag(self):
        t = Tokenizer('</div>')
        tok = t.next_token()
        self.assertIsInstance(tok, TagClose)
        self.assertEqual(tok.name, 'div')

    def test_self_closing(self):
        t = Tokenizer('<br />')
        self.assertIsInstance(t.next_token(), TagOpen)
        self.assertIsInstance(t.next_token(), SelfClose)

    def test_attribute_quoted(self):
        t = Tokenizer('<a href="url">')
        t.next_token()  # TagOpen
        tok = t.next_token()
        self.assertIsInstance(tok, AttrName)
        self.assertEqual(tok.name, 'href')
        tok = t.next_token()
        self.assertIsInstance(tok, AttrValue)
        self.assertEqual(tok.value, 'url')

    def test_attribute_unquoted(self):
        t = Tokenizer('<div class=foo>')
        t.next_token()  # TagOpen
        t.next_token()  # AttrName
        tok = t.next_token()
        self.assertIsInstance(tok, AttrUnquoted)
        self.assertEqual(tok.value, 'foo')

    def test_boolean_attr(self):
        t = Tokenizer('<input disabled>')
        t.next_token()  # TagOpen
        tok = t.next_token()
        self.assertIsInstance(tok, AttrName)
        self.assertEqual(tok.name, 'disabled')
        self.assertIsInstance(t.next_token(), TagEnd)

    def test_doctype(self):
        t = Tokenizer('<!DOCTYPE html>')
        self.assertIsInstance(t.next_token(), Doctype)

    def test_comment(self):
        t = Tokenizer('<!-- hello -->')
        tok = t.next_token()
        self.assertIsInstance(tok, Comment)
        self.assertEqual(tok.content, ' hello ')

    def test_text_node(self):
        t = Tokenizer('hello world')
        tok = t.next_token()
        self.assertIsInstance(tok, Text)
        self.assertEqual(tok.content, 'hello world')

    def test_position_tracking(self):
        t = Tokenizer('<div>\n<p>')
        t.next_token()  # TagOpen div
        t.next_token()  # TagEnd
        t.next_token()  # Text '\n'
        t.next_token()  # TagOpen p
        self.assertEqual(t.token_start[0], 2)

    def test_single_quoted_attr(self):
        t = Tokenizer("<a href='url'>")
        t.next_token()  # TagOpen
        t.next_token()  # AttrName
        tok = t.next_token()
        self.assertIsInstance(tok, AttrValue)
        self.assertEqual(tok.value, 'url')

    def test_multiple_attrs(self):
        t = Tokenizer('<a href="url" class="foo">')
        t.next_token()  # TagOpen
        tok = t.next_token()
        self.assertIsInstance(tok, AttrName)
        self.assertEqual(tok.name, 'href')
        t.next_token()  # AttrValue
        tok = t.next_token()
        self.assertIsInstance(tok, AttrName)
        self.assertEqual(tok.name, 'class')


if __name__ == '__main__':
    unittest.main()
