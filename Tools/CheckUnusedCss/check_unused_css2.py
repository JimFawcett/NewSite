#!/usr/bin/env python3
# check_unused_css2.py -- reports CSS stylesheets with no matching selectors in an HTML page
# Generated from pytools.md + case study prompt
# Requires: pip install tinycss2 beautifulsoup4
# Usage: python check_unused_css2.py <page.html|dir> [<page.html|dir> ...] [--detail]

import sys
import re
from pathlib import Path

import tinycss2
from bs4 import BeautifulSoup

_PSEUDO      = re.compile(r'::?[\w-]+(?:\([^)]*\))?')
_CLASS       = re.compile(r'\.([\w-]+)')
_ID_SEL      = re.compile(r'#([\w-]+)')
_CUSTOM_ELEM = re.compile(r'\b([a-z][\w]*-[\w-]+)\b')

SKIP_AT = {'keyframes', '-webkit-keyframes', 'font-face', 'charset', 'import'}


def parse_selectors(rules):
    """Recursively collect all selectors from a CSS rule list."""
    selectors = []
    for rule in rules:
        if rule.type == 'qualified-rule':
            text = tinycss2.serialize(rule.prelude).strip()
            for part in text.split(','):
                part = part.strip()
                if part:
                    selectors.append(part)
        elif (rule.type == 'at-rule'
              and rule.at_keyword.lower() not in SKIP_AT
              and rule.content):
            inner = tinycss2.parse_rule_list(
                rule.content, skip_whitespace=True, skip_comments=True
            )
            selectors.extend(parse_selectors(inner))
    return selectors


def scan_page(html_text):
    """Return (tags, classes, ids) present in the page."""
    soup = BeautifulSoup(html_text, 'html.parser')
    tags = {el.name for el in soup.find_all(True)}
    classes = set()
    for el in soup.find_all(True):
        classes.update(el.get('class', []))
    ids = {el['id'] for el in soup.find_all(id=True)}
    return tags, classes, ids


def collect_js_text(html_text, html_path):
    """Return concatenated text of all inline and linked scripts for the page."""
    soup = BeautifulSoup(html_text, 'html.parser')
    parts = []
    for tag in soup.find_all('script'):
        src = tag.get('src')
        if src:
            js_path = (html_path.parent / src).resolve()
            if js_path.exists():
                try:
                    parts.append(js_path.read_text(encoding='utf-8-sig'))
                except Exception:
                    pass
        elif tag.string:
            parts.append(tag.string)
    return '\n'.join(parts)


def token_names(selector):
    """Extract class names, IDs, and custom element names from a selector."""
    clean = _PSEUDO.sub('', selector)
    names = set()
    names.update(_CLASS.findall(clean))
    names.update(_ID_SEL.findall(clean))
    names.update(_CUSTOM_ELEM.findall(clean))
    return names


def matches(selector, tags, classes, ids):
    """Return True if every named token in the selector exists on the page."""
    clean = _PSEUDO.sub('', selector).strip()
    if not clean:
        return False
    for cls in _CLASS.findall(clean):
        if cls not in classes:
            return False
    for id_ in _ID_SEL.findall(clean):
        if id_ not in ids:
            return False
    for elem in _CUSTOM_ELEM.findall(clean):
        if elem not in tags:
            return False
    return True


def js_hits(names, js_text):
    """Return names that appear as substrings in js_text."""
    return sorted(n for n in names if n in js_text)


def check_page(html_path, detail):
    html_text = html_path.read_text(encoding='utf-8')
    tags, classes, ids = scan_page(html_text)
    js_text = collect_js_text(html_text, html_path)

    soup = BeautifulSoup(html_text, 'html.parser')
    links = [lnk for lnk in soup.find_all('link', rel='stylesheet') if lnk.get('href')]
    stylesheets = [
        (lnk['href'], (html_path.parent / lnk['href']).resolve())
        for lnk in links
    ]

    print(f"\n{html_path.name}  ({len(stylesheets)} stylesheets)")
    print('-' * 64)

    for href, css_path in stylesheets:
        name = css_path.name
        if not css_path.exists():
            print(f"  MISSING     {name}  ({href})")
            continue

        css_text = css_path.read_text(encoding='utf-8-sig')
        selectors = parse_selectors(
            tinycss2.parse_stylesheet(css_text, skip_whitespace=True, skip_comments=True)
        )

        if not selectors:
            print(f"  ok          {name}  (no selectors)")
            continue

        hits   = [s for s in selectors if     matches(s, tags, classes, ids)]
        misses = [s for s in selectors if not matches(s, tags, classes, ids)]

        if not hits:
            all_names = set()
            for s in selectors:
                all_names.update(token_names(s))
            refs = js_hits(all_names, js_text)
            suffix = f"  [JS: {', '.join(refs)}]" if refs else ""
            print(f"  UNUSED      {name}{suffix}")
        elif misses:
            print(f"  partial {len(hits):2}/{len(selectors):<2}  {name}")
            if detail:
                for m in misses:
                    refs = js_hits(token_names(m), js_text)
                    js_note = f"  [JS: {', '.join(refs)}]" if refs else ""
                    print(f"               no match: {m}{js_note}")
        else:
            print(f"  ok          {name}")


def main():
    sys.stdout.reconfigure(encoding='utf-8')
    args = sys.argv[1:]
    detail = '--detail' in args
    paths = [a for a in args if not a.startswith('--')]

    if not paths:
        print("Usage: python check_unused_css2.py <page.html|dir> [<page.html|dir> ...] [--detail]")
        sys.exit(1)

    for p in paths:
        target = Path(p).resolve()
        if target.is_dir():
            html_files = sorted(target.glob('*.html'))
            if not html_files:
                print(f"\nNo .html files found in {target}", file=sys.stderr)
            for f in html_files:
                check_page(f, detail)
        else:
            check_page(target, detail)


if __name__ == '__main__':
    main()
