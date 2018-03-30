import { ElementRef } from '@angular/core';
export declare class PdfJsViewerComponent {
    iframe: ElementRef;
    pdfJsFolder: string;
    externalWindow: boolean;
    showSpinner: boolean;
    downloadFileName: string;
    openFile: boolean;
    download: boolean;
    viewBookmark: boolean;
    viewerTab: any;
    private src;
    pdfSrc: string | Blob | Uint8Array;
    ngOnInit(): void;
    refresh(): void;
    private loadPdf();
}
