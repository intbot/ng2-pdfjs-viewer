// Keeps the whole-million download figure ("9M+") current everywhere it can't be fetched live:
// README text and banner, npm description, SEO text, llms.txt, the live components' fallbacks,
// the sample-PDF generator. The README badge, docs pages and playground hero read
// docs-website/api/downloads.ts live; this covers the static copies.
//
// Every tracked text file is scanned, so a new mention is covered as long as it's written `9M+`.
// A count written any other way ("9 million") fails the run so it gets noticed.
// Re-renders lib/pdf-viewer-banner.png here; the workflow re-renders the sample PDF and the
// showcase screenshot when this reports changed=true.
//
// Run weekly by .github/workflows/downloads-milestone.yml. Locally (Node 24+, Chrome installed):
//   node scripts/downloads-milestone.mjs
//   DOWNLOADS_TOTAL=10000000 node scripts/downloads-milestone.mjs   # fake a total to try it out
import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { totalDownloads } from '../docs-website/api/downloads.ts';

process.chdir(fileURLToPath(new URL('..', import.meta.url)));

const TEXT = /\.(md|mdx|ts|tsx|js|mjs|cjs|html|json|txt|ya?ml|cff)$/;
const SKIP = [
  /^lib\/pdfjs\//, // vendored PDF.js
  /package-lock\.json$/,
  /^CHANGELOG\.md$/, // history: past entries keep the figure they shipped with
  /^scripts\/downloads-milestone\.mjs$/, // this file's comments
  /^docs-website\/api\/downloads\.ts$/, // the formatter's examples
];
const FILES = execFileSync('git', ['ls-files'], { encoding: 'utf8' })
  .split('\n')
  .filter((f) => TEXT.test(f) && !SKIP.some((re) => re.test(f)));
const BANNER = 'scripts/readme-banner.html';

const total = Number(process.env.DOWNLOADS_TOTAL) || (await totalDownloads());
const millions = `${Math.floor(total / 1e6)}M+`;
const years = String(Math.floor((Date.now() - Date.UTC(2018, 2, 29)) / (365.25 * 86_400_000)));
console.log(`total ${total} -> ${millions}, ${years} years since the first publish`);

let changed = false;
let bannerChanged = false;
const unhandled = [];
for (const f of FILES) {
  const before = readFileSync(f, 'utf8');
  for (const m of before.matchAll(/.{0,30}\b\d+(?:\.\d+)?\+? ?million (?:downloads|installs).{0,10}/gi)) {
    unhandled.push(`${f}: ${m[0].trim()}`);
  }
  const after = before
    .replace(/\b\d+(?:\.\d)?M\+/g, millions)
    // "8 yrs" on the banner and sample infographic, "8 years (since 2018)" in the README alt text
    .replace(/\b\d+(?= (?:yrs<|years \(since 2018\)))/g, years);
  if (after === before) continue;
  writeFileSync(f, after);
  console.log(`updated ${f}`);
  changed = true;
  if (f === BANNER) bannerChanged = true;
}
if (unhandled.length) {
  throw new Error(`Write download counts as "${millions}" so this script can keep them current:\n  ${unhandled.join('\n  ')}`);
}

if (bannerChanged) {
  const chrome = [
    process.env.CHROME_PATH,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    '/usr/bin/google-chrome',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ].find((p) => p && existsSync(p));
  if (!chrome) throw new Error('Chrome not found; set CHROME_PATH');
  execFileSync(chrome, [
    '--headless',
    '--hide-scrollbars',
    '--force-device-scale-factor=2',
    '--window-size=1040,250',
    '--default-background-color=00000000', // transparent outside the rounded corners
    `--screenshot=${fileURLToPath(new URL('../lib/pdf-viewer-banner.png', import.meta.url))}`,
    pathToFileURL(BANNER).href,
  ]);
  console.log('rendered lib/pdf-viewer-banner.png');
}

if (process.env.GITHUB_OUTPUT) {
  appendFileSync(process.env.GITHUB_OUTPUT, `millions=${millions}\nchanged=${changed}\n`);
}
