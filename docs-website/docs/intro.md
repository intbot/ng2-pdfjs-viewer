---
description: "ng2-pdfjs-viewer is a comprehensive Angular PDF viewer built on Mozilla PDF.js 6: one component for viewing, annotating, signing, forms, search, and read-aloud. Angular 10 through 22."
keywords: [angular pdf viewer, ng2-pdfjs-viewer, pdf.js angular, angular pdf component, angular pdf library]
---

# ng2-pdfjs-viewer

ng2-pdfjs-viewer wraps Mozilla PDF.js in a single Angular component. It has been on npm since 2018, has passed more than 8.3 million downloads, and still supports Angular 10 through 22 with zero runtime dependencies. It's the same one-tag component it has always been, with annotations, forms, search, page editing, read-aloud, and a bring-your-own AI panel layered on in v26.

```bash
npm install ng2-pdfjs-viewer
```

```typescript
import { PdfJsViewerModule } from 'ng2-pdfjs-viewer';

@NgModule({ imports: [PdfJsViewerModule] })
export class AppModule {}
```

```html
<ng2-pdfjs-viewer pdfSrc="assets/sample.pdf" [showSpinner]="true"></ng2-pdfjs-viewer>
```

`pdfSrc` takes a URL, a `Blob`, a `Uint8Array`, or an `ArrayBuffer`. Point the component at a file, serve the bundled PDF.js assets (the [Getting Started](./getting-started) guide covers the one-time `angular.json` step), and you have a working viewer.

## What's in v26

PDF.js 6.x is bundled, and the component is built and tested on Angular 22 while the peer range stays `>=10`. Beyond plain viewing:

- **Annotation editing and eSign.** Highlight, free-text, draw, and stamp editors, plus opt-in signature and comment editors. `getAnnotations()` and `setAnnotations()` round-trip edits through your server, and `getDocumentAsBlob()` hands back the document with edits baked in.
- **Forms.** Two-way `[(formData)]` AcroForm binding and programmatic field access.
- **Search, page organization, and read-aloud.** A `search()` API with per-page counts; reorder, delete, extract, and merge pages; sentence-by-sentence text-to-speech that highlights the words as it reads them.
- **AI assistant.** A built-in chat panel that talks to *your* OpenAI-compatible endpoint and cites pages you can click through to. The library never calls an AI service on its own.
- **And the rest.** Custom toolbar, sidebar, and per-page overlay templates; content protection with watermarks; authenticated loading via `httpHeaders` and `withCredentials`; true dark-mode page rendering.

Each has its own guide under [Features](./features/overview).

## About the v25 rewrite

v25 replaced the old mix of events and polling with one event-driven path. Every action now waits for the viewer to report it's ready instead of guessing with a timeout, so a call made the instant the component appears no longer races the PDF load. Loading and error states became Angular templates rather than HTML strings, and the public surface is typed end to end. Coming from v20, the [migration guide](./migration/overview) lists the input renames; most apps need only a handful.

## Links

- [Getting Started](./getting-started): install, assets, and your first viewer
- [Live demo](https://demo.angularpdf.com/)
- [Examples](./examples/basic-usage): copy-paste starting points
- [API reference](./api/component-inputs): every input, output, and method
- [Migration from v20.x](./migration/overview)

Bugs and questions go to [GitHub Issues](https://github.com/intbot/ng2-pdfjs-viewer/issues); design discussion to [GitHub Discussions](https://github.com/intbot/ng2-pdfjs-viewer/discussions).
