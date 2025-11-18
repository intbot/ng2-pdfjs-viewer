import {
  Component,
  provideZonelessChangeDetection,
  signal,
} from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { PdfPreviewDialogComponent } from './pdf-preview-dialog/pdf-preview-dialog.component';

async function fileToBlob(file: File) {
  return new Blob([new Uint8Array(await file.arrayBuffer())], {
    type: file.type,
  });
}

@Component({
  selector: 'app-root',
  template: `
  <div class="container">
    <label for="file-input">Input PDF to show in dialog</label>
    <input id="file-input" type="file" accept="application/pdf" (change)="fileChanged($event)" />

    <button mat-button-raised (click)="showDialog()">Show PDF Preview</button>

    @if (error) {
       <p>You need to pass a pdf file first</p>
    }
</div>
  `,
  imports: [MatDialogModule, MatButtonModule],
})
export class App {
  readonly name = signal('Angular/Material v20 Template');
  protected error = false;
  private blob?: Blob;
  private fileName?: string;

  constructor(private readonly matDialog: MatDialog) {}

  protected async fileChanged(event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.fileName = file.name;
    this.blob = await fileToBlob(file);
  }

  protected showDialog(): void {
    if (!this.blob || !this.fileName) {
      this.error = true;
    }
    this.error = false;

    this.matDialog.open(PdfPreviewDialogComponent, {
      autoFocus: false,
      restoreFocus: false,
      panelClass: ['rb-dialog-xxl'],
      data: { fileName: this.fileName, blob: this.blob },
    });
  }
}

bootstrapApplication(App, {
  providers: [provideZonelessChangeDetection()],
});
