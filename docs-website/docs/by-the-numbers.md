---
description: "ng2-pdfjs-viewer by the numbers: 8.3M+ downloads, on npm since 2018, Angular 10 through 22 in one package, PDF.js 6 bundled, zero runtime dependencies, 30+ inputs and 24+ events."
keywords: [ng2-pdfjs-viewer stats, angular pdf viewer downloads, angular pdf viewer versions supported, angular pdf viewer dependencies]
---

# ng2-pdfjs-viewer by the numbers

A fact sheet for sizing up the library at a glance. Figures are current as of June 2026; download
counts come from the npm registry.

| Metric | Value |
| --- | --- |
| On npm since | 2018 |
| Total downloads | 8.3M+ |
| Weekly downloads | ~52,000 (June 2026) |
| Angular versions supported | 10 through 22, from one package (peer range `>=10`) |
| PDF.js engine | [PDF.js](https://github.com/mozilla/pdf.js) 6.x, bundled (no separate `pdfjs-dist` to manage) |
| Runtime dependencies | 0 (beyond Angular itself) |
| Public API | 30+ inputs, 24+ outputs, 19+ Promise-returning methods, all typed |
| License | Apache-2.0 (Commons Clause) |
| Bundled assets | PDF.js viewer + worker, served from your app |

## What one component covers

A single `<ng2-pdfjs-viewer>` tag provides:

- Viewing, navigation, zoom, print, and download
- Annotation editing and eSign: highlight, text, draw, stamp, signature, comment
- AcroForm filling with two-way binding
- Full-text search with totals and per-page counts
- Page organization: reorder, delete, extract, merge
- Read-aloud (text-to-speech) with in-page highlighting
- A bring-your-own-endpoint AI assistant with page citations
- Theming, true dark-mode pages, content protection, and watermarks
- Custom toolbar, sidebar, and per-page overlay templates
- Accessibility for WCAG and the European Accessibility Act

## Architecture facts

- The bundled PDF.js viewer runs in a sandboxed, same-origin iframe.
- The host-to-viewer `postMessage` bridge checks `event.source` in both directions.
- Every method call is queued until the viewer reports ready, so calls made before the PDF finishes
  loading are not dropped.

## In production

Public-sector and education teams run ng2-pdfjs-viewer in live software:

- [CNIL PIA](https://github.com/LINCnil/pia): the French data-protection authority's Privacy Impact Assessment tool, published in 20+ languages.
- [AOE (aoe.fi)](https://aoe.fi): the Finnish National Agency for Education's open educational resources library.
- [OC Stormwater Tools](https://ocstormwatertools.org): Orange County, California compliance tracking.

More on the [showcase](https://angularpdf.com/showcase).

## Sources

- Downloads and version history: [npm](https://www.npmjs.com/package/ng2-pdfjs-viewer)
- Source and releases: [GitHub](https://github.com/intbot/ng2-pdfjs-viewer)
- Full API: [Component inputs](./api/component-inputs), [outputs](./api/component-outputs), [methods](./api/component-methods)
- The engine underneath: [The state of PDF.js](./state-of-pdfjs)
