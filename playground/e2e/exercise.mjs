// Exercises each page's controls + the shell to surface runtime/layout bugs.
import puppeteer from 'puppeteer';
import { fileURLToPath } from 'node:url';
const BASE = process.argv[2] || 'http://localhost:4300';
// gitignored — see playground/.gitignore
const SHOTS = fileURLToPath(new URL('./shots/exercise/', import.meta.url));
import { mkdirSync } from 'node:fs';
mkdirSync(SHOTS, { recursive: true });

const PAGES = ['', 'quickstart', 'sources', 'toolbar', 'navigation', 'theming',
  'auto-actions', 'loading', 'errors', 'localization', 'events', 'config-objects', 'api'];

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
const findings = [];

for (const route of PAGES) {
  const name = route || 'overview';
  const p = await browser.newPage();
  await p.setViewport({ width: 1440, height: 960 });
  const errors = [];
  p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  p.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
  await p.goto(`${BASE}/#/${route}`, { waitUntil: 'networkidle2', timeout: 45000 });
  await p.waitForSelector('pg-shell');
  await new Promise((r) => setTimeout(r, 1500));

  // exercise controls
  try {
    // toggles
    for (const sw of await p.$$('pg-page [controls] .switch')) { await sw.click(); await new Promise(r=>setTimeout(r,120)); }
    // selects: pick last option
    for (const sel of await p.$$('pg-page [controls] select.ctl-input')) {
      const opts = await sel.$$('option');
      if (opts.length > 1) { const v = await (await opts[opts.length-1].getProperty('value')).jsonValue(); await sel.select(v); await new Promise(r=>setTimeout(r,150)); }
    }
    // seg buttons
    for (const b of await p.$$('pg-page [controls] .seg button')) { await b.click(); await new Promise(r=>setTimeout(r,80)); }
    // tabs: Split then Code then Preview
    const tabs = await p.$$('pg-page .tabbar .seg button');
    if (tabs[2]) { await tabs[2].click(); await new Promise(r=>setTimeout(r,300)); await p.screenshot({ path: `${SHOTS}/${name}-split.png` }); }
    if (tabs[0]) { await tabs[0].click(); await new Promise(r=>setTimeout(r,200)); }
    // width presets
    for (const w of await p.$$('pg-page .widths button')) { await w.click(); await new Promise(r=>setTimeout(r,150)); }
  } catch (e) { errors.push('INTERACT: ' + e.message); }

  const fatal = errors.filter((e) => !/favicon|sourcemap|DevTools|Download the .* DevTools/i.test(e));
  if (fatal.length) findings.push({ name, errors: [...new Set(fatal)].slice(0, 5) });
  await p.close();
}

// Shell test: switch sample PDFs on the navigation page
{
  const p = await browser.newPage();
  await p.setViewport({ width: 1440, height: 960 });
  const errors = [];
  p.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
  await p.goto(`${BASE}/#/navigation`, { waitUntil: 'networkidle2' });
  await p.waitForSelector('.top .srcpick select');
  for (const id of ['guide', 'invoice', 'infographic', 'research']) {
    try { await p.select('.top .srcpick select', id); await new Promise(r=>setTimeout(r,2500)); } catch (e) { errors.push('SAMPLE '+id+': '+e.message); }
  }
  await p.screenshot({ path: `${SHOTS}/sample-switch.png` });
  const fatal = errors.filter((e) => !/favicon|sourcemap/i.test(e));
  if (fatal.length) findings.push({ name: 'SAMPLE-SWITCH', errors: [...new Set(fatal)].slice(0,5) });
  await p.close();
}

await browser.close();
console.log('\n=== Exercise findings ===');
if (!findings.length) console.log('No console/page errors across all interactions. ✔');
for (const f of findings) { console.log(`\n[${f.name}]`); f.errors.forEach((e)=>console.log('  ! '+e)); }
console.log(`\nScreenshots → ${SHOTS}`);
