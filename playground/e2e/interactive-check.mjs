// Interactive verification: ⌘K palette navigation, share-URL round-trip, light theme.
import puppeteer from 'puppeteer';
import { fileURLToPath } from 'node:url';

const BASE = process.argv[2] || 'http://localhost:4300';
// gitignored — see playground/.gitignore
const SHOTS = fileURLToPath(new URL('./shots/', import.meta.url));
const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
const out = [];
const ok = (n, c) => out.push(`[${c ? 'PASS' : 'FAIL'}] ${n}`);

// 1) Command palette: open with Ctrl+K, search, Enter → navigates
{
  const p = await browser.newPage();
  await p.setViewport({ width: 1440, height: 960 });
  await p.goto(`${BASE}/#/navigation`, { waitUntil: 'networkidle2' });
  await p.waitForSelector('pg-shell');
  await new Promise((r) => setTimeout(r, 800));
  await p.keyboard.down('Control'); await p.keyboard.press('KeyK'); await p.keyboard.up('Control');
  await p.waitForSelector('pg-command-palette input', { timeout: 5000 });
  await p.type('pg-command-palette input', 'theming');
  await new Promise((r) => setTimeout(r, 300));
  await p.keyboard.press('Enter');
  await new Promise((r) => setTimeout(r, 800));
  ok('⌘K palette navigates to Theming', /#\/theming/.test(p.url()));
  await p.close();
}

// 2) Share-URL round-trip on Theming: pick a color → URL gets ?s= → reload restores it
{
  const p = await browser.newPage();
  await p.setViewport({ width: 1440, height: 960 });
  await p.goto(`${BASE}/#/theming`, { waitUntil: 'networkidle2' });
  await p.waitForSelector('pg-theming .swatch i', { timeout: 8000 });
  await new Promise((r) => setTimeout(r, 600));
  // click the violet swatch (2nd = #7c5cff)
  const swatches = await p.$$('pg-theming .swatch i');
  await swatches[1].click();
  await new Promise((r) => setTimeout(r, 500));
  const shared = p.url();
  const hasState = /[?&]s=/.test(shared);
  await p.close();

  const p2 = await browser.newPage();
  await p2.setViewport({ width: 1440, height: 960 });
  await p2.goto(shared, { waitUntil: 'networkidle2' });
  await p2.waitForSelector('pg-theming', { timeout: 8000 });
  await new Promise((r) => setTimeout(r, 600));
  // switch to Code tab and confirm the snippet carries the restored color
  const tabs = await p2.$$('pg-page .seg button');
  await tabs[1].click();
  await new Promise((r) => setTimeout(r, 300));
  const code = await p2.$eval('pg-page pre', (el) => el.textContent || '').catch(() => '');
  ok('Share URL encodes state (?s=)', hasState);
  ok('Reloaded link restores primaryColor', code.includes('#7c5cff'));
  await p2.close();
}

// 3) Light theme toggle + screenshot
{
  const p = await browser.newPage();
  await p.setViewport({ width: 1440, height: 960 });
  await p.goto(`${BASE}/#/theming`, { waitUntil: 'networkidle2' });
  await p.waitForSelector('pg-shell');
  await new Promise((r) => setTimeout(r, 600));
  await p.click('.top .ghost'); // theme toggle
  await new Promise((r) => setTimeout(r, 500));
  const mode = await p.evaluate(() => document.documentElement.getAttribute('data-theme'));
  ok('Theme toggle switches to light', mode === 'light');
  await p.screenshot({ path: `${SHOTS}/theming-light.png` });
  await p.close();
}

await browser.close();
console.log('\n=== Interactive checks ===');
out.forEach((l) => console.log(l));
const passed = out.filter((l) => l.startsWith('[PASS]')).length;
console.log(`\n${passed}/${out.length} interactive checks passed.`);
process.exit(passed === out.length ? 0 : 1);
