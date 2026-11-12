// Appends a fallback for PDF.js's light-dark() colours to dist/pdfjs/web/viewer.css, for
// browsers without light-dark() (Safari/iOS < 17.5). There those custom properties come out
// invalid, so toolbar icons, fields and menus lose their colours and the icons disappear (#457).
// Only the top-level :root variables are covered (toolbar, fields, menus, dialogs). The light
// value goes on :root and the dark value on our dark theme classes; @supports keeps every
// browser with light-dark() on PDF.js's own CSS.
import { readFileSync, appendFileSync } from 'node:fs';

const FILE = 'dist/pdfjs/web/viewer.css';
const css = readFileSync(FILE, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

// light-dark(a, b) -> a (pick 0) or b (pick 1); a and b may hold nested functions.
function resolve(value, pick) {
  let out = '', i = 0, at;
  while ((at = value.indexOf('light-dark(', i)) !== -1) {
    out += value.slice(i, at);
    let depth = 0, comma = -1, j = at + 'light-dark'.length;
    for (; j < value.length; j++) {
      const c = value[j];
      if (c === '(') depth++;
      else if (c === ')' && --depth === 0) break;
      else if (c === ',' && depth === 1 && comma === -1) comma = j;
    }
    const inner = pick === 0 ? value.slice(at + 11, comma) : value.slice(comma + 1, j);
    out += resolve(inner.trim(), pick);
    i = j + 1;
  }
  return out + value.slice(i);
}

// Declarations directly inside top-level `:root { }` blocks (nested rules skipped).
const decls = [];
let depth = 0, start = 0, inRoot = false, text = '';
for (let i = 0; i < css.length; i++) {
  const c = css[i];
  if (c === '{') {
    if (depth === 0) inRoot = css.slice(start, i).trim() === ':root';
    depth++;
  } else if (c === '}') {
    if (--depth === 0) { if (inRoot) decls.push(...text.split(';')); inRoot = false; text = ''; start = i + 1; }
  } else if (inRoot && depth === 1) text += c;
}
const vars = decls.map((d) => d.trim()).filter((d) => d.startsWith('--') && d.includes('light-dark('));
if (!vars.length) throw new Error(`light-dark-fallback: no light-dark() variables found in ${FILE}`);

const block = (pick) => vars.map((d) => {
  const colon = d.indexOf(':');
  return `    ${d.slice(0, colon)}: ${resolve(d.slice(colon + 1).trim(), pick).replace(/\s+/g, ' ')};`;
}).join('\n');
appendFileSync(FILE, `
@supports not (color: light-dark(tan, tan)) {
  :root {
${block(0)}
  }
  .ng2-theme-dark, .ng2-theme-dark-active {
${block(1)}
  }
}
`);
console.log(`${FILE}: light-dark() fallback for ${vars.length} variables`);
