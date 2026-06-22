# Changelog

This page highlights what's new. The full, version-by-version record (including patch releases) lives in [CHANGELOG.md](https://github.com/intbot/ng2-pdfjs-viewer/blob/master/CHANGELOG.md) on GitHub.

## Latest release

The current line upgrades the engine and turns the viewer into a full editing surface:

- **PDF.js 6.x bundled** (up from the 5.x line); existing component APIs are unchanged. The PDF.js 6 modern build raises the browser floor: Safari needs PDF.js's legacy build, which this package doesn't ship.
- **Built and tested on Angular 22** (ng-packagr 22 / TypeScript 6); the peer range stays wide at `>=10`.
- **[Annotation editing & eSign](./features/annotation-editing)**: highlight, text, draw, stamp, plus opt-in signature and comment editors. `getAnnotations()`/`setAnnotations()` persistence and download-with-edits via `getDocumentAsBlob()`.
- **[Forms](./features/forms)**: `[(formData)]` two-way binding and programmatic field access.
- **[Search](./features/search)**, **[page organization](./features/page-organization)**, and **[read aloud](./features/read-aloud)** with sentence highlighting.
- **[AI assistant](./features/ai-assistant)**: your own OpenAI-compatible endpoint, with clickable page citations. The library never calls an AI service on its own.
- **[Custom toolbar, sidebar & overlays](./features/custom-ui)**, **[content protection](./features/content-protection)** with watermarks, **[authenticated loading](./features/loading-documents)**, true dark page rendering, and four new events (`onSidebarViewChanged`, `onLayersChanged`, `onNamedAction`, `onDocumentProperties`).

**Behavior changes to check when upgrading:** `showAnnotations` now defaults to `true`; external PDF links open in a new tab by default (`externalLinkTarget`, with `allow-popups` added to the iframe sandbox); `zoomChange` emits named presets (`page-fit`, `page-width`, `auto`) instead of raw numbers for preset zooms.

## v25: the ground-up rewrite

After years of incremental change, v25 rebuilt the component on modern Angular. The visible differences:

- **One event-driven action path.** Every method waits for a five-level readiness signal instead of polling with timeouts, which removed the race conditions that came from calling methods before the PDF finished loading.
- **Angular templates instead of HTML strings** for spinners, error states, and chrome, so custom UI keeps its bindings and goes through Angular's sanitizer.
- **A typed, Promise-based API** end to end.

It is a major release with breaking changes. The renamed inputs and methods:

| Old | New |
|-----|-----|
| `[startDownload]` | `[downloadOnLoad]` |
| `[startPrint]` | `[printOnLoad]` |
| `[errorHtml]` / `setErrorHtml()` | `[customErrorTpl]` |
| `[spinnerHtml]` / `setSpinnerHtml()` | `[customSpinnerTpl]` |

Template inputs replaced the HTML-string properties, several inputs were renamed for clarity, and some event payloads changed shape. The [migration guide](./migration/overview) walks through the upgrade from v20.
