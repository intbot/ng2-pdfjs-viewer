import { Component, signal } from '@angular/core';
import { PdfJsViewerComponent, PdfJsViewerModule, FormDataMap } from 'ng2-pdfjs-viewer';
import { PlaygroundLayoutComponent } from '../../shared/playground-layout.component';

@Component({
  selector: 'pg-forms',
  standalone: true,
  imports: [PlaygroundLayoutComponent, PdfJsViewerModule],
  templateUrl: './forms.component.html',
  styles: [`
    .note { font-size: 11.5px; color: var(--faint); line-height: 1.5; margin: 4px 0 0; }
    .dump { font: 11px/1.5 var(--mono, monospace); background: var(--panel-2, #111); border-radius: 6px;
            padding: 8px; max-height: 220px; overflow: auto; white-space: pre-wrap; word-break: break-all; }
    .count { font-size: 12px; margin: 6px 0 0; }
  `],
})
export class FormsComponent {
  // This page pins a real AcroForm document (US tax form from the PDF.js
  // test corpus) instead of the global sample picker.
  readonly src = '/assets/samples/form-sample.pdf';

  readonly formData = signal<FormDataMap>({});
  readonly dumpJson = signal('');
  readonly fieldName = signal('');
  readonly fieldValue = signal('');
  readonly changes = signal(0);

  onFormDataChange(data: FormDataMap): void {
    this.formData.set(data);
    this.changes.update((n) => n + 1);
  }

  async dump(viewer: PdfJsViewerComponent): Promise<void> {
    try {
      const data = await viewer.getFormData();
      this.formData.set(data);
      this.dumpJson.set(JSON.stringify(data, null, 2));
      const first = Object.keys(data)[0];
      if (first && !this.fieldName()) this.fieldName.set(first);
    } catch (e) {
      this.dumpJson.set(String(e));
    }
  }

  async setField(viewer: PdfJsViewerComponent): Promise<void> {
    if (!this.fieldName()) return;
    await viewer.setFormField(this.fieldName(), this.fieldValue());
    await this.dump(viewer);
  }

  fieldCount(): number { return Object.keys(this.formData()).length; }
  setName(e: Event): void { this.fieldName.set((e.target as HTMLInputElement).value); }
  setValue(e: Event): void { this.fieldValue.set((e.target as HTMLInputElement).value); }

  readonly code = [
    `<ng2-pdfjs-viewer #viewer`,
    `  pdfSrc="assets/tax-form.pdf"`,
    `  [(formData)]="model">`,
    `</ng2-pdfjs-viewer>`,
    ``,
    `// read everything the user typed`,
    `const values = await this.viewer.getFormData();`,
    ``,
    `// write a single field`,
    `await this.viewer.setFormField('f1_01[0]', 'Jane Doe');`,
    ``,
    `// the filled document, ready to upload`,
    `const blob = await this.viewer.getDocumentAsBlob();`,
  ].join('\n');
}
