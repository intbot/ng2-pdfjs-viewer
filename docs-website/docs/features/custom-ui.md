# Custom Toolbar, Sidebar & Page Overlays

Replace or extend the viewer's chrome with your own Angular templates — without forking
PDF.js. Three template inputs cover the three surfaces:

- `[customToolbarTpl]` — your toolbar, rendered **above** the viewer
- `[customSidebarTpl]` — your sidebar, rendered **beside** the viewer on the left
- `[pageOverlayTpl]` — your content, projected **onto every rendered page**

All three are ordinary `TemplateRef`s from your host application, so they have full access
to your services, pipes, and event handlers — and the toolbar/sidebar templates receive
the viewer component itself as template context, giving them the entire public API.

:::info
These hooks render in embedded mode only — they are not available when the viewer runs
with `[externalWindow]="true"`.
:::

## Embedded (chromeless) mode

Sometimes you don't want to replace the chrome, just remove it. Set `[chromeless]="true"`
to hide the toolbar and sidebar together so the iframe shows only the scrolling pages —
handy for inline previews and thumbnails where the controls would get in the way.

```html
<ng2-pdfjs-viewer pdfSrc="assets/doc.pdf" [chromeless]="true"></ng2-pdfjs-viewer>
```

It's shorthand for `[showToolbar]="false"` + `[showSidebar]="false"`, and it overrides
those inputs without overwriting them: bind it to a signal, flip it off, and the
individual switches return to whatever you had set. The pages still render inside an
iframe with its own scroll container — when you need host-app DOM on top of each page,
reach for [`pageOverlayTpl`](#page-overlays) instead.

## Custom Toolbar

`[customToolbarTpl]` renders your template in a bar above the viewer iframe. The template
context's `$implicit` value is the component instance — declare it with `let-viewer` and
call any public method or property. Pair it with `[showToolbar]="false"` to hide the
built-in PDF.js toolbar and ship a fully custom one.

```html
<ng-template #toolbar let-viewer>
  <div class="my-toolbar">
    <button (click)="viewer.setPage(viewer.page - 1)">‹ Prev</button>
    <span>Page {{ viewer.page }}</span>
    <button (click)="viewer.setPage(viewer.page + 1)">Next ›</button>

    <span class="spacer"></span>

    <button (click)="viewer.setZoom('page-width')">Fit width</button>
    <button (click)="viewer.setZoom('page-fit')">Fit page</button>

    <span class="spacer"></span>

    <button (click)="viewer.triggerDownload()">Download</button>
    <button (click)="viewer.triggerPrint()">Print</button>
  </div>
</ng-template>

<ng2-pdfjs-viewer
  pdfSrc="assets/sample.pdf"
  [customToolbarTpl]="toolbar"
  [showToolbar]="false">
</ng2-pdfjs-viewer>
```

```css
.my-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #1f2430;
  color: #fff;
}

.my-toolbar .spacer {
  flex: 1;
}
```

Because the template lives in your app, the buttons are your buttons — your design
system, your icons, your keyboard handling.

## Custom Sidebar

`[customSidebarTpl]` renders your template beside the iframe on the left, with the same
`let-viewer` context as the toolbar. Pair it with `[groupVisibility]="{ sidebar: false }"`
to replace the built-in PDF.js sidebar entirely. The sidebar column sizes to its content —
set the width with your own CSS.

When you use both a custom toolbar and a custom sidebar, the toolbar spans the full width
above the sidebar and the viewer.

```typescript
export class MyComponent {
  sections = [
    { label: 'Executive Summary', page: 1 },
    { label: 'Financials',        page: 4 },
    { label: 'Risk Factors',      page: 9 },
    { label: 'Appendix',          page: 14 },
  ];
}
```

```html
<ng-template #sidebar let-viewer>
  <nav class="my-sidebar">
    <h4>Contents</h4>
    <a *ngFor="let s of sections"
       (click)="viewer.setPage(s.page)"
       [class.active]="viewer.page >= s.page">
      {{ s.label }}
      <span class="page-no">p.{{ s.page }}</span>
    </a>
  </nav>
</ng-template>

<ng2-pdfjs-viewer
  pdfSrc="assets/report.pdf"
  [customSidebarTpl]="sidebar"
  [groupVisibility]="{ sidebar: false }">
</ng2-pdfjs-viewer>
```

```css
.my-sidebar {
  width: 240px;          /* you control the size */
  height: 100%;
  padding: 12px;
  background: #f7f8fa;
  border-right: 1px solid #e3e6ea;
}

.my-sidebar a {
  display: flex;
  justify-content: space-between;
  padding: 6px 8px;
  border-radius: 6px;
  cursor: pointer;
}
```

## Page Overlays

`[pageOverlayTpl]` projects an Angular template onto **every rendered page** inside the
viewer — watermarks, stamps, badges, review UI. The template context's `$implicit` value
is the **1-based page number** (`let-page`).

Key mechanics:

- Each page gets a wrapper that covers the page and has `pointer-events: none`, so
  overlays never block text selection or annotation by default. Re-enable
  `pointer-events: auto` on the specific elements you want interactive.
- Bindings inside the template **stay live** — the views are attached to your Angular
  application, so interpolations and event handlers keep working.
- Overlays mount per rendered page and are re-mounted when PDF.js re-renders pages
  (zoom changes, rotation). Setting the input after pages have rendered (e.g. a toggle)
  mounts overlays on the already-rendered pages; clearing it unmounts them.
- Overlay nodes are placed inside the viewer's iframe document, so styles from your
  component stylesheets won't reach them — use inline styles or style bindings, as in
  the examples below.

### Example: "DRAFT" Watermark on Every Page

```html
<ng-template #overlay let-page>
  <div style="position: absolute; inset: 0; display: flex;
              align-items: center; justify-content: center;">
    <span style="transform: rotate(-35deg); font-size: 72px; font-weight: 700;
                 color: #888; opacity: 0.25; white-space: nowrap;">
      DRAFT
    </span>
  </div>
</ng-template>

<ng2-pdfjs-viewer
  pdfSrc="assets/contract.pdf"
  [pageOverlayTpl]="overlay">
</ng2-pdfjs-viewer>
```

### Example: An Interactive Per-Page Badge

The wrapper is `pointer-events: none`, so interactive elements opt back in with
`pointer-events: auto`. Here each page gets a review button whose label tracks live
component state:

```typescript
export class ReviewComponent {
  reviewed = new Set<number>();

  toggleReviewed(page: number): void {
    if (this.reviewed.has(page)) {
      this.reviewed.delete(page);
    } else {
      this.reviewed.add(page);
    }
  }
}
```

```html
<ng-template #overlay let-page>
  <button style="position: absolute; top: 8px; right: 8px; pointer-events: auto;
                 padding: 4px 10px; border: none; border-radius: 12px;
                 background: #4436a1; color: #fff; cursor: pointer;"
          (click)="toggleReviewed(page)">
    {{ reviewed.has(page) ? '✓ Reviewed' : 'Mark page ' + page + ' reviewed' }}
  </button>
</ng-template>

<ng2-pdfjs-viewer
  pdfSrc="assets/contract.pdf"
  [pageOverlayTpl]="overlay">
</ng2-pdfjs-viewer>
```

Because `let-page` carries the page number, one template serves every page with
page-specific content and behavior.

## Related

- [Theming & Customization](./theming) — restyle the built-in UI instead of replacing it
- [AI Assistant (Bring Your Own Endpoint)](./ai-assistant) — add an "Ask AI" button to your custom toolbar
- [Read Aloud (Text-to-Speech)](./read-aloud) — player controls fit naturally in a custom toolbar
- [API Reference: Methods](../api/component-methods) — everything `let-viewer` gives you access to
