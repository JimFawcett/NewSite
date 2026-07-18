#!/usr/bin/env python3
# check_unused_css.py -- reports CSS stylesheets with no matching selectors in an HTML page
# Requires: pip install tinycss2 beautifulsoup4
# Usage: python check_unused_css.py <page.html|dir> [<page.html|dir> ...] [--detail]
#
# Match strategy: a selector "could match" if every class, ID, and custom element
# it names exists somewhere in the page.  Standard HTML element names are ignored
# (they're nearly always present).  This avoids false positives while being
# conservative enough to correctly identify wholly unused stylesheets.

import sys
import re
from pathlib import Path

import tinycss2
from bs4 import BeautifulSoup

_PSEUDO      = re.compile(r'::?[\w-]+(?:\([^)]*\))?')
_CLASS       = re.compile(r'\.([\w-]+)')
_ID          = re.compile(r'#([\w-]+)')
_CUSTOM_ELEM = re.compile(r'\b([a-z][\w]*-[\w-]+)\b')  # contains hyphen = custom element

SKIP_AT = {'keyframes', '-webkit-keyframes', 'font-face', 'charset', 'import'}


def collect_selectors(rules: list) -> list[str]:
    out = []
    for rule in rules:
        if rule.type == 'qualified-rule':
            text = tinycss2.serialize(rule.prelude).strip()
            for part in text.split(','):
                part = part.strip()
                if part:
                    out.append(part)
        elif (rule.type == 'at-rule'
              and rule.at_keyword.lower() not in SKIP_AT
              and rule.content is not None):
            inner = tinycss2.parse_rule_list(
                rule.content, skip_whitespace=True, skip_comments=True
            )
            out.extend(collect_selectors(inner))
    return out


def page_inventory(html_text: str) -> tuple[set, set, set]:
    soup = BeautifulSoup(html_text, 'html.parser')
    tags    = {el.name for el in soup.find_all(True)}
    classes = set()
    for el in soup.find_all(True):
        classes.update(el.get('class', []))
    ids = {el.get('id') for el in soup.find_all(id=True)}
    return tags, classes, ids


def collect_js_text(html_text: str, html_path: Path) -> str:
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


def selector_names(selectors: list[str]) -> set[str]:
    names = set()
    for sel in selectors:
        clean = _PSEUDO.sub('', sel)
        names.update(_CLASS.findall(clean))
        names.update(_ID.findall(clean))
        names.update(_CUSTOM_ELEM.findall(clean))
    return names


def js_refs(names: set[str], js_text: str) -> list[str]:
    return sorted(n for n in names if n in js_text)


def could_match(selector: str, tags: set, classes: set, ids: set) -> bool:
    sel = _PSEUDO.sub('', selector).strip()
    if not sel:
        return False
    for cls in _CLASS.findall(sel):
        if cls not in classes:
            return False
    for id_ in _ID.findall(sel):
        if id_ not in ids:
            return False
    for tag in _CUSTOM_ELEM.findall(sel):
        if tag not in tags:
            return False
    return True


def report(html_path: Path, detail: bool) -> None:
    html_text = html_path.read_text(encoding='utf-8')
    tags, classes, ids = page_inventory(html_text)
    js_text = collect_js_text(html_text, html_path)

    soup  = BeautifulSoup(html_text, 'html.parser')
    links = soup.find_all('link', rel='stylesheet')
    stylesheets = [
        (lnk.get('href', ''), (html_path.parent / lnk.get('href', '')).resolve())
        for lnk in links if lnk.get('href')
    ]

    print(f"\n{html_path.name}  ({len(stylesheets)} stylesheets)")
    print('-' * 64)

    for href, css_path in stylesheets:
        name = css_path.name
        if not css_path.exists():
            print(f"  MISSING     {name}  ({href})")
            continue

        css_text  = css_path.read_text(encoding='utf-8-sig')
        selectors = collect_selectors(
            tinycss2.parse_stylesheet(css_text, skip_whitespace=True, skip_comments=True)
        )

        if not selectors:
            print(f"  EMPTY       {name}")
            continue

        hits   = [s for s in selectors if     could_match(s, tags, classes, ids)]
        misses = [s for s in selectors if not could_match(s, tags, classes, ids)]

        if not hits:
            refs = js_refs(selector_names(selectors), js_text)
            suffix = f"  [JS: {', '.join(refs)}]" if refs else ""
            print(f"  UNUSED      {name}{suffix}")
        elif misses:
            print(f"  partial {len(hits):2}/{len(selectors):<2}  {name}")
            if detail:
                for m in misses:
                    refs = js_refs(selector_names([m]), js_text)
                    js_note = f"  [JS: {', '.join(refs)}]" if refs else ""
                    print(f"               no match: {m}{js_note}")
        else:
            print(f"  ok          {name}")


def main() -> None:
    sys.stdout.reconfigure(encoding='utf-8')
    args   = sys.argv[1:]
    detail = '--detail' in args
    paths  = [a for a in args if not a.startswith('--')]

    if not paths:
        print("Usage: python check_unused_css.py <page.html|dir> [<page.html|dir> ...] [--detail]")
        sys.exit(1)

    for p in paths:
        resolved = Path(p).resolve()
        if resolved.is_dir():
            html_files = sorted(resolved.glob('*.html'))
            if not html_files:
                print(f"\nNo .html files found in {resolved}")
            for f in html_files:
                report(f, detail)
        else:
            report(resolved, detail)


if __name__ == '__main__':
    main()
