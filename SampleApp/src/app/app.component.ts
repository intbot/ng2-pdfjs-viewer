import { Component, ViewChild } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'app';
  page: number;

  @ViewChild('externalPdfViewer', { static: true }) public externalPdfViewer;
  @ViewChild('embeddedPdfViewer', { static: true }) public embeddedPdfViewer;

  public openPdf() {
    console.log('opening pdf in new tab!');
    this.externalPdfViewer.pdfSrc = '/assets/pdfjs/web/compressed.tracemonkey-pldi-09.pdf';
    this.externalPdfViewer.refresh();
  }

  public changePdf() {
    console.log('Changing pdf viewer url!');
    this.embeddedPdfViewer.pdfSrc = '/assets/pdfjs/web/compressed.tracemonkey-pldi-09.pdf';
    this.embeddedPdfViewer.refresh();
  }
}
