---
description: "Add, edit, save, and restore PDF annotations in Angular: highlight, text, draw, and stamp, plus signature and comment editors, with getAnnotations() and setAnnotations()."
keywords: [angular pdf annotation, angular pdf annotation editor, angular pdf signature, esign angular, pdf annotations save restore]
---

# Annotation Editing & eSign

Let your users draw, highlight, add text, stamp images, and sign documents directly in the viewer — then persist their work to your server and restore it later. The annotation editor is the bundled PDF.js editor; ng2-pdfjs-viewer exposes it through Angular inputs, outputs, and promise-based methods.

## Editor Modes

The active editing tool is controlled with the two-way bindable `annotationEditor` input:

```typescript
import { AnnotationEditorMode } from 'ng2-pdfjs-viewer';

export class MyComponent {
  // 'disable' | 'none' | 'freetext' | 'highlight' | 'stamp' | 'ink' | 'signature' | 'comment'
  editorMode: AnnotationEditorMode = 'none';

  startDrawing() {
    this.editorMode = 'ink';
  }
}
```

```html
<ng2-pdfjs-viewer
  pdfSrc="assets/sample.pdf"
  [(annotationEditor)]="editorMode">
</ng2-pdfjs-viewer>

<button (click)="startDrawing()">Draw</button>
```

The binding is two-way: when the user clicks an editor button in the viewer toolbar, `annotationEditorChange` fires and your property updates. Setting the property programmatically activates that tool in the viewer.

Mode values:

- `none` — no tool active, but the editor toolbar buttons stay visible
- `disable` — tears the editing UI down entirely
- `freetext` — text boxes
- `highlight` — text highlighting
- `stamp` — image stamps
- `ink` — freehand drawing
- `signature` — signature placement (requires `enableSignatureEditor`)
- `comment` — threaded comments (requires `enableCommentEditor`)

Editing requires a loaded document; mode changes made before the document is ready are queued and applied automatically.

### Toolbar Visibility

The annotation editor buttons in the toolbar are shown by default. Hide them with `showAnnotations`:

```html
<ng2-pdfjs-viewer
  pdfSrc="assets/sample.pdf"
  [showAnnotations]="false">
</ng2-pdfjs-viewer>
```

### Highlight Color Presets

Customize the highlight editor's color palette with `highlightEditorColors`, using the PDF.js `name=#hex` list format. It is applied before the document opens:

```html
<ng2-pdfjs-viewer
  pdfSrc="assets/sample.pdf"
  highlightEditorColors="yellow=#FFFF98,green=#53FFBC,blue=#80EBFF,pink=#FFCBE6,red=#FF4F5F">
</ng2-pdfjs-viewer>
```

## Opt-in Editors: Signature & Comment

Two editors are opt-in via boolean inputs:

```html
<ng2-pdfjs-viewer
  pdfSrc="assets/contract.pdf"
  [enableSignatureEditor]="true"
  [enableCommentEditor]="true">
</ng2-pdfjs-viewer>
```

- `enableSignatureEditor` (default `false`) — the PDF.js signature editor: users can draw a signature, type one, or upload an image.
- `enableCommentEditor` (default `false`) — threaded comment popups on highlights, with edit/delete and undo/redo.

Both are **init-time options**: they ride the viewer URL and are read before the postMessage channel exists, so changing them after the document has loaded reloads the viewer.

## Editor State Events

`(onAnnotationEditorStateChange)` emits an `AnnotationEditorState` whenever the editor's editing/undo state changes — ideal for driving "unsaved changes" and save-button UX:

```typescript
interface AnnotationEditorState {
  isEditing: boolean;
  isEmpty: boolean;
  hasSomethingToUndo: boolean;
  hasSomethingToRedo: boolean;
  hasSelectedEditor: boolean;
}
```

```typescript
import { AnnotationEditorState } from 'ng2-pdfjs-viewer';

export class MyComponent {
  canSave = false;

  onEditorState(state: AnnotationEditorState) {
    // Enable the save button once there is something to save
    this.canSave = !state.isEmpty || state.hasSomethingToUndo;
  }
}
```

```html
<ng2-pdfjs-viewer
  pdfSrc="assets/sample.pdf"
  (onAnnotationEditorStateChange)="onEditorState($event)">
</ng2-pdfjs-viewer>

<button [disabled]="!canSave" (click)="save()">Save annotations</button>
```

## Persisting Annotations

Three methods cover the persistence story:

| Method | Returns | Purpose |
|---|---|---|
| `getAnnotations()` | `Promise<any[]>` | Serialized state of every annotation created or modified in the editor |
| `setAnnotations(annotations)` | `Promise<{ restored: number; pending: number; rejected: number }>` | Restore previously exported annotations into the editor |
| `getDocumentAsBlob()` | `Promise<Blob>` | The current document bytes — including annotation edits — as a `Blob` |

### Exporting with getAnnotations()

`getAnnotations()` returns a JSON-safe array (geometry arrays are plain arrays), so you can `JSON.stringify` it and send it to your server as-is.

### Restoring with setAnnotations()

`setAnnotations()` rebuilds each annotation on its own page. Important semantics:

- **Restore is additive.** Calling it twice with the same payload creates duplicates — restore once per document load.
- **`pending`** counts annotations targeting pages that haven't rendered yet; they apply automatically when those pages render.
- **`rejected`** counts items with a `pageIndex` that is invalid for the current document — they are skipped.
- **Stamp images cannot round-trip.** Their bitmaps are not serializable, so stamp annotations won't survive an export/restore cycle. If you need edits baked in permanently, save the whole document with `getDocumentAsBlob()` instead.

### Complete Example: Save to Server, Restore on Reload

```typescript
import { Component, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PdfJsViewerComponent } from 'ng2-pdfjs-viewer';

@Component({
  selector: 'app-document-review',
  template: `
    <ng2-pdfjs-viewer #pdfViewer
      pdfSrc="assets/contract.pdf"
      (onDocumentLoad)="restoreAnnotations()"
      (onAnnotationEditorStateChange)="canSave = !$event.isEmpty || $event.hasSomethingToUndo">
    </ng2-pdfjs-viewer>
    <button [disabled]="!canSave" (click)="saveAnnotations()">Save</button>
  `
})
export class DocumentReviewComponent {
  @ViewChild('pdfViewer') pdfViewer!: PdfJsViewerComponent;
  canSave = false;
  documentId = 'contract-42';

  constructor(private http: HttpClient) {}

  async saveAnnotations() {
    const annotations = await this.pdfViewer.getAnnotations();
    await this.http
      .put(`/api/documents/${this.documentId}/annotations`, annotations)
      .toPromise();
  }

  async restoreAnnotations() {
    const annotations = await this.http
      .get<any[]>(`/api/documents/${this.documentId}/annotations`)
      .toPromise();
    if (annotations?.length) {
      // Additive: only call once per document load
      const result = await this.pdfViewer.setAnnotations(annotations);
      console.log(
        `restored ${result.restored}, pending ${result.pending}, rejected ${result.rejected}`
      );
    }
  }
}
```

### Uploading the Edited Document

To persist the document itself — with annotations and form fills baked into the PDF bytes — use `getDocumentAsBlob()`:

```typescript
async uploadDocument() {
  const blob = await this.pdfViewer.getDocumentAsBlob();
  const formData = new FormData();
  formData.append('file', blob, 'annotated.pdf');
  await this.http.post('/api/upload', formData).toPromise();
}
```

## Signatures (eSign)

With `enableSignatureEditor` on, users can draw, type, or upload a signature and place it on the page. Placed signatures are saved as **stamp-style annotations**.

:::caution
This is an **eSign convenience, not cryptographic signing**. The signature is a visual annotation in the document — it does not produce a digital signature, certificate chain, or tamper-evident seal. If you need legally binding cryptographic signatures, pair the viewer with a server-side signing service.
:::

### Persisting Saved Signatures with signatureStorage

By default, signatures the user saves for reuse live in the viewer iframe's `localStorage`. To store them server-side per user instead, provide a `PdfSignatureStorage` implementation via the `[signatureStorage]` input:

```typescript
interface PdfSignatureStorage {
  loadAll(): Promise<Record<string, unknown>>;
  save(uuid: string, data: unknown): Promise<void>;
  delete(uuid: string): Promise<void>;
}
```

`data` is PDF.js's serialized signature — treat it as an opaque JSON value.

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PdfSignatureStorage } from 'ng2-pdfjs-viewer';

@Injectable({ providedIn: 'root' })
export class ServerSignatureStorage implements PdfSignatureStorage {
  constructor(private http: HttpClient) {}

  loadAll(): Promise<Record<string, unknown>> {
    return this.http
      .get<Record<string, unknown>>('/api/me/signatures')
      .toPromise() as Promise<Record<string, unknown>>;
  }

  async save(uuid: string, data: unknown): Promise<void> {
    await this.http.put(`/api/me/signatures/${uuid}`, data).toPromise();
  }

  async delete(uuid: string): Promise<void> {
    await this.http.delete(`/api/me/signatures/${uuid}`).toPromise();
  }
}
```

```typescript
export class MyComponent {
  constructor(public signatureStorage: ServerSignatureStorage) {}
}
```

```html
<ng2-pdfjs-viewer
  pdfSrc="assets/contract.pdf"
  [enableSignatureEditor]="true"
  [signatureStorage]="signatureStorage">
</ng2-pdfjs-viewer>
```

## Related

- [Forms & Data](./forms) — fill and read AcroForm fields, save filled documents
- [Programmatic Search](./search) — drive the find bar from your own UI
- [Component Methods](../api/component-methods) — full method reference
- [Component Inputs](../api/component-inputs) — full input reference
- [Component Outputs](../api/component-outputs) — full event reference
