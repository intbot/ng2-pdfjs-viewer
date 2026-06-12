# Page Organization

Let users restructure a document directly in the viewer: reorder pages by drag and drop, delete, cut/copy/paste, extract pages, and merge another PDF or images into the document — powered by PDF.js 6's page-editing support.

## Enabling Page Editing

Page editing is opt-in via `[enablePageEditing]` (default `false`):

```html
<ng2-pdfjs-viewer
  pdfSrc="assets/sample.pdf"
  [enablePageEditing]="true"
  (onPagesEdited)="onPagesEdited($event)">
</ng2-pdfjs-viewer>
```

:::info Init-time option
`enablePageEditing` is applied when the viewer initializes — changing it after the document has loaded requires a reload (`refresh()`).
:::

## The "Manage pages" Panel

In PDF.js 6 the classic sidebar has become the **"Manage pages" panel** (the views manager) — the sidebar toggle now opens a panel that hosts the familiar views (page thumbnails, document outline, attachments, layers) plus, when `enablePageEditing` is on, the editing actions.

With the flag off, the panel behaves like the classic sidebar: thumbnails and the other views, no editing. With the flag on, users can select pages in the thumbnails view and:

- **Reorder** pages by drag and drop
- **Delete** selected pages
- **Cut / copy / paste** pages to other positions
- **Extract** selected pages
- **Add file** — merge another PDF or images into the current document

## Reacting to Edits

Every page-organization operation emits `(onPagesEdited)` with a `PagesEditedEvent`:

```typescript
interface PagesEditedEvent {
  operation: string;   // e.g. 'move', 'delete', 'copy', 'extract'
  pagesCount: number;  // page count after the operation
}
```

```typescript
onPagesEdited(event: PagesEditedEvent) {
  console.log(`Document edited (${event.operation}), now ${event.pagesCount} pages`);
  this.hasUnsavedChanges = true;
}
```

The `operation` string is PDF.js's operation name for the edit; `pagesCount` reflects the document's page count after the change — useful for "unsaved changes" indicators or keeping a host-side page counter in sync.

## Persisting the Result

Edits live in the viewer until you save them. `getDocumentAsBlob()` returns the **current** document — including page edits, annotation edits, and filled form fields — as a `Blob` ready for upload:

```typescript
export class MyComponent {
  @ViewChild('pdfViewer') pdfViewer!: PdfJsViewerComponent;

  constructor(private http: HttpClient) {}

  async save() {
    const blob = await this.pdfViewer.getDocumentAsBlob();
    await firstValueFrom(
      this.http.put('/api/documents/42', blob, {
        headers: { 'Content-Type': 'application/pdf' },
      })
    );
    this.hasUnsavedChanges = false;
  }
}
```

A typical flow: enable page editing, set a dirty flag from `(onPagesEdited)`, and offer a host-side Save button that uploads the blob.

## Related

- [Loading Documents](./loading-documents)
- [Component Inputs](../api/component-inputs)
- [Component Outputs](../api/component-outputs)
- [Component Methods](../api/component-methods)
