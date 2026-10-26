# Loading Documents

Everything about getting a PDF into the viewer: the source formats `pdfSrc` accepts, controlling the initial view, authenticated loading with custom headers, password-protected documents, and the loading/error UX.

## Document Sources

The `pdfSrc` input accepts three source types: a URL string, a `Blob`, or a `Uint8Array`.

### URL

The simplest case — point the viewer at a file the browser can reach:

```html
<ng2-pdfjs-viewer pdfSrc="assets/sample.pdf"></ng2-pdfjs-viewer>
```

Absolute URLs work too (subject to CORS, like any cross-origin fetch):

```html
<ng2-pdfjs-viewer pdfSrc="https://example.com/reports/q3.pdf"></ng2-pdfjs-viewer>
```

### Blob

Useful when your API returns the PDF bytes — fetch with `HttpClient` and hand the viewer the blob:

```typescript
export class MyComponent {
  @ViewChild('pdfViewer') pdfViewer!: PdfJsViewerComponent;

  constructor(private http: HttpClient) {}

  openFromServer() {
    this.http
      .get('/api/documents/42', { responseType: 'blob' })
      .subscribe((blob: Blob) => {
        this.pdfViewer.pdfSrc = blob;
        this.pdfViewer.refresh();
      });
  }
}
```

When you change `pdfSrc` programmatically after the viewer has rendered, call `refresh()` to load the new document.

### Uint8Array

Raw bytes work the same way — generated PDFs, IndexedDB content, decrypted buffers:

```typescript
const bytes: Uint8Array = await this.generatePdf();
this.pdfViewer.pdfSrc = bytes;
this.pdfViewer.refresh();
```

## Initial View State

Control what the user sees when the document opens:

```html
<ng2-pdfjs-viewer
  pdfSrc="assets/sample.pdf"
  [page]="5"
  [zoom]="'page-width'"
  [rememberLastView]="false">
</ng2-pdfjs-viewer>
```

- **`[page]`** — the page to open on. Also settable after load (`pdfViewer.page = 5`).
- **`[zoom]`** — initial zoom level. Supports `auto` (default), `page-fit`, `page-width`, `page-actual`, and percentage values like `'150%'`. Two-way bindable with `[(zoom)]`.
- **`[namedDest]`** — jump to a named destination defined inside the PDF instead of a page number:

```html
<ng2-pdfjs-viewer pdfSrc="assets/manual.pdf" namedDest="chapter3"></ng2-pdfjs-viewer>
```

- **`[rememberLastView]`** — restore the previous reading position (page/zoom/sidebar) when the same document is reopened. Defaults to `true`. Set it to `false` if documents should always open at page 1 / your configured initial view.

## Authenticated Loading

The viewer runs inside an iframe, and an iframe's own request for a URL cannot carry custom headers. The component solves this with `httpHeaders`: when set, the **component fetches the document itself** (with your headers) and feeds the viewer a local blob — the URL never has to be reachable by the iframe directly.

```typescript
export class MyComponent {
  headers = { Authorization: `Bearer ${this.auth.token}` };

  onProgress(progress: { loaded: number; total: number }) {
    // total is 0 when the server sends no Content-Length
    this.percent = progress.total
      ? Math.round((progress.loaded / progress.total) * 100)
      : null;
  }
}
```

```html
<ng2-pdfjs-viewer
  [pdfSrc]="protectedUrl"
  [httpHeaders]="headers"
  [withCredentials]="true"
  (onProgress)="onProgress($event)">
</ng2-pdfjs-viewer>
```

- **`[httpHeaders]`** — a `Record<string, string>` of request headers (JWT bearer tokens, API keys) sent with the component-side fetch of a string `pdfSrc` URL.
- **`[withCredentials]`** — send cookies/credentials with that fetch (default `false`).
- **`(onProgress)`** — `{ loaded, total }` download progress, emitted only for this component-side fetch path.

:::info S3 and signed URLs
If your storage supports **pre-signed URLs** (S3, Azure Blob SAS, GCS), you don't need `httpHeaders` at all — the credentials live in the URL itself. Just pass the signed URL as `pdfSrc` and let the viewer load it directly. This also keeps PDF.js's streaming/range-request loading, which the header-based fetch path gives up (see [Large Documents](#large-documents) below).
:::

## Password-Protected PDFs

No extra configuration needed: when a document is password-protected, the viewer shows PDF.js's built-in password dialog. The component fires `(onPasswordPrompt)` at that moment — and automatically drops its own loading spinner so the dialog is usable. Use the event to tear down any overlays or skeletons your app put on top:

```html
<ng2-pdfjs-viewer
  pdfSrc="assets/confidential.pdf"
  (onPasswordPrompt)="hideAppOverlay()">
</ng2-pdfjs-viewer>
```

## Loading UX

A loading spinner is shown by default (`[showSpinner]="true"`). Replace it with your own Angular template:

```html
<ng-template #loadingTpl>
  <div class="loading">
    <div class="spinner"></div>
    <p>Loading your document...</p>
  </div>
</ng-template>

<ng2-pdfjs-viewer
  pdfSrc="assets/sample.pdf"
  [customSpinnerTpl]="loadingTpl">
</ng2-pdfjs-viewer>
```

## Error Handling

When a document fails to load, `(onDocumentError)` fires with a `DocumentError` (`{ message, source?, name? }`) and the loading spinner stops. The component shows nothing of its own unless you turn on `errorOverride`; then it shows your `customErrorTpl` (or a plain message box):

```html
<ng-template #errorTpl let-errorName="errorName" let-errorMessage="errorMessage">
  <div class="error">
    <h3 *ngIf="errorName === 'UnsupportedBrowser'; else failed">This document needs Safari 17 or later</h3>
    <ng-template #failed><h3>Couldn't load this document</h3></ng-template>
    <p>{{ errorMessage }}</p>
    <button (click)="retry()">Retry</button>
  </div>
</ng-template>

<ng2-pdfjs-viewer
  [pdfSrc]="src"
  [errorOverride]="true"
  [customErrorTpl]="errorTpl"
  (onDocumentError)="logError($event)">
</ng2-pdfjs-viewer>
```

- **`errorOverride`**: show the component's error overlay (default `false`). `customErrorTpl` only appears when this is on.
- **`customErrorTpl`**: your template for the overlay. It receives `errorMessage`, `errorName` and `errorClass`.
- **`errorMessage`**: your text, added to the viewer's message.
- **`errorAppend`**: append `errorMessage` (default `true`), or `false` to replace the viewer's message with it.
- **`errorClass`**: a CSS class for the overlay.

`errorName` (also on the event) tells failures apart: `UnsupportedBrowser` when the browser can't run PDF.js at all (Safari and iOS 16 or older), `ViewerLoadError` when a viewer file didn't load (check the asset path, and that `.mjs` is served as JavaScript), `FetchError` when the component's own download failed, otherwise PDF.js's name for the document error.

## Large Documents

PDF.js can stream documents with HTTP range requests, so the first pages render before the whole file downloads. Two things make that work:

1. **Linearize the PDF** ("fast web view") when producing it, e.g. `qpdf --linearize input.pdf output.pdf`.
2. **Serve with range support** — the server must send `Accept-Ranges: bytes` and honor `Range` requests (standard on Nginx/IIS/S3/CDNs; check that proxies don't strip it).

Pages render lazily as the user scrolls, so memory stays bounded even for thousand-page documents. Note that the `httpHeaders`/`withCredentials` path downloads the full document before display (headers can't be attached to the viewer's streaming fetch) — prefer time-limited signed URLs for very large protected documents. See the "Large Documents & Fast Web View" section of the [README](https://github.com/intbot/ng2-pdfjs-viewer/blob/master/README.md) for the full recipe.

## Related

- [Features Overview](./overview)
- [Security Features](./security)
- [Component Inputs](../api/component-inputs)
- [Component Outputs](../api/component-outputs)
- [Basic Usage Examples](../examples/basic-usage)
