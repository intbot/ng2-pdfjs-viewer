import { ElementRef } from '@angular/core';
export declare class PdfJsViewerComponent {
    iframe: ElementRef;
    externalWindow: boolean;
    src: string | Blob | Uint8Array;
    showSpinner: boolean;
    viewerTab: any;
    pdfJsFolder: string;
    downloadFileName: string;
    openFile: boolean;
    download: boolean;
    viewBookmark: boolean;
    pdfSrc: string | Blob | Uint8Array;
    ngOnInit(): void;
    refresh(): void;
    private loadPdf();
}
