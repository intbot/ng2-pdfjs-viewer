# ng2-pdfjs-viewer · Playground

The interactive feature explorer for **ng2-pdfjs-viewer** (the 2026 successor to `SampleApp/`).
A grouped, multi-page Angular app where each page demonstrates one feature group with a live
`<ng2-pdfjs-viewer>`, controls that mutate it, auto-generated copyable code, **Open in StackBlitz**,
and **shareable URLs**. A ⌘K command palette jumps to any feature.

> The marketing landing page lives on the Docusaurus docs site (`docs-website/src/pages/index.tsx`)
> and deep-links into this playground. This app is the *interactive* surface; the docs site is the
> *static front door*.

## Run

```bash
# 1. build the library once (produces ../lib/dist, which this app links to)
cd ../lib && npm install && npm run build

# 2. install + serve the playground
cd ../playground && npm install
npm start            # http://localhost:4300
```

`ng2-pdfjs-viewer` is linked via `file:../lib/dist` (with `preserveSymlinks`), and the bundled
PDF.js assets are copied to `/assets/pdfjs` by the `angular.json` asset glob — same wiring the
published package expects in a consumer app.

## Architecture

- **Standalone components + signals** (Angular 20), hash routing for static-deploy deep links.
- `src/app/core/feature-registry.ts` — single source of truth; drives the sidebar, breadcrumbs,
  ⌘K, and routing. **Add a page = add one registry entry + one component under `src/app/pages/`.**
- `src/app/shared/playground-layout.component.ts` (`<pg-page>`) — the shared chrome every feature
  page composes (Preview/Code/Split tabs, responsive width presets, copy, Share, StackBlitz).
- Services in `src/app/core/services/` — code generation, command palette, sample PDFs, theme,
  share-state (URL round-trip), StackBlitz.

## Verify in a browser

```bash
npm start                      # in one terminal
node e2e/browser-check.mjs      # 13-page smoke + screenshots → e2e/shots (gitignored)
node e2e/interactive-check.mjs  # ⌘K nav, share-URL round-trip, light theme
```

## Lint

```bash
npm run lint   # angular-eslint (flat config)
```
