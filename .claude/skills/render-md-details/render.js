#!/usr/bin/env node
/* Render Markdown documents into the labelled blocks of the Spec-Driven pages.
   Re-running is safe: a block already rendered is regenerated from its source, which
   is how a page is refreshed after its .md changes. */

const fs = require('fs'), path = require('path');
const MarkdownIt = (m => m.default || m)(require('./vendor/markdown-it.umd.min.js'));

const ROOT = path.resolve(__dirname, '../../..');
const CONFIG = {
  pages: 'Code',                                   // folder holding the HTML pages
  pageName: /^Spec_Driven_Design_.*\.html$/,       // which pages this skill owns
  source: 'Code/Projects/Spec_driven_TextFinder',  // folder searched for the .md files
  repo: 'https://github.com/JimFawcett/NewSite',
  branch: 'main',
};

/* One rule set, written to every page that carries a rendered document, so the pages
   cannot drift apart. Sizes are rem, and rem is 16px here while body text is 20px. */
const CSS = [
  '#github .mdview { font-size: 0.95rem; border: 2px solid var(--dark); padding: 0.75rem 1rem; }',
  '#github .mdview h2 { font-size: 1.4rem; margin: 0.25rem 0 0.75rem; }',
  '#github .mdview h3 { font-size: 1.2rem; margin: 1.25rem 0 0.5rem; }',
  '#github .mdview h4 { font-size: 1.05rem; margin: 1rem 0 0.4rem; }',
  '#github .mdview h5 { font-size: 1rem; margin: 0.75rem 0 0.3rem; }',
  '#github .mdview p, #github .mdview li { max-width: 90ch; margin: 0.5rem 0; }',
  '#github .mdview ul, #github .mdview ol { margin-left: 1.75rem; }',
  '#github .mdview li, #github .mdview li > p { margin: 0.25rem 0; }',
  '#github .mdview code { font-size: 0.95rem; }',
  '#github .mdview :not(pre) > code { background: var(--atten); padding: 0 0.25rem; }',
  '#github .mdview blockquote { border-left: 3px solid var(--dark); margin: 0.5rem 0; padding: 0.1rem 0 0.1rem 0.75rem; }',
  '#github .mdview table { table-layout: auto; width: max-content; max-width: 100%; border-collapse: collapse; }',
  '#github .mdview th, #github .mdview td { border: 1px solid var(--dark); }',
  '#github .mdview hr { margin: 1rem 0; }',
].map(r => '    ' + r + '\n').join('');

/* A label line followed by either raw markdown or a fragment rendered by an earlier run. */
const BLOCK = /(<summary class="labelStyle darkItem">([^<]*\.md)<\/summary>\n|<h5 class="indent">([^<]*\.md)<\/h5>\n)(?:<pre><code class="language-markdown">[\s\S]*?<\/code><\/pre>|<div class="mdview">[\s\S]*?\n<\/div>)/g;

function indexSources(dir) {
  const found = {};
  (function walk(rel) {
    for (const e of fs.readdirSync(path.join(ROOT, rel), { withFileTypes: true })) {
      if (e.isDirectory()) { if (e.name.toLowerCase() !== 'archive') walk(rel + '/' + e.name); }
      else if (e.name.endsWith('.md')) (found[e.name] ||= []).push(rel + '/' + e.name);
    }
  })(dir);
  return found;
}

function render(repoRelPath) {
  const dir = path.posix.dirname(repoRelPath);
  const md = new MarkdownIt({ html: false, linkify: false, typographer: false });
  // a relative .md link resolves to nothing from the pages folder, so point it at the repo
  md.renderer.rules.link_open = (tokens, i, opts, env, self) => {
    const href = tokens[i].attrGet('href');
    if (href && !/^[a-z]+:|^#/.test(href)) {
      const isDir = href.endsWith('/');
      const target = path.posix.normalize(path.posix.join(dir, href)).replace(/\/$/, '');
      tokens[i].attrSet('href', `${CONFIG.repo}/${isDir ? 'tree' : 'blob'}/${CONFIG.branch}/${target}`);
      tokens[i].attrSet('target', '_blank');
    }
    return self.renderToken(tokens, i, opts);
  };
  let body = md.render(fs.readFileSync(path.join(ROOT, repoRelPath), 'utf8'));
  // the page owns h2 and h3 already, so the embedded document starts a level down
  for (const n of [5, 4, 3, 2, 1]) body = body.replace(new RegExp(`<(/?)h${n}>`, 'g'), `<$1h${n + 1}>`);
  // unlabelled fences and indented blocks need the class prism keys the page's code styling on
  body = body.replace(/<pre><code>/g, '<pre><code class="language-text">');
  return `<div class="mdview">\n${body}</div>`;
}

function main() {
  const args = process.argv.slice(2);
  const check = args.includes('--check');
  const only = (i => i < 0 ? null : args[i + 1])(args.indexOf('--page'));

  const sources = indexSources(CONFIG.source);
  const pagesDir = path.join(ROOT, CONFIG.pages);
  let changed = 0, rendered = 0, missing = [];

  for (const file of fs.readdirSync(pagesDir).filter(n => CONFIG.pageName.test(n))) {
    if (only && file !== only) continue;
    const full = path.join(pagesDir, file);
    const before = fs.readFileSync(full, 'utf8');
    const names = [];

    BLOCK.lastIndex = 0;
    let html = before.replace(BLOCK, (m, head, a, b) => {
      const name = a || b;
      const hits = sources[name];
      if (!hits) { missing.push(`${file}: no source found for ${name}`); return m; }
      if (hits.length > 1) console.warn(`ambiguous: ${name} -> ${hits.join(', ')}; using the first`);
      names.push(name);
      return head + render(hits[0]);
    });

    if (!names.length && !html.includes('class="mdview"')) continue;
    html = html.replace(/^ *#github \.mdview .*\n/gm, '');
    const i = html.indexOf('</style>');
    if (i < 0) { missing.push(`${file}: no <style> block to hold the rule set`); continue; }
    html = html.slice(0, i) + CSS + '  ' + html.slice(i);

    rendered += names.length;
    if (html === before) continue;
    changed++;
    console.log(`${check ? 'would update' : 'updated'} ${file}  (${names.length}: ${names.join(', ')})`);
    if (!check) fs.writeFileSync(full, html, 'utf8');
  }

  console.log(`\n${rendered} documents, ${changed} page(s) ${check ? 'would change' : 'changed'}`);
  for (const m of missing) console.error('MISSING ' + m);
  process.exit(missing.length ? 1 : 0);
}

main();
