# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [26.2.0] - 2026-06-27

### Added
- `ng2-pdfjs-viewer/signals`: a new entry point that projects viewer state — current
  page, zoom, total pages, search matches, read-aloud progress, annotation-editor
  state, sidebar, metadata, form data, and the view-mode strings — as read-only
  Angular signals. Call `pdfViewerSignals(viewer, { injector })` and read
  `signals.page()`, `signals.totalPages()`, `signals.loaded()` in a template, or
  build `computed`/`effect` on top. Aimed at zoneless / OnPush apps. Requires
  Angular 16+; the base package's `>=10` peer range is unchanged.
- AI assistant streaming: `PdfAiAssistant.ask()` and `complete()` take an optional
  `onToken` callback and stream the answer token-by-token over Server-Sent Events,
  falling back to a single response when the endpoint doesn't stream. The built-in
  chat panel renders the answer as it arrives.

### Fixed
- `onPagesInit` now fires once the document's pages initialize - it carries the
  page count and was declared but never emitted. This is what makes the new
  signals entry point's `loaded()` and `totalPages()` populate.

## [26.1.1] - 2026-06-23

### Changed
- npm `keywords` refreshed for search relevance, and `homepage` now points at the documentation
  site's domain, `angularpdf.com`.

### Documentation
- Docs site moved to `angularpdf.com` (the live demo moved to `demo.angularpdf.com`). Added an
  "Angular PDF viewer" overview page and a "Coming from ng2-pdf-viewer" migration guide, added
  per-page metadata, `robots.txt`, and `llms.txt`, and updated README and docs links to the new
  domains.

## [26.1.0] - 2026-06-22

### Added
- `chromeless` input: a single switch that hides the toolbar and sidebar so the
  viewer shows just the scrolling pages — an embedded/inline preview mode. It is
  shorthand for `showToolbar=false` + `showSidebar=false` and overrides them
  without mutating those bindings, so toggling it off restores them. Reach for
  `pageOverlayTpl` when you need per-page DOM in the host app.

## [26.0.3] - 2026-06-22

### Fixed
- The `file` parameter is now appended last on the viewer URL, so a hash
  fragment carried on the PDF URL (e.g. `doc.pdf#search=foo`, `#page=2`) reaches
  PDF.js intact instead of swallowing the viewer's own query parameters. Thanks
  to @THCavaciuti for the report and fix. (#305)

## [26.0.2] - 2026-06-22

### Fixed
- Toolbar and menu icons no longer go invisible when the viewer `[theme]`
  differs from the operating-system color scheme (e.g. `[theme]="'light'"` on a
  dark-mode OS, or the reverse). The theme classes now pin `color-scheme` to the
  selected theme, so PDF.js 6's `light-dark()` icon colors resolve to the chosen
  theme instead of following the OS. (#307)

## [26.0.1] - 2026-06-16

### Fixed
- `getDocumentText()` now waits for the document to finish loading before it
  extracts text (up to a timeout), so an AI `ask` — or any call — made the
  instant the viewer appears no longer returns an empty result.

### Added
- Unit coverage for the built-in AI panel's `[p.N]` page-citation parsing.

### Changed
- The `ng2-pdfjs-viewer/ai` entry point header now notes that requests run from
  the browser — route cloud LLMs through a local model or a backend proxy
  (avoids API-key exposure and CORS failures).

## [26.0.0] - 2026-06-13

### Added

#### ✍️ Annotation Editing & eSign
- Annotation editor exposure: two-way `[(annotationEditor)]` mode input
  (`freetext`/`ink`/`highlight`/`stamp` + opt-in `signature`/`comment`),
  `[highlightEditorColors]`, and `(onAnnotationEditorStateChange)` (undo/redo/dirty state).
- Annotation persistence: `getAnnotations()` (serialized, JSON-safe export) and
  `setAnnotations()` — restore exported annotations back into the editor (server-side
  round-trip). Annotations for pages that haven't rendered yet apply automatically as those
  pages render; invalid items are rejected with a count.
- `getDocumentAsBlob()` — the document including annotation edits and filled form fields,
  ready for upload.
- Opt-in signature editor (`[enableSignatureEditor]` — draw/type/upload, saved as stamp-style
  annotations; an eSign convenience, NOT cryptographic signing) and `[signatureStorage]` —
  host-side persistence hook for saved signatures (server/per-user storage instead of the
  viewer's localStorage).
- Opt-in comment editor (`[enableCommentEditor]`) — threaded comment popups on highlights.

#### 📄 Pages, Forms & Search
- Page organization (`[enablePageEditing]`): drag-drop reorder, delete, cut/copy/paste,
  extract and merge pages in the viewer's "Manage pages" panel; `(onPagesEdited)` relay.
- Forms: two-way `[(formData)]` AcroForm binding, `getFormData()`, `setFormField()`.
- Programmatic search: `search()` (totals, per-page counts, pages with matches),
  `searchNext()`, `searchPrevious()`, `clearSearch()`.

#### 🤖 AI & Read Aloud
- Bring-your-own-endpoint AI: headless `PdfAiAssistant` (any OpenAI-compatible endpoint —
  OpenAI, Azure, Ollama, vLLM…) plus a built-in chat panel via `[aiAssistantConfig]`;
  answers cite pages as `[p.3]` and citations click-through to the page. The library never
  calls any AI service on its own. `getDocumentText()` extracts per-page text for custom
  integrations.
- The headless `PdfAiAssistant` is also published as a standalone secondary entry point —
  `import { PdfAiAssistant } from "ng2-pdfjs-viewer/ai"` — so it can be used and tree-shaken
  independently of the component, with no Angular dependency. It is still re-exported from the
  package root (`ng2-pdfjs-viewer`) for backwards compatibility.
- Read-aloud (`startReadAloud()`/`pauseReadAloud()`/`resumeReadAloud()`/`stopReadAloud()`)
  with browser speech synthesis: reads sentence by sentence, highlights the sentence being
  spoken in the page text layer, and reports progress via `(onReadAloudStateChange)`
  (including the current `sentence`).

#### 🎨 Custom UI & Display
- `[customToolbarTpl]` (+ `[showToolbar]`) — replace the viewer toolbar with your own Angular
  template; the template receives the component instance for full API access.
- `[customSidebarTpl]` — host-side sidebar beside the viewer, same template context.
- `[pageOverlayTpl]` — project an Angular template onto every rendered page (watermark
  badges, stamps, review UI) with live bindings.
- True dark page rendering via `[pageColors]` (re-renders page content, not just chrome).
- Content protection bundle `[contentProtection]`: block print/download, disable text
  selection, per-page watermarks — documented honestly as client-side deterrence, not DRM.

#### 🔌 Loading, Events & Options
- Authenticated document loading: `[httpHeaders]`, `[withCredentials]`, and `(onProgress)`
  (the component fetches the PDF and feeds the viewer a blob).
- `(onPasswordPrompt)` — fired when PDF.js shows its password dialog (the loading spinner is
  dropped automatically so the dialog is usable; fixes #303).
- `[rememberLastView]` — restore the previous reading position on reload (fixes #299).
- `[externalLinkTarget]` (default `'blank'`) and `[iframeSandbox]` allowlisted tokens — PDF
  links open reliably (fixes #304).
- `[pdfJsOptions]` — allowlisted PDF.js AppOptions passthrough for init-time options.
- Four new event relays: `(onSidebarViewChanged)`, `(onLayersChanged)`, `(onNamedAction)`,
  `(onDocumentProperties)`.
- README accessibility section linking the full `ACCESSIBILITY.md` guide (screen readers,
  tagged PDFs, keyboard navigation, WCAG/EAA notes).

### Changed

#### 🅰️ Angular 22

- Library is now built and verified on **Angular 22** (ng-packagr 22, TypeScript 6.0).
  Peer dependencies stay wide (`>=10`) — no action needed for existing consumers.

#### 🔄 PDF.js 6.0.227

- Bundled Mozilla PDF.js upgraded to **v6.0.227** (from the 5.x line). All component
  inputs, outputs, and APIs work unchanged.
- The sidebar toggle is now PDF.js's "Manage pages" panel (the upstream successor to the
  classic sidebar); page-editing actions in it remain gated behind `enablePageEditing`.
- Build tooling: viewer CSS is now minified with esbuild (csso could not parse PDF.js 6's
  modern CSS).

#### ⚠️ Behavior Changes

- `showAnnotations` now defaults to `true` — the PDF.js annotation editor toolbar
  (highlight, text, draw, stamp, and the opt-in signature/comment editors) is visible
  out of the box. Set `[showAnnotations]="false"` to restore the previous hidden-by-default behavior.
- The viewer iframe's `sandbox` now includes `allow-popups allow-popups-to-escape-sandbox`,
  and external links inside PDFs open in a new tab by default (new `externalLinkTarget`
  input, default `'blank'`) — previously such links were silently dead (issue #304).
  A new `iframeSandbox` input can add further allowlisted tokens; review your embedding
  policy if you relied on the stricter previous sandbox.
- `zoomChange` now emits named presets (`page-fit`, `page-width`, `auto`) instead of raw
  numeric scales for preset zooms — handlers that `parseFloat` the value should handle
  the named cases.

#### 📦 Leaner Package

- npm tarball reduced ~22% (4.1 MB → 3.2 MB packed, 11.1 MB → 8.7 MB unpacked — measured
  after the PDF.js 6 upgrade and this release's feature additions)
- `viewer.mjs` (551 KB → 343 KB) and the postMessage bridge (72 KB → 34 KB) now ship minified
- `viewer.css` now ships minified (197 KB → 147 KB)
- Source maps and debug tooling no longer included in the package
- 1,000+ lines of dead code removed from the library source

#### ⚡ Faster Startup

- Initial viewer configuration is batched into one message per readiness level
  (previously ~40 individual postMessage round-trips per document load)
- Viewer URL cache-busting now keys off Angular's `isDevMode()` instead of a
  hostname/port heuristic — production apps served from localhost get clean,
  cacheable viewer URLs

### Fixed

- Window `message` listener is now removed on component destroy (memory leak with repeated create/destroy)
- `message` events are filtered by source on both sides — multiple viewers on one page no longer cross-talk
- False "SECURITY ALERT" console errors no longer fire on legitimate `pdfSrc` changes
- Config-object inputs (`themeConfig`, `controlVisibility`, etc.) now apply live after initial load
- Changing `locale` at runtime now reloads the viewer with the new language
- `zoomChange` now emits named presets (`page-fit`, `page-width`, `auto`) instead of raw numeric scales
- `errorMessage`, `errorAppend`, and `errorOverride` now compose and display as documented
- `showAnnotations` now actually toggles the annotation editor, not just the toolbar button
- `refresh()` no longer silently kills event emitters; queued actions resolve with real results
- Blocked popups in external-window mode no longer crash `loadPdf`
- `ActionExecutionResult` and `ChangedPage` types are now exported

### Removed

- The bundled sample PDF (`web/compressed.tracemonkey-pldi-09.pdf`) no longer ships in the package — apps that referenced it from `assets/pdfjs/web/` should bundle their own copy

## [20.4.0] - 2024-12-07

### Added

#### 🎨 Theme System

- Complete theme customization with CSS custom properties
- Light, dark, and auto theme support
- Custom color schemes for primary, background, toolbar, and text colors
- Border radius and spacing customization
- Material Design integration

#### ⚡ Universal Action Dispatcher

- Event-driven architecture with promise-based API
- Readiness-based action execution (5-level hierarchy)
- Automatic action queuing until requirements are met
- Trust-based execution model (no defensive programming)

#### 🔄 Custom Loading & Error Handling

- Template-based loading spinners with Angular templates
- Multiple built-in error display styles (Basic, Corporate, Minimalist, Gradient, Dark, Interactive)
- Custom error templates with company logo support
- CSS-only styling with animations and responsive design

#### 🎯 Enhanced Developer Experience

- TypeScript strict mode support
- Comprehensive API coverage with consistent promise returns
- Better error handling and debugging capabilities
- Improved IDE integration and autocomplete

#### 📱 Mobile & Responsive Features

- Mobile-first responsive design
- Touch-friendly controls and gestures
- Smart device zoom optimization
- Responsive breakpoint configuration

#### 🌍 Improved Internationalization

- Better locale support with automatic detection
- Fixed locale change issues in PDF.js v5.x
- Support for 50+ languages and locales

### Changed

#### 🔄 PDF.js Upgrade

- **BREAKING**: Upgraded from PDF.js v4.0.x to v5.3.93
- Improved rendering performance and security
- Enhanced event system and API compatibility
- Better mobile device support

#### 🏗️ Architecture Improvements

- Single-file integration in `postmessage-wrapper.js`
- Removed all `window` variable dependencies (except BUILD_ID)
- Pure event-driven patterns (no timeouts or polling)
- Consolidated configuration management

#### 📝 API Enhancements

- Promise-based method returns for all actions
- Consistent error handling across all methods
- Better property transformation between Angular and PDF.js
- Enhanced event system with comprehensive coverage

### Deprecated

#### ⚠️ Properties (Deprecated)

- `[startDownload]` → Use `[downloadOnLoad]`
- `[startPrint]` → Use `[printOnLoad]`
- `[errorHtml]` → Use `[customErrorTpl]`
- `[errorTemplate]` → Use `[customErrorTpl]`
- `[spinnerHtml]` → Use `[customSpinnerTpl]`

#### ⚠️ Methods (Deprecated)

- `setErrorHtml()` → Use `[customErrorTpl]` with ng-template
- `setSpinnerHtml()` → Use `[customSpinnerTpl]` with ng-template

### Fixed

#### 🐛 Bug Fixes

- Fixed locale changes not applying in PDF.js v5.x
- Fixed spinner not hiding on error conditions
- Fixed PostMessage serialization errors
- Fixed CORS/security error handling
- Fixed HTML sanitization warnings in error displays

#### 🔧 Technical Fixes

- Removed timeout-based hacks in favor of event-driven solutions
- Fixed circular update prevention in two-way binding
- Improved error event listener setup and timing
- Enhanced state change notification system

### Security

#### 🔒 Security Improvements

- Updated to PDF.js v5.3.93 with latest security patches
- Removed HTML sanitization issues with template-based approach
- Enhanced CORS error handling
- Better input validation and sanitization

### Performance

#### ⚡ Performance Improvements

- Faster PDF loading with PDF.js v5.3.93
- Reduced memory usage with better cleanup
- Improved rendering performance on mobile devices
- Optimized event handling and state management

### Documentation

#### 📚 Documentation Updates

- Complete README rewrite with SEO optimization
- Comprehensive API reference with examples
- Migration guide from v19.x to v20.4.0
- Enhanced code examples and tutorials
- Better troubleshooting and FAQ sections

## [19.x.x] - Previous Versions

### Legacy Features (Deprecated)

- Old theme system with custom CSS
- HTML string-based error and spinner customization
- Timeout-based action execution
- Window variable dependencies
- PDF.js v4.0.x integration

---

## Migration Guide

### From v19.x to v20.4.0

1. **Update Dependencies**

   ```bash
   npm install ng2-pdfjs-viewer@latest
   ```

2. **Update Theme Configuration**

   ```typescript
   // Old way
   [customCSS] =
     // New way
     "'body { background: red; }'"[theme] =
     "'light'"[primaryColor] =
     "'#ff0000'"[backgroundColor] =
       "'#ffffff'";
   ```

3. **Update Error Handling**

   ```html
   <!-- Old way -->
   [errorHtml]="'
   <div>Custom error</div>
   '"

   <!-- New way -->
   <ng-template #errorTemplate>
     <div>Custom error</div>
   </ng-template>
   <ng2-pdfjs-viewer [customErrorTpl]="errorTemplate"></ng2-pdfjs-viewer>
   ```

4. **Update Loading Spinners**

   ```html
   <!-- Old way -->
   [spinnerHtml]="'
   <div>Loading...</div>
   '"

   <!-- New way -->
   <ng-template #spinnerTemplate>
     <div>Loading...</div>
   </ng-template>
   <ng2-pdfjs-viewer [customSpinnerTpl]="spinnerTemplate"></ng2-pdfjs-viewer>
   ```

### Breaking Changes

- **PDF.js v5.3.93**: Some internal APIs may have changed
- **Theme System**: New CSS custom properties approach
- **Error Handling**: Template-based system replaces HTML strings
- **Window Variables**: Removed most window dependencies

### Compatibility

- **Angular**: 2.0+ (tested with Angular 20.0+)
- **TypeScript**: 5.0+
- **Node.js**: 18.0+
- **Browsers**: Modern browsers with ES2020+ support

---

## Support

- 📖 **Documentation**: [GitHub Wiki](https://github.com/intbot/ng2-pdfjs-viewer/wiki)
- 💬 **Community**: [GitHub Discussions](https://github.com/intbot/ng2-pdfjs-viewer/discussions)
- 🐛 **Issues**: [GitHub Issues](https://github.com/intbot/ng2-pdfjs-viewer/issues)
- 📧 **Email**: codehippie1@gmail.com
