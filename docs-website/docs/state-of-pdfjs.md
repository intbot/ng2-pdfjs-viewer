---
description: "The state of PDF.js: who maintains it, the current version and release cadence, how the major browsers render PDF (PDF.js, PDFium, PDFKit), where it sits across web frameworks, and PDF's ISO 32000 standard — a sourced reference."
keywords: [pdf.js, pdfjs, how browsers render pdf, pdf.js version, pdfjs-dist downloads, pdf.js angular, pdf rendering browser, iso 32000]
---

# The state of PDF.js

[PDF.js](https://github.com/mozilla/pdf.js) is Mozilla's PDF renderer for the browser: a JavaScript
library that parses and paints PDF pages onto HTML5 Canvas, with no native plugin. It's the engine
behind Firefox's built-in PDF viewer, and — because it's a plain JavaScript library anyone can
embed — it's also the foundation under most web-framework PDF components, including the Angular one
we maintain, [ng2-pdfjs-viewer](https://github.com/intbot/ng2-pdfjs-viewer).

This page is a sourced snapshot of where PDF.js stands. Figures are current as of June 2026; the
download and star counts move week to week, so read them as magnitudes and check the linked source
for the live number.

## PDF.js by the numbers

| | |
| --- | --- |
| First release | 2 July 2011, started by Andreas Gal as a Mozilla experiment |
| Maintained by | Mozilla |
| In Firefox | bundled since Firefox 15 (2012), the default viewer since Firefox 19 (2013) |
| Latest release | 6.0.227, published 30 May 2026 |
| Release cadence | roughly monthly (Mozilla publishes no fixed schedule) |
| GitHub stars | ~53,500 |
| npm package | [`pdfjs-dist`](https://www.npmjs.com/package/pdfjs-dist) |
| npm downloads | ~21 million per week |
| License | Apache-2.0 |

That ~21M weekly figure for `pdfjs-dist` is the clearest signal of the engine's reach: nearly every
in-browser PDF feature on the web, native browser viewers aside, traces back to it.

## How the major browsers render PDF

Open a PDF in a browser and one of three engines draws it. They're genuinely different
codebases, which is why the same PDF can look or behave slightly differently across browsers:

| Browser | PDF engine | Language | Embeddable yourself? |
| --- | --- | --- | --- |
| Firefox | PDF.js | JavaScript | Yes — it's an open-source JS library |
| Chrome | PDFium | C++ | Indirectly (PDFium is C++, not a drop-in web library) |
| Edge | PDFium | C++ | Indirectly |
| Safari | Apple PDFKit | native (Apple) | No — Apple framework |

PDF.js is the outlier in a useful way: it's the one a web developer can pull into their own page and
control directly, rather than relying on whatever the browser ships. That's what makes the framework
wrappers below possible.

Sources: [PDFObject browser support](https://pdfobject.com/guide/browser-support.html),
[Nutrient on PDFium](https://www.nutrient.io/blog/why-pdfium-is-a-trusted-platform-for-pdf-rendering/),
[Wikipedia: PDF.js](https://en.wikipedia.org/wiki/PDF.js).

## PDF.js across the frameworks

Because PDF.js is just JavaScript, each front-end ecosystem has grown its own components on top of
it, so you don't wire up the worker, the text layer, and the viewer UI by hand:

- **React** — `react-pdf` is the most-downloaded single PDF.js wrapper on npm, by roughly an order of
  magnitude over the rest.
- **Vue** — `vue-pdf-embed` is the actively maintained option.
- **Angular** — several components wrap PDF.js; [ng2-pdfjs-viewer](./getting-started) is the one we
  build, packaging the PDF.js viewer and worker as assets so there's no separate `pdfjs-dist` to
  version-match.

The common thread: these are convenience layers. The rendering underneath is PDF.js in every case.

## PDF as an open standard

PDF predates all of this. It came out of Adobe's 1991–1992 "Camelot" project (John Warnock), and it's
been an open ISO standard since 2008:

- **PDF 1.7 → ISO 32000-1**, published 2008 — the point PDF became a royalty-free open standard.
- **PDF 2.0 → ISO 32000-2**, first published 2017, revised 2020 — maintained by ISO/TC 171 with the
  [PDF Association](https://pdfa.org/resource/iso-32000-2/) as committee manager, no single vendor in
  control.

Adobe estimated in 2020 that roughly **2.5 trillion** PDFs existed — a vendor figure, now several
years old, but it conveys the scale a PDF renderer has to serve.

## Using PDF.js in Angular

If you're rendering PDFs in an Angular app, you have two practical paths: call PDF.js directly (you
manage `pdfjs-dist`, the worker, and the viewer UI yourself), or use a component that bundles all of
that. ng2-pdfjs-viewer takes the second path — one `<ng2-pdfjs-viewer>` tag, PDF.js 6 bundled,
Angular 10 through 22 from one package.

- [Getting started](./getting-started) — install and render a first document
- [Coming from another PDF.js wrapper](./migration/overview) — the input/event map
- [ng2-pdfjs-viewer by the numbers](./by-the-numbers) — this library's own fact sheet

## Sources

- PDF.js source, releases, and stars: [github.com/mozilla/pdf.js](https://github.com/mozilla/pdf.js)
- `pdfjs-dist` version and downloads: [npm](https://www.npmjs.com/package/pdfjs-dist)
- History and Firefox integration: [Wikipedia: PDF.js](https://en.wikipedia.org/wiki/PDF.js)
- Browser PDF engines: [PDFObject](https://pdfobject.com/guide/browser-support.html), [Nutrient](https://www.nutrient.io/blog/why-pdfium-is-a-trusted-platform-for-pdf-rendering/)
- The PDF standard: [ISO 32000-2:2020](https://www.iso.org/standard/75839.html), [PDF Association](https://pdfa.org/resource/iso-32000-2/)
