import { ElementRef } from '@angular/core';
export declare class PdfJsViewerComponent {
    iframe: ElementRef;
    viewerFolder: string;
    externalWindow: boolean;
    showSpinner: boolean;
    downloadFileName: string;
    openFile: boolean;
    download: boolean;
    startDownload: boolean;
    viewBookmark: boolean;
    print: boolean;
    startPrint: boolean;
    fullScreen: boolean;
    find: boolean;
    page: number;
    zoom: string;
    nameddest: string;
    pagemode: string;
    lastPage: boolean;
    rotatecw: boolean;
    rotateccw: boolean;
    cursor: string;
    scroll: string;
    spread: string;
    /**
     * Used to determine how the external window looks when opened. Follows
     * the specs parameter from the browsers Window open() function.
     */
    externalWindowOptions: string;
    viewerTab: any;
    private innerSrc;
    readonly PDFViewerApplicationOptions: any;
    readonly PDFViewerApplication: any;
    pdfSrc: string | Blob | Uint8Array;
    ngOnInit(): void;
    refresh(): void;
    private loadPdf;
}
