import { EventEmitter, ElementRef } from '@angular/core';
export declare class PdfJsViewerComponent {
    iframe: ElementRef;
    viewerId: string;
    onBeforePrint: EventEmitter<any>;
    onAfterPrint: EventEmitter<any>;
    onDocumentLoad: EventEmitter<any>;
    onPageChange: EventEmitter<any>;
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
    zoom: string;
    nameddest: string;
    pagemode: string;
    lastPage: boolean;
    rotatecw: boolean;
    rotateccw: boolean;
    cursor: string;
    scroll: string;
    spread: string;
    locale: string;
    useOnlyCssZoom: boolean;
    errorOverride: boolean;
    errorAppend: boolean;
    errorMessage: string;
    diagnosticLogs: boolean;
    externalWindowOptions: string;
    viewerTab: any;
    private _src;
    private _page;
    set page(_page: number);
    get page(): number;
    set pdfSrc(_src: string | Blob | Uint8Array);
    get pdfSrc(): string | Blob | Uint8Array;
    get PDFViewerApplicationOptions(): any;
    get PDFViewerApplication(): any;
    receiveMessage(viewerEvent: any): void;
    ngOnInit(): void;
    refresh(): void;
    private loadPdf;
}
