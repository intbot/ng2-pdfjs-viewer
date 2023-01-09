import { Component, Input, Output, ViewChild, EventEmitter } from '@angular/core';
import * as i0 from "@angular/core";
export class PdfJsViewerComponent {
    constructor() {
        this.onBeforePrint = new EventEmitter();
        this.onAfterPrint = new EventEmitter();
        this.onDocumentLoad = new EventEmitter();
        this.onPageChange = new EventEmitter();
        this.externalWindow = false;
        this.target = '_blank';
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
            this.viewerTab = window.open('', this.target, this.externalWindowOptions || '');
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
PdfJsViewerComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "15.0.4", type: PdfJsViewerComponent, selector: "ng2-pdfjs-viewer", inputs: { viewerId: "viewerId", viewerFolder: "viewerFolder", externalWindow: "externalWindow", target: "target", showSpinner: "showSpinner", downloadFileName: "downloadFileName", openFile: "openFile", download: "download", startDownload: "startDownload", viewBookmark: "viewBookmark", print: "print", startPrint: "startPrint", fullScreen: "fullScreen", find: "find", zoom: "zoom", nameddest: "nameddest", pagemode: "pagemode", lastPage: "lastPage", rotatecw: "rotatecw", rotateccw: "rotateccw", cursor: "cursor", scroll: "scroll", spread: "spread", locale: "locale", useOnlyCssZoom: "useOnlyCssZoom", errorOverride: "errorOverride", errorAppend: "errorAppend", errorMessage: "errorMessage", diagnosticLogs: "diagnosticLogs", externalWindowOptions: "externalWindowOptions", page: "page", pdfSrc: "pdfSrc" }, outputs: { onBeforePrint: "onBeforePrint", onAfterPrint: "onAfterPrint", onDocumentLoad: "onDocumentLoad", onPageChange: "onPageChange" }, viewQueries: [{ propertyName: "iframe", first: true, predicate: ["iframe"], descendants: true, static: true }], ngImport: i0, template: `<iframe title="ng2-pdfjs-viewer" [hidden]="externalWindow || (!externalWindow && !pdfSrc)" #iframe width="100%" height="100%"></iframe>`, isInline: true });
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
            }], target: [{
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmcyLXBkZmpzLXZpZXdlci5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbmcyLXBkZmpzLXZpZXdlci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxZQUFZLEVBQWMsTUFBTSxlQUFlLENBQUM7O0FBTTlGLE1BQU0sT0FBTyxvQkFBb0I7SUFKakM7UUFPWSxrQkFBYSxHQUFzQixJQUFJLFlBQVksRUFBRSxDQUFDO1FBQ3RELGlCQUFZLEdBQXNCLElBQUksWUFBWSxFQUFFLENBQUM7UUFDckQsbUJBQWMsR0FBc0IsSUFBSSxZQUFZLEVBQUUsQ0FBQztRQUN2RCxpQkFBWSxHQUFzQixJQUFJLFlBQVksRUFBRSxDQUFDO1FBRS9DLG1CQUFjLEdBQVksS0FBSyxDQUFDO1FBQ2hDLFdBQU0sR0FBVyxRQUFRLENBQUM7UUFDMUIsZ0JBQVcsR0FBWSxJQUFJLENBQUM7UUFFNUIsYUFBUSxHQUFZLElBQUksQ0FBQztRQUN6QixhQUFRLEdBQVksSUFBSSxDQUFDO1FBRXpCLGlCQUFZLEdBQVksSUFBSSxDQUFDO1FBQzdCLFVBQUssR0FBWSxJQUFJLENBQUM7UUFFdEIsZUFBVSxHQUFZLElBQUksQ0FBQztRQUMzQywwQ0FBMEM7UUFDMUIsU0FBSSxHQUFZLElBQUksQ0FBQztRQVdyQixtQkFBYyxHQUFZLEtBQUssQ0FBQztRQUNoQyxrQkFBYSxHQUFZLEtBQUssQ0FBQztRQUMvQixnQkFBVyxHQUFZLElBQUksQ0FBQztRQUU1QixtQkFBYyxHQUFZLElBQUksQ0FBQztLQXVTaEQ7SUFoU0MsSUFDVyxJQUFJLENBQUMsS0FBYTtRQUMzQixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNuQixJQUFHLElBQUksQ0FBQyxvQkFBb0IsRUFBRTtZQUM1QixJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFB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QUk7c0JBQW5CLEtBQUs7Z0JBQ1UsSUFBSTtzQkFBbkIsS0FBSztnQkFDVSxTQUFTO3NCQUF4QixLQUFLO2dCQUNVLFFBQVE7c0JBQXZCLEtBQUs7Z0JBQ1UsUUFBUTtzQkFBdkIsS0FBSztnQkFDVSxRQUFRO3NCQUF2QixLQUFLO2dCQUNVLFNBQVM7c0JBQXhCLEtBQUs7Z0JBQ1UsTUFBTTtzQkFBckIsS0FBSztnQkFDVSxNQUFNO3NCQUFyQixLQUFLO2dCQUNVLE1BQU07c0JBQXJCLEtBQUs7Z0JBQ1UsTUFBTTtzQkFBckIsS0FBSztnQkFDVSxjQUFjO3NCQUE3QixLQUFLO2dCQUNVLGFBQWE7c0JBQTVCLEtBQUs7Z0JBQ1UsV0FBVztzQkFBMUIsS0FBSztnQkFDVSxZQUFZO3NCQUEzQixLQUFLO2dCQUNVLGNBQWM7c0JBQTdCLEtBQUs7Z0JBRVUscUJBQXFCO3NCQUFwQyxLQUFLO2dCQU1LLElBQUk7c0JBRGQsS0FBSztnQkFtQkssTUFBTTtzQkFEaEIsS0FBSyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgSW5wdXQsIE91dHB1dCwgVmlld0NoaWxkLCBFdmVudEVtaXR0ZXIsIEVsZW1lbnRSZWYgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuXHJcbkBDb21wb25lbnQoe1xyXG4gIHNlbGVjdG9yOiAnbmcyLXBkZmpzLXZpZXdlcicsXHJcbiAgdGVtcGxhdGU6IGA8aWZyYW1lIHRpdGxlPVwibmcyLXBkZmpzLXZpZXdlclwiIFtoaWRkZW5dPVwiZXh0ZXJuYWxXaW5kb3cgfHwgKCFleHRlcm5hbFdpbmRvdyAmJiAhcGRmU3JjKVwiICNpZnJhbWUgd2lkdGg9XCIxMDAlXCIgaGVpZ2h0PVwiMTAwJVwiPjwvaWZyYW1lPmBcclxufSlcclxuZXhwb3J0IGNsYXNzIFBkZkpzVmlld2VyQ29tcG9uZW50IHtcclxuICBAVmlld0NoaWxkKCdpZnJhbWUnLCB7c3RhdGljOiB0cnVlfSkgaWZyYW1lOiBFbGVtZW50UmVmO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyB2aWV3ZXJJZDogc3RyaW5nO1xyXG4gIEBPdXRwdXQoKSBvbkJlZm9yZVByaW50OiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcclxuICBAT3V0cHV0KCkgb25BZnRlclByaW50OiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcclxuICBAT3V0cHV0KCkgb25Eb2N1bWVudExvYWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xyXG4gIEBPdXRwdXQoKSBvblBhZ2VDaGFuZ2U6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyB2aWV3ZXJGb2xkZXI6IHN0cmluZztcclxuICBASW5wdXQoKSBwdWJsaWMgZXh0ZXJuYWxXaW5kb3c6IGJvb2xlYW4gPSBmYWxzZTtcclxuICBASW5wdXQoKSBwdWJsaWMgdGFyZ2V0OiBzdHJpbmcgPSAnX2JsYW5rJztcclxuICBASW5wdXQoKSBwdWJsaWMgc2hvd1NwaW5uZXI6IGJvb2xlYW4gPSB0cnVlO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyBkb3dubG9hZEZpbGVOYW1lOiBzdHJpbmc7XHJcbiAgQElucHV0KCkgcHVibGljIG9wZW5GaWxlOiBib29sZWFuID0gdHJ1ZTtcclxuICBASW5wdXQoKSBwdWJsaWMgZG93bmxvYWQ6IGJvb2xlYW4gPSB0cnVlO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyBzdGFydERvd25sb2FkOiBib29sZWFuO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyB2aWV3Qm9va21hcms6IGJvb2xlYW4gPSB0cnVlO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyBwcmludDogYm9vbGVhbiA9IHRydWU7XHJcbiAgQElucHV0KCkgcHVibGljIHN0YXJ0UHJpbnQ6IGJvb2xlYW47XHJcbiAgQElucHV0KCkgcHVibGljIGZ1bGxTY3JlZW46IGJvb2xlYW4gPSB0cnVlO1xyXG4gIC8vQElucHV0KCkgcHVibGljIHNob3dGdWxsU2NyZWVuOiBib29sZWFuO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyBmaW5kOiBib29sZWFuID0gdHJ1ZTtcclxuICBASW5wdXQoKSBwdWJsaWMgem9vbTogc3RyaW5nO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyBuYW1lZGRlc3Q6IHN0cmluZztcclxuICBASW5wdXQoKSBwdWJsaWMgcGFnZW1vZGU6IHN0cmluZztcclxuICBASW5wdXQoKSBwdWJsaWMgbGFzdFBhZ2U6IGJvb2xlYW47XHJcbiAgQElucHV0KCkgcHVibGljIHJvdGF0ZWN3OiBib29sZWFuO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyByb3RhdGVjY3c6IGJvb2xlYW47XHJcbiAgQElucHV0KCkgcHVibGljIGN1cnNvcjogc3RyaW5nO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyBzY3JvbGw6IHN0cmluZztcclxuICBASW5wdXQoKSBwdWJsaWMgc3ByZWFkOiBzdHJpbmc7XHJcbiAgQElucHV0KCkgcHVibGljIGxvY2FsZTogc3RyaW5nO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyB1c2VPbmx5Q3NzWm9vbTogYm9vbGVhbiA9IGZhbHNlO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyBlcnJvck92ZXJyaWRlOiBib29sZWFuID0gZmFsc2U7XHJcbiAgQElucHV0KCkgcHVibGljIGVycm9yQXBwZW5kOiBib29sZWFuID0gdHJ1ZTtcclxuICBASW5wdXQoKSBwdWJsaWMgZXJyb3JNZXNzYWdlOiBzdHJpbmc7XHJcbiAgQElucHV0KCkgcHVibGljIGRpYWdub3N0aWNMb2dzOiBib29sZWFuID0gdHJ1ZTtcclxuICBcclxuICBASW5wdXQoKSBwdWJsaWMgZXh0ZXJuYWxXaW5kb3dPcHRpb25zOiBzdHJpbmc7XHJcbiAgcHVibGljIHZpZXdlclRhYjogYW55O1xyXG4gIHByaXZhdGUgX3NyYzogc3RyaW5nIHwgQmxvYiB8IFVpbnQ4QXJyYXk7XHJcbiAgcHJpdmF0ZSBfcGFnZTogbnVtYmVyO1xyXG4gIFxyXG4gIEBJbnB1dCgpXHJcbiAgcHVibGljIHNldCBwYWdlKF9wYWdlOiBudW1iZXIpIHtcclxuICAgIHRoaXMuX3BhZ2UgPSBfcGFnZTtcclxuICAgIGlmKHRoaXMuUERGVmlld2VyQXBwbGljYXRpb24pIHtcclxuICAgICAgdGhpcy5QREZWaWV3ZXJBcHBsaWNhdGlvbi5wYWdlID0gdGhpcy5fcGFnZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGlmKHRoaXMuZGlhZ25vc3RpY0xvZ3MpIGNvbnNvbGUud2FybihcIkRvY3VtZW50IGlzIG5vdCBsb2FkZWQgeWV0ISEhLiBUcnkgdG8gc2V0IHBhZ2UjIGFmdGVyIGZ1bGwgbG9hZC4gSWdub3JlIHRoaXMgd2FybmluZyBpZiB5b3UgYXJlIG5vdCBzZXR0aW5nIHBhZ2UjIHVzaW5nICcuJyBub3RhdGlvbi4gKEUuZy4gcGRmVmlld2VyLnBhZ2UgPSA1OylcIik7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0IHBhZ2UoKSB7XHJcbiAgICBpZih0aGlzLlBERlZpZXdlckFwcGxpY2F0aW9uKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLlBERlZpZXdlckFwcGxpY2F0aW9uLnBhZ2U7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBpZih0aGlzLmRpYWdub3N0aWNMb2dzKSBjb25zb2xlLndhcm4oXCJEb2N1bWVudCBpcyBub3QgbG9hZGVkIHlldCEhIS4gVHJ5IHRvIHJldHJpZXZlIHBhZ2UjIGFmdGVyIGZ1bGwgbG9hZC5cIik7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBASW5wdXQoKVxyXG4gIHB1YmxpYyBzZXQgcGRmU3JjKF9zcmM6IHN0cmluZyB8IEJsb2IgfCBVaW50OEFycmF5KSB7XHJcbiAgICB0aGlzLl9zcmMgPSBfc3JjO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldCBwZGZTcmMoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5fc3JjO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldCBQREZWaWV3ZXJBcHBsaWNhdGlvbk9wdGlvbnMoKSB7XHJcbiAgICBsZXQgcGRmVmlld2VyT3B0aW9ucyA9IG51bGw7XHJcbiAgICBpZiAodGhpcy5leHRlcm5hbFdpbmRvdykge1xyXG4gICAgICBpZiAodGhpcy52aWV3ZXJUYWIpIHtcclxuICAgICAgICBwZGZWaWV3ZXJPcHRpb25zID0gdGhpcy52aWV3ZXJUYWIuUERGVmlld2VyQXBwbGljYXRpb25PcHRpb25zO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBpZiAodGhpcy5pZnJhbWUubmF0aXZlRWxlbWVudC5jb250ZW50V2luZG93KSB7XHJcbiAgICAgICAgcGRmVmlld2VyT3B0aW9ucyA9IHRoaXMuaWZyYW1lLm5hdGl2ZUVsZW1lbnQuY29udGVudFdpbmRvdy5QREZWaWV3ZXJBcHBsaWNhdGlvbk9wdGlvbnM7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBwZGZWaWV3ZXJPcHRpb25zO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldCBQREZWaWV3ZXJBcHBsaWNhdGlvbigpIHtcclxuICAgIGxldCBwZGZWaWV3ZXIgPSBudWxsO1xyXG4gICAgaWYgKHRoaXMuZXh0ZXJuYWxXaW5kb3cpIHtcclxuICAgICAgaWYgKHRoaXMudmlld2VyVGFiKSB7XHJcbiAgICAgICAgcGRmVmlld2VyID0gdGhpcy52aWV3ZXJUYWIuUERGVmlld2VyQXBwbGljYXRpb247XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGlmICh0aGlzLmlmcmFtZS5uYXRpdmVFbGVtZW50LmNvbnRlbnRXaW5kb3cpIHtcclxuICAgICAgICBwZGZWaWV3ZXIgPSB0aGlzLmlmcmFtZS5uYXRpdmVFbGVtZW50LmNvbnRlbnRXaW5kb3cuUERGVmlld2VyQXBwbGljYXRpb247XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBwZGZWaWV3ZXI7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgcmVjZWl2ZU1lc3NhZ2Uodmlld2VyRXZlbnQpICB7XHJcbiAgICBpZiAodmlld2VyRXZlbnQuZGF0YSAmJiB2aWV3ZXJFdmVudC5kYXRhLnZpZXdlcklkICYmIHZpZXdlckV2ZW50LmRhdGEuZXZlbnQpIHtcclxuICAgICAgbGV0IHZpZXdlcklkID0gdmlld2VyRXZlbnQuZGF0YS52aWV3ZXJJZDtcclxuICAgICAgbGV0IGV2ZW50ID0gdmlld2VyRXZlbnQuZGF0YS5ldmVudDtcclxuICAgICAgbGV0IHBhcmFtID0gdmlld2VyRXZlbnQuZGF0YS5wYXJhbTtcclxuICAgICAgaWYgKHRoaXMudmlld2VySWQgPT0gdmlld2VySWQpIHtcclxuICAgICAgICBpZiAodGhpcy5vbkJlZm9yZVByaW50ICYmIGV2ZW50ID09IFwiYmVmb3JlUHJpbnRcIikge1xyXG4gICAgICAgICAgdGhpcy5vbkJlZm9yZVByaW50LmVtaXQoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAodGhpcy5vbkFmdGVyUHJpbnQgJiYgZXZlbnQgPT0gXCJhZnRlclByaW50XCIpIHtcclxuICAgICAgICAgIHRoaXMub25BZnRlclByaW50LmVtaXQoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAodGhpcy5vbkRvY3VtZW50TG9hZCAmJiBldmVudCA9PSBcInBhZ2VzTG9hZGVkXCIpIHtcclxuICAgICAgICAgIHRoaXMub25Eb2N1bWVudExvYWQuZW1pdChwYXJhbSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHRoaXMub25QYWdlQ2hhbmdlICYmIGV2ZW50ID09IFwicGFnZUNoYW5nZVwiKSB7XHJcbiAgICAgICAgICB0aGlzLm9uUGFnZUNoYW5nZS5lbWl0KHBhcmFtKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIG5nT25Jbml0KCk6IHZvaWQge1xyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtZXNzYWdlXCIsIHRoaXMucmVjZWl2ZU1lc3NhZ2UuYmluZCh0aGlzKSwgZmFsc2UpO1xyXG4gICAgaWYgKCF0aGlzLmV4dGVybmFsV2luZG93KSB7IC8vIExvYWQgcGRmIGZvciBlbWJlZGRlZCB2aWV3c1xyXG4gICAgICB0aGlzLmxvYWRQZGYoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyByZWZyZXNoKCk6IHZvaWQgeyAvLyBOZWVkcyB0byBiZSBpbnZva2VkIGZvciBleHRlcm5hbCB3aW5kb3cgb3Igd2hlbiBuZWVkcyB0byByZWxvYWQgcGRmXHJcbiAgICB0aGlzLmxvYWRQZGYoKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgbG9hZFBkZigpIHtcclxuICAgIGlmICghdGhpcy5fc3JjKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBjb25zb2xlLmxvZyhgVGFiIGlzIC0gJHt0aGlzLnZpZXdlclRhYn1gKTtcclxuICAgIC8vIGlmICh0aGlzLnZpZXdlclRhYikge1xyXG4gICAgLy8gICBjb25zb2xlLmxvZyhgU3RhdHVzIG9mIHdpbmRvdyAtICR7dGhpcy52aWV3ZXJUYWIuY2xvc2VkfWApO1xyXG4gICAgLy8gfVxyXG5cclxuICAgIGlmICh0aGlzLmV4dGVybmFsV2luZG93ICYmICh0eXBlb2YgdGhpcy52aWV3ZXJUYWIgPT09ICd1bmRlZmluZWQnIHx8IHRoaXMudmlld2VyVGFiLmNsb3NlZCkpIHtcclxuICAgICAgdGhpcy52aWV3ZXJUYWIgPSB3aW5kb3cub3BlbignJywgdGhpcy50YXJnZXQsIHRoaXMuZXh0ZXJuYWxXaW5kb3dPcHRpb25zIHx8ICcnKTtcclxuICAgICAgaWYgKHRoaXMudmlld2VyVGFiID09IG51bGwpIHtcclxuICAgICAgICBpZih0aGlzLmRpYWdub3N0aWNMb2dzKSBjb25zb2xlLmVycm9yKFwibmcyLXBkZmpzLXZpZXdlcjogRm9yICdleHRlcm5hbFdpbmRvdyA9IHRydWUnLiBpLmUgb3BlbmluZyBpbiBuZXcgdGFiIHRvIHdvcmssIHBvcC11cHMgc2hvdWxkIGJlIGVuYWJsZWQuXCIpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKHRoaXMuc2hvd1NwaW5uZXIpIHtcclxuICAgICAgICB0aGlzLnZpZXdlclRhYi5kb2N1bWVudC53cml0ZShgXHJcbiAgICAgICAgICA8c3R5bGU+XHJcbiAgICAgICAgICAubG9hZGVyIHtcclxuICAgICAgICAgICAgcG9zaXRpb246IGZpeGVkO1xyXG4gICAgICAgICAgICBsZWZ0OiA0MCU7XHJcbiAgICAgICAgICAgIHRvcDogNDAlO1xyXG4gICAgICAgICAgICBib3JkZXI6IDE2cHggc29saWQgI2YzZjNmMztcclxuICAgICAgICAgICAgYm9yZGVyLXJhZGl1czogNTAlO1xyXG4gICAgICAgICAgICBib3JkZXItdG9wOiAxNnB4IHNvbGlkICMzNDk4ZGI7XHJcbiAgICAgICAgICAgIHdpZHRoOiAxMjBweDtcclxuICAgICAgICAgICAgaGVpZ2h0OiAxMjBweDtcclxuICAgICAgICAgICAgYW5pbWF0aW9uOiBzcGluIDJzIGxpbmVhciBpbmZpbml0ZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIEBrZXlmcmFtZXMgc3BpbiB7XHJcbiAgICAgICAgICAgIDAlIHtcclxuICAgICAgICAgICAgICB0cmFuc2Zvcm06IHJvdGF0ZSgwZGVnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAxMDAlIHtcclxuICAgICAgICAgICAgICB0cmFuc2Zvcm06IHJvdGF0ZSgzNjBkZWcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICA8L3N0eWxlPlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cImxvYWRlclwiPjwvZGl2PlxyXG4gICAgICAgIGApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGZpbGVVcmw7XHJcbiAgICAvL2lmICh0eXBlb2YgdGhpcy5zcmMgPT09IFwic3RyaW5nXCIpIHtcclxuICAgIC8vICBmaWxlVXJsID0gdGhpcy5zcmM7XHJcbiAgICAvL31cclxuICAgIGlmICh0aGlzLl9zcmMgaW5zdGFuY2VvZiBCbG9iKSB7XHJcbiAgICAgIGZpbGVVcmwgPSBlbmNvZGVVUklDb21wb25lbnQoVVJMLmNyZWF0ZU9iamVjdFVSTCh0aGlzLl9zcmMpKTtcclxuICAgIH0gZWxzZSBpZiAodGhpcy5fc3JjIGluc3RhbmNlb2YgVWludDhBcnJheSkge1xyXG4gICAgICBsZXQgYmxvYiA9IG5ldyBCbG9iKFt0aGlzLl9zcmNdLCB7IHR5cGU6IFwiYXBwbGljYXRpb24vcGRmXCIgfSk7XHJcbiAgICAgIGZpbGVVcmwgPSBlbmNvZGVVUklDb21wb25lbnQoVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iKSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBmaWxlVXJsID0gdGhpcy5fc3JjO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCB2aWV3ZXJVcmw7XHJcbiAgICBpZiAodGhpcy52aWV3ZXJGb2xkZXIpIHtcclxuICAgICAgdmlld2VyVXJsID0gYCR7dGhpcy52aWV3ZXJGb2xkZXJ9L3dlYi92aWV3ZXIuaHRtbGA7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB2aWV3ZXJVcmwgPSBgYXNzZXRzL3BkZmpzL3dlYi92aWV3ZXIuaHRtbGA7XHJcbiAgICB9XHJcblxyXG4gICAgdmlld2VyVXJsICs9IGA/ZmlsZT0ke2ZpbGVVcmx9YDtcclxuXHJcbiAgICBpZiAodHlwZW9mIHRoaXMudmlld2VySWQgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgIHZpZXdlclVybCArPSBgJnZpZXdlcklkPSR7dGhpcy52aWV3ZXJJZH1gO1xyXG4gICAgfVxyXG4gICAgaWYgKHR5cGVvZiB0aGlzLm9uQmVmb3JlUHJpbnQgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgIHZpZXdlclVybCArPSBgJmJlZm9yZVByaW50PXRydWVgO1xyXG4gICAgfVxyXG4gICAgaWYgKHR5cGVvZiB0aGlzLm9uQWZ0ZXJQcmludCAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgdmlld2VyVXJsICs9IGAmYWZ0ZXJQcmludD10cnVlYDtcclxuICAgIH1cclxuICAgIGlmICh0eXBlb2YgdGhpcy5vbkRvY3VtZW50TG9hZCAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgdmlld2VyVXJsICs9IGAmcGFnZXNMb2FkZWQ9dHJ1ZWA7XHJcbiAgICB9XHJcbiAgICBpZiAodHlwZW9mIHRoaXMub25QYWdlQ2hhbmdlICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICB2aWV3ZXJVcmwgKz0gYCZwYWdlQ2hhbmdlPXRydWVgO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLmRvd25sb2FkRmlsZU5hbWUpIHtcclxuICAgICAgaWYoIXRoaXMuZG93bmxvYWRGaWxlTmFtZS5lbmRzV2l0aChcIi5wZGZcIikpIHtcclxuICAgICAgICB0aGlzLmRvd25sb2FkRmlsZU5hbWUgKz0gXCIucGRmXCI7XHJcbiAgICAgIH1cclxuICAgICAgdmlld2VyVXJsICs9IGAmZmlsZU5hbWU9JHt0aGlzLmRvd25sb2FkRmlsZU5hbWV9YDtcclxuICAgIH1cclxuICAgIGlmICh0eXBlb2YgdGhpcy5vcGVuRmlsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgdmlld2VyVXJsICs9IGAmb3BlbkZpbGU9JHt0aGlzLm9wZW5GaWxlfWA7XHJcbiAgICB9XHJcbiAgICBpZiAodHlwZW9mIHRoaXMuZG93bmxvYWQgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgIHZpZXdlclVybCArPSBgJmRvd25sb2FkPSR7dGhpcy5kb3dubG9hZH1gO1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMuc3RhcnREb3dubG9hZCkge1xyXG4gICAgICB2aWV3ZXJVcmwgKz0gYCZzdGFydERvd25sb2FkPSR7dGhpcy5zdGFydERvd25sb2FkfWA7XHJcbiAgICB9XHJcbiAgICBpZiAodHlwZW9mIHRoaXMudmlld0Jvb2ttYXJrICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICB2aWV3ZXJVcmwgKz0gYCZ2aWV3Qm9va21hcms9JHt0aGlzLnZpZXdCb29rbWFya31gO1xyXG4gICAgfVxyXG4gICAgaWYgKHR5cGVvZiB0aGlzLnByaW50ICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICB2aWV3ZXJVcmwgKz0gYCZwcmludD0ke3RoaXMucHJpbnR9YDtcclxuICAgIH1cclxuICAgIGlmICh0aGlzLnN0YXJ0UHJpbnQpIHtcclxuICAgICAgdmlld2VyVXJsICs9IGAmc3RhcnRQcmludD0ke3RoaXMuc3RhcnRQcmludH1gO1xyXG4gICAgfVxyXG4gICAgaWYgKHR5cGVvZiB0aGlzLmZ1bGxTY3JlZW4gIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgIHZpZXdlclVybCArPSBgJmZ1bGxTY3JlZW49JHt0aGlzLmZ1bGxTY3JlZW59YDtcclxuICAgIH1cclxuICAgIC8vIGlmICh0aGlzLnNob3dGdWxsU2NyZWVuKSB7XHJcbiAgICAvLyAgIHZpZXdlclVybCArPSBgJnNob3dGdWxsU2NyZWVuPSR7dGhpcy5zaG93RnVsbFNjcmVlbn1gO1xyXG4gICAgLy8gfVxyXG4gICAgaWYgKHR5cGVvZiB0aGlzLmZpbmQgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgIHZpZXdlclVybCArPSBgJmZpbmQ9JHt0aGlzLmZpbmR9YDtcclxuICAgIH1cclxuICAgIGlmICh0aGlzLmxhc3RQYWdlKSB7XHJcbiAgICAgIHZpZXdlclVybCArPSBgJmxhc3RwYWdlPSR7dGhpcy5sYXN0UGFnZX1gO1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMucm90YXRlY3cpIHtcclxuICAgICAgdmlld2VyVXJsICs9IGAmcm90YXRlY3c9JHt0aGlzLnJvdGF0ZWN3fWA7XHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy5yb3RhdGVjY3cpIHtcclxuICAgICAgdmlld2VyVXJsICs9IGAmcm90YXRlY2N3PSR7dGhpcy5yb3RhdGVjY3d9YDtcclxuICAgIH1cclxuICAgIGlmICh0aGlzLmN1cnNvcikge1xyXG4gICAgICB2aWV3ZXJVcmwgKz0gYCZjdXJzb3I9JHt0aGlzLmN1cnNvcn1gO1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMuc2Nyb2xsKSB7XHJcbiAgICAgIHZpZXdlclVybCArPSBgJnNjcm9sbD0ke3RoaXMuc2Nyb2xsfWA7XHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy5zcHJlYWQpIHtcclxuICAgICAgdmlld2VyVXJsICs9IGAmc3ByZWFkPSR7dGhpcy5zcHJlYWR9YDtcclxuICAgIH1cclxuICAgIGlmICh0aGlzLmxvY2FsZSkge1xyXG4gICAgICB2aWV3ZXJVcmwgKz0gYCZsb2NhbGU9JHt0aGlzLmxvY2FsZX1gO1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMudXNlT25seUNzc1pvb20pIHtcclxuICAgICAgdmlld2VyVXJsICs9IGAmdXNlT25seUNzc1pvb209JHt0aGlzLnVzZU9ubHlDc3Nab29tfWA7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGlmICh0aGlzLl9wYWdlIHx8IHRoaXMuem9vbSB8fCB0aGlzLm5hbWVkZGVzdCB8fCB0aGlzLnBhZ2Vtb2RlKSB2aWV3ZXJVcmwgKz0gXCIjXCJcclxuICAgIGlmICh0aGlzLl9wYWdlKSB7XHJcbiAgICAgIHZpZXdlclVybCArPSBgJnBhZ2U9JHt0aGlzLl9wYWdlfWA7XHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy56b29tKSB7XHJcbiAgICAgIHZpZXdlclVybCArPSBgJnpvb209JHt0aGlzLnpvb219YDtcclxuICAgIH1cclxuICAgIGlmICh0aGlzLm5hbWVkZGVzdCkge1xyXG4gICAgICB2aWV3ZXJVcmwgKz0gYCZuYW1lZGRlc3Q9JHt0aGlzLm5hbWVkZGVzdH1gO1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMucGFnZW1vZGUpIHtcclxuICAgICAgdmlld2VyVXJsICs9IGAmcGFnZW1vZGU9JHt0aGlzLnBhZ2Vtb2RlfWA7XHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy5lcnJvck92ZXJyaWRlIHx8IHRoaXMuZXJyb3JBcHBlbmQpIHtcclxuICAgICAgdmlld2VyVXJsICs9IGAmZXJyb3JNZXNzYWdlPSR7dGhpcy5lcnJvck1lc3NhZ2V9YDtcclxuXHJcbiAgICAgIGlmICh0aGlzLmVycm9yT3ZlcnJpZGUpIHtcclxuICAgICAgICB2aWV3ZXJVcmwgKz0gYCZlcnJvck92ZXJyaWRlPSR7dGhpcy5lcnJvck92ZXJyaWRlfWA7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHRoaXMuZXJyb3JBcHBlbmQpIHtcclxuICAgICAgICB2aWV3ZXJVcmwgKz0gYCZlcnJvckFwcGVuZD0ke3RoaXMuZXJyb3JBcHBlbmR9YDtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLmV4dGVybmFsV2luZG93KSB7XHJcbiAgICAgIHRoaXMudmlld2VyVGFiLmxvY2F0aW9uLmhyZWYgPSB2aWV3ZXJVcmw7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLmlmcmFtZS5uYXRpdmVFbGVtZW50LnNyYyA9IHZpZXdlclVybDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBjb25zb2xlLmxvZyhgXHJcbiAgICAvLyAgIHBkZlNyYyA9ICR7dGhpcy5wZGZTcmN9XHJcbiAgICAvLyAgIGZpbGVVcmwgPSAke2ZpbGVVcmx9XHJcbiAgICAvLyAgIGV4dGVybmFsV2luZG93ID0gJHt0aGlzLmV4dGVybmFsV2luZG93fVxyXG4gICAgLy8gICBkb3dubG9hZEZpbGVOYW1lID0gJHt0aGlzLmRvd25sb2FkRmlsZU5hbWV9XHJcbiAgICAvLyAgIHZpZXdlckZvbGRlciA9ICR7dGhpcy52aWV3ZXJGb2xkZXJ9XHJcbiAgICAvLyAgIG9wZW5GaWxlID0gJHt0aGlzLm9wZW5GaWxlfVxyXG4gICAgLy8gICBkb3dubG9hZCA9ICR7dGhpcy5kb3dubG9hZH1cclxuICAgIC8vICAgc3RhcnREb3dubG9hZCA9ICR7dGhpcy5zdGFydERvd25sb2FkfVxyXG4gICAgLy8gICB2aWV3Qm9va21hcmsgPSAke3RoaXMudmlld0Jvb2ttYXJrfVxyXG4gICAgLy8gICBwcmludCA9ICR7dGhpcy5wcmludH1cclxuICAgIC8vICAgc3RhcnRQcmludCA9ICR7dGhpcy5zdGFydFByaW50fVxyXG4gICAgLy8gICBmdWxsU2NyZWVuID0gJHt0aGlzLmZ1bGxTY3JlZW59XHJcbiAgICAvLyAgIGZpbmQgPSAke3RoaXMuZmluZH1cclxuICAgIC8vICAgbGFzdFBhZ2UgPSAke3RoaXMubGFzdFBhZ2V9XHJcbiAgICAvLyAgIHJvdGF0ZWN3ID0gJHt0aGlzLnJvdGF0ZWN3fVxyXG4gICAgLy8gICByb3RhdGVjY3cgPSAke3RoaXMucm90YXRlY2N3fVxyXG4gICAgLy8gICBjdXJzb3IgPSAke3RoaXMuY3Vyc29yfVxyXG4gICAgLy8gICBzY3JvbGxNb2RlID0gJHt0aGlzLnNjcm9sbH1cclxuICAgIC8vICAgc3ByZWFkID0gJHt0aGlzLnNwcmVhZH1cclxuICAgIC8vICAgcGFnZSA9ICR7dGhpcy5wYWdlfVxyXG4gICAgLy8gICB6b29tID0gJHt0aGlzLnpvb219XHJcbiAgICAvLyAgIG5hbWVkZGVzdCA9ICR7dGhpcy5uYW1lZGRlc3R9XHJcbiAgICAvLyAgIHBhZ2Vtb2RlID0gJHt0aGlzLnBhZ2Vtb2RlfVxyXG4gICAgLy8gICBwYWdlbW9kZSA9ICR7dGhpcy5lcnJvck92ZXJyaWRlfVxyXG4gICAgLy8gICBwYWdlbW9kZSA9ICR7dGhpcy5lcnJvckFwcGVuZH1cclxuICAgIC8vICAgcGFnZW1vZGUgPSAke3RoaXMuZXJyb3JNZXNzYWdlfVxyXG4gICAgLy8gYCk7XHJcbiAgfVxyXG59Il19