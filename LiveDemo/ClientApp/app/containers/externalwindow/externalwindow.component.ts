import { Component, ViewChild } from '@angular/core';

@Component({
  selector: 'app-externalwindow',
  templateUrl: './externalwindow.component.html'
})
export class ExternalWindowComponent {
    @ViewChild('externalPdfViewer') public externalPdfViewer;

    public openPdf() {
        console.log("opening pdf in new tab!");
        this.externalPdfViewer.pdfSrc = "gre_research_validity_data.pdf";
        this.externalPdfViewer.refresh();
    }

    public htmlcode =
`
<!-- your.component.html -->
<button (click)="openPdf()" style="background-color: greenyellow; font-weight: bold; font-style: italic; height: 50px;">Open PDF in new tab and start print preview</button>
<ng2-pdfjs-viewer #externalPdfViewer [externalWindow]="true" [startPrint]=true></ng2-pdfjs-viewer>
`;

    public tscode =
        `
<!-- your.component.ts -->
@ViewChild('externalPdfViewer') public externalPdfViewer;
public openPdf() {
    console.log("opening pdf in new tab!");
    this.externalPdfViewer.pdfSrc = "gre_research_validity_data.pdf";
    this.externalPdfViewer.refresh();
}
`;
}
