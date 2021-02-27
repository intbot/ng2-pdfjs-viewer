import { Component, ViewChild, Input, Output, EventEmitter, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * @fileoverview added by tsickle
 * Generated from: ng2-pdfjs-viewer.component.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
var PdfJsViewerComponent = /** @class */ (function () {
    function PdfJsViewerComponent() {
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
    Object.defineProperty(PdfJsViewerComponent.prototype, "page", {
        get: /**
         * @return {?}
         */
        function () {
            if (this.PDFViewerApplication) {
                return this.PDFViewerApplication.page;
            }
            else {
                if (this.diagnosticLogs)
                    console.warn("Document is not loaded yet!!!. Try to retrieve page# after full load.");
            }
        },
        set: /**
         * @param {?} _page
         * @return {?}
         */
        function (_page) {
            this._page = _page;
            if (this.PDFViewerApplication) {
                this.PDFViewerApplication.page = this._page;
            }
            else {
                if (this.diagnosticLogs)
                    console.warn("Document is not loaded yet!!!. Try to set page# after full load. Ignore this warning if you are not setting page# using '.' notation. (E.g. pdfViewer.page = 5;)");
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PdfJsViewerComponent.prototype, "pdfSrc", {
        get: /**
         * @return {?}
         */
        function () {
            return this._src;
        },
        set: /**
         * @param {?} _src
         * @return {?}
         */
        function (_src) {
            this._src = _src;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PdfJsViewerComponent.prototype, "PDFViewerApplicationOptions", {
        get: /**
         * @return {?}
         */
        function () {
            /** @type {?} */
            var pdfViewerOptions = null;
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
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PdfJsViewerComponent.prototype, "PDFViewerApplication", {
        get: /**
         * @return {?}
         */
        function () {
            /** @type {?} */
            var pdfViewer = null;
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
        },
        enumerable: false,
        configurable: true
    });
    /**
     * @param {?} viewerEvent
     * @return {?}
     */
    PdfJsViewerComponent.prototype.receiveMessage = /**
     * @param {?} viewerEvent
     * @return {?}
     */
    function (viewerEvent) {
        if (viewerEvent.data && viewerEvent.data.viewerId && viewerEvent.data.event) {
            /** @type {?} */
            var viewerId = viewerEvent.data.viewerId;
            /** @type {?} */
            var event_1 = viewerEvent.data.event;
            /** @type {?} */
            var param = viewerEvent.data.param;
            if (this.viewerId == viewerId) {
                if (this.onBeforePrint && event_1 == "beforePrint") {
                    this.onBeforePrint.emit();
                }
                else if (this.onAfterPrint && event_1 == "afterPrint") {
                    this.onAfterPrint.emit();
                }
                else if (this.onDocumentLoad && event_1 == "pagesLoaded") {
                    this.onDocumentLoad.emit(param);
                }
                else if (this.onPageChange && event_1 == "pageChange") {
                    this.onPageChange.emit(param);
                }
            }
        }
    };
    /**
     * @return {?}
     */
    PdfJsViewerComponent.prototype.ngOnInit = /**
     * @return {?}
     */
    function () {
        window.addEventListener("message", this.receiveMessage.bind(this), false);
        if (!this.externalWindow) { // Load pdf for embedded views
            this.loadPdf();
        }
    };
    /**
     * @return {?}
     */
    PdfJsViewerComponent.prototype.refresh = /**
     * @return {?}
     */
    function () {
        this.loadPdf();
    };
    /**
     * @private
     * @return {?}
     */
    PdfJsViewerComponent.prototype.loadPdf = /**
     * @private
     * @return {?}
     */
    function () {
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
                this.viewerTab.document.write("\n          <style>\n          .loader {\n            position: fixed;\n            left: 40%;\n            top: 40%;\n            border: 16px solid #f3f3f3;\n            border-radius: 50%;\n            border-top: 16px solid #3498db;\n            width: 120px;\n            height: 120px;\n            animation: spin 2s linear infinite;\n          }\n          @keyframes spin {\n            0% {\n              transform: rotate(0deg);\n            }\n            100% {\n              transform: rotate(360deg);\n            }\n          }\n          </style>\n          <div class=\"loader\"></div>\n        ");
            }
        }
        /** @type {?} */
        var fileUrl;
        //if (typeof this.src === "string") {
        //  fileUrl = this.src;
        //}
        if (this._src instanceof Blob) {
            fileUrl = encodeURIComponent(URL.createObjectURL(this._src));
        }
        else if (this._src instanceof Uint8Array) {
            /** @type {?} */
            var blob = new Blob([this._src], { type: "application/pdf" });
            fileUrl = encodeURIComponent(URL.createObjectURL(blob));
        }
        else {
            fileUrl = this._src;
        }
        /** @type {?} */
        var viewerUrl;
        if (this.viewerFolder) {
            viewerUrl = this.viewerFolder + "/web/viewer.html";
        }
        else {
            viewerUrl = "assets/pdfjs/web/viewer.html";
        }
        viewerUrl += "?file=" + fileUrl;
        if (typeof this.viewerId !== 'undefined') {
            viewerUrl += "&viewerId=" + this.viewerId;
        }
        if (typeof this.onBeforePrint !== 'undefined') {
            viewerUrl += "&beforePrint=true";
        }
        if (typeof this.onAfterPrint !== 'undefined') {
            viewerUrl += "&afterPrint=true";
        }
        if (typeof this.onDocumentLoad !== 'undefined') {
            viewerUrl += "&pagesLoaded=true";
        }
        if (typeof this.onPageChange !== 'undefined') {
            viewerUrl += "&pageChange=true";
        }
        if (this.downloadFileName) {
            if (!this.downloadFileName.endsWith(".pdf")) {
                this.downloadFileName += ".pdf";
            }
            viewerUrl += "&fileName=" + this.downloadFileName;
        }
        if (typeof this.openFile !== 'undefined') {
            viewerUrl += "&openFile=" + this.openFile;
        }
        if (typeof this.download !== 'undefined') {
            viewerUrl += "&download=" + this.download;
        }
        if (this.startDownload) {
            viewerUrl += "&startDownload=" + this.startDownload;
        }
        if (typeof this.viewBookmark !== 'undefined') {
            viewerUrl += "&viewBookmark=" + this.viewBookmark;
        }
        if (typeof this.print !== 'undefined') {
            viewerUrl += "&print=" + this.print;
        }
        if (this.startPrint) {
            viewerUrl += "&startPrint=" + this.startPrint;
        }
        if (typeof this.fullScreen !== 'undefined') {
            viewerUrl += "&fullScreen=" + this.fullScreen;
        }
        // if (this.showFullScreen) {
        //   viewerUrl += `&showFullScreen=${this.showFullScreen}`;
        // }
        if (typeof this.find !== 'undefined') {
            viewerUrl += "&find=" + this.find;
        }
        if (this.lastPage) {
            viewerUrl += "&lastpage=" + this.lastPage;
        }
        if (this.rotatecw) {
            viewerUrl += "&rotatecw=" + this.rotatecw;
        }
        if (this.rotateccw) {
            viewerUrl += "&rotateccw=" + this.rotateccw;
        }
        if (this.cursor) {
            viewerUrl += "&cursor=" + this.cursor;
        }
        if (this.scroll) {
            viewerUrl += "&scroll=" + this.scroll;
        }
        if (this.spread) {
            viewerUrl += "&spread=" + this.spread;
        }
        if (this.locale) {
            viewerUrl += "&locale=" + this.locale;
        }
        if (this.useOnlyCssZoom) {
            viewerUrl += "&useOnlyCssZoom=" + this.useOnlyCssZoom;
        }
        if (this._page || this.zoom || this.nameddest || this.pagemode)
            viewerUrl += "#";
        if (this._page) {
            viewerUrl += "&page=" + this._page;
        }
        if (this.zoom) {
            viewerUrl += "&zoom=" + this.zoom;
        }
        if (this.nameddest) {
            viewerUrl += "&nameddest=" + this.nameddest;
        }
        if (this.pagemode) {
            viewerUrl += "&pagemode=" + this.pagemode;
        }
        if (this.errorOverride || this.errorAppend) {
            viewerUrl += "&errorMessage=" + this.errorMessage;
            if (this.errorOverride) {
                viewerUrl += "&errorOverride=" + this.errorOverride;
            }
            if (this.errorAppend) {
                viewerUrl += "&errorAppend=" + this.errorAppend;
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
    };
    PdfJsViewerComponent.decorators = [
        { type: Component, args: [{
                    selector: 'ng2-pdfjs-viewer',
                    template: "<iframe title=\"ng2-pdfjs-viewer\" [hidden]=\"externalWindow || (!externalWindow && !pdfSrc)\" #iframe width=\"100%\" height=\"100%\"></iframe>"
                },] }
    ];
    PdfJsViewerComponent.propDecorators = {
        iframe: [{ type: ViewChild, args: ['iframe', { static: true },] }],
        viewerId: [{ type: Input }],
        onBeforePrint: [{ type: Output }],
        onAfterPrint: [{ type: Output }],
        onDocumentLoad: [{ type: Output }],
        onPageChange: [{ type: Output }],
        viewerFolder: [{ type: Input }],
        externalWindow: [{ type: Input }],
        showSpinner: [{ type: Input }],
        downloadFileName: [{ type: Input }],
        openFile: [{ type: Input }],
        download: [{ type: Input }],
        startDownload: [{ type: Input }],
        viewBookmark: [{ type: Input }],
        print: [{ type: Input }],
        startPrint: [{ type: Input }],
        fullScreen: [{ type: Input }],
        find: [{ type: Input }],
        zoom: [{ type: Input }],
        nameddest: [{ type: Input }],
        pagemode: [{ type: Input }],
        lastPage: [{ type: Input }],
        rotatecw: [{ type: Input }],
        rotateccw: [{ type: Input }],
        cursor: [{ type: Input }],
        scroll: [{ type: Input }],
        spread: [{ type: Input }],
        locale: [{ type: Input }],
        useOnlyCssZoom: [{ type: Input }],
        errorOverride: [{ type: Input }],
        errorAppend: [{ type: Input }],
        errorMessage: [{ type: Input }],
        diagnosticLogs: [{ type: Input }],
        externalWindowOptions: [{ type: Input }],
        page: [{ type: Input }],
        pdfSrc: [{ type: Input }]
    };
    return PdfJsViewerComponent;
}());

/**
 * @fileoverview added by tsickle
 * Generated from: index.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
var PdfJsViewerModule = /** @class */ (function () {
    function PdfJsViewerModule() {
    }
    /**
     * @return {?}
     */
    PdfJsViewerModule.forRoot = /**
     * @return {?}
     */
    function () {
        return {
            ngModule: PdfJsViewerModule
        };
    };
    PdfJsViewerModule.decorators = [
        { type: NgModule, args: [{
                    imports: [
                        CommonModule
                    ],
                    declarations: [
                        PdfJsViewerComponent
                    ],
                    exports: [
                        PdfJsViewerComponent
                    ]
                },] }
    ];
    return PdfJsViewerModule;
}());

export { PdfJsViewerModule, PdfJsViewerComponent };
