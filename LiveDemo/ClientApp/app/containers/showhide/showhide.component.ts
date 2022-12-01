import { Component, ViewChild } from '@angular/core';

@Component({
    selector: 'app-showhide',
    templateUrl: './showhide.component.html'
})
export class ShowHideComponent {
    public htmlcode =
        `
<!-- your.component.html -->
<button (click)="openPdf()" style="background-color: greenyellow; height: 50px;">Open PDF in new tab and start print preview</button>
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