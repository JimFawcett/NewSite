import sys
from pathlib import Path
import unittest

sys.path.insert(0, str(Path(__file__).parent.parent))
from Lexer.lexer import (
    Lexer, OpenTag, SelfClosingTag, CloseTag, TextNode, CommentNode, DoctypeDecl,
)


class TestLexer(unittest.TestCase):

    def test_open_tag(self):
        lex = Lexer('<div>').next_lexeme()
        self.assertIsInstance(lex, OpenTag)
        self.assertEqual(lex.name, 'div')

    def test_self_closing_tag(self):
        lex = Lexer('<br />').next_lexeme()
        self.assertIsInstance(lex, SelfClosingTag)
        self.assertEqual(lex.name, 'br')

    def test_close_tag(self):
        lex = Lexer('</div>').next_lexeme()
        self.assertIsInstance(lex, CloseTag)
        self.assertEqual(lex.name, 'div')

    def test_attrs_quoted(self):
        lex = Lexer('<a href="url" class="foo">').next_lexeme()
        self.assertIsInstance(lex, OpenTag)
        self.assertEqual(len(lex.attrs), 2)
        self.assertEqual(lex.attrs[0].key, 'href')
        self.assertEqual(lex.attrs[0].value, 'url')
        self.assertTrue(lex.attrs[0].quoted)
        self.assertEqual(lex.attrs[1].key, 'class')

    def test_attr_unquoted_flagged(self):
        lex = Lexer('<div class=foo>').next_lexeme()
        self.assertIsInstance(lex, OpenTag)
        self.assertFalse(lex.attrs[0].quoted)

    def test_boolean_attr(self):
        lex = Lexer('<input disabled>').next_lexeme()
        self.assertIsInstance(lex, OpenTag)
        self.assertEqual(lex.attrs[0].key, 'disabled')
        self.assertEqual(lex.attrs[0].value, '')

    def test_doctype(self):
        l = Lexer('<!DOCTYPE html><html>')
        self.assertIsInstance(l.next_lexeme(), DoctypeDecl)
        lex = l.next_lexeme()
        self.assertIsInstance(lex, OpenTag)
        self.assertEqual(lex.name, 'html')

    def test_case_normalisation(self):
        l = Lexer('<DIV></DIV>')
        lex = l.next_lexeme()
        self.assertIsInstance(lex, OpenTag)
        self.assertEqual(lex.name, 'div')
        lex = l.next_lexeme()
        self.assertIsInstance(lex, CloseTag)
        self.assertEqual(lex.name, 'div')

    def test_whitespace_only_text_skipped(self):
        l = Lexer('<p>  \n  </p>')
        self.assertIsInstance(l.next_lexeme(), OpenTag)
        self.assertIsInstance(l.next_lexeme(), CloseTag)

    def test_nonempty_text_kept(self):
        l = Lexer('<p>hello</p>')
        l.next_lexeme()  # OpenTag
        lex = l.next_lexeme()
        self.assertIsInstance(lex, TextNode)
        self.assertEqual(lex.content, 'hello')

    def test_comment_node(self):
        l = Lexer('<!-- note --><div>')
        self.assertIsInstance(l.next_lexeme(), CommentNode)
        self.assertIsInstance(l.next_lexeme(), OpenTag)


if __name__ == '__main__':
    unittest.main()
