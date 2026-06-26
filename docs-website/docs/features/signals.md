---
description: "Read viewer state as Angular signals — current page, zoom, search matches, read-aloud progress, and more — for zoneless and OnPush apps, from the ng2-pdfjs-viewer/signals entry point."
keywords: [angular pdf signals, zoneless pdf viewer angular, onpush pdf viewer, angular pdf viewer state]
---

# Signals (zoneless / OnPush)

Every piece of viewer state the component emits is also available as a read-only Angular signal. Instead of wiring up `(onPageChange)`, `(onScaleChange)`, and a dozen other bindings — each pushing into a field you then read in the template — you call one function and read `signals.page()`, `signals.totalPages()`, `signals.loaded()` directly.

This lives in a separate entry point so the base package keeps its `>=10` peer range. Signals and `@angular/core/rxjs-interop` arrived in Angular 16, so **this feature needs Angular 16+**. Apps on older Angular never load it.

```typescript
import { pdfViewerSignals, PdfViewerSignals } from 'ng2-pdfjs-viewer/signals';
```

## Wire it up

A `@ViewChild` reference is only populated in `ngAfterViewInit`, which is **not** an Angular injection context. `toSignal` needs one (to clean up its subscriptions when the host is destroyed), so capture an `Injector` earlier and hand it over:

```typescript
import { Component, ViewChild, Injector, inject, AfterViewInit } from '@angular/core';
import { PdfJsViewerComponent } from 'ng2-pdfjs-viewer';
import { pdfViewerSignals, PdfViewerSignals } from 'ng2-pdfjs-viewer/signals';

@Component({
  selector: 'app-reader',
  template: `
    <ng2-pdfjs-viewer #viewer pdfSrc="/docs/report.pdf"></ng2-pdfjs-viewer>

    @if (signals?.loaded()) {
      <footer>Page {{ signals.page() }} of {{ signals.totalPages() }} · {{ signals.scale() | percent }}</footer>
    }
  `,
})
export class ReaderComponent implements AfterViewInit {
  @ViewChild('viewer') viewer!: PdfJsViewerComponent;
  private injector = inject(Injector);
  signals!: PdfViewerSignals;

  ngAfterViewInit() {
    this.signals = pdfViewerSignals(this.viewer, { injector: this.injector });
  }
}
```

Call it from a constructor or field initializer (where an injection context already exists) and the `injector` option can be dropped — but the `@ViewChild` is `undefined` that early, so `ngAfterViewInit` with an explicit injector is the usual path.

## What you get

Each signal holds the **latest** value from its source output and starts as `undefined` until that output first fires. `loaded` and `totalPages` are derived from page initialization, so `loaded` starts `false`.

| Signal | Type | Source |
| --- | --- | --- |
| `page` | `number \| undefined` | current 1-based page |
| `scale` | `number \| undefined` | zoom factor (1 = 100%) |
| `totalPages` | `number \| undefined` | page count, once pages init |
| `loaded` | `boolean` | `true` once pages init |
| `error` | `DocumentError \| undefined` | last load error |
| `rotation` | `ChangedRotation \| undefined` | `{ rotation, page }` |
| `findMatches` | `FindMatchesCount \| undefined` | `{ current, total }` |
| `readAloud` | `ReadAloudState \| undefined` | `{ status, page, sentence? }` |
| `annotationEditor` | `AnnotationEditorState \| undefined` | undo/empty/selection state |
| `annotationEditorMode` | `AnnotationEditorMode \| undefined` | active tool (highlight, ink, …) |
| `sidebar` | `SidebarViewChange \| undefined` | `{ view }` |
| `metadata` | `DocumentMetadata \| undefined` | title, author, … |
| `outline` | `DocumentOutline \| undefined` | bookmarks |
| `formData` | `FormDataMap \| undefined` | current AcroForm values |
| `presentationMode` | `PresentationMode \| undefined` | `{ active }` |
| `zoom` `cursor` `scroll` `spread` `pageMode` | `string \| undefined` | view-mode strings |

The payload types (`ChangedRotation`, `FindMatchesCount`, …) come from the main package — import them from `ng2-pdfjs-viewer`.

## Composing derived state

Because these are real signals, `computed` and `effect` work as you'd expect — no manual change detection, no `markForCheck`:

```typescript
import { computed, effect } from '@angular/core';

// A "X matches on this page" label that recomputes only when search changes.
readonly matchSummary = computed(() => {
  const m = this.signals.findMatches();
  return m ? `${m.current} of ${m.total}` : 'No search';
});

// React to read-aloud finishing.
constructor() {
  effect(() => {
    if (this.signals?.readAloud()?.status === 'finished') {
      // ...
    }
  });
}
```

## Notes

- **Read-only.** These signals report state; they don't set it. To drive the viewer, use its `@Input()`s and methods (e.g. `[(page)]`, `goToPage()`, `search()`).
- **Cleanup is automatic.** Subscriptions are tied to the injector's `DestroyRef`, so they're released when the host component is destroyed.
- **The outputs still work.** This is a projection of the same `@Output()` events — bind to them directly if you'd rather, or mix both.
