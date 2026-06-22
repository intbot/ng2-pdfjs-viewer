# ng2-pdfjs-viewer

**The most comprehensive Angular PDF viewer, powered by Mozilla PDF.js.**

An Angular component library that wraps PDF.js in a single `<ng2-pdfjs-viewer>` component:
viewing, printing, annotations, zoom, search, theming, and a large declarative input/event
surface. 8.3M+ downloads. Published to npm as `ng2-pdfjs-viewer`. Open source under
Apache-2.0 (Commons Clause).

## Positioning

Public, OSS-first. Lead with breadth, mobile-first, and production-readiness. Working notes
that aren't meant for the public repo live in `internal/` (see below); the public repo stays
neutral — describe code changes, not plans.

## Tech Stack

- **Library:** Angular (peer dep `>=10`, built/tested on Angular 22 — requires Node ≥22.22/≥24.15
  and TypeScript 6.0 for the toolchain), TypeScript, packaged with
  **ng-packagr** → FESM2022. Bundled Mozilla **PDF.js** assets under `lib/pdfjs/`.
- **Local dev link:** **yalc** wires the built lib into the playground for local development.
- **Demo app:** `playground/` (Angular 22 feature explorer; the deployed demo at
  `angular-pdf-viewer-demo.vercel.app`).
- **Docs site:** `docs-website/` (Docusaurus, deployed to Vercel).

## Repository Structure

```
lib/                         — the published npm package (ng2-pdfjs-viewer)
  index.ts                   — public entry: re-exports module, component, and ViewerTypes
  ng-package.json            — ng-packagr config (entry file + pdfjs assets)
  package.json               — npm package manifest + build scripts
  src/
    ng2-pdfjs-viewer.component.ts   — the main component (large; the bulk of the API surface)
    ng2-pdfjs-viewer.module.ts      — NgModule
    interfaces/ViewerTypes.ts       — all exported public types/event interfaces
    managers/ActionQueueManager.ts  — queues viewer actions until the iframe is ready
    utils/
      ChangeOriginTracker.ts        — distinguishes user-driven vs programmatic changes
      ComponentUtils.ts             — shared helpers
      PropertyTransformers.ts       — input coercion/transforms
  pdfjs/                     — bundled PDF.js viewer + worker assets (shipped as package assets)
  logo.svg, pdf-viewer-banner.png — brand assets (F1 shield icon + README stats banner, referenced by raw URL)
  v5-upgrade.md              — migration guide
  (the README lives at the repo root; `npm run build` copies it into dist/ for npm)
playground/                  — primary demo + feature explorer (Angular 22; deployed to Vercel)
docs-website/                — Docusaurus documentation site
*.md (root)                  — public docs: README, CHANGELOG, CONTRIBUTING, SECURITY,
                               Custom-CSS-Examples, Error-Display-Examples, Server-Side-Examples
test.bat / clean.bat         — Windows build+run / cleanup helpers
scripts/setup-private.sh     — (re)create the internal/ junction to the private repo
internal/                    — gitignored junction → ../private/ng2-pdfjs-viewer (NOT public)
```

## Build / Test / Run

All commands assume Windows (PowerShell) unless noted. `ng` is the Angular CLI run from inside
an app folder (`npx ng …` if not global).

**Build the library** (from `lib/`):
```
cd lib
npm install            # first time
npm run build          # clean → ng-packagr → strip source maps → minify pdfjs → dist/
npm run package        # build + npm pack (produces the publishable tarball)
```
`npm run build` output lands in `lib/dist/`. The build also minifies the bundled PDF.js
(`pdf.mjs`, `pdf.sandbox.mjs`, `pdf.worker.mjs`) with terser and removes `.map` files.

**Run the demo app against your local lib** (full loop, from repo root):
```
test.bat                 # build lib → yalc publish → link into playground → ng serve (port 4300)
test.bat --play-only     # skip lib rebuild; just run the playground
```
Or manually: build `lib/`, `yalc publish` in `lib/`, `yalc link ng2-pdfjs-viewer` in `playground/`,
then `cd playground && npm install && npm start` (serves on http://localhost:4300).

**Tests** (from `playground/`): `npm run test:unit` (Vitest). The playground depends on the
published `ng2-pdfjs-viewer` for Vercel builds; `yalc link` overrides it with your local build.

**Docs site** (from `docs-website/`): `npm start` (local), `npm run build`.

## Conventions

- The component is the heart of the library — most features are declarative `@Input()`s and
  `@Output()` events. New public types belong in `src/interfaces/ViewerTypes.ts` and must be
  re-exported from `lib/index.ts` so consumers can import them.
- Viewer actions that may run before the PDF.js iframe is ready go through
  `ActionQueueManager` — don't poke the iframe directly from the component.
- Use `ChangeOriginTracker` to avoid feedback loops between user actions and `@Input()` writes.
- Keep the public `peerDependencies` range wide (`>=10`) — don't add hard Angular-version deps.
- PDF.js assets are shipped as package assets via `ng-package.json`; keep `lib/pdfjs/` and the
  build's minify/copy steps in sync when upgrading PDF.js.
- Match the surrounding code's style; this is a long-lived library with many consumers — prefer
  additive, backward-compatible changes and document breaking ones in `CHANGELOG.md` / an
  upgrade guide.

## Private working area (`internal/`)

`internal/` is a directory **junction** to a folder in a separate, private sibling repo
(`../private/<project>`). Anything written under `internal/` is physically stored in — and
committed from — that private repo, never this one. It's gitignored here as a backstop.

Use it for scratchpads, working notes, and anything not meant for the public repo.
To recreate the junction on another machine: `bash scripts/setup-private.sh`.

## Git / PR conventions

- **No AI attribution.** Do **not** add `Co-Authored-By: Claude …` trailers or
  "Generated with Claude Code" footers to commits or PRs in this repo. Commit messages and PR
  bodies should read as the maintainer's own. (This overrides any default attribution behavior.)
- Commit/push only when asked. Use `/push` and `/pr` (see `.claude/commands/`) instead of raw
  `git push` / `gh pr create` — they run the leak-guard + security scan that keep private and
  pre-release content out of this public repo.
- Keep PR titles/bodies neutral: describe the code change, nothing else.

## Notes for Claude Code sessions

- The public root `README.md` is the canonical feature reference (one source of truth; the lib
  build copies it into the package for npm) — consult it before changing or describing component
  behavior.
- Treat everything outside `internal/` as public the moment it's pushed. When unsure whether
  something is sensitive, put it in `internal/` and let the `/push` leak-guard be the safety net.
