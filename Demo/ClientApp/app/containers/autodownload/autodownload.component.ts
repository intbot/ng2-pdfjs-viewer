import { Component, ViewChild } from '@angular/core';

@Component({
    selector: 'app-autodownload',
    templateUrl: './autodownload.component.html'
})
export class AutoDownloadComponent {

    public htmlcode =
        `
<!-- your.component.html -->
<ng2-pdfjs-viewer pdfSrc="gre_research_validity_data.pdf" [startDownload]="true"></ng2-pdfjs-viewer>
`;
}