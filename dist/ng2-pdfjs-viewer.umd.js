(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('@angular/common')) :
	typeof define === 'function' && define.amd ? define(['exports', '@angular/core', '@angular/common'], factory) :
	(factory((global['ng2-pdfjs-viewer'] = {}),global.core,global.common));
}(this, (function (exports,core,common) { 'use strict';

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
//import viewerHtml from 'pdfjs/web/viewer.html';
//declare var require: any
//require('static-reference')('./pdfjs/web/viewer.html');
//declare var path: any;
var PdfJsViewerComponent = /** @class */ (function () {
    function PdfJsViewerComponent() {
        this.showSpinner = true;
    }
    Object.defineProperty(PdfJsViewerComponent.prototype, "pdfSrc", {
        get: /**
         * @return {?}
         */
        function () {
            return this.innerSrc;
        },
        set: /**
         * @param {?} innerSrc
         * @return {?}
         */
        function (innerSrc) {
            this.innerSrc = innerSrc;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * @return {?}
     */
    PdfJsViewerComponent.prototype.ngOnInit = /**
     * @return {?}
     */
    function () {
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
        if (!this.innerSrc) {
            return;
        }
        // console.log(`Tab is - ${this.viewerTab}`);
        // if (this.viewerTab) {
        //   console.log(`Status of window - ${this.viewerTab.closed}`);
        // }
        if (this.externalWindow && (typeof this.viewerTab === 'undefined' || this.viewerTab.closed)) {
            this.viewerTab = window.open('', '_blank');
            if (this.viewerTab == null) {
                console.log("ng2-pdfjs-viewer: For 'externalWindow = true'. i.e opening in new tab, to work, pop-ups should be enabled.");
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
        if (this.innerSrc instanceof Blob) {
            fileUrl = encodeURIComponent(URL.createObjectURL(this.innerSrc));
        }
        else if (this.innerSrc instanceof Uint8Array) {
            /** @type {?} */
            var blob = new Blob([this.innerSrc], { type: "application/pdf" });
            fileUrl = encodeURIComponent(URL.createObjectURL(blob));
        }
        else {
            fileUrl = this.innerSrc;
        }
        /** @type {?} */
        var viewerUrl;
        if (this.pdfJsFolder) {
            viewerUrl = this.pdfJsFolder + "/web/viewer.html";
        }
        else {
            viewerUrl = "assets/pdfjs/web/viewer.html";
        }
        //console.log("__dirname" + __dirname);
        //console.log("__dirname" + path.join(__dirname, 'my/public'));
        //var viewerUrl = __dirname + "/pdfjs/web/viewer.html";
        viewerUrl += "?file=" + fileUrl;
        if (this.downloadFileName) {
            if (!this.downloadFileName.endsWith(".pdf")) {
                this.downloadFileName += ".pdf";
            }
            viewerUrl += "&fileName=" + this.downloadFileName;
        }
        if (this.openFile) {
            viewerUrl += "&openFile=" + this.openFile;
        }
        if (this.download) {
            viewerUrl += "&download=" + this.download;
        }
        if (this.startDownload) {
            viewerUrl += "&startDownload=" + this.startDownload;
        }
        if (this.viewBookmark) {
            viewerUrl += "&viewBookmark=" + this.viewBookmark;
        }
        if (this.print) {
            viewerUrl += "&print=" + this.print;
        }
        if (this.startPrint) {
            viewerUrl += "&startPrint=" + this.startPrint;
        }
        if (this.fullScreen) {
            viewerUrl += "&fullScreen=" + this.fullScreen;
        }
        // if (this.showFullScreen) {
        //   viewerUrl += `&showFullScreen=${this.showFullScreen}`;
        // }
        if (this.find) {
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
        if (this.page || this.zoom || this.nameddest || this.pagemode)
            viewerUrl += "#";
        if (this.page) {
            viewerUrl += "&page=" + this.page;
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
        if (this.externalWindow) {
            this.viewerTab.location.href = viewerUrl;
        }
        else {
            this.iframe.nativeElement.src = viewerUrl;
        }
        console.log("\n      pdfSrc = " + this.pdfSrc + "\n      fileUrl = " + fileUrl + "\n      externalWindow = " + this.externalWindow + "\n      downloadFileName = " + this.downloadFileName + "\n      pdfJsFolder = " + this.pdfJsFolder + "\n      openFile = " + this.openFile + "\n      download = " + this.download + "\n      startDownload = " + this.startDownload + "\n      viewBookmark = " + this.viewBookmark + "\n      print = " + this.print + "\n      startPrint = " + this.startPrint + "\n      fullScreen = " + this.fullScreen + "\n      find = " + this.find + "\n      lastPage = " + this.lastPage + "\n      rotatecw = " + this.rotatecw + "\n      rotateccw = " + this.rotateccw + "\n      cursor = " + this.cursor + "\n      scrollMode = " + this.scroll + "\n      spread = " + this.spread + "\n      page = " + this.page + "\n      zoom = " + this.zoom + "\n      nameddest = " + this.nameddest + "\n      pagemode = " + this.pagemode + "\n    ");
    };
    PdfJsViewerComponent.decorators = [
        { type: core.Component, args: [{
                    selector: 'ng2-pdfjs-viewer',
                    template: "<iframe [hidden]=\"externalWindow || (!externalWindow && !pdfSrc)\" #iframe width=\"100%\" height=\"100%\"></iframe>"
                },] },
    ];
    PdfJsViewerComponent.propDecorators = {
        iframe: [{ type: core.ViewChild, args: ['iframe',] }],
        pdfJsFolder: [{ type: core.Input }],
        externalWindow: [{ type: core.Input }],
        showSpinner: [{ type: core.Input }],
        downloadFileName: [{ type: core.Input }],
        openFile: [{ type: core.Input }],
        download: [{ type: core.Input }],
        startDownload: [{ type: core.Input }],
        viewBookmark: [{ type: core.Input }],
        print: [{ type: core.Input }],
        startPrint: [{ type: core.Input }],
        fullScreen: [{ type: core.Input }],
        find: [{ type: core.Input }],
        page: [{ type: core.Input }],
        zoom: [{ type: core.Input }],
        nameddest: [{ type: core.Input }],
        pagemode: [{ type: core.Input }],
        lastPage: [{ type: core.Input }],
        rotatecw: [{ type: core.Input }],
        rotateccw: [{ type: core.Input }],
        cursor: [{ type: core.Input }],
        scroll: [{ type: core.Input }],
        spread: [{ type: core.Input }],
        pdfSrc: [{ type: core.Input }]
    };
    return PdfJsViewerComponent;
}());

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
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
        { type: core.NgModule, args: [{
                    imports: [
                        common.CommonModule
                    ],
                    declarations: [
                        PdfJsViewerComponent
                    ],
                    exports: [
                        PdfJsViewerComponent
                    ]
                },] },
    ];
    return PdfJsViewerModule;
}());

exports.PdfJsViewerModule = PdfJsViewerModule;
exports.PdfJsViewerComponent = PdfJsViewerComponent;

Object.defineProperty(exports, '__esModule', { value: true });

})));
