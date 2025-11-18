import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { PdfJsViewerModule } from 'ng2-pdfjs-viewer';

export interface PdfPreviewDialogComponentData {
  fileName: string;
  blob: Blob;
}

@Component({
  selector: 'app-pdf-preview-dialog',
  templateUrl: './pdf-preview-dialog.component.html',
  styles: `
      .content-pdf {
        height: 100%;
      }
      ng2-pdfjs-viewer {
      height: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PdfJsViewerModule, MatIconModule, MatButtonModule, MatDialogModule],
})
export class PdfPreviewDialogComponent {
  protected readonly fileName = this.data.fileName;
  protected readonly blob = this.data.blob;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public readonly data: PdfPreviewDialogComponentData
  ) {}
}
