# Error Display Examples

When a PDF can't be shown, the component fires `(onDocumentError)` with a `DocumentError`
(`{ message, source?, name? }`) and stops its loading spinner. Whether anything appears on screen is
your call: with `errorOverride` off (the default) the component draws nothing of its own.

## Inputs

| Input | What it does |
|---|---|
| `errorOverride` | Shows the component's error overlay (default `false`). `customErrorTpl` only appears when this is `true`. |
| `customErrorTpl` | Your own `TemplateRef` for the overlay. Without it, a plain message box is used. |
| `errorClass` | CSS class added to the overlay element. |
| `errorMessage` | Your text, added to the viewer's message. |
| `errorAppend` | `true` (default) appends `errorMessage`; `false` replaces the viewer's message with it. |

The same three settings are also available as one object: `[errorHandling]="{ override, message, append }"`.

## What the template receives

| Variable | Value |
|---|---|
| `errorMessage` | The message, after `errorMessage` / `errorAppend` are applied |
| `errorName` | Which kind of failure it was (below) |
| `errorClass` | The `errorClass` input |

`errorName` is one of:

- `UnsupportedBrowser`: the browser can't run the bundled PDF.js at all. With PDF.js 6.x that means
  Safari and iOS 16 or older. Mozilla's own legacy build doesn't support them either.
- `ViewerLoadError`: one of the viewer's files didn't load, usually a wrong asset path, or a server
  that doesn't send `.mjs` files as JavaScript.
- `FetchError`: the component's own download failed (the path used when `httpHeaders` or
  `withCredentials` is set).
- Anything else is PDF.js's own error name for the document (a missing file, a broken or
  password-protected PDF), or `DocumentError` when PDF.js gives none.

## Example: tell old browsers what they need

```html
<ng-template #errorTpl let-errorName="errorName" let-errorMessage="errorMessage">
  <div class="pdf-error">
    <p *ngIf="errorName === 'UnsupportedBrowser'; else otherError">
      This document needs Safari 17 or later. Please update your browser to view it.
    </p>
    <ng-template #otherError>
      <p>We couldn't open this document.</p>
      <small>{{ errorMessage }}</small>
    </ng-template>
  </div>
</ng-template>

<ng2-pdfjs-viewer
  [pdfSrc]="src"
  [errorOverride]="true"
  [customErrorTpl]="errorTpl">
</ng2-pdfjs-viewer>
```

Leave out a download link if your app doesn't offer downloads; nothing is added for you.

## Example: handle it outside the viewer

If you'd rather keep the viewer area empty and show the message somewhere else, skip
`errorOverride` and use the event:

```typescript
onDocumentError(error: DocumentError) {
  if (error.name === 'UnsupportedBrowser') {
    this.banner = 'Please update your browser to view this document.';
  }
}
```

```html
<ng2-pdfjs-viewer [pdfSrc]="src" (onDocumentError)="onDocumentError($event)"></ng2-pdfjs-viewer>
```

## Example: a retry button

The overlay sits inside the component, so a template reference gives you `refresh()`:

```html
<ng-template #retryTpl let-errorMessage="errorMessage">
  <div class="pdf-error">
    <p>{{ errorMessage }}</p>
    <button type="button" (click)="viewer.refresh()">Try again</button>
  </div>
</ng-template>

<ng2-pdfjs-viewer #viewer
  [pdfSrc]="src"
  [errorOverride]="true"
  [customErrorTpl]="retryTpl"
  errorClass="my-error">
</ng2-pdfjs-viewer>
```

## Built-in templates

`errorTemplate="basic"`, `"corporate"` and the other built-in templates were deprecated in 25.0.0
and are no longer in the package. The attribute is ignored now; use `customErrorTpl`.
