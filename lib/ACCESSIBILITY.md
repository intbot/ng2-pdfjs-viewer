# Accessibility

ng2-pdfjs-viewer embeds the full Mozilla PDF.js viewer — the same viewer that
ships in Firefox — and inherits its accessibility architecture. This page
documents what you get out of the box, what the component adds, and what your
application is responsible for.

## What the viewer provides

- **Screen-reader text layer.** Every rendered page carries a transparent text
  layer that assistive technology reads in document order. This is real
  selectable text, not OCR of the canvas.
- **Tagged-PDF structure mapping.** For tagged PDFs (PDF/UA), PDF.js builds a
  structure tree (headings, tables, lists, alt text) and links it to the text
  layer with `aria-owns` — the only in-browser PDF viewer architecture that
  exposes PDF structure tags to the accessibility tree.
- **Keyboard navigation.** The viewer chrome (toolbar, sidebar, dialogs,
  find bar) is keyboard-operable, with the standard PDF.js shortcut set
  (`n`/`p` pages, `+`/`-` zoom, `Ctrl+F` find, `F4` sidebar, etc.).
- **Localized UI.** 100+ locales ship with the package; the UI honors the
  `locale` input and right-to-left scripts.
- **High-contrast support.** PDF.js includes high-contrast-mode palettes
  (e.g. highlight editor `_HCM` colors) and respects forced-colors where the
  platform provides it.
- **Reduced motion.** Sidebar and UI animations respect
  `prefers-reduced-motion`.

## What the component adds

- **Accessible iframe embedding.** The viewer iframe always carries a `title`
  (`iframeTitle` input, default "PDF document viewer").
- **Alert semantics for failures.** Error and security-warning overlays are
  host-side Angular templates you fully control — put `role="alert"` on your
  custom templates where appropriate.
- **Read-aloud.** `startReadAloud()` reads the document with the browser's
  speech synthesis, following the reading position page by page
  (`onReadAloudStateChange` reports progress).
- **True dark page rendering.** The `pageColors` input re-renders page
  content with custom colors (not a CSS filter), preserving text-layer and
  structure-tree semantics in dark themes.

## What your application is responsible for

- **Document quality.** A scanned, untagged PDF has no text layer to expose.
  Produce tagged PDFs (PDF/UA) for full screen-reader fidelity.
- **Custom toolbars.** If you replace the toolbar via `customToolbarTpl`,
  you own its keyboard operability and ARIA labeling.
- **Focus management.** When opening/closing the viewer inside dialogs or
  route changes, move focus appropriately in the host app.

## Conformance notes

The viewer targets the WCAG 2.1 AA expectations that apply to embedded
document viewers (EN 301 549 / European Accessibility Act context):
keyboard operability, text alternatives via the text layer and structure
tags, visible focus, and color-contrast-respecting themes. Accessibility
conformance of a page that embeds the viewer always depends on the embedding
application and the documents served — validate end-to-end with your own
audit tooling.
