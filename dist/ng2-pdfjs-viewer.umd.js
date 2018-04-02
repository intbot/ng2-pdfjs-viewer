(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('@angular/common')) :
	typeof define === 'function' && define.amd ? define(['exports', '@angular/core', '@angular/common'], factory) :
	(factory((global['ng2-pdfjs-viewer'] = {}),global.core,global.common));
}(this, (function (exports,core,common) { 'use strict';

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
var PdfJsViewerComponent = /** @class */ (function () {
    function PdfJsViewerComponent() {
        this.pdfJsFolder = "pdfjs";
        this.externalWindow = false;
        this.showSpinner = true;
        this.openFile = true;
        this.download = true;
        this.viewBookmark = true;
    }
    Object.defineProperty(PdfJsViewerComponent.prototype, "pdfSrc", {
        set: /**
         * @param {?} src
         * @return {?}
         */
        function (src) {
            this.src = src;
            this.loadPdf();
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
        this.loadPdf();
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
     * @return {?}
     */
    PdfJsViewerComponent.prototype.loadPdf = /**
     * @return {?}
     */
    function () {
        if (!this.src) {
            return;
        }
        if (this.externalWindow && typeof this.viewerTab === 'undefined') {
            this.viewerTab = window.open('', '_blank');
            if (this.viewerTab == null) {
                console.log("ng2-pdfjs-viewer: For 'externalWindow = true'. i.e opening in new tab, to work, pop-ups should be enabled.");
                return;
            }
            if (this.showSpinner) {
                this.viewerTab.document.write("\n          <style>\n          .loader {\n            position: fixed;\n            left: 40%;\n            top: 40%;\n            border: 16px solid #f3f3f3;\n            border-radius: 50%;\n            border-top: 16px solid #3498db;\n            width: 120px;\n            height: 120px;\n            animation: spin 2s linear infinite;\n          }\n          @keyframes spin {\n            0% {\n              transform: rotate(0deg);\n            }\n            100% {\n              transform: rotate(360deg);\n            }\n          }\n          </style>\n          <div class=\"loader\"></div>\n        ");
            }
        }
        var /** @type {?} */ fileUrl;
        //if (typeof this.src === "string") {
        //  fileUrl = this.src;
        //}
        //if (typeof this.src === "string") {
        //  fileUrl = this.src;
        //}
        if (this.src instanceof Blob) {
            fileUrl = encodeURIComponent(URL.createObjectURL(this.src));
        }
        else if (this.src instanceof Uint8Array) {
            var /** @type {?} */ blob = new Blob([this.src], { type: "application/pdf" });
            fileUrl = encodeURIComponent(URL.createObjectURL(blob));
        }
        else {
            fileUrl = this.src;
        }
        var /** @type {?} */ viewerUrl = "assets/" + this.pdfJsFolder + "/web/viewer.html";
        //var viewerUrl = "./pdfjs/web/viewer.html";
        viewerUrl += "?file=" + fileUrl;
        if (this.downloadFileName) {
            viewerUrl += "&fileName=" + this.downloadFileName + ".pdf";
        }
        if (typeof this.openFile !== 'undefined') {
            viewerUrl += "&openFile=" + this.openFile;
        }
        if (typeof this.download !== 'undefined') {
            viewerUrl += "&download=" + this.download;
        }
        if (typeof this.viewBookmark !== 'undefined') {
            viewerUrl += "&viewBookmark=" + this.viewBookmark;
        }
        if (this.externalWindow) {
            this.viewerTab.location.href = viewerUrl;
        }
        else {
            this.iframe.nativeElement.src = viewerUrl;
        }
    };
    PdfJsViewerComponent.decorators = [
        { type: core.Component, args: [{
                    selector: 'ng2-pdfjs-viewer',
                    template: "<iframe [hidden]=\"externalWindow || (!externalWindow && !src)\" #iframe width=\"100%\" height=\"100%\"></iframe>"
                },] },
    ];
    /** @nocollapse */
    PdfJsViewerComponent.ctorParameters = function () { return []; };
    PdfJsViewerComponent.propDecorators = {
        "iframe": [{ type: core.ViewChild, args: ['iframe',] },],
        "pdfJsFolder": [{ type: core.Input },],
        "externalWindow": [{ type: core.Input },],
        "showSpinner": [{ type: core.Input },],
        "downloadFileName": [{ type: core.Input },],
        "openFile": [{ type: core.Input },],
        "download": [{ type: core.Input },],
        "viewBookmark": [{ type: core.Input },],
        "pdfSrc": [{ type: core.Input },],
    };
    return PdfJsViewerComponent;
}());

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
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
    /** @nocollapse */
    PdfJsViewerModule.ctorParameters = function () { return []; };
    return PdfJsViewerModule;
}());

exports.PdfJsViewerModule = PdfJsViewerModule;
exports.PdfJsViewerComponent = PdfJsViewerComponent;

Object.defineProperty(exports, '__esModule', { value: true });

})));
