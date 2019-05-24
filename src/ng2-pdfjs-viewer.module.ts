import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PdfJsViewerComponent } from './ng2-pdfjs-viewer.component';

@NgModule({
  imports: [CommonModule],
  declarations: [PdfJsViewerComponent],
  exports: [PdfJsViewerModule]
})
export class PdfJsViewerModule {}