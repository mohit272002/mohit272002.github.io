const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');

const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css  = fs.readFileSync(path.join(root, 'assets/css/styles.css'), 'utf8');
const js   = fs.readFileSync(path.join(root, 'assets/js/main.js'), 'utf8');

let fail = 0;
const ok  = (m) => console.log('  OK   ' + m);
const bad = (m) => { fail++; console.log('  FAIL ' + m); };

// strip BEM modifiers only (an alphanumeric followed by `--`), so a token like
// `--bg` is left intact while `.btn--primary` collapses to `.btn`
const stripMod = (s) => s.replace(/([a-zA-Z0-9])--[a-zA-Z0-9_-]*/g, '$1');

console.log('── CSS ──');
const cssClasses = new Set();
for (const m of css.matchAll(/\.([a-zA-Z][a-zA-Z0-9_-]*)/g)) cssClasses.add(stripMod(m[1]));
{
  let o = 0, c = 0, line = 1, badLine = null;
  for (const ch of css) {
    if (ch === '\n') line++;
    if (ch === '{') o++;
    if (ch === '}') { c++; if (o < c && badLine === null) badLine = line; }
  }
  (o === c) ? ok(`braces balanced (${o})`) : bad(`brace mismatch: open=${o} close=${c} firstExtraClose@line ${badLine}`);

  // lookbehind excludes BEM modifiers like `.section--alt::before`
  const defined = new Set([...css.matchAll(/(?<![a-zA-Z0-9])(--[a-z0-9-]+)\s*:/g)].map(x => x[1]));
  const used    = new Set([...css.matchAll(/var\(\s*(--[a-z0-9-]+)/g)].map(x => x[1]));
  const undef   = [...used].filter(v => !defined.has(v));
  undef.length ? bad('undefined CSS vars: ' + undef.join(', ')) : ok(`all ${used.size} custom properties are defined`);

  const unused = [...defined].filter(v => {
    const body = css.slice(css.indexOf('}', css.indexOf(v + ':')));
    return !new RegExp('var\\(\\s*' + v.replace(/[-]/g, '\\-')).test(body);
  });
  if (unused.length) console.log('  note unused custom props: ' + unused.join(', '));
}

console.log('── HTML ──');
{
  const voids = new Set(['area','base','br','col','embed','hr','img','input','link','meta',
                         'source','track','wbr','path','circle','rect','ellipse','use',
                         'stop','polygon','line','polyline']);
  const stack = [];
  const errs  = [];
  const re = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)((?:"[^"]*"|'[^']*'|[^>"'])*?)(\/?)>/g;
  let m;
  while ((m = re.exec(html))) {
    const closing = m[1] === '/';
    const tag     = m[2].toLowerCase();
    const self    = m[4] === '/';
    if (voids.has(tag) || self) continue;
    if (closing) {
      const top = stack.pop();
      if (top !== tag) errs.push(`</${tag}> closed while <${top || 'nothing'}> was open`);
    } else stack.push(tag);
  }
  stack.length ? bad('unclosed tags: ' + stack.join(' > ')) : ok('all tags closed');
  errs.length  ? bad('nesting errors: ' + errs.slice(0, 6).join(' | ')) : ok('nesting correct');

  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map(x => x[1]));
  const dupCheck = [...html.matchAll(/\sid="([^"]+)"/g)].map(x => x[1]);
  const dupes = dupCheck.filter((v, i) => dupCheck.indexOf(v) !== i);
  dupes.length ? bad('duplicate ids: ' + [...new Set(dupes)].join(', ')) : ok(`${ids.size} unique ids`);

  const anchors = [...html.matchAll(/href="#([^"]+)"/g)].map(x => x[1]);
  const missing = [...new Set(anchors)].filter(a => !ids.has(a));
  missing.length ? bad('anchors with no target: ' + missing.join(', '))
                 : ok(`all ${new Set(anchors).size} in-page anchors resolve`);

  const localRefs = [...html.matchAll(/(?:src|href)="(?!https?:|mailto:|tel:|#|data:)([^"]+)"/g)].map(x => x[1]);
  const missingFiles = localRefs.filter(p => !fs.existsSync(path.join(root, p)));
  missingFiles.length ? bad('missing local files: ' + missingFiles.join(', '))
                      : ok(`all ${localRefs.length} local asset references exist`);

  // accessibility spot checks
  const imgs = [...html.matchAll(/<img\b[^>]*>/g)].map(x => x[0]);
  const noAlt = imgs.filter(t => !/\balt="[^"]+"/.test(t));
  noAlt.length ? bad(`${noAlt.length} <img> without alt`) : ok(`all ${imgs.length} images have alt text`);

  const h1 = (html.match(/<h1\b/g) || []).length;
  h1 === 1 ? ok('exactly one <h1>') : bad(`expected 1 <h1>, found ${h1}`);

  const htmlLangs = (html.match(/<html\b[^>]*\blang="/g) || []).length;
  htmlLangs ? ok('<html lang> set') : bad('<html> missing lang attribute');

  // tags may be pretty-printed across lines, so allow whitespace around
  // attribute names/values instead of assuming one tag per line
  const rawTitle = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1];
  const title = rawTitle && rawTitle.replace(/\s+/g, ' ').trim();
  title
    ? ok(`title present (${title.length} chars)`)
    : bad('missing <title>');

  const descTag =
    /<meta\b[^>]*\bname\s*=\s*"description"[^>]*\bcontent\s*=\s*"([^"]*)"/i.exec(html);
  const descVal = descTag && descTag[1].replace(/\s+/g, ' ').trim();
  descVal
    ? ok(`meta description present (${descVal.length} chars)`)
    : bad('missing meta description');

  const viewport = /<meta\b[^>]*\bname\s*=\s*"viewport"/i.test(html);
  viewport ? ok('viewport meta present') : bad('missing viewport meta');
}

console.log('── CSS ↔ HTML class cross-check ──');
{
  const cssClasses = new Set();
  for (const m of css.matchAll(/\.([a-zA-Z][a-zA-Z0-9_-]*)/g)) cssClasses.add(m[1]);
  const htmlClasses = new Set();
  for (const m of html.matchAll(/\sclass="([^"]+)"/g)) m[1].split(/\s+/).forEach(c => c && htmlClasses.add(c));
  const orphan = [...htmlClasses].filter(c => !cssClasses.has(c));
  orphan.length ? bad('HTML classes with no CSS rule: ' + orphan.join(', '))
                : ok(`all ${htmlClasses.size} used classes are styled`);
}

console.log('── JS ──');
{
  const refs = [...js.matchAll(/getElementById\('([^']+)'\)/g)].map(x => x[1]);
  const ids  = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map(x => x[1]));
  const miss = [...new Set(refs)].filter(r => !ids.has(r));
  miss.length ? bad('JS getElementById targets missing: ' + miss.join(', '))
              : ok(`all ${new Set(refs).size} JS id lookups exist`);

  const sel = [...js.matchAll(/querySelectorAll\('([^']+)'\)/g)].map(x => x[1]);
  const missSel = [...new Set(sel)].filter(s => {
    const cls = (s.match(/\.([a-zA-Z][\w-]*)/) || [])[1];
    return cls && !cssClasses.has(cls);
  });
  missSel.length ? bad('JS selectors referencing unknown classes: ' + missSel.join(', '))
                 : ok(`all ${new Set(sel).size} JS selector roots are styled classes`);
}

console.log('');
console.log(fail === 0 ? '✓ all checks passed' : `✗ ${fail} check(s) failed`);
process.exit(fail === 0 ? 0 : 1);