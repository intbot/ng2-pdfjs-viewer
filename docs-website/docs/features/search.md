# Programmatic Search

Drive the viewer's full-text search from your own Angular UI. The `search()` family of methods wraps the PDF.js find controller in promises that resolve with structured results — totals, per-page match counts, and the current match position — so you can build an external search box, result badges, or page navigation without touching the built-in find bar.

## search()

```typescript
search(query: string, options?: SearchOptions): Promise<SearchResult>
```

Runs a full-text search and highlights the matches in the viewer:

```typescript
const result = await this.pdfViewer.search('invoice');
console.log(`${result.total} matches`);
```

### SearchOptions

```typescript
interface SearchOptions {
  caseSensitive?: boolean;
  entireWord?: boolean;
  highlightAll?: boolean;   // highlight every match in the document (default true)
  matchDiacritics?: boolean;
}
```

```typescript
await this.pdfViewer.search('Total', {
  caseSensitive: true,
  entireWord: true
});
```

### SearchResult

```typescript
interface SearchResult {
  total: number;
  current: { page: number; matchIndex: number } | null;
  matchesPerPage: number[];     // match count per page, index 0 = page 1
  pagesWithMatches: number[];   // 1-based page numbers with at least one match
}
```

`current` is the active (selected) match, or `null` when there is none.

## Navigating Matches

`searchNext()` and `searchPrevious()` move the selection and resolve with an updated `SearchResult`, so `result.current` always tells you where the user landed:

```typescript
const next = await this.pdfViewer.searchNext();
console.log(`match ${next.current?.matchIndex} on page ${next.current?.page}`);

const prev = await this.pdfViewer.searchPrevious();
```

## Clearing the Search

`clearSearch()` removes the highlights and forgets the active query:

```typescript
await this.pdfViewer.clearSearch();
```

It returns `Promise<ActionExecutionResult>`.

## Find Events

Two outputs mirror the viewer's find activity — they fire for built-in find-bar searches as well:

- `(onFind)` emits a `FindOperation` when a search is performed:

  ```typescript
  interface FindOperation {
    query: string;
    phraseSearch: boolean;
    caseSensitive: boolean;
    entireWord?: boolean;
    highlightAll?: boolean;
    findPrevious?: boolean;
  }
  ```

- `(onUpdateFindMatchesCount)` emits a `FindMatchesCount` as the match count updates:

  ```typescript
  interface FindMatchesCount {
    current: number;
    total: number;
  }
  ```

```html
<ng2-pdfjs-viewer
  pdfSrc="assets/sample.pdf"
  (onFind)="onFind($event)"
  (onUpdateFindMatchesCount)="onMatches($event)">
</ng2-pdfjs-viewer>
```

## Complete Example: External Search Box

A host-side search box with a result counter and next/previous navigation:

```typescript
import { Component, ViewChild } from '@angular/core';
import { PdfJsViewerComponent, SearchResult } from 'ng2-pdfjs-viewer';

@Component({
  selector: 'app-pdf-search',
  template: `
    <div class="search-bar">
      <input #box placeholder="Search document"
             (keyup.enter)="runSearch(box.value)" />
      <button (click)="runSearch(box.value)">Search</button>
      <ng-container *ngIf="result">
        <span>{{ currentLabel }}</span>
        <button (click)="previous()" [disabled]="!result.total">Previous</button>
        <button (click)="next()" [disabled]="!result.total">Next</button>
        <button (click)="clear(box)">Clear</button>
      </ng-container>
    </div>

    <ng2-pdfjs-viewer #pdfViewer pdfSrc="assets/sample.pdf">
    </ng2-pdfjs-viewer>
  `
})
export class PdfSearchComponent {
  @ViewChild('pdfViewer') pdfViewer!: PdfJsViewerComponent;
  result: SearchResult | null = null;

  get currentLabel(): string {
    if (!this.result || !this.result.total) {
      return 'No matches';
    }
    const page = this.result.current?.page;
    return `${this.result.total} matches` + (page ? ` (page ${page})` : '');
  }

  async runSearch(query: string) {
    if (!query) return;
    this.result = await this.pdfViewer.search(query, { highlightAll: true });
  }

  async next() {
    this.result = await this.pdfViewer.searchNext();
  }

  async previous() {
    this.result = await this.pdfViewer.searchPrevious();
  }

  async clear(box: HTMLInputElement) {
    box.value = '';
    this.result = null;
    await this.pdfViewer.clearSearch();
  }
}
```

You can also use `result.pagesWithMatches` to render a clickable list of pages and jump to them with `setPage(page)`.

## Related

- [Annotation Editing & eSign](./annotation-editing) — editor modes, signatures, annotation persistence
- [Forms & Data](./forms) — fill and read AcroForm fields
- [Component Methods](../api/component-methods) — full method reference
- [Component Outputs](../api/component-outputs) — full event reference
