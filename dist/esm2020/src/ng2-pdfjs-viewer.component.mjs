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
PdfJsViewerComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.1.2", ngImport: i0, type: PdfJsViewerComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
PdfJsViewerComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "14.1.2", type: PdfJsViewerComponent, selector: "ng2-pdfjs-viewer", inputs: { viewerId: "viewerId", viewerFolder: "viewerFolder", externalWindow: "externalWindow", showSpinner: "showSpinner", downloadFileName: "downloadFileName", openFile: "openFile", download: "download", startDownload: "startDownload", viewBookmark: "viewBookmark", print: "print", startPrint: "startPrint", fullScreen: "fullScreen", find: "find", zoom: "zoom", nameddest: "nameddest", pagemode: "pagemode", lastPage: "lastPage", rotatecw: "rotatecw", rotateccw: "rotateccw", cursor: "cursor", scroll: "scroll", spread: "spread", locale: "locale", useOnlyCssZoom: "useOnlyCssZoom", errorOverride: "errorOverride", errorAppend: "errorAppend", errorMessage: "errorMessage", diagnosticLogs: "diagnosticLogs", externalWindowOptions: "externalWindowOptions", page: "page", pdfSrc: "pdfSrc" }, outputs: { onBeforePrint: "onBeforePrint", onAfterPrint: "onAfterPrint", onDocumentLoad: "onDocumentLoad", onPageChange: "onPageChange" }, viewQueries: [{ propertyName: "iframe", first: true, predicate: ["iframe"], descendants: true, static: true }], ngImport: i0, template: `<iframe title="ng2-pdfjs-viewer" [hidden]="externalWindow || (!externalWindow && !pdfSrc)" #iframe width="100%" height="100%"></iframe>`, isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.1.2", ngImport: i0, type: PdfJsViewerComponent, decorators: [{
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmcyLXBkZmpzLXZpZXdlci5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbmcyLXBkZmpzLXZpZXdlci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxZQUFZLEVBQWMsTUFBTSxlQUFlLENBQUM7O0FBTTlGLE1BQU0sT0FBTyxvQkFBb0I7SUFKakM7UUFPWSxrQkFBYSxHQUFzQixJQUFJLFlBQVksRUFBRSxDQUFDO1FBQ3RELGlCQUFZLEdBQXNCLElBQUksWUFBWSxFQUFFLENBQUM7UUFDckQsbUJBQWMsR0FBc0IsSUFBSSxZQUFZLEVBQUUsQ0FBQztRQUN2RCxpQkFBWSxHQUFzQixJQUFJLFlBQVksRUFBRSxDQUFDO1FBRS9DLG1CQUFjLEdBQVksS0FBSyxDQUFDO1FBQ2hDLGdCQUFXLEdBQVksSUFBSSxDQUFDO1FBRTVCLGFBQVEsR0FBWSxJQUFJLENBQUM7UUFDekIsYUFBUSxHQUFZLElBQUksQ0FBQztRQUV6QixpQkFBWSxHQUFZLElBQUksQ0FBQztRQUM3QixVQUFLLEdBQVksSUFBSSxDQUFDO1FBRXRCLGVBQVUsR0FBWSxJQUFJLENBQUM7UUFDM0MsMENBQTBDO1FBQzFCLFNBQUksR0FBWSxJQUFJLENBQUM7UUFXckIsbUJBQWMsR0FBWSxLQUFLLENBQUM7UUFDaEMsa0JBQWEsR0FBWSxLQUFLLENBQUM7UUFDL0IsZ0JBQVcsR0FBWSxJQUFJLENBQUM7UUFFNUIsbUJBQWMsR0FBWSxJQUFJLENBQUM7S0F1U2hEO0lBaFNDLElBQ1csSUFBSSxDQUFDLEtBQWE7UUFDM0IsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDbkIsSUFBRyxJQUFJLENBQUMsb0JBQW9CLEVBQUU7WUFDNUIsSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFD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SztnQkFDVSxRQUFRO3NCQUF2QixLQUFLO2dCQUNVLFFBQVE7c0JBQXZCLEtBQUs7Z0JBQ1UsUUFBUTtzQkFBdkIsS0FBSztnQkFDVSxTQUFTO3NCQUF4QixLQUFLO2dCQUNVLE1BQU07c0JBQXJCLEtBQUs7Z0JBQ1UsTUFBTTtzQkFBckIsS0FBSztnQkFDVSxNQUFNO3NCQUFyQixLQUFLO2dCQUNVLE1BQU07c0JBQXJCLEtBQUs7Z0JBQ1UsY0FBYztzQkFBN0IsS0FBSztnQkFDVSxhQUFhO3NCQUE1QixLQUFLO2dCQUNVLFdBQVc7c0JBQTFCLEtBQUs7Z0JBQ1UsWUFBWTtzQkFBM0IsS0FBSztnQkFDVSxjQUFjO3NCQUE3QixLQUFLO2dCQUVVLHFCQUFxQjtzQkFBcEMsS0FBSztnQkFNSyxJQUFJO3NCQURkLEtBQUs7Z0JBbUJLLE1BQU07c0JBRGhCLEtBQUsiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIElucHV0LCBPdXRwdXQsIFZpZXdDaGlsZCwgRXZlbnRFbWl0dGVyLCBFbGVtZW50UmVmIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ25nMi1wZGZqcy12aWV3ZXInLFxuICB0ZW1wbGF0ZTogYDxpZnJhbWUgdGl0bGU9XCJuZzItcGRmanMtdmlld2VyXCIgW2hpZGRlbl09XCJleHRlcm5hbFdpbmRvdyB8fCAoIWV4dGVybmFsV2luZG93ICYmICFwZGZTcmMpXCIgI2lmcmFtZSB3aWR0aD1cIjEwMCVcIiBoZWlnaHQ9XCIxMDAlXCI+PC9pZnJhbWU+YFxufSlcbmV4cG9ydCBjbGFzcyBQZGZKc1ZpZXdlckNvbXBvbmVudCB7XG4gIEBWaWV3Q2hpbGQoJ2lmcmFtZScsIHtzdGF0aWM6IHRydWV9KSBpZnJhbWU6IEVsZW1lbnRSZWY7XG4gIEBJbnB1dCgpIHB1YmxpYyB2aWV3ZXJJZDogc3RyaW5nO1xuICBAT3V0cHV0KCkgb25CZWZvcmVQcmludDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gIEBPdXRwdXQoKSBvbkFmdGVyUHJpbnQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICBAT3V0cHV0KCkgb25Eb2N1bWVudExvYWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICBAT3V0cHV0KCkgb25QYWdlQ2hhbmdlOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgQElucHV0KCkgcHVibGljIHZpZXdlckZvbGRlcjogc3RyaW5nO1xuICBASW5wdXQoKSBwdWJsaWMgZXh0ZXJuYWxXaW5kb3c6IGJvb2xlYW4gPSBmYWxzZTtcbiAgQElucHV0KCkgcHVibGljIHNob3dTcGlubmVyOiBib29sZWFuID0gdHJ1ZTtcbiAgQElucHV0KCkgcHVibGljIGRvd25sb2FkRmlsZU5hbWU6IHN0cmluZztcbiAgQElucHV0KCkgcHVibGljIG9wZW5GaWxlOiBib29sZWFuID0gdHJ1ZTtcbiAgQElucHV0KCkgcHVibGljIGRvd25sb2FkOiBib29sZWFuID0gdHJ1ZTtcbiAgQElucHV0KCkgcHVibGljIHN0YXJ0RG93bmxvYWQ6IGJvb2xlYW47XG4gIEBJbnB1dCgpIHB1YmxpYyB2aWV3Qm9va21hcms6IGJvb2xlYW4gPSB0cnVlO1xuICBASW5wdXQoKSBwdWJsaWMgcHJpbnQ6IGJvb2xlYW4gPSB0cnVlO1xuICBASW5wdXQoKSBwdWJsaWMgc3RhcnRQcmludDogYm9vbGVhbjtcbiAgQElucHV0KCkgcHVibGljIGZ1bGxTY3JlZW46IGJvb2xlYW4gPSB0cnVlO1xuICAvL0BJbnB1dCgpIHB1YmxpYyBzaG93RnVsbFNjcmVlbjogYm9vbGVhbjtcbiAgQElucHV0KCkgcHVibGljIGZpbmQ6IGJvb2xlYW4gPSB0cnVlO1xuICBASW5wdXQoKSBwdWJsaWMgem9vbTogc3RyaW5nO1xuICBASW5wdXQoKSBwdWJsaWMgbmFtZWRkZXN0OiBzdHJpbmc7XG4gIEBJbnB1dCgpIHB1YmxpYyBwYWdlbW9kZTogc3RyaW5nO1xuICBASW5wdXQoKSBwdWJsaWMgbGFzdFBhZ2U6IGJvb2xlYW47XG4gIEBJbnB1dCgpIHB1YmxpYyByb3RhdGVjdzogYm9vbGVhbjtcbiAgQElucHV0KCkgcHVibGljIHJvdGF0ZWNjdzogYm9vbGVhbjtcbiAgQElucHV0KCkgcHVibGljIGN1cnNvcjogc3RyaW5nO1xuICBASW5wdXQoKSBwdWJsaWMgc2Nyb2xsOiBzdHJpbmc7XG4gIEBJbnB1dCgpIHB1YmxpYyBzcHJlYWQ6IHN0cmluZztcbiAgQElucHV0KCkgcHVibGljIGxvY2FsZTogc3RyaW5nO1xuICBASW5wdXQoKSBwdWJsaWMgdXNlT25seUNzc1pvb206IGJvb2xlYW4gPSBmYWxzZTtcbiAgQElucHV0KCkgcHVibGljIGVycm9yT3ZlcnJpZGU6IGJvb2xlYW4gPSBmYWxzZTtcbiAgQElucHV0KCkgcHVibGljIGVycm9yQXBwZW5kOiBib29sZWFuID0gdHJ1ZTtcbiAgQElucHV0KCkgcHVibGljIGVycm9yTWVzc2FnZTogc3RyaW5nO1xuICBASW5wdXQoKSBwdWJsaWMgZGlhZ25vc3RpY0xvZ3M6IGJvb2xlYW4gPSB0cnVlO1xuICBcbiAgQElucHV0KCkgcHVibGljIGV4dGVybmFsV2luZG93T3B0aW9uczogc3RyaW5nO1xuICBwdWJsaWMgdmlld2VyVGFiOiBhbnk7XG4gIHByaXZhdGUgX3NyYzogc3RyaW5nIHwgQmxvYiB8IFVpbnQ4QXJyYXk7XG4gIHByaXZhdGUgX3BhZ2U6IG51bWJlcjtcbiAgXG4gIEBJbnB1dCgpXG4gIHB1YmxpYyBzZXQgcGFnZShfcGFnZTogbnVtYmVyKSB7XG4gICAgdGhpcy5fcGFnZSA9IF9wYWdlO1xuICAgIGlmKHRoaXMuUERGVmlld2VyQXBwbGljYXRpb24pIHtcbiAgICAgIHRoaXMuUERGVmlld2VyQXBwbGljYXRpb24ucGFnZSA9IHRoaXMuX3BhZ2U7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmKHRoaXMuZGlhZ25vc3RpY0xvZ3MpIGNvbnNvbGUud2FybihcIkRvY3VtZW50IGlzIG5vdCBsb2FkZWQgeWV0ISEhLiBUcnkgdG8gc2V0IHBhZ2UjIGFmdGVyIGZ1bGwgbG9hZC4gSWdub3JlIHRoaXMgd2FybmluZyBpZiB5b3UgYXJlIG5vdCBzZXR0aW5nIHBhZ2UjIHVzaW5nICcuJyBub3RhdGlvbi4gKEUuZy4gcGRmVmlld2VyLnBhZ2UgPSA1OylcIik7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIGdldCBwYWdlKCkge1xuICAgIGlmKHRoaXMuUERGVmlld2VyQXBwbGljYXRpb24pIHtcbiAgICAgIHJldHVybiB0aGlzLlBERlZpZXdlckFwcGxpY2F0aW9uLnBhZ2U7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmKHRoaXMuZGlhZ25vc3RpY0xvZ3MpIGNvbnNvbGUud2FybihcIkRvY3VtZW50IGlzIG5vdCBsb2FkZWQgeWV0ISEhLiBUcnkgdG8gcmV0cmlldmUgcGFnZSMgYWZ0ZXIgZnVsbCBsb2FkLlwiKTtcbiAgICB9XG4gIH1cblxuICBASW5wdXQoKVxuICBwdWJsaWMgc2V0IHBkZlNyYyhfc3JjOiBzdHJpbmcgfCBCbG9iIHwgVWludDhBcnJheSkge1xuICAgIHRoaXMuX3NyYyA9IF9zcmM7XG4gIH1cblxuICBwdWJsaWMgZ2V0IHBkZlNyYygpIHtcbiAgICByZXR1cm4gdGhpcy5fc3JjO1xuICB9XG5cbiAgcHVibGljIGdldCBQREZWaWV3ZXJBcHBsaWNhdGlvbk9wdGlvbnMoKSB7XG4gICAgbGV0IHBkZlZpZXdlck9wdGlvbnMgPSBudWxsO1xuICAgIGlmICh0aGlzLmV4dGVybmFsV2luZG93KSB7XG4gICAgICBpZiAodGhpcy52aWV3ZXJUYWIpIHtcbiAgICAgICAgcGRmVmlld2VyT3B0aW9ucyA9IHRoaXMudmlld2VyVGFiLlBERlZpZXdlckFwcGxpY2F0aW9uT3B0aW9ucztcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHRoaXMuaWZyYW1lLm5hdGl2ZUVsZW1lbnQuY29udGVudFdpbmRvdykge1xuICAgICAgICBwZGZWaWV3ZXJPcHRpb25zID0gdGhpcy5pZnJhbWUubmF0aXZlRWxlbWVudC5jb250ZW50V2luZG93LlBERlZpZXdlckFwcGxpY2F0aW9uT3B0aW9ucztcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHBkZlZpZXdlck9wdGlvbnM7XG4gIH1cblxuICBwdWJsaWMgZ2V0IFBERlZpZXdlckFwcGxpY2F0aW9uKCkge1xuICAgIGxldCBwZGZWaWV3ZXIgPSBudWxsO1xuICAgIGlmICh0aGlzLmV4dGVybmFsV2luZG93KSB7XG4gICAgICBpZiAodGhpcy52aWV3ZXJUYWIpIHtcbiAgICAgICAgcGRmVmlld2VyID0gdGhpcy52aWV3ZXJUYWIuUERGVmlld2VyQXBwbGljYXRpb247XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0aGlzLmlmcmFtZS5uYXRpdmVFbGVtZW50LmNvbnRlbnRXaW5kb3cpIHtcbiAgICAgICAgcGRmVmlld2VyID0gdGhpcy5pZnJhbWUubmF0aXZlRWxlbWVudC5jb250ZW50V2luZG93LlBERlZpZXdlckFwcGxpY2F0aW9uO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcGRmVmlld2VyO1xuICB9XG5cbiAgcHVibGljIHJlY2VpdmVNZXNzYWdlKHZpZXdlckV2ZW50KSAge1xuICAgIGlmICh2aWV3ZXJFdmVudC5kYXRhICYmIHZpZXdlckV2ZW50LmRhdGEudmlld2VySWQgJiYgdmlld2VyRXZlbnQuZGF0YS5ldmVudCkge1xuICAgICAgbGV0IHZpZXdlcklkID0gdmlld2VyRXZlbnQuZGF0YS52aWV3ZXJJZDtcbiAgICAgIGxldCBldmVudCA9IHZpZXdlckV2ZW50LmRhdGEuZXZlbnQ7XG4gICAgICBsZXQgcGFyYW0gPSB2aWV3ZXJFdmVudC5kYXRhLnBhcmFtO1xuICAgICAgaWYgKHRoaXMudmlld2VySWQgPT0gdmlld2VySWQpIHtcbiAgICAgICAgaWYgKHRoaXMub25CZWZvcmVQcmludCAmJiBldmVudCA9PSBcImJlZm9yZVByaW50XCIpIHtcbiAgICAgICAgICB0aGlzLm9uQmVmb3JlUHJpbnQuZW1pdCgpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHRoaXMub25BZnRlclByaW50ICYmIGV2ZW50ID09IFwiYWZ0ZXJQcmludFwiKSB7XG4gICAgICAgICAgdGhpcy5vbkFmdGVyUHJpbnQuZW1pdCgpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHRoaXMub25Eb2N1bWVudExvYWQgJiYgZXZlbnQgPT0gXCJwYWdlc0xvYWRlZFwiKSB7XG4gICAgICAgICAgdGhpcy5vbkRvY3VtZW50TG9hZC5lbWl0KHBhcmFtKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0aGlzLm9uUGFnZUNoYW5nZSAmJiBldmVudCA9PSBcInBhZ2VDaGFuZ2VcIikge1xuICAgICAgICAgIHRoaXMub25QYWdlQ2hhbmdlLmVtaXQocGFyYW0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgbmdPbkluaXQoKTogdm9pZCB7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtZXNzYWdlXCIsIHRoaXMucmVjZWl2ZU1lc3NhZ2UuYmluZCh0aGlzKSwgZmFsc2UpO1xuICAgIGlmICghdGhpcy5leHRlcm5hbFdpbmRvdykgeyAvLyBMb2FkIHBkZiBmb3IgZW1iZWRkZWQgdmlld3NcbiAgICAgIHRoaXMubG9hZFBkZigpO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyByZWZyZXNoKCk6IHZvaWQgeyAvLyBOZWVkcyB0byBiZSBpbnZva2VkIGZvciBleHRlcm5hbCB3aW5kb3cgb3Igd2hlbiBuZWVkcyB0byByZWxvYWQgcGRmXG4gICAgdGhpcy5sb2FkUGRmKCk7XG4gIH1cblxuICBwcml2YXRlIGxvYWRQZGYoKSB7XG4gICAgaWYgKCF0aGlzLl9zcmMpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBjb25zb2xlLmxvZyhgVGFiIGlzIC0gJHt0aGlzLnZpZXdlclRhYn1gKTtcbiAgICAvLyBpZiAodGhpcy52aWV3ZXJUYWIpIHtcbiAgICAvLyAgIGNvbnNvbGUubG9nKGBTdGF0dXMgb2Ygd2luZG93IC0gJHt0aGlzLnZpZXdlclRhYi5jbG9zZWR9YCk7XG4gICAgLy8gfVxuXG4gICAgaWYgKHRoaXMuZXh0ZXJuYWxXaW5kb3cgJiYgKHR5cGVvZiB0aGlzLnZpZXdlclRhYiA9PT0gJ3VuZGVmaW5lZCcgfHwgdGhpcy52aWV3ZXJUYWIuY2xvc2VkKSkge1xuICAgICAgdGhpcy52aWV3ZXJUYWIgPSB3aW5kb3cub3BlbignJywgJ19ibGFuaycsIHRoaXMuZXh0ZXJuYWxXaW5kb3dPcHRpb25zIHx8ICcnKTtcbiAgICAgIGlmICh0aGlzLnZpZXdlclRhYiA9PSBudWxsKSB7XG4gICAgICAgIGlmKHRoaXMuZGlhZ25vc3RpY0xvZ3MpIGNvbnNvbGUuZXJyb3IoXCJuZzItcGRmanMtdmlld2VyOiBGb3IgJ2V4dGVybmFsV2luZG93ID0gdHJ1ZScuIGkuZSBvcGVuaW5nIGluIG5ldyB0YWIgdG8gd29yaywgcG9wLXVwcyBzaG91bGQgYmUgZW5hYmxlZC5cIik7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuc2hvd1NwaW5uZXIpIHtcbiAgICAgICAgdGhpcy52aWV3ZXJUYWIuZG9jdW1lbnQud3JpdGUoYFxuICAgICAgICAgIDxzdHlsZT5cbiAgICAgICAgICAubG9hZGVyIHtcbiAgICAgICAgICAgIHBvc2l0aW9uOiBmaXhlZDtcbiAgICAgICAgICAgIGxlZnQ6IDQwJTtcbiAgICAgICAgICAgIHRvcDogNDAlO1xuICAgICAgICAgICAgYm9yZGVyOiAxNnB4IHNvbGlkICNmM2YzZjM7XG4gICAgICAgICAgICBib3JkZXItcmFkaXVzOiA1MCU7XG4gICAgICAgICAgICBib3JkZXItdG9wOiAxNnB4IHNvbGlkICMzNDk4ZGI7XG4gICAgICAgICAgICB3aWR0aDogMTIwcHg7XG4gICAgICAgICAgICBoZWlnaHQ6IDEyMHB4O1xuICAgICAgICAgICAgYW5pbWF0aW9uOiBzcGluIDJzIGxpbmVhciBpbmZpbml0ZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgQGtleWZyYW1lcyBzcGluIHtcbiAgICAgICAgICAgIDAlIHtcbiAgICAgICAgICAgICAgdHJhbnNmb3JtOiByb3RhdGUoMGRlZyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAxMDAlIHtcbiAgICAgICAgICAgICAgdHJhbnNmb3JtOiByb3RhdGUoMzYwZGVnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgPC9zdHlsZT5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwibG9hZGVyXCI+PC9kaXY+XG4gICAgICAgIGApO1xuICAgICAgfVxuICAgIH1cblxuICAgIGxldCBmaWxlVXJsO1xuICAgIC8vaWYgKHR5cGVvZiB0aGlzLnNyYyA9PT0gXCJzdHJpbmdcIikge1xuICAgIC8vICBmaWxlVXJsID0gdGhpcy5zcmM7XG4gICAgLy99XG4gICAgaWYgKHRoaXMuX3NyYyBpbnN0YW5jZW9mIEJsb2IpIHtcbiAgICAgIGZpbGVVcmwgPSBlbmNvZGVVUklDb21wb25lbnQoVVJMLmNyZWF0ZU9iamVjdFVSTCh0aGlzLl9zcmMpKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuX3NyYyBpbnN0YW5jZW9mIFVpbnQ4QXJyYXkpIHtcbiAgICAgIGxldCBibG9iID0gbmV3IEJsb2IoW3RoaXMuX3NyY10sIHsgdHlwZTogXCJhcHBsaWNhdGlvbi9wZGZcIiB9KTtcbiAgICAgIGZpbGVVcmwgPSBlbmNvZGVVUklDb21wb25lbnQoVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGZpbGVVcmwgPSB0aGlzLl9zcmM7XG4gICAgfVxuXG4gICAgbGV0IHZpZXdlclVybDtcbiAgICBpZiAodGhpcy52aWV3ZXJGb2xkZXIpIHtcbiAgICAgIHZpZXdlclVybCA9IGAke3RoaXMudmlld2VyRm9sZGVyfS93ZWIvdmlld2VyLmh0bWxgO1xuICAgIH0gZWxzZSB7XG4gICAgICB2aWV3ZXJVcmwgPSBgYXNzZXRzL3BkZmpzL3dlYi92aWV3ZXIuaHRtbGA7XG4gICAgfVxuXG4gICAgdmlld2VyVXJsICs9IGA/ZmlsZT0ke2ZpbGVVcmx9YDtcblxuICAgIGlmICh0eXBlb2YgdGhpcy52aWV3ZXJJZCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHZpZXdlclVybCArPSBgJnZpZXdlcklkPSR7dGhpcy52aWV3ZXJJZH1gO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIHRoaXMub25CZWZvcmVQcmludCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHZpZXdlclVybCArPSBgJmJlZm9yZVByaW50PXRydWVgO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIHRoaXMub25BZnRlclByaW50ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgdmlld2VyVXJsICs9IGAmYWZ0ZXJQcmludD10cnVlYDtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiB0aGlzLm9uRG9jdW1lbnRMb2FkICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgdmlld2VyVXJsICs9IGAmcGFnZXNMb2FkZWQ9dHJ1ZWA7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgdGhpcy5vblBhZ2VDaGFuZ2UgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB2aWV3ZXJVcmwgKz0gYCZwYWdlQ2hhbmdlPXRydWVgO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmRvd25sb2FkRmlsZU5hbWUpIHtcbiAgICAgIGlmKCF0aGlzLmRvd25sb2FkRmlsZU5hbWUuZW5kc1dpdGgoXCIucGRmXCIpKSB7XG4gICAgICAgIHRoaXMuZG93bmxvYWRGaWxlTmFtZSArPSBcIi5wZGZcIjtcbiAgICAgIH1cbiAgICAgIHZpZXdlclVybCArPSBgJmZpbGVOYW1lPSR7dGhpcy5kb3dubG9hZEZpbGVOYW1lfWA7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgdGhpcy5vcGVuRmlsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHZpZXdlclVybCArPSBgJm9wZW5GaWxlPSR7dGhpcy5vcGVuRmlsZX1gO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIHRoaXMuZG93bmxvYWQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB2aWV3ZXJVcmwgKz0gYCZkb3dubG9hZD0ke3RoaXMuZG93bmxvYWR9YDtcbiAgICB9XG4gICAgaWYgKHRoaXMuc3RhcnREb3dubG9hZCkge1xuICAgICAgdmlld2VyVXJsICs9IGAmc3RhcnREb3dubG9hZD0ke3RoaXMuc3RhcnREb3dubG9hZH1gO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIHRoaXMudmlld0Jvb2ttYXJrICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgdmlld2VyVXJsICs9IGAmdmlld0Jvb2ttYXJrPSR7dGhpcy52aWV3Qm9va21hcmt9YDtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiB0aGlzLnByaW50ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgdmlld2VyVXJsICs9IGAmcHJpbnQ9JHt0aGlzLnByaW50fWA7XG4gICAgfVxuICAgIGlmICh0aGlzLnN0YXJ0UHJpbnQpIHtcbiAgICAgIHZpZXdlclVybCArPSBgJnN0YXJ0UHJpbnQ9JHt0aGlzLnN0YXJ0UHJpbnR9YDtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiB0aGlzLmZ1bGxTY3JlZW4gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB2aWV3ZXJVcmwgKz0gYCZmdWxsU2NyZWVuPSR7dGhpcy5mdWxsU2NyZWVufWA7XG4gICAgfVxuICAgIC8vIGlmICh0aGlzLnNob3dGdWxsU2NyZWVuKSB7XG4gICAgLy8gICB2aWV3ZXJVcmwgKz0gYCZzaG93RnVsbFNjcmVlbj0ke3RoaXMuc2hvd0Z1bGxTY3JlZW59YDtcbiAgICAvLyB9XG4gICAgaWYgKHR5cGVvZiB0aGlzLmZpbmQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB2aWV3ZXJVcmwgKz0gYCZmaW5kPSR7dGhpcy5maW5kfWA7XG4gICAgfVxuICAgIGlmICh0aGlzLmxhc3RQYWdlKSB7XG4gICAgICB2aWV3ZXJVcmwgKz0gYCZsYXN0cGFnZT0ke3RoaXMubGFzdFBhZ2V9YDtcbiAgICB9XG4gICAgaWYgKHRoaXMucm90YXRlY3cpIHtcbiAgICAgIHZpZXdlclVybCArPSBgJnJvdGF0ZWN3PSR7dGhpcy5yb3RhdGVjd31gO1xuICAgIH1cbiAgICBpZiAodGhpcy5yb3RhdGVjY3cpIHtcbiAgICAgIHZpZXdlclVybCArPSBgJnJvdGF0ZWNjdz0ke3RoaXMucm90YXRlY2N3fWA7XG4gICAgfVxuICAgIGlmICh0aGlzLmN1cnNvcikge1xuICAgICAgdmlld2VyVXJsICs9IGAmY3Vyc29yPSR7dGhpcy5jdXJzb3J9YDtcbiAgICB9XG4gICAgaWYgKHRoaXMuc2Nyb2xsKSB7XG4gICAgICB2aWV3ZXJVcmwgKz0gYCZzY3JvbGw9JHt0aGlzLnNjcm9sbH1gO1xuICAgIH1cbiAgICBpZiAodGhpcy5zcHJlYWQpIHtcbiAgICAgIHZpZXdlclVybCArPSBgJnNwcmVhZD0ke3RoaXMuc3ByZWFkfWA7XG4gICAgfVxuICAgIGlmICh0aGlzLmxvY2FsZSkge1xuICAgICAgdmlld2VyVXJsICs9IGAmbG9jYWxlPSR7dGhpcy5sb2NhbGV9YDtcbiAgICB9XG4gICAgaWYgKHRoaXMudXNlT25seUNzc1pvb20pIHtcbiAgICAgIHZpZXdlclVybCArPSBgJnVzZU9ubHlDc3Nab29tPSR7dGhpcy51c2VPbmx5Q3NzWm9vbX1gO1xuICAgIH1cbiAgICBcbiAgICBpZiAodGhpcy5fcGFnZSB8fCB0aGlzLnpvb20gfHwgdGhpcy5uYW1lZGRlc3QgfHwgdGhpcy5wYWdlbW9kZSkgdmlld2VyVXJsICs9IFwiI1wiXG4gICAgaWYgKHRoaXMuX3BhZ2UpIHtcbiAgICAgIHZpZXdlclVybCArPSBgJnBhZ2U9JHt0aGlzLl9wYWdlfWA7XG4gICAgfVxuICAgIGlmICh0aGlzLnpvb20pIHtcbiAgICAgIHZpZXdlclVybCArPSBgJnpvb209JHt0aGlzLnpvb219YDtcbiAgICB9XG4gICAgaWYgKHRoaXMubmFtZWRkZXN0KSB7XG4gICAgICB2aWV3ZXJVcmwgKz0gYCZuYW1lZGRlc3Q9JHt0aGlzLm5hbWVkZGVzdH1gO1xuICAgIH1cbiAgICBpZiAodGhpcy5wYWdlbW9kZSkge1xuICAgICAgdmlld2VyVXJsICs9IGAmcGFnZW1vZGU9JHt0aGlzLnBhZ2Vtb2RlfWA7XG4gICAgfVxuICAgIGlmICh0aGlzLmVycm9yT3ZlcnJpZGUgfHwgdGhpcy5lcnJvckFwcGVuZCkge1xuICAgICAgdmlld2VyVXJsICs9IGAmZXJyb3JNZXNzYWdlPSR7dGhpcy5lcnJvck1lc3NhZ2V9YDtcblxuICAgICAgaWYgKHRoaXMuZXJyb3JPdmVycmlkZSkge1xuICAgICAgICB2aWV3ZXJVcmwgKz0gYCZlcnJvck92ZXJyaWRlPSR7dGhpcy5lcnJvck92ZXJyaWRlfWA7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5lcnJvckFwcGVuZCkge1xuICAgICAgICB2aWV3ZXJVcmwgKz0gYCZlcnJvckFwcGVuZD0ke3RoaXMuZXJyb3JBcHBlbmR9YDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy5leHRlcm5hbFdpbmRvdykge1xuICAgICAgdGhpcy52aWV3ZXJUYWIubG9jYXRpb24uaHJlZiA9IHZpZXdlclVybDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5pZnJhbWUubmF0aXZlRWxlbWVudC5zcmMgPSB2aWV3ZXJVcmw7XG4gICAgfVxuXG4gICAgLy8gY29uc29sZS5sb2coYFxuICAgIC8vICAgcGRmU3JjID0gJHt0aGlzLnBkZlNyY31cbiAgICAvLyAgIGZpbGVVcmwgPSAke2ZpbGVVcmx9XG4gICAgLy8gICBleHRlcm5hbFdpbmRvdyA9ICR7dGhpcy5leHRlcm5hbFdpbmRvd31cbiAgICAvLyAgIGRvd25sb2FkRmlsZU5hbWUgPSAke3RoaXMuZG93bmxvYWRGaWxlTmFtZX1cbiAgICAvLyAgIHZpZXdlckZvbGRlciA9ICR7dGhpcy52aWV3ZXJGb2xkZXJ9XG4gICAgLy8gICBvcGVuRmlsZSA9ICR7dGhpcy5vcGVuRmlsZX1cbiAgICAvLyAgIGRvd25sb2FkID0gJHt0aGlzLmRvd25sb2FkfVxuICAgIC8vICAgc3RhcnREb3dubG9hZCA9ICR7dGhpcy5zdGFydERvd25sb2FkfVxuICAgIC8vICAgdmlld0Jvb2ttYXJrID0gJHt0aGlzLnZpZXdCb29rbWFya31cbiAgICAvLyAgIHByaW50ID0gJHt0aGlzLnByaW50fVxuICAgIC8vICAgc3RhcnRQcmludCA9ICR7dGhpcy5zdGFydFByaW50fVxuICAgIC8vICAgZnVsbFNjcmVlbiA9ICR7dGhpcy5mdWxsU2NyZWVufVxuICAgIC8vICAgZmluZCA9ICR7dGhpcy5maW5kfVxuICAgIC8vICAgbGFzdFBhZ2UgPSAke3RoaXMubGFzdFBhZ2V9XG4gICAgLy8gICByb3RhdGVjdyA9ICR7dGhpcy5yb3RhdGVjd31cbiAgICAvLyAgIHJvdGF0ZWNjdyA9ICR7dGhpcy5yb3RhdGVjY3d9XG4gICAgLy8gICBjdXJzb3IgPSAke3RoaXMuY3Vyc29yfVxuICAgIC8vICAgc2Nyb2xsTW9kZSA9ICR7dGhpcy5zY3JvbGx9XG4gICAgLy8gICBzcHJlYWQgPSAke3RoaXMuc3ByZWFkfVxuICAgIC8vICAgcGFnZSA9ICR7dGhpcy5wYWdlfVxuICAgIC8vICAgem9vbSA9ICR7dGhpcy56b29tfVxuICAgIC8vICAgbmFtZWRkZXN0ID0gJHt0aGlzLm5hbWVkZGVzdH1cbiAgICAvLyAgIHBhZ2Vtb2RlID0gJHt0aGlzLnBhZ2Vtb2RlfVxuICAgIC8vICAgcGFnZW1vZGUgPSAke3RoaXMuZXJyb3JPdmVycmlkZX1cbiAgICAvLyAgIHBhZ2Vtb2RlID0gJHt0aGlzLmVycm9yQXBwZW5kfVxuICAgIC8vICAgcGFnZW1vZGUgPSAke3RoaXMuZXJyb3JNZXNzYWdlfVxuICAgIC8vIGApO1xuICB9XG59Il19