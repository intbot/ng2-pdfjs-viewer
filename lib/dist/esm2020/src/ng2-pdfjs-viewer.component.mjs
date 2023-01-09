import { Component, Input, Output, ViewChild, EventEmitter } from '@angular/core';
import * as i0 from "@angular/core";
export class PdfJsViewerComponent {
    constructor() {
        this.onBeforePrint = new EventEmitter();
        this.onAfterPrint = new EventEmitter();
        this.onDocumentLoad = new EventEmitter();
        this.onPageChange = new EventEmitter();
        this.externalWindow = false;
        this.showSpinner = true;
        this.openFile = true;
        this.download = true;
        this.viewBookmark = true;
        this.print = true;
        this.fullScreen = true;
        //@Input() public showFullScreen: boolean;
        this.find = true;
        this.useOnlyCssZoom = false;
        this.errorOverride = false;
        this.errorAppend = true;
        this.diagnosticLogs = true;
    }
    set page(_page) {
        this._page = _page;
        if (this.PDFViewerApplication) {
            this.PDFViewerApplication.page = this._page;
        }
        else {
            if (this.diagnosticLogs)
                console.warn("Document is not loaded yet!!!. Try to set page# after full load. Ignore this warning if you are not setting page# using '.' notation. (E.g. pdfViewer.page = 5;)");
        }
    }
    get page() {
        if (this.PDFViewerApplication) {
            return this.PDFViewerApplication.page;
        }
        else {
            if (this.diagnosticLogs)
                console.warn("Document is not loaded yet!!!. Try to retrieve page# after full load.");
        }
    }
    set pdfSrc(_src) {
        this._src = _src;
    }
    get pdfSrc() {
        return this._src;
    }
    get PDFViewerApplicationOptions() {
        let pdfViewerOptions = null;
        if (this.externalWindow) {
            if (this.viewerTab) {
                pdfViewerOptions = this.viewerTab.PDFViewerApplicationOptions;
            }
        }
        else {
            if (this.iframe.nativeElement.contentWindow) {
                pdfViewerOptions = this.iframe.nativeElement.contentWindow.PDFViewerApplicationOptions;
            }
        }
        return pdfViewerOptions;
    }
    get PDFViewerApplication() {
        let pdfViewer = null;
        if (this.externalWindow) {
            if (this.viewerTab) {
                pdfViewer = this.viewerTab.PDFViewerApplication;
            }
        }
        else {
            if (this.iframe.nativeElement.contentWindow) {
                pdfViewer = this.iframe.nativeElement.contentWindow.PDFViewerApplication;
            }
        }
        return pdfViewer;
    }
    receiveMessage(viewerEvent) {
        if (viewerEvent.data && viewerEvent.data.viewerId && viewerEvent.data.event) {
            let viewerId = viewerEvent.data.viewerId;
            let event = viewerEvent.data.event;
            let param = viewerEvent.data.param;
            if (this.viewerId == viewerId) {
                if (this.onBeforePrint && event == "beforePrint") {
                    this.onBeforePrint.emit();
                }
                else if (this.onAfterPrint && event == "afterPrint") {
                    this.onAfterPrint.emit();
                }
                else if (this.onDocumentLoad && event == "pagesLoaded") {
                    this.onDocumentLoad.emit(param);
                }
                else if (this.onPageChange && event == "pageChange") {
                    this.onPageChange.emit(param);
                }
            }
        }
    }
    ngOnInit() {
        window.addEventListener("message", this.receiveMessage.bind(this), false);
        if (!this.externalWindow) { // Load pdf for embedded views
            this.loadPdf();
        }
    }
    refresh() {
        this.loadPdf();
    }
    loadPdf() {
        if (!this._src) {
            return;
        }
        // console.log(`Tab is - ${this.viewerTab}`);
        // if (this.viewerTab) {
        //   console.log(`Status of window - ${this.viewerTab.closed}`);
        // }
        if (this.externalWindow && (typeof this.viewerTab === 'undefined' || this.viewerTab.closed)) {
            this.viewerTab = window.open('', '_blank', this.externalWindowOptions || '');
            if (this.viewerTab == null) {
                if (this.diagnosticLogs)
                    console.error("ng2-pdfjs-viewer: For 'externalWindow = true'. i.e opening in new tab to work, pop-ups should be enabled.");
                return;
            }
            if (this.showSpinner) {
                this.viewerTab.document.write(`
          <style>
          .loader {
            position: fixed;
            left: 40%;
            top: 40%;
            border: 16px solid #f3f3f3;
            border-radius: 50%;
            border-top: 16px solid #3498db;
            width: 120px;
            height: 120px;
            animation: spin 2s linear infinite;
          }
          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
          </style>
          <div class="loader"></div>
        `);
            }
        }
        let fileUrl;
        //if (typeof this.src === "string") {
        //  fileUrl = this.src;
        //}
        if (this._src instanceof Blob) {
            fileUrl = encodeURIComponent(URL.createObjectURL(this._src));
        }
        else if (this._src instanceof Uint8Array) {
            let blob = new Blob([this._src], { type: "application/pdf" });
            fileUrl = encodeURIComponent(URL.createObjectURL(blob));
        }
        else {
            fileUrl = this._src;
        }
        let viewerUrl;
        if (this.viewerFolder) {
            viewerUrl = `${this.viewerFolder}/web/viewer.html`;
        }
        else {
            viewerUrl = `assets/pdfjs/web/viewer.html`;
        }
        viewerUrl += `?file=${fileUrl}`;
        if (typeof this.viewerId !== 'undefined') {
            viewerUrl += `&viewerId=${this.viewerId}`;
        }
        if (typeof this.onBeforePrint !== 'undefined') {
            viewerUrl += `&beforePrint=true`;
        }
        if (typeof this.onAfterPrint !== 'undefined') {
            viewerUrl += `&afterPrint=true`;
        }
        if (typeof this.onDocumentLoad !== 'undefined') {
            viewerUrl += `&pagesLoaded=true`;
        }
        if (typeof this.onPageChange !== 'undefined') {
            viewerUrl += `&pageChange=true`;
        }
        if (this.downloadFileName) {
            if (!this.downloadFileName.endsWith(".pdf")) {
                this.downloadFileName += ".pdf";
            }
            viewerUrl += `&fileName=${this.downloadFileName}`;
        }
        if (typeof this.openFile !== 'undefined') {
            viewerUrl += `&openFile=${this.openFile}`;
        }
        if (typeof this.download !== 'undefined') {
            viewerUrl += `&download=${this.download}`;
        }
        if (this.startDownload) {
            viewerUrl += `&startDownload=${this.startDownload}`;
        }
        if (typeof this.viewBookmark !== 'undefined') {
            viewerUrl += `&viewBookmark=${this.viewBookmark}`;
        }
        if (typeof this.print !== 'undefined') {
            viewerUrl += `&print=${this.print}`;
        }
        if (this.startPrint) {
            viewerUrl += `&startPrint=${this.startPrint}`;
        }
        if (typeof this.fullScreen !== 'undefined') {
            viewerUrl += `&fullScreen=${this.fullScreen}`;
        }
        // if (this.showFullScreen) {
        //   viewerUrl += `&showFullScreen=${this.showFullScreen}`;
        // }
        if (typeof this.find !== 'undefined') {
            viewerUrl += `&find=${this.find}`;
        }
        if (this.lastPage) {
            viewerUrl += `&lastpage=${this.lastPage}`;
        }
        if (this.rotatecw) {
            viewerUrl += `&rotatecw=${this.rotatecw}`;
        }
        if (this.rotateccw) {
            viewerUrl += `&rotateccw=${this.rotateccw}`;
        }
        if (this.cursor) {
            viewerUrl += `&cursor=${this.cursor}`;
        }
        if (this.scroll) {
            viewerUrl += `&scroll=${this.scroll}`;
        }
        if (this.spread) {
            viewerUrl += `&spread=${this.spread}`;
        }
        if (this.locale) {
            viewerUrl += `&locale=${this.locale}`;
        }
        if (this.useOnlyCssZoom) {
            viewerUrl += `&useOnlyCssZoom=${this.useOnlyCssZoom}`;
        }
        if (this._page || this.zoom || this.nameddest || this.pagemode)
            viewerUrl += "#";
        if (this._page) {
            viewerUrl += `&page=${this._page}`;
        }
        if (this.zoom) {
            viewerUrl += `&zoom=${this.zoom}`;
        }
        if (this.nameddest) {
            viewerUrl += `&nameddest=${this.nameddest}`;
        }
        if (this.pagemode) {
            viewerUrl += `&pagemode=${this.pagemode}`;
        }
        if (this.errorOverride || this.errorAppend) {
            viewerUrl += `&errorMessage=${this.errorMessage}`;
            if (this.errorOverride) {
                viewerUrl += `&errorOverride=${this.errorOverride}`;
            }
            if (this.errorAppend) {
                viewerUrl += `&errorAppend=${this.errorAppend}`;
            }
        }
        if (this.externalWindow) {
            this.viewerTab.location.href = viewerUrl;
        }
        else {
            this.iframe.nativeElement.src = viewerUrl;
        }
        // console.log(`
        //   pdfSrc = ${this.pdfSrc}
        //   fileUrl = ${fileUrl}
        //   externalWindow = ${this.externalWindow}
        //   downloadFileName = ${this.downloadFileName}
        //   viewerFolder = ${this.viewerFolder}
        //   openFile = ${this.openFile}
        //   download = ${this.download}
        //   startDownload = ${this.startDownload}
        //   viewBookmark = ${this.viewBookmark}
        //   print = ${this.print}
        //   startPrint = ${this.startPrint}
        //   fullScreen = ${this.fullScreen}
        //   find = ${this.find}
        //   lastPage = ${this.lastPage}
        //   rotatecw = ${this.rotatecw}
        //   rotateccw = ${this.rotateccw}
        //   cursor = ${this.cursor}
        //   scrollMode = ${this.scroll}
        //   spread = ${this.spread}
        //   page = ${this.page}
        //   zoom = ${this.zoom}
        //   nameddest = ${this.nameddest}
        //   pagemode = ${this.pagemode}
        //   pagemode = ${this.errorOverride}
        //   pagemode = ${this.errorAppend}
        //   pagemode = ${this.errorMessage}
        // `);
    }
}
PdfJsViewerComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.0.4", ngImport: i0, type: PdfJsViewerComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
PdfJsViewerComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "15.0.4", type: PdfJsViewerComponent, selector: "ng2-pdfjs-viewer", inputs: { viewerId: "viewerId", viewerFolder: "viewerFolder", externalWindow: "externalWindow", showSpinner: "showSpinner", downloadFileName: "downloadFileName", openFile: "openFile", download: "download", startDownload: "startDownload", viewBookmark: "viewBookmark", print: "print", startPrint: "startPrint", fullScreen: "fullScreen", find: "find", zoom: "zoom", nameddest: "nameddest", pagemode: "pagemode", lastPage: "lastPage", rotatecw: "rotatecw", rotateccw: "rotateccw", cursor: "cursor", scroll: "scroll", spread: "spread", locale: "locale", useOnlyCssZoom: "useOnlyCssZoom", errorOverride: "errorOverride", errorAppend: "errorAppend", errorMessage: "errorMessage", diagnosticLogs: "diagnosticLogs", externalWindowOptions: "externalWindowOptions", page: "page", pdfSrc: "pdfSrc" }, outputs: { onBeforePrint: "onBeforePrint", onAfterPrint: "onAfterPrint", onDocumentLoad: "onDocumentLoad", onPageChange: "onPageChange" }, viewQueries: [{ propertyName: "iframe", first: true, predicate: ["iframe"], descendants: true, static: true }], ngImport: i0, template: `<iframe title="ng2-pdfjs-viewer" [hidden]="externalWindow || (!externalWindow && !pdfSrc)" #iframe width="100%" height="100%"></iframe>`, isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.0.4", ngImport: i0, type: PdfJsViewerComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'ng2-pdfjs-viewer',
                    template: `<iframe title="ng2-pdfjs-viewer" [hidden]="externalWindow || (!externalWindow && !pdfSrc)" #iframe width="100%" height="100%"></iframe>`
                }]
        }], propDecorators: { iframe: [{
                type: ViewChild,
                args: ['iframe', { static: true }]
            }], viewerId: [{
                type: Input
            }], onBeforePrint: [{
                type: Output
            }], onAfterPrint: [{
                type: Output
            }], onDocumentLoad: [{
                type: Output
            }], onPageChange: [{
                type: Output
            }], viewerFolder: [{
                type: Input
            }], externalWindow: [{
                type: Input
            }], showSpinner: [{
                type: Input
            }], downloadFileName: [{
                type: Input
            }], openFile: [{
                type: Input
            }], download: [{
                type: Input
            }], startDownload: [{
                type: Input
            }], viewBookmark: [{
                type: Input
            }], print: [{
                type: Input
            }], startPrint: [{
                type: Input
            }], fullScreen: [{
                type: Input
            }], find: [{
                type: Input
            }], zoom: [{
                type: Input
            }], nameddest: [{
                type: Input
            }], pagemode: [{
                type: Input
            }], lastPage: [{
                type: Input
            }], rotatecw: [{
                type: Input
            }], rotateccw: [{
                type: Input
            }], cursor: [{
                type: Input
            }], scroll: [{
                type: Input
            }], spread: [{
                type: Input
            }], locale: [{
                type: Input
            }], useOnlyCssZoom: [{
                type: Input
            }], errorOverride: [{
                type: Input
            }], errorAppend: [{
                type: Input
            }], errorMessage: [{
                type: Input
            }], diagnosticLogs: [{
                type: Input
            }], externalWindowOptions: [{
                type: Input
            }], page: [{
                type: Input
            }], pdfSrc: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmcyLXBkZmpzLXZpZXdlci5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbmcyLXBkZmpzLXZpZXdlci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxZQUFZLEVBQWMsTUFBTSxlQUFlLENBQUM7O0FBTTlGLE1BQU0sT0FBTyxvQkFBb0I7SUFKakM7UUFPWSxrQkFBYSxHQUFzQixJQUFJLFlBQVksRUFBRSxDQUFDO1FBQ3RELGlCQUFZLEdBQXNCLElBQUksWUFBWSxFQUFFLENBQUM7UUFDckQsbUJBQWMsR0FBc0IsSUFBSSxZQUFZLEVBQUUsQ0FBQztRQUN2RCxpQkFBWSxHQUFzQixJQUFJLFlBQVksRUFBRSxDQUFDO1FBRS9DLG1CQUFjLEdBQVksS0FBSyxDQUFDO1FBQ2hDLGdCQUFXLEdBQVksSUFBSSxDQUFDO1FBRTVCLGFBQVEsR0FBWSxJQUFJLENBQUM7UUFDekIsYUFBUSxHQUFZLElBQUksQ0FBQztRQUV6QixpQkFBWSxHQUFZLElBQUksQ0FBQztRQUM3QixVQUFLLEdBQVksSUFBSSxDQUFDO1FBRXRCLGVBQVUsR0FBWSxJQUFJLENBQUM7UUFDM0MsMENBQTBDO1FBQzFCLFNBQUksR0FBWSxJQUFJLENBQUM7UUFXckIsbUJBQWMsR0FBWSxLQUFLLENBQUM7UUFDaEMsa0JBQWEsR0FBWSxLQUFLLENBQUM7UUFDL0IsZ0JBQVcsR0FBWSxJQUFJLENBQUM7UUFFNUIsbUJBQWMsR0FBWSxJQUFJLENBQUM7S0F1U2hEO0lBaFNDLElBQ1csSUFBSSxDQUFDLEtBQWE7UUFDM0IsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDbkIsSUFBRyxJQUFJLENBQUMsb0JBQW9CLEVBQUU7WUFDNUIsSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFD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SztnQkFDVSxRQUFRO3NCQUF2QixLQUFLO2dCQUNVLFFBQVE7c0JBQXZCLEtBQUs7Z0JBQ1UsUUFBUTtzQkFBdkIsS0FBSztnQkFDVSxTQUFTO3NCQUF4QixLQUFLO2dCQUNVLE1BQU07c0JBQXJCLEtBQUs7Z0JBQ1UsTUFBTTtzQkFBckIsS0FBSztnQkFDVSxNQUFNO3NCQUFyQixLQUFLO2dCQUNVLE1BQU07c0JBQXJCLEtBQUs7Z0JBQ1UsY0FBYztzQkFBN0IsS0FBSztnQkFDVSxhQUFhO3NCQUE1QixLQUFLO2dCQUNVLFdBQVc7c0JBQTFCLEtBQUs7Z0JBQ1UsWUFBWTtzQkFBM0IsS0FBSztnQkFDVSxjQUFjO3NCQUE3QixLQUFLO2dCQUVVLHFCQUFxQjtzQkFBcEMsS0FBSztnQkFNSyxJQUFJO3NCQURkLEtBQUs7Z0JBbUJLLE1BQU07c0JBRGhCLEtBQUsiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIElucHV0LCBPdXRwdXQsIFZpZXdDaGlsZCwgRXZlbnRFbWl0dGVyLCBFbGVtZW50UmVmIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcblxyXG5AQ29tcG9uZW50KHtcclxuICBzZWxlY3RvcjogJ25nMi1wZGZqcy12aWV3ZXInLFxyXG4gIHRlbXBsYXRlOiBgPGlmcmFtZSB0aXRsZT1cIm5nMi1wZGZqcy12aWV3ZXJcIiBbaGlkZGVuXT1cImV4dGVybmFsV2luZG93IHx8ICghZXh0ZXJuYWxXaW5kb3cgJiYgIXBkZlNyYylcIiAjaWZyYW1lIHdpZHRoPVwiMTAwJVwiIGhlaWdodD1cIjEwMCVcIj48L2lmcmFtZT5gXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBQZGZKc1ZpZXdlckNvbXBvbmVudCB7XHJcbiAgQFZpZXdDaGlsZCgnaWZyYW1lJywge3N0YXRpYzogdHJ1ZX0pIGlmcmFtZTogRWxlbWVudFJlZjtcclxuICBASW5wdXQoKSBwdWJsaWMgdmlld2VySWQ6IHN0cmluZztcclxuICBAT3V0cHV0KCkgb25CZWZvcmVQcmludDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XHJcbiAgQE91dHB1dCgpIG9uQWZ0ZXJQcmludDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XHJcbiAgQE91dHB1dCgpIG9uRG9jdW1lbnRMb2FkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcclxuICBAT3V0cHV0KCkgb25QYWdlQ2hhbmdlOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcclxuICBASW5wdXQoKSBwdWJsaWMgdmlld2VyRm9sZGVyOiBzdHJpbmc7XHJcbiAgQElucHV0KCkgcHVibGljIGV4dGVybmFsV2luZG93OiBib29sZWFuID0gZmFsc2U7XHJcbiAgQElucHV0KCkgcHVibGljIHNob3dTcGlubmVyOiBib29sZWFuID0gdHJ1ZTtcclxuICBASW5wdXQoKSBwdWJsaWMgZG93bmxvYWRGaWxlTmFtZTogc3RyaW5nO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyBvcGVuRmlsZTogYm9vbGVhbiA9IHRydWU7XHJcbiAgQElucHV0KCkgcHVibGljIGRvd25sb2FkOiBib29sZWFuID0gdHJ1ZTtcclxuICBASW5wdXQoKSBwdWJsaWMgc3RhcnREb3dubG9hZDogYm9vbGVhbjtcclxuICBASW5wdXQoKSBwdWJsaWMgdmlld0Jvb2ttYXJrOiBib29sZWFuID0gdHJ1ZTtcclxuICBASW5wdXQoKSBwdWJsaWMgcHJpbnQ6IGJvb2xlYW4gPSB0cnVlO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyBzdGFydFByaW50OiBib29sZWFuO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyBmdWxsU2NyZWVuOiBib29sZWFuID0gdHJ1ZTtcclxuICAvL0BJbnB1dCgpIHB1YmxpYyBzaG93RnVsbFNjcmVlbjogYm9vbGVhbjtcclxuICBASW5wdXQoKSBwdWJsaWMgZmluZDogYm9vbGVhbiA9IHRydWU7XHJcbiAgQElucHV0KCkgcHVibGljIHpvb206IHN0cmluZztcclxuICBASW5wdXQoKSBwdWJsaWMgbmFtZWRkZXN0OiBzdHJpbmc7XHJcbiAgQElucHV0KCkgcHVibGljIHBhZ2Vtb2RlOiBzdHJpbmc7XHJcbiAgQElucHV0KCkgcHVibGljIGxhc3RQYWdlOiBib29sZWFuO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyByb3RhdGVjdzogYm9vbGVhbjtcclxuICBASW5wdXQoKSBwdWJsaWMgcm90YXRlY2N3OiBib29sZWFuO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyBjdXJzb3I6IHN0cmluZztcclxuICBASW5wdXQoKSBwdWJsaWMgc2Nyb2xsOiBzdHJpbmc7XHJcbiAgQElucHV0KCkgcHVibGljIHNwcmVhZDogc3RyaW5nO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyBsb2NhbGU6IHN0cmluZztcclxuICBASW5wdXQoKSBwdWJsaWMgdXNlT25seUNzc1pvb206IGJvb2xlYW4gPSBmYWxzZTtcclxuICBASW5wdXQoKSBwdWJsaWMgZXJyb3JPdmVycmlkZTogYm9vbGVhbiA9IGZhbHNlO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyBlcnJvckFwcGVuZDogYm9vbGVhbiA9IHRydWU7XHJcbiAgQElucHV0KCkgcHVibGljIGVycm9yTWVzc2FnZTogc3RyaW5nO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyBkaWFnbm9zdGljTG9nczogYm9vbGVhbiA9IHRydWU7XHJcbiAgXHJcbiAgQElucHV0KCkgcHVibGljIGV4dGVybmFsV2luZG93T3B0aW9uczogc3RyaW5nO1xyXG4gIHB1YmxpYyB2aWV3ZXJUYWI6IGFueTtcclxuICBwcml2YXRlIF9zcmM6IHN0cmluZyB8IEJsb2IgfCBVaW50OEFycmF5O1xyXG4gIHByaXZhdGUgX3BhZ2U6IG51bWJlcjtcclxuICBcclxuICBASW5wdXQoKVxyXG4gIHB1YmxpYyBzZXQgcGFnZShfcGFnZTogbnVtYmVyKSB7XHJcbiAgICB0aGlzLl9wYWdlID0gX3BhZ2U7XHJcbiAgICBpZih0aGlzLlBERlZpZXdlckFwcGxpY2F0aW9uKSB7XHJcbiAgICAgIHRoaXMuUERGVmlld2VyQXBwbGljYXRpb24ucGFnZSA9IHRoaXMuX3BhZ2U7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBpZih0aGlzLmRpYWdub3N0aWNMb2dzKSBjb25zb2xlLndhcm4oXCJEb2N1bWVudCBpcyBub3QgbG9hZGVkIHlldCEhIS4gVHJ5IHRvIHNldCBwYWdlIyBhZnRlciBmdWxsIGxvYWQuIElnbm9yZSB0aGlzIHdhcm5pbmcgaWYgeW91IGFyZSBub3Qgc2V0dGluZyBwYWdlIyB1c2luZyAnLicgbm90YXRpb24uIChFLmcuIHBkZlZpZXdlci5wYWdlID0gNTspXCIpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldCBwYWdlKCkge1xyXG4gICAgaWYodGhpcy5QREZWaWV3ZXJBcHBsaWNhdGlvbikge1xyXG4gICAgICByZXR1cm4gdGhpcy5QREZWaWV3ZXJBcHBsaWNhdGlvbi5wYWdlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaWYodGhpcy5kaWFnbm9zdGljTG9ncykgY29uc29sZS53YXJuKFwiRG9jdW1lbnQgaXMgbm90IGxvYWRlZCB5ZXQhISEuIFRyeSB0byByZXRyaWV2ZSBwYWdlIyBhZnRlciBmdWxsIGxvYWQuXCIpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgQElucHV0KClcclxuICBwdWJsaWMgc2V0IHBkZlNyYyhfc3JjOiBzdHJpbmcgfCBCbG9iIHwgVWludDhBcnJheSkge1xyXG4gICAgdGhpcy5fc3JjID0gX3NyYztcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXQgcGRmU3JjKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuX3NyYztcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXQgUERGVmlld2VyQXBwbGljYXRpb25PcHRpb25zKCkge1xyXG4gICAgbGV0IHBkZlZpZXdlck9wdGlvbnMgPSBudWxsO1xyXG4gICAgaWYgKHRoaXMuZXh0ZXJuYWxXaW5kb3cpIHtcclxuICAgICAgaWYgKHRoaXMudmlld2VyVGFiKSB7XHJcbiAgICAgICAgcGRmVmlld2VyT3B0aW9ucyA9IHRoaXMudmlld2VyVGFiLlBERlZpZXdlckFwcGxpY2F0aW9uT3B0aW9ucztcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaWYgKHRoaXMuaWZyYW1lLm5hdGl2ZUVsZW1lbnQuY29udGVudFdpbmRvdykge1xyXG4gICAgICAgIHBkZlZpZXdlck9wdGlvbnMgPSB0aGlzLmlmcmFtZS5uYXRpdmVFbGVtZW50LmNvbnRlbnRXaW5kb3cuUERGVmlld2VyQXBwbGljYXRpb25PcHRpb25zO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcGRmVmlld2VyT3B0aW9ucztcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXQgUERGVmlld2VyQXBwbGljYXRpb24oKSB7XHJcbiAgICBsZXQgcGRmVmlld2VyID0gbnVsbDtcclxuICAgIGlmICh0aGlzLmV4dGVybmFsV2luZG93KSB7XHJcbiAgICAgIGlmICh0aGlzLnZpZXdlclRhYikge1xyXG4gICAgICAgIHBkZlZpZXdlciA9IHRoaXMudmlld2VyVGFiLlBERlZpZXdlckFwcGxpY2F0aW9uO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBpZiAodGhpcy5pZnJhbWUubmF0aXZlRWxlbWVudC5jb250ZW50V2luZG93KSB7XHJcbiAgICAgICAgcGRmVmlld2VyID0gdGhpcy5pZnJhbWUubmF0aXZlRWxlbWVudC5jb250ZW50V2luZG93LlBERlZpZXdlckFwcGxpY2F0aW9uO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcGRmVmlld2VyO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHJlY2VpdmVNZXNzYWdlKHZpZXdlckV2ZW50KSAge1xyXG4gICAgaWYgKHZpZXdlckV2ZW50LmRhdGEgJiYgdmlld2VyRXZlbnQuZGF0YS52aWV3ZXJJZCAmJiB2aWV3ZXJFdmVudC5kYXRhLmV2ZW50KSB7XHJcbiAgICAgIGxldCB2aWV3ZXJJZCA9IHZpZXdlckV2ZW50LmRhdGEudmlld2VySWQ7XHJcbiAgICAgIGxldCBldmVudCA9IHZpZXdlckV2ZW50LmRhdGEuZXZlbnQ7XHJcbiAgICAgIGxldCBwYXJhbSA9IHZpZXdlckV2ZW50LmRhdGEucGFyYW07XHJcbiAgICAgIGlmICh0aGlzLnZpZXdlcklkID09IHZpZXdlcklkKSB7XHJcbiAgICAgICAgaWYgKHRoaXMub25CZWZvcmVQcmludCAmJiBldmVudCA9PSBcImJlZm9yZVByaW50XCIpIHtcclxuICAgICAgICAgIHRoaXMub25CZWZvcmVQcmludC5lbWl0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHRoaXMub25BZnRlclByaW50ICYmIGV2ZW50ID09IFwiYWZ0ZXJQcmludFwiKSB7XHJcbiAgICAgICAgICB0aGlzLm9uQWZ0ZXJQcmludC5lbWl0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHRoaXMub25Eb2N1bWVudExvYWQgJiYgZXZlbnQgPT0gXCJwYWdlc0xvYWRlZFwiKSB7XHJcbiAgICAgICAgICB0aGlzLm9uRG9jdW1lbnRMb2FkLmVtaXQocGFyYW0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh0aGlzLm9uUGFnZUNoYW5nZSAmJiBldmVudCA9PSBcInBhZ2VDaGFuZ2VcIikge1xyXG4gICAgICAgICAgdGhpcy5vblBhZ2VDaGFuZ2UuZW1pdChwYXJhbSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBuZ09uSW5pdCgpOiB2b2lkIHtcclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibWVzc2FnZVwiLCB0aGlzLnJlY2VpdmVNZXNzYWdlLmJpbmQodGhpcyksIGZhbHNlKTtcclxuICAgIGlmICghdGhpcy5leHRlcm5hbFdpbmRvdykgeyAvLyBMb2FkIHBkZiBmb3IgZW1iZWRkZWQgdmlld3NcclxuICAgICAgdGhpcy5sb2FkUGRmKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgcmVmcmVzaCgpOiB2b2lkIHsgLy8gTmVlZHMgdG8gYmUgaW52b2tlZCBmb3IgZXh0ZXJuYWwgd2luZG93IG9yIHdoZW4gbmVlZHMgdG8gcmVsb2FkIHBkZlxyXG4gICAgdGhpcy5sb2FkUGRmKCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGxvYWRQZGYoKSB7XHJcbiAgICBpZiAoIXRoaXMuX3NyYykge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gY29uc29sZS5sb2coYFRhYiBpcyAtICR7dGhpcy52aWV3ZXJUYWJ9YCk7XHJcbiAgICAvLyBpZiAodGhpcy52aWV3ZXJUYWIpIHtcclxuICAgIC8vICAgY29uc29sZS5sb2coYFN0YXR1cyBvZiB3aW5kb3cgLSAke3RoaXMudmlld2VyVGFiLmNsb3NlZH1gKTtcclxuICAgIC8vIH1cclxuXHJcbiAgICBpZiAodGhpcy5leHRlcm5hbFdpbmRvdyAmJiAodHlwZW9mIHRoaXMudmlld2VyVGFiID09PSAndW5kZWZpbmVkJyB8fCB0aGlzLnZpZXdlclRhYi5jbG9zZWQpKSB7XHJcbiAgICAgIHRoaXMudmlld2VyVGFiID0gd2luZG93Lm9wZW4oJycsICdfYmxhbmsnLCB0aGlzLmV4dGVybmFsV2luZG93T3B0aW9ucyB8fCAnJyk7XHJcbiAgICAgIGlmICh0aGlzLnZpZXdlclRhYiA9PSBudWxsKSB7XHJcbiAgICAgICAgaWYodGhpcy5kaWFnbm9zdGljTG9ncykgY29uc29sZS5lcnJvcihcIm5nMi1wZGZqcy12aWV3ZXI6IEZvciAnZXh0ZXJuYWxXaW5kb3cgPSB0cnVlJy4gaS5lIG9wZW5pbmcgaW4gbmV3IHRhYiB0byB3b3JrLCBwb3AtdXBzIHNob3VsZCBiZSBlbmFibGVkLlwiKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICh0aGlzLnNob3dTcGlubmVyKSB7XHJcbiAgICAgICAgdGhpcy52aWV3ZXJUYWIuZG9jdW1lbnQud3JpdGUoYFxyXG4gICAgICAgICAgPHN0eWxlPlxyXG4gICAgICAgICAgLmxvYWRlciB7XHJcbiAgICAgICAgICAgIHBvc2l0aW9uOiBmaXhlZDtcclxuICAgICAgICAgICAgbGVmdDogNDAlO1xyXG4gICAgICAgICAgICB0b3A6IDQwJTtcclxuICAgICAgICAgICAgYm9yZGVyOiAxNnB4IHNvbGlkICNmM2YzZjM7XHJcbiAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDUwJTtcclxuICAgICAgICAgICAgYm9yZGVyLXRvcDogMTZweCBzb2xpZCAjMzQ5OGRiO1xyXG4gICAgICAgICAgICB3aWR0aDogMTIwcHg7XHJcbiAgICAgICAgICAgIGhlaWdodDogMTIwcHg7XHJcbiAgICAgICAgICAgIGFuaW1hdGlvbjogc3BpbiAycyBsaW5lYXIgaW5maW5pdGU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBAa2V5ZnJhbWVzIHNwaW4ge1xyXG4gICAgICAgICAgICAwJSB7XHJcbiAgICAgICAgICAgICAgdHJhbnNmb3JtOiByb3RhdGUoMGRlZyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgMTAwJSB7XHJcbiAgICAgICAgICAgICAgdHJhbnNmb3JtOiByb3RhdGUoMzYwZGVnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgPC9zdHlsZT5cclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJsb2FkZXJcIj48L2Rpdj5cclxuICAgICAgICBgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGxldCBmaWxlVXJsO1xyXG4gICAgLy9pZiAodHlwZW9mIHRoaXMuc3JjID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICAvLyAgZmlsZVVybCA9IHRoaXMuc3JjO1xyXG4gICAgLy99XHJcbiAgICBpZiAodGhpcy5fc3JjIGluc3RhbmNlb2YgQmxvYikge1xyXG4gICAgICBmaWxlVXJsID0gZW5jb2RlVVJJQ29tcG9uZW50KFVSTC5jcmVhdGVPYmplY3RVUkwodGhpcy5fc3JjKSk7XHJcbiAgICB9IGVsc2UgaWYgKHRoaXMuX3NyYyBpbnN0YW5jZW9mIFVpbnQ4QXJyYXkpIHtcclxuICAgICAgbGV0IGJsb2IgPSBuZXcgQmxvYihbdGhpcy5fc3JjXSwgeyB0eXBlOiBcImFwcGxpY2F0aW9uL3BkZlwiIH0pO1xyXG4gICAgICBmaWxlVXJsID0gZW5jb2RlVVJJQ29tcG9uZW50KFVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYikpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgZmlsZVVybCA9IHRoaXMuX3NyYztcclxuICAgIH1cclxuXHJcbiAgICBsZXQgdmlld2VyVXJsO1xyXG4gICAgaWYgKHRoaXMudmlld2VyRm9sZGVyKSB7XHJcbiAgICAgIHZpZXdlclVybCA9IGAke3RoaXMudmlld2VyRm9sZGVyfS93ZWIvdmlld2VyLmh0bWxgO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdmlld2VyVXJsID0gYGFzc2V0cy9wZGZqcy93ZWIvdmlld2VyLmh0bWxgO1xyXG4gICAgfVxyXG5cclxuICAgIHZpZXdlclVybCArPSBgP2ZpbGU9JHtmaWxlVXJsfWA7XHJcblxyXG4gICAgaWYgKHR5cGVvZiB0aGlzLnZpZXdlcklkICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICB2aWV3ZXJVcmwgKz0gYCZ2aWV3ZXJJZD0ke3RoaXMudmlld2VySWR9YDtcclxuICAgIH1cclxuICAgIGlmICh0eXBlb2YgdGhpcy5vbkJlZm9yZVByaW50ICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICB2aWV3ZXJVcmwgKz0gYCZiZWZvcmVQcmludD10cnVlYDtcclxuICAgIH1cclxuICAgIGlmICh0eXBlb2YgdGhpcy5vbkFmdGVyUHJpbnQgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgIHZpZXdlclVybCArPSBgJmFmdGVyUHJpbnQ9dHJ1ZWA7XHJcbiAgICB9XHJcbiAgICBpZiAodHlwZW9mIHRoaXMub25Eb2N1bWVudExvYWQgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgIHZpZXdlclVybCArPSBgJnBhZ2VzTG9hZGVkPXRydWVgO1xyXG4gICAgfVxyXG4gICAgaWYgKHR5cGVvZiB0aGlzLm9uUGFnZUNoYW5nZSAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgdmlld2VyVXJsICs9IGAmcGFnZUNoYW5nZT10cnVlYDtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy5kb3dubG9hZEZpbGVOYW1lKSB7XHJcbiAgICAgIGlmKCF0aGlzLmRvd25sb2FkRmlsZU5hbWUuZW5kc1dpdGgoXCIucGRmXCIpKSB7XHJcbiAgICAgICAgdGhpcy5kb3dubG9hZEZpbGVOYW1lICs9IFwiLnBkZlwiO1xyXG4gICAgICB9XHJcbiAgICAgIHZpZXdlclVybCArPSBgJmZpbGVOYW1lPSR7dGhpcy5kb3dubG9hZEZpbGVOYW1lfWA7XHJcbiAgICB9XHJcbiAgICBpZiAodHlwZW9mIHRoaXMub3BlbkZpbGUgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgIHZpZXdlclVybCArPSBgJm9wZW5GaWxlPSR7dGhpcy5vcGVuRmlsZX1gO1xyXG4gICAgfVxyXG4gICAgaWYgKHR5cGVvZiB0aGlzLmRvd25sb2FkICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICB2aWV3ZXJVcmwgKz0gYCZkb3dubG9hZD0ke3RoaXMuZG93bmxvYWR9YDtcclxuICAgIH1cclxuICAgIGlmICh0aGlzLnN0YXJ0RG93bmxvYWQpIHtcclxuICAgICAgdmlld2VyVXJsICs9IGAmc3RhcnREb3dubG9hZD0ke3RoaXMuc3RhcnREb3dubG9hZH1gO1xyXG4gICAgfVxyXG4gICAgaWYgKHR5cGVvZiB0aGlzLnZpZXdCb29rbWFyayAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgdmlld2VyVXJsICs9IGAmdmlld0Jvb2ttYXJrPSR7dGhpcy52aWV3Qm9va21hcmt9YDtcclxuICAgIH1cclxuICAgIGlmICh0eXBlb2YgdGhpcy5wcmludCAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgdmlld2VyVXJsICs9IGAmcHJpbnQ9JHt0aGlzLnByaW50fWA7XHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy5zdGFydFByaW50KSB7XHJcbiAgICAgIHZpZXdlclVybCArPSBgJnN0YXJ0UHJpbnQ9JHt0aGlzLnN0YXJ0UHJpbnR9YDtcclxuICAgIH1cclxuICAgIGlmICh0eXBlb2YgdGhpcy5mdWxsU2NyZWVuICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICB2aWV3ZXJVcmwgKz0gYCZmdWxsU2NyZWVuPSR7dGhpcy5mdWxsU2NyZWVufWA7XHJcbiAgICB9XHJcbiAgICAvLyBpZiAodGhpcy5zaG93RnVsbFNjcmVlbikge1xyXG4gICAgLy8gICB2aWV3ZXJVcmwgKz0gYCZzaG93RnVsbFNjcmVlbj0ke3RoaXMuc2hvd0Z1bGxTY3JlZW59YDtcclxuICAgIC8vIH1cclxuICAgIGlmICh0eXBlb2YgdGhpcy5maW5kICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICB2aWV3ZXJVcmwgKz0gYCZmaW5kPSR7dGhpcy5maW5kfWA7XHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy5sYXN0UGFnZSkge1xyXG4gICAgICB2aWV3ZXJVcmwgKz0gYCZsYXN0cGFnZT0ke3RoaXMubGFzdFBhZ2V9YDtcclxuICAgIH1cclxuICAgIGlmICh0aGlzLnJvdGF0ZWN3KSB7XHJcbiAgICAgIHZpZXdlclVybCArPSBgJnJvdGF0ZWN3PSR7dGhpcy5yb3RhdGVjd31gO1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMucm90YXRlY2N3KSB7XHJcbiAgICAgIHZpZXdlclVybCArPSBgJnJvdGF0ZWNjdz0ke3RoaXMucm90YXRlY2N3fWA7XHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy5jdXJzb3IpIHtcclxuICAgICAgdmlld2VyVXJsICs9IGAmY3Vyc29yPSR7dGhpcy5jdXJzb3J9YDtcclxuICAgIH1cclxuICAgIGlmICh0aGlzLnNjcm9sbCkge1xyXG4gICAgICB2aWV3ZXJVcmwgKz0gYCZzY3JvbGw9JHt0aGlzLnNjcm9sbH1gO1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMuc3ByZWFkKSB7XHJcbiAgICAgIHZpZXdlclVybCArPSBgJnNwcmVhZD0ke3RoaXMuc3ByZWFkfWA7XHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy5sb2NhbGUpIHtcclxuICAgICAgdmlld2VyVXJsICs9IGAmbG9jYWxlPSR7dGhpcy5sb2NhbGV9YDtcclxuICAgIH1cclxuICAgIGlmICh0aGlzLnVzZU9ubHlDc3Nab29tKSB7XHJcbiAgICAgIHZpZXdlclVybCArPSBgJnVzZU9ubHlDc3Nab29tPSR7dGhpcy51c2VPbmx5Q3NzWm9vbX1gO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBpZiAodGhpcy5fcGFnZSB8fCB0aGlzLnpvb20gfHwgdGhpcy5uYW1lZGRlc3QgfHwgdGhpcy5wYWdlbW9kZSkgdmlld2VyVXJsICs9IFwiI1wiXHJcbiAgICBpZiAodGhpcy5fcGFnZSkge1xyXG4gICAgICB2aWV3ZXJVcmwgKz0gYCZwYWdlPSR7dGhpcy5fcGFnZX1gO1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMuem9vbSkge1xyXG4gICAgICB2aWV3ZXJVcmwgKz0gYCZ6b29tPSR7dGhpcy56b29tfWA7XHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy5uYW1lZGRlc3QpIHtcclxuICAgICAgdmlld2VyVXJsICs9IGAmbmFtZWRkZXN0PSR7dGhpcy5uYW1lZGRlc3R9YDtcclxuICAgIH1cclxuICAgIGlmICh0aGlzLnBhZ2Vtb2RlKSB7XHJcbiAgICAgIHZpZXdlclVybCArPSBgJnBhZ2Vtb2RlPSR7dGhpcy5wYWdlbW9kZX1gO1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMuZXJyb3JPdmVycmlkZSB8fCB0aGlzLmVycm9yQXBwZW5kKSB7XHJcbiAgICAgIHZpZXdlclVybCArPSBgJmVycm9yTWVzc2FnZT0ke3RoaXMuZXJyb3JNZXNzYWdlfWA7XHJcblxyXG4gICAgICBpZiAodGhpcy5lcnJvck92ZXJyaWRlKSB7XHJcbiAgICAgICAgdmlld2VyVXJsICs9IGAmZXJyb3JPdmVycmlkZT0ke3RoaXMuZXJyb3JPdmVycmlkZX1gO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICh0aGlzLmVycm9yQXBwZW5kKSB7XHJcbiAgICAgICAgdmlld2VyVXJsICs9IGAmZXJyb3JBcHBlbmQ9JHt0aGlzLmVycm9yQXBwZW5kfWA7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy5leHRlcm5hbFdpbmRvdykge1xyXG4gICAgICB0aGlzLnZpZXdlclRhYi5sb2NhdGlvbi5ocmVmID0gdmlld2VyVXJsO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5pZnJhbWUubmF0aXZlRWxlbWVudC5zcmMgPSB2aWV3ZXJVcmw7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gY29uc29sZS5sb2coYFxyXG4gICAgLy8gICBwZGZTcmMgPSAke3RoaXMucGRmU3JjfVxyXG4gICAgLy8gICBmaWxlVXJsID0gJHtmaWxlVXJsfVxyXG4gICAgLy8gICBleHRlcm5hbFdpbmRvdyA9ICR7dGhpcy5leHRlcm5hbFdpbmRvd31cclxuICAgIC8vICAgZG93bmxvYWRGaWxlTmFtZSA9ICR7dGhpcy5kb3dubG9hZEZpbGVOYW1lfVxyXG4gICAgLy8gICB2aWV3ZXJGb2xkZXIgPSAke3RoaXMudmlld2VyRm9sZGVyfVxyXG4gICAgLy8gICBvcGVuRmlsZSA9ICR7dGhpcy5vcGVuRmlsZX1cclxuICAgIC8vICAgZG93bmxvYWQgPSAke3RoaXMuZG93bmxvYWR9XHJcbiAgICAvLyAgIHN0YXJ0RG93bmxvYWQgPSAke3RoaXMuc3RhcnREb3dubG9hZH1cclxuICAgIC8vICAgdmlld0Jvb2ttYXJrID0gJHt0aGlzLnZpZXdCb29rbWFya31cclxuICAgIC8vICAgcHJpbnQgPSAke3RoaXMucHJpbnR9XHJcbiAgICAvLyAgIHN0YXJ0UHJpbnQgPSAke3RoaXMuc3RhcnRQcmludH1cclxuICAgIC8vICAgZnVsbFNjcmVlbiA9ICR7dGhpcy5mdWxsU2NyZWVufVxyXG4gICAgLy8gICBmaW5kID0gJHt0aGlzLmZpbmR9XHJcbiAgICAvLyAgIGxhc3RQYWdlID0gJHt0aGlzLmxhc3RQYWdlfVxyXG4gICAgLy8gICByb3RhdGVjdyA9ICR7dGhpcy5yb3RhdGVjd31cclxuICAgIC8vICAgcm90YXRlY2N3ID0gJHt0aGlzLnJvdGF0ZWNjd31cclxuICAgIC8vICAgY3Vyc29yID0gJHt0aGlzLmN1cnNvcn1cclxuICAgIC8vICAgc2Nyb2xsTW9kZSA9ICR7dGhpcy5zY3JvbGx9XHJcbiAgICAvLyAgIHNwcmVhZCA9ICR7dGhpcy5zcHJlYWR9XHJcbiAgICAvLyAgIHBhZ2UgPSAke3RoaXMucGFnZX1cclxuICAgIC8vICAgem9vbSA9ICR7dGhpcy56b29tfVxyXG4gICAgLy8gICBuYW1lZGRlc3QgPSAke3RoaXMubmFtZWRkZXN0fVxyXG4gICAgLy8gICBwYWdlbW9kZSA9ICR7dGhpcy5wYWdlbW9kZX1cclxuICAgIC8vICAgcGFnZW1vZGUgPSAke3RoaXMuZXJyb3JPdmVycmlkZX1cclxuICAgIC8vICAgcGFnZW1vZGUgPSAke3RoaXMuZXJyb3JBcHBlbmR9XHJcbiAgICAvLyAgIHBhZ2Vtb2RlID0gJHt0aGlzLmVycm9yTWVzc2FnZX1cclxuICAgIC8vIGApO1xyXG4gIH1cclxufSJdfQ==