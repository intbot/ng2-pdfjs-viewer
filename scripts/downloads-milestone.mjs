// Keeps the whole-million download figure ("9M+") current in the files that can't fetch it live
// (npm description, SEO text, the live components' fallbacks, the README banner), and re-renders
// lib/pdf-viewer-banner.png when the banner's numbers change. The README badge, docs pages and
// playground read docs-website/api/downloads.ts live; this only covers the static copies.
//
// Run weekly by .github/workflows/downloads-milestone.yml. Locally (Node 24+, Chrome installed):
//   node scripts/downloads-milestone.mjs
//   DOWNLOADS_TOTAL=10000000 node scripts/downloads-milestone.mjs   # fake a total to try it out
import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { totalDownloads } from '../docs-website/api/downloads.ts';

process.chdir(fileURLToPath(new URL('..', import.meta.url)));

// Every `<n>M+` / `<n.n>M+` in these files is the download count; keep it that way.
const FILES = [
  'README.md',
  'CLAUDE.md',
  'lib/package.json',
  'scripts/readme-banner.html',
  'docs-website/static/llms.txt',
  'docs-website/docs/by-the-numbers.md',
  'docs-website/src/pages/index.tsx',
  'docs-website/src/components/Downloads.tsx',
  'playground/src/app/pages/overview/overview.component.ts',
];
const BANNER = 'scripts/readme-banner.html';

const total = Number(process.env.DOWNLOADS_TOTAL) || (await totalDownloads());
const millions = `${Math.floor(total / 1e6)}M+`;
const years = String(Math.floor((Date.now() - Date.UTC(2018, 2, 29)) / (365.25 * 86_400_000)));
console.log(`total ${total} -> ${millions}, ${years} years since the first publish`);

let bannerChanged = false;
for (const f of FILES) {
  const before = readFileSync(f, 'utf8');
  const after = before
    .replace(/\b\d+(?:\.\d)?M\+/g, millions)
    // "8 yrs" on the banner, "8 years (since 2018)" in the README's banner alt text
    .replace(/\b\d+(?= (?:yrs<|years \(since 2018\)))/g, years);
  if (after === before) continue;
  writeFileSync(f, after);
  console.log(`updated ${f}`);
  if (f === BANNER) bannerChanged = true;
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

if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `millions=${millions}\n`);
