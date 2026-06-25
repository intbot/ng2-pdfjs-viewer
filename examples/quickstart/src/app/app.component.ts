import { Component } from '@angular/core';
import { PdfJsViewerModule } from 'ng2-pdfjs-viewer';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [PdfJsViewerModule],
  template: `
    <ng2-pdfjs-viewer
      [pdfSrc]="pdfSrc"
      style="display:block;height:100vh;"
    ></ng2-pdfjs-viewer>
  `,
})
export class AppComponent {
  // Mozilla's canonical PDF.js sample, served with permissive CORS headers
  // so it loads straight from StackBlitz / CodeSandbox without a bundled file.
  pdfSrc = 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf';
}
