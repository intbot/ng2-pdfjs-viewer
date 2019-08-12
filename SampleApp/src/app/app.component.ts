import { Component, ViewChild } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'app';

  @ViewChild('externalPdfViewer') public externalPdfViewer;
  @ViewChild('embeddedPdfViewer') public embeddedPdfViewer;
  @ViewChild('inlinePdfViewer') public inlinePdfViewer;
  @ViewChild('bigPdfViewer') public bigPdfViewer;
  
  public isPdfLoaded = false;

  public openPdf() {
    console.log("opening pdf in new tab!");
    this.externalPdfViewer.pdfSrc = "gre_research_validity_data.pdf";
    this.externalPdfViewer.refresh();
  }

  public changePdf() {
    console.log("Changing pdf viewer url!");
    this.embeddedPdfViewer.pdfSrc = "gre_research_validity_data.pdf";
    this.embeddedPdfViewer.refresh();
  }

  public loadAndDisplayPdf() {
    this.inlinePdfViewer.pdfSrc = "gre_research_validity_data.pdf";
    this.inlinePdfViewer.refresh();
    this.isPdfLoaded = !this.isPdfLoaded;
  }

  public testBeforePrint() {
    console.log("testBeforePrint() successfully called");
    console.log(this.bigPdfViewer.page);
    this.bigPdfViewer.page = 3;
    console.log(this.bigPdfViewer.page);
  }

  public testAfterPrint() {
    console.log("testAfterPrint() successfully called");
  }

  public testPagesLoaded(count: number) {
    console.log("testPagesLoaded() successfully called. Total pages # : " + count);
  }

  public testPageChange(pageNumber: number) {
    console.log("testPageChange() successfully called. Current page # : " + pageNumber);
  }
}