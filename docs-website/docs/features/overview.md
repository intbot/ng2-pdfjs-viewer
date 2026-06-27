---
description: "The full feature surface of ng2-pdfjs-viewer: annotations, eSign, AcroForm forms, search, page organization, AI assistant, read-aloud, theming, and accessibility."
keywords: [angular pdf viewer features, angular pdf annotations, angular pdf forms, angular pdf search]
---

# Features Overview

Most of what you reach for in a PDF viewer is a declarative input or output here. Point `pdfSrc` at a file and the component renders, navigates, searches, prints, and zooms with no extra wiring. The table below is the whole feature surface; each row links to a guide with runnable code.

[PDF.js](https://github.com/mozilla/pdf.js) 6.x is bundled, and the component is built and tested on [Angular](https://angular.dev) 22 (peer range stays `>=10`).

## Features

| Feature | What it does | Guide |
| ------- | ------------ | ----- |
| **Annotation editing & eSign** | Highlight, text, draw, stamp, plus opt-in signature & comment editors. Save and restore with `getAnnotations()`/`setAnnotations()`; download with edits applied. | [Annotation editing](./annotation-editing) |
| **Forms** | Two-way `[(formData)]` AcroForm binding, programmatic read/write, save filled documents. | [Forms](./forms) |
| **Search** | `search()` with totals, per-page counts, and next/previous stepping. | [Search](./search) |
| **Page organization** | Reorder, delete, extract, and merge pages in the viewer (opt-in). | [Page organization](./page-organization) |
| **AI assistant (your endpoint)** | Chat panel with clickable page citations against your OpenAI-compatible endpoint. The library makes no vendor calls of its own. | [AI assistant](./ai-assistant) |
| **Read aloud** | Sentence-by-sentence text-to-speech with in-page highlighting. | [Read aloud](./read-aloud) |
| **Custom toolbar, sidebar & overlays** | Replace the viewer chrome with your Angular templates, project templates onto every page, or drop the chrome entirely with `chromeless` for an embedded pages-only view. | [Custom UI](./custom-ui) |
| **Signals (zoneless / OnPush)** | Read viewer state — page, zoom, search matches, read-aloud, more — as Angular signals from `ng2-pdfjs-viewer/signals` (Angular 16+). | [Signals](./signals) |
| **Content protection** | Block print, download, and text selection; stamp watermarks. Client-side deterrence, not DRM. | [Content protection](./content-protection) |
| **Authenticated loading** | `httpHeaders`/`withCredentials`, download progress, password-prompt events. | [Loading documents](./loading-documents) |
| **Localization** | Locale detection, RTL, and overridable UI strings via `locale`. | [Component inputs](../api/component-inputs) |
| **Accessibility (WCAG/EAA)** | Screen-reader text layer, tagged-PDF structure, keyboard chrome, read-aloud. | [Accessibility](./accessibility) |
| **True dark pages** | Re-render page content with custom colors via `pageColors`, not just the chrome. | [Theming](./theming) |
| **PDF.js options passthrough** | Allowlisted `pdfJsOptions` for init-time viewer preferences. | [Component inputs](../api/component-inputs) |

## How it's built

A few design choices worth knowing before you wire it up:

- **One action path, no polling.** Every method call (go to page, set zoom, start read-aloud) is queued and runs once the viewer reports it's ready, so calls made before the PDF finishes loading don't get dropped or race the load. This replaced the timeout-based approach from v20.
- **Templates, not HTML strings.** Loading spinners, error states, the toolbar, the sidebar, and per-page overlays are `<ng-template>`s you supply, so they keep your bindings and pass through Angular's sanitizer.
- **A typed surface.** 30+ inputs, 24+ outputs, and 19+ Promise-returning methods, all typed. The [API reference](../api/component-inputs) is the full list.
- **One same-origin iframe.** The bundled PDF.js viewer runs in a sandboxed, same-origin iframe, and the host-to-viewer `postMessage` bridge checks `event.source` in both directions. See [iframe security](./iframe-security).
- **Mobile & touch.** Two-finger pinch-to-zoom and touch scrolling work on phones and tablets with no extra wiring — they're handled by the bundled PDF.js viewer. (Behaviour varies a little between iOS Safari and Android Chrome, so spot-check on your target devices.)

## Theming

Pass a theme object, or drive it all with CSS variables:

```typescript
themeConfig = { theme: 'dark', primaryColor: '#3f51b5', backgroundColor: '#1e1e1e', textColor: '#ffffff' };
```

```css
:root {
  --pdf-viewer-primary: #3f51b5;
  --pdf-viewer-background: #ffffff;
  --pdf-viewer-text: #333333;
}
```

Dark mode can re-render the page content itself, not just the toolbar, with `pageColors`. The [theming guide](./theming) has the full set.

## Next

- [Theming](./theming), [security](./security), and [iframe security](./iframe-security)
- [External window](./external-window) for new-tab and popout viewers
- [Examples](../examples/basic-usage) and the [API reference](../api/component-inputs)
- [Migration from v20.x](../migration/overview)
