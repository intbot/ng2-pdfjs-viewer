// Headless browser smoke + screenshot pass for the playground.
// Usage: node e2e/browser-check.mjs [baseUrl]
import puppeteer from 'puppeteer';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const BASE = process.argv[2] || 'http://localhost:4300';
// gitignored — see playground/.gitignore
const SHOTS = fileURLToPath(new URL('./shots/', import.meta.url));
mkdirSync(SHOTS, { recursive: true });

const PAGES = [
  ['overview', ''],
  ['quickstart', 'quickstart'],
  ['sources', 'sources'],
  ['toolbar', 'toolbar'],
  ['navigation', 'navigation'],
  ['theming', 'theming'],
  ['auto-actions', 'auto-actions'],
  ['loading', 'loading'],
  ['errors', 'errors'],
  ['localization', 'localization'],
  ['events', 'events'],
  ['config-objects', 'config-objects'],
  ['api', 'api'],
];

// Pages we capture screenshots for (the visually important ones).
const SHOT = new Set(['overview', 'navigation', 'theming', 'events', 'toolbar', 'auto-actions', 'localization']);

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
const results = [];

for (const [name, route] of PAGES) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 960, deviceScaleFactor: 1 });
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));

  const url = `${BASE}/#/${route}`;
  let ok = true, note = '';
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 });
    await page.waitForSelector('pg-shell', { timeout: 15000 });
    // wait a beat for lazy chunk + viewer iframe
    await new Promise((r) => setTimeout(r, 1800));
    const hasViewer = await page.$('ng2-pdfjs-viewer') !== null || name === 'overview';
    const heading = await page.$eval('h1', (el) => el.textContent?.trim()).catch(() => '(no h1)');
    note = `h1="${heading}" viewer=${hasViewer}`;
    if (SHOT.has(name)) {
      await page.screenshot({ path: `${SHOTS}/${name}.png`, fullPage: name === 'overview' });
    }
  } catch (e) {
    ok = false; note = 'NAV FAIL: ' + e.message;
  }
  // ignore noisy non-fatal favicon / pdf.worker warnings
  const fatal = errors.filter((e) => !/favicon|sourcemap|DevTools/i.test(e));
  results.push({ name, ok: ok && fatal.length === 0, note, errors: fatal.slice(0, 4) });
  await page.close();
}

await browser.close();

console.log('\n=== Playground browser check ===');
let pass = 0;
for (const r of results) {
  const status = r.ok ? 'PASS' : 'FAIL';
  if (r.ok) pass++;
  console.log(`[${status}] ${r.name.padEnd(16)} ${r.note}`);
  for (const e of r.errors) console.log(`         ! ${e}`);
}
console.log(`\n${pass}/${results.length} pages OK. Screenshots in ${SHOTS}`);
process.exit(pass === results.length ? 0 : 1);
