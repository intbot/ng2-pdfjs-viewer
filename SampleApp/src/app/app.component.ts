import { Component, ViewChild } from '@angular/core';

@Component({
  selector: 'app-root',
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
    this.externalPdfViewer.pdfSrc = 'gre_research_validity_data.pdf';
    this.externalPdfViewer.refresh();
  }

  public changePdf() {
    console.log('Changing pdf viewer url!');
    this.embeddedPdfViewer.pdfSrc = 'gre_research_validity_data.pdf';
    this.embeddedPdfViewer.refresh();
  }
}
