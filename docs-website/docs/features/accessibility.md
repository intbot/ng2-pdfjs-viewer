# Accessibility

ng2-pdfjs-viewer embeds the full Mozilla PDF.js viewer — the same viewer that ships in Firefox — and inherits its accessibility architecture. This page summarizes what you get out of the box, what the component adds on top, and what remains your application's responsibility.

## What the Viewer Provides

- **Screen-reader text layer.** Every rendered page carries a transparent text layer that assistive technology reads in document order. This is real, selectable text — not OCR of the canvas.
- **Tagged-PDF structure mapped to ARIA.** For tagged PDFs (PDF/UA), PDF.js builds a structure tree — headings, tables, lists, alternative text — and links it to the text layer with `aria-owns`, exposing the document's structure tags to the browser accessibility tree.
- **Keyboard-operable chrome.** The toolbar, sidebar, dialogs, and find bar are keyboard-operable, with the standard PDF.js shortcut set (`n`/`p` for pages, `+`/`-` for zoom, `Ctrl+F` for find, `F4` for the sidebar, and more).
- **100+ locales and RTL.** The bundled viewer ships with 100+ locales; the UI honors the `locale` input and right-to-left scripts.
- **High-contrast support.** PDF.js includes high-contrast-mode palettes and respects forced-colors where the platform provides it.
- **Reduced motion.** Sidebar and UI animations respect `prefers-reduced-motion`.

## What the Component Adds

- **A titled iframe.** The viewer iframe always carries a `title` — set your own with the `iframeTitle` input (default `"PDF document viewer"`):

```html
<ng2-pdfjs-viewer
  pdfSrc="assets/annual-report.pdf"
  iframeTitle="Annual report 2026 PDF viewer">
</ng2-pdfjs-viewer>
```

- **Accessible loading and error states.** The spinner, error, and security-warning overlays are host-side Angular templates you fully control (`customSpinnerTpl`, `customErrorTpl`, `customSecurityTpl`) — put `role="alert"` and appropriate ARIA on your custom templates where it makes sense.
- **True dark page rendering.** The `pageColors` input re-renders page *content* with custom colors (not a CSS filter), preserving text-layer and structure-tree semantics in dark themes.

## Read-Aloud

Read-aloud is built in and doubles as an assistive feature: `startReadAloud()` reads the document with the browser's speech synthesis, following the reading position page by page, while `(onReadAloudStateChange)` reports progress and the viewer highlights the sentence being read. See [Read Aloud](./read-aloud) for the full API (`pauseReadAloud()`, `resumeReadAloud()`, `stopReadAloud()`).

## What Your Application Is Responsible For

- **Document quality.** A scanned, untagged PDF has no text layer to expose. Produce tagged PDFs (PDF/UA) for full screen-reader fidelity — the viewer can only surface structure that exists in the document, including alt text for images.
- **Custom toolbars.** If you replace the toolbar via `customToolbarTpl`, you own its keyboard operability and ARIA labeling.
- **Focus management.** When opening or closing the viewer inside dialogs or on route changes, move focus appropriately in the host app.

## Conformance Notes

The viewer targets the WCAG 2.1 AA expectations that apply to embedded document viewers (EN 301 549 / European Accessibility Act context): keyboard operability, text alternatives via the text layer and structure tags, visible focus, and color-contrast-respecting themes. Accessibility conformance of a page that embeds the viewer always depends on the embedding application and the documents served — validate end-to-end with your own audit tooling.

For the full guide, see [ACCESSIBILITY.md on GitHub](https://github.com/intbot/ng2-pdfjs-viewer/blob/master/lib/ACCESSIBILITY.md).

## Related

- [Read Aloud](./read-aloud)
- [Theming & Customization](./theming) — dark themes and `pageColors`
- [Component Inputs](../api/component-inputs)
- [Features Overview](./overview)
