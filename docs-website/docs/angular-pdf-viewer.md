---
title: Angular PDF Viewer
description: A comprehensive Angular PDF viewer component built on Mozilla PDF.js 6. Add viewing, annotation, signatures, forms, search, and read-aloud to an Angular app with one tag. Supports Angular 10 through 22.
keywords:
  - angular pdf viewer
  - angular pdf viewer component
  - angular pdf annotation
  - angular pdf forms
  - angular pdf signature
  - pdf.js angular
  - ng2-pdfjs-viewer
slug: /angular-pdf-viewer
---

# Angular PDF Viewer

`ng2-pdfjs-viewer` is an Angular PDF viewer component built on Mozilla PDF.js. One tag,
`<ng2-pdfjs-viewer>`, renders a document and gives you annotations, signatures, AcroForm
filling, search, page editing, printing, theming, and read-aloud through declarative inputs and
events. It has been on npm since 2018, passed 8.3M+ downloads, and supports Angular 10 through 22
with zero runtime dependencies.

This page answers the questions people ask when they pick an Angular PDF viewer. Each one links to
the guide with runnable code.

## How do I add a PDF viewer to an Angular app?

Install the package, import the module, and point one tag at a file:

```bash
npm install ng2-pdfjs-viewer
```

```typescript
import { PdfJsViewerModule } from 'ng2-pdfjs-viewer';

@NgModule({ imports: [PdfJsViewerModule] })
export class AppModule {}
```

```html
<ng2-pdfjs-viewer pdfSrc="assets/sample.pdf"></ng2-pdfjs-viewer>
```

`pdfSrc` accepts a URL, `Blob`, `Uint8Array`, or `ArrayBuffer`. The one-time step is serving the
bundled PDF.js assets, covered in [Getting Started](./getting-started).

## Which Angular versions are supported?

The peer range is `>=10`, and the package is built and tested on Angular 22. That is the widest
Angular support in the category from a single package: one install covers Angular 10 through 22.
PDF.js 6 is bundled, so you do not manage a separate PDF.js dependency or worker version.

## Can it edit and save PDF annotations?

Yes. Highlight, free-text, draw, and stamp editors are built in, plus opt-in signature and comment
editors. `getAnnotations()` and `setAnnotations()` round-trip edits through your own server, and
`getDocumentAsBlob()` returns the document with edits applied. See
[Annotation editing & eSign](./features/annotation-editing).

## Does it support PDF forms?

Yes. AcroForm fields bind two-way through `[(formData)]`, and you can read or write fields
programmatically and save the filled document. See [Forms](./features/forms).

## Can users sign a PDF?

Yes. The signature editor places drawn or typed signatures, and a `signatureStorage` hook lets you
persist and reload signatures from your own backend. See
[Annotation editing & eSign](./features/annotation-editing).

## Can I search inside the document?

Yes. The `search()` method returns total matches and per-page counts and steps through
next/previous. See [Search](./features/search).

## Is there a built-in AI assistant?

Yes, and it calls *your* endpoint, not ours. The chat panel talks to any OpenAI-compatible URL you
configure and renders clickable page citations. The library never makes an AI call on its own, so
there is no backend to run and no vendor lock-in. See [AI assistant](./features/ai-assistant).

## Does it read PDFs aloud?

Yes. Read-aloud speaks the document sentence by sentence and highlights the words in the page as it
reads. See [Read aloud](./features/read-aloud).

## Can I reorganize pages?

Yes, when you opt in. Users can reorder, delete, extract, and merge pages in the viewer. See
[Page organization](./features/page-organization).

## Can I customize the toolbar, sidebar, and theme?

Yes. Replace the toolbar, sidebar, and per-page overlays with your own Angular templates, or drop
the chrome entirely with `chromeless` for an embedded pages-only view. Theme with a config object or
CSS variables, and re-render page content for true dark mode via `pageColors`. See
[Custom UI](./features/custom-ui) and [Theming](./features/theming).

## Is it accessible?

The screen-reader text layer, tagged-PDF structure, keyboard-navigable chrome, and read-aloud cover
WCAG and the European Accessibility Act. See [Accessibility](./features/accessibility).

## How heavy is it, and how is it built?

There are no runtime dependencies beyond Angular itself. The bundled [PDF.js](https://github.com/mozilla/pdf.js)
viewer runs in a sandboxed, same-origin iframe, and the host-to-viewer bridge checks `event.source` in both
directions. Every method is queued until the viewer reports ready, so a call made before the PDF
finishes loading is not dropped. See [iframe security](./features/iframe-security).

## Who uses it in production?

It runs in live public-sector and education software, including the French data-protection
authority's [CNIL PIA](https://github.com/LINCnil/pia) tool, the Finnish National Agency for
Education's [AOE library](https://aoe.fi), and Orange County's
[stormwater compliance tools](https://ocstormwatertools.org). More on the
[showcase](https://angularpdf.com/showcase).

## Where to next

- [Getting Started](./getting-started): install, assets, and your first viewer
- [Features overview](./features/overview): the full capability surface in one table
- [API reference](./api/component-inputs): every input, output, and method
- [Live demo](https://demo.angularpdf.com/)
- [Coming from ng2-pdf-viewer](./migration/from-ng2-pdf-viewer): map a basic renderer onto this component
