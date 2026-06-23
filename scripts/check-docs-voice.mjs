#!/usr/bin/env node
// check-docs-voice.mjs — flags filler and marketing-speak in Markdown/MDX prose.
//
// Usage:
//   node scripts/check-docs-voice.mjs --staged         # added lines of staged *.md/*.mdx (pre-commit)
//   node scripts/check-docs-voice.mjs --base=<ref>     # added lines of *.md/*.mdx vs <ref> (CI on a PR)
//   node scripts/check-docs-voice.mjs <file> ...       # whole files (PR body temp file / manual)
//
// Two tiers:
//   BLOCK — hype/filler with ~no place in honest docs. Exit 1 (fails the commit).
//   WARN  — softer or brand-adjacent tells. Printed, never blocks.
//
// Brand language is intentional and NOT flagged: "comprehensive", "feature-rich",
// "AI-enabled", "mobile-first", "#1". Keep those. The point is to cut filler and
// marketing-speak, not our positioning. Tune the lists below as the docs evolve.
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const BLOCK = [
  [/\bblazing[\s-]?fast\b/i, 'hype: "blazing fast"'],
  [/\bworld[\s-]?class\b/i, 'hype: "world-class"'],
  [/\bgame[\s-]?chang(ing|er)\b/i, 'hype: "game-changing"'],
  [/\bcutting[\s-]?edge\b/i, 'hype: "cutting-edge"'],
  [/\bbest[\s-]?in[\s-]?class\b/i, 'hype: "best-in-class"'],
  [/\bnext[\s-]?level\b/i, 'hype: "next-level"'],
  [/\bsupercharg/i, 'hype: "supercharge"'],
  [/\bunleash/i, 'hype: "unleash"'],
  [/\bseamless(ly)?\b/i, 'filler: "seamless"'],
  [/\beffortless(ly)?\b/i, 'filler: "effortless"'],
  [/\brevolutioniz/i, 'hype: "revolutionize"'],
  [/\bharness the power\b/i, 'cliché: "harness the power"'],
  [/\bsay goodbye to\b/i, 'cliché: "say goodbye to"'],
  [/\blook no further\b/i, 'cliché: "look no further"'],
  [/\belevate your\b/i, 'cliché: "elevate your"'],
  [/\bdive (in|into)\b/i, 'filler: "dive in/into"'],
  [/\bwelcome to the (comprehensive )?(documentation|docs)\b/i, 'generic opener: "Welcome to the … documentation"'],
  [/\bin this (guide|article|tutorial|section),? we['’]?ll\b/i, 'tutorial filler: "in this guide we\'ll"'],
  [/\bby the end of this\b/i, 'tutorial filler: "by the end of this"'],
  [/\bwhether you['’]?re\b.*\bor\b/i, 'opener cliché: "whether you\'re X or Y"'],
];

const WARN = [
  [/\bproduction[\s-]?ready\b/i, 'soft superlative: "production-ready"'],
  [/\bpacked with\b/i, 'marketing: "packed with"'],
  [/\bdesigned for modern\b/i, 'marketing: "designed for modern"'],
  [/\b(a )?(rich|wide) (set|range|array) of\b/i, 'marketing: "rich set of"'],
  [/\bplethora\b/i, 'marketing: "plethora"'],
  [/\bout[\s-]?of[\s-]?the[\s-]?box\b/i, 'cliché: "out of the box"'],
  [/\b(powerful|robust)\b/i, 'generic adjective (prefer a concrete fact)'],
];

const EMDASH_WARN = 4; // per file's scanned content

// Parse `git diff --unified=0` output into { file, line, text } rows for each
// ADDED line, so we only flag what a change introduces, not pre-existing prose.
function parseAddedLines(out) {
  const rows = [];
  let file = null;
  let newLine = 0;
  for (const raw of out.split('\n')) {
    if (raw.startsWith('+++ ')) { file = raw.slice(4).replace(/^b\//, ''); continue; }
    if (raw.startsWith('--- ')) continue;
    const h = raw.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
    if (h) { newLine = parseInt(h[1], 10); continue; }
    if (raw.startsWith('+')) { rows.push({ file, line: newLine, text: raw.slice(1) }); newLine++; }
  }
  return rows;
}

// Added Markdown/MDX lines for a `git diff` selector: '--cached' for the
// pre-commit hook, '<base>...HEAD' for CI against the PR base.
function addedLines(selector) {
  let out = '';
  try {
    out = execSync(`git diff ${selector} --unified=0 --no-color -- "*.md" "*.mdx"`, { encoding: 'utf8' });
  } catch {
    return [];
  }
  return parseAddedLines(out);
}

function wholeFileLines(files) {
  const rows = [];
  for (const f of files) {
    let txt;
    try { txt = readFileSync(f, 'utf8'); } catch { continue; }
    txt.split('\n').forEach((text, i) => rows.push({ file: f, line: i + 1, text }));
  }
  return rows;
}

const args = process.argv.slice(2);
const baseArg = args.find((a) => a.startsWith('--base='));
let rows;
if (args.includes('--staged')) {
  rows = addedLines('--cached');                                   // pre-commit hook
} else if (baseArg) {
  rows = addedLines(`${baseArg.slice('--base='.length)}...HEAD`);  // CI: added lines vs PR base
} else {
  rows = wholeFileLines(args.filter((a) => !a.startsWith('--')));  // whole files (PR body, manual)
}

const blocks = [];
const warns = [];
const emdash = new Map();
let inFence = false;
let curFile = null;
for (const { file, line, text } of rows) {
  if (file !== curFile) { curFile = file; inFence = false; }
  if (/^\s*(```|~~~)/.test(text)) { inFence = !inFence; continue; } // fenced code block toggle
  if (inFence) continue;
  if (/^\s{4,}\S/.test(text)) continue; // indented code block
  const prose = text.replace(/`[^`]*`/g, ''); // ignore inline code (e.g. a list of banned words shown as `code`)
  for (const [re, label] of BLOCK) if (re.test(prose)) blocks.push({ file, line, label, text: text.trim() });
  for (const [re, label] of WARN) if (re.test(prose)) warns.push({ file, line, label, text: text.trim() });
  const dashes = (prose.match(/—/g) || []).length;
  if (dashes) emdash.set(file, (emdash.get(file) || 0) + dashes);
}

const fmt = (f) => `  ${f.file}:${f.line}  ${f.label}\n      ${f.text.slice(0, 100)}`;
if (!rows.length) { console.log('docs-style: nothing to scan.'); process.exit(0); }

if (warns.length || [...emdash.values()].some((n) => n >= EMDASH_WARN)) {
  console.log('\n⚠ docs-style WARN (review, not blocking):');
  warns.forEach((w) => console.log(fmt(w)));
  for (const [f, n] of emdash) if (n >= EMDASH_WARN) console.log(`  ${f}  em-dash density: ${n} — prefer periods/commas`);
}
if (blocks.length) {
  console.log('\n✗ docs-style BLOCK (filler — rewrite before committing):');
  blocks.forEach((b) => console.log(fmt(b)));
  console.log('\nSee the writing rule in CONTRIBUTING.md / CLAUDE.md. Bypass once with `git commit --no-verify`.\n');
  process.exit(1);
}
console.log(`docs-style: clean${warns.length ? ' (warnings above)' : ''}.`);
process.exit(0);
