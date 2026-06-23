---
description: "Move from ng2-pdf-viewer to ng2-pdfjs-viewer: input/event mapping, the asset setup step, and the toolbar, annotations, forms, and print you gain."
keywords: [ng2-pdf-viewer alternative, migrate ng2-pdf-viewer, angular pdf viewer with toolbar, ng2-pdf-viewer vs ng2-pdfjs-viewer]
---

# Coming from ng2-pdf-viewer

`ng2-pdf-viewer` renders a PDF onto a canvas and leaves the interface to you. If you started
there and now need a built-in toolbar, a sidebar, annotations, form filling, signatures, or
printing, `ng2-pdfjs-viewer` is a close move: both are single Angular components that take a
source and emit load and page events. The difference is scope. `ng2-pdfjs-viewer` embeds the full
Mozilla PDF.js viewer, so the chrome and the editors come with it instead of being something you
build.

This guide maps the inputs and events you already use, covers the one setup step that is genuinely
different, and lists what you no longer have to build yourself.

## Install

```bash
npm uninstall ng2-pdf-viewer
npm install ng2-pdfjs-viewer
```

`ng2-pdfjs-viewer` ships the PDF.js worker and viewer as bundled assets, so you do not install or
pin `pdfjs-dist` separately.

## The one real difference: serve the assets

`ng2-pdf-viewer` pulls the PDF.js worker at runtime. `ng2-pdfjs-viewer` serves a bundled copy of
the viewer, so you add its assets folder to `angular.json` once:

```json
"assets": [
  { "glob": "**/*", "input": "node_modules/ng2-pdfjs-viewer/pdfjs", "output": "/assets/pdfjs" }
]
```

The [Getting Started](../getting-started) guide has the exact block for your Angular version. This
is the step most migrations get caught on, so do it first.

## Template: before and after

```html
<!-- ng2-pdf-viewer -->
<pdf-viewer
  [src]="pdfSrc"
  [(page)]="page"
  [render-text]="true"
  [original-size]="false"
  (after-load-complete)="onLoaded($event)">
</pdf-viewer>
```

```html
<!-- ng2-pdfjs-viewer -->
<ng2-pdfjs-viewer
  [pdfSrc]="pdfSrc"
  [page]="page"
  (onPageChange)="page = $event.pageNumber"
  (onDocumentLoad)="onLoaded()">
</ng2-pdfjs-viewer>
```

The text layer is always on (it is what powers search and selection), so there is no
`render-text` flag to set.

## Input and event mapping

| ng2-pdf-viewer | ng2-pdfjs-viewer | Note |
| --- | --- | --- |
| `[src]` | `[pdfSrc]` | URL, `Blob`, `Uint8Array`, or `ArrayBuffer`, same as before. |
| `[(page)]` | `[page]` + `(onPageChange)` | Two-way page sync; `onPageChange` carries the page number. |
| `[rotation]` | `[rotation]` | Same idea. |
| `[zoom]` / `[zoom-scale]` | `[zoom]` | A zoom level or a named mode the viewer understands. |
| `[render-text]` | (always on) | Text layer is built in; it backs search and selection. |
| `[original-size]` / `[fit-to-page]` / `[show-all]` | viewer zoom modes | The toolbar exposes these, or set `[zoom]`/`[pageMode]`. |
| `(after-load-complete)` | `(onDocumentLoad)`, `(onPagesInit)` | Document ready and page count available. |
| `(page-rendered)` | `(onPageRendered)` | Per-page render. |
| `(error)` | `(onDocumentError)` | Load and render errors. |
| `(on-progress)` | `(onProgress)` | `{ loaded, total }` download progress. |

The [API reference](../api/component-inputs) is the authoritative list of every input, output, and
method, including the ones with no `ng2-pdf-viewer` equivalent.

## What you no longer build yourself

`ng2-pdf-viewer` is a renderer; the UI and document features are yours to add. With
`ng2-pdfjs-viewer` these are part of the component:

- A toolbar and sidebar: page navigation, zoom, search, thumbnails, outline, print, download.
- [Annotation editing and eSign](../features/annotation-editing): highlight, text, draw, stamp, signature, and comment editors, saved and restored through your server.
- [Forms](../features/forms): two-way AcroForm binding and save.
- [Search](../features/search) with totals and per-page counts, [read-aloud](../features/read-aloud), and [page organization](../features/page-organization).
- Printing, theming, and [accessibility](../features/accessibility) (screen-reader text layer, keyboard chrome).

If all you need is a canvas that draws a PDF, `ng2-pdf-viewer` stays a reasonable fit. Move when the
list above is work you would otherwise write by hand.

## Next

- [Getting Started](../getting-started): the assets step in full
- [Angular PDF viewer overview](../angular-pdf-viewer): the capability map
- [API reference](../api/component-inputs): every input, output, and method
