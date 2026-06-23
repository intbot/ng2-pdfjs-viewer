---
description: "Fill and read PDF AcroForm fields in Angular with two-way [(formData)] binding, programmatic field access, and save of the completed document."
keywords: [angular pdf forms, acroform angular, fill pdf form angular, pdf form data binding]
---

# Forms & Data

Fill, read, and submit PDF form (AcroForm) fields from Angular — no digging into the viewer iframe. Bind form values two-way, prefill them from your API, and upload the filled document as a single PDF.

## Two-Way Form Binding

The `formData` input is two-way bindable. Setting it writes the values into the viewer's form widgets; when the user edits a field in the viewer, `formDataChange` fires and your property updates:

```typescript
import { FormDataMap } from 'ng2-pdfjs-viewer';

export class MyComponent {
  formData: FormDataMap = {
    fullName: 'Ada Lovelace',
    subscribe: true
  };
}
```

```html
<ng2-pdfjs-viewer
  pdfSrc="assets/application-form.pdf"
  [(formData)]="formData">
</ng2-pdfjs-viewer>
```

`FormDataMap` keys values by field name:

```typescript
type FormDataMap = Record<string, string | boolean | null>;
```

- Text and choice fields are strings
- Checkboxes are booleans
- Radio groups hold the selected export value

## Reading Form Values

`getFormData()` returns the current field values, reflecting any user edits. It resolves to `{}` for documents without form fields:

```typescript
const values = await this.pdfViewer.getFormData();
console.log(values['fullName']);
```

## Setting a Single Field

When you only need to change one field, `setFormField(name, value)` avoids re-sending the whole map:

```typescript
await this.pdfViewer.setFormField('status', 'approved');
await this.pdfViewer.setFormField('subscribe', false);
```

The signature is `setFormField(name: string, value: string | boolean | null): Promise<ActionExecutionResult>`.

## Saving the Filled Document

`getDocumentAsBlob()` returns the current document — including filled form fields and any annotation edits — as a `Blob`, ready for upload or download:

```typescript
const blob = await this.pdfViewer.getDocumentAsBlob();
```

## Complete Example: Prefill, Collect, Upload

```typescript
import { Component, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PdfJsViewerComponent, FormDataMap } from 'ng2-pdfjs-viewer';

@Component({
  selector: 'app-form-filler',
  template: `
    <ng2-pdfjs-viewer #pdfViewer
      pdfSrc="assets/application-form.pdf"
      [(formData)]="formData">
    </ng2-pdfjs-viewer>
    <button (click)="submit()">Submit</button>
  `
})
export class FormFillerComponent {
  @ViewChild('pdfViewer') pdfViewer!: PdfJsViewerComponent;
  formData: FormDataMap = {};

  constructor(private http: HttpClient) {}

  async ngOnInit() {
    // Prefill from your API - queued and applied once the document is ready
    this.formData = await this.http
      .get<FormDataMap>('/api/applicants/42/prefill')
      .toPromise() as FormDataMap;
  }

  async submit() {
    // 1. Collect the structured field values
    const values = await this.pdfViewer.getFormData();
    await this.http.post('/api/applications', values).toPromise();

    // 2. Upload the filled PDF itself
    const blob = await this.pdfViewer.getDocumentAsBlob();
    const upload = new FormData();
    upload.append('file', blob, 'application.pdf');
    await this.http.post('/api/applications/42/document', upload).toPromise();
  }
}
```

## XFA Forms & Document Scripting

The form APIs above target **AcroForm** fields. Two related PDF.js capabilities are available through the `pdfJsOptions` passthrough:

```html
<ng2-pdfjs-viewer
  pdfSrc="assets/xfa-form.pdf"
  [pdfJsOptions]="{ enableXfa: true, enableScripting: true }">
</ng2-pdfjs-viewer>
```

- `enableXfa` — render XFA forms
- `enableScripting` — run embedded document JavaScript (e.g. field calculations and validation)

These are **init-time options**: they ride the viewer URL and are read before the postMessage channel exists, so changing `pdfJsOptions` after the document has loaded reloads the viewer. `pdfJsOptions` keys outside the wrapper's allowlist are ignored with a console warning.

You can check whether a document contains forms at all via the `(onMetadataLoaded)` event — its `DocumentMetadata` payload includes `isAcroFormPresent` and `isXFAPresent`.

## Related

- [Annotation Editing & eSign](./annotation-editing) — editor modes, signatures, annotation persistence
- [Programmatic Search](./search) — drive the find bar from your own UI
- [Component Methods](../api/component-methods) — full method reference
- [Component Inputs](../api/component-inputs) — full input reference
