import { Component, Input, Output, OnInit, OnDestroy, ViewChild, EventEmitter, ElementRef } from '@angular/core';

export type ChangedPage = number;
export type ChangedScale = number;
export interface ChangedRotation {
  rotation: number;
  page: number;
}

@Component({
  selector: 'ng2-pdfjs-viewer',
  standalone: false,
  template: `<iframe title="ng2-pdfjs-viewer" [hidden]="externalWindow || (!externalWindow && !pdfSrc)" #iframe width="100%" height="100%"></iframe>`
})
export class PdfJsViewerComponent implements OnInit, OnDestroy {
  @ViewChild('iframe', { static: true }) iframe: ElementRef;
  static lastID = 0;
  @Input() public viewerId = `ng2-pdfjs-viewer-ID${++PdfJsViewerComponent.lastID}`;
  @Output() onBeforePrint: EventEmitter<void> = new EventEmitter();
  @Output() onAfterPrint: EventEmitter<void> = new EventEmitter();
  @Output() onDocumentLoad: EventEmitter<void> = new EventEmitter();
  @Output() onPageChange: EventEmitter<ChangedPage> = new EventEmitter();
  @Output() onScaleChange: EventEmitter<ChangedScale> = new EventEmitter();
  @Output() onRotationChange: EventEmitter<ChangedRotation> = new EventEmitter();
  @Input() public viewerFolder: string;
  @Input() public externalWindow: boolean = false;
  @Input() public target: string = '_blank';
  @Input() public showSpinner: boolean = true;
  @Input() public downloadFileName: string;
  @Input() public openFile: boolean = true;
  @Input() public annotations: boolean = false;
  @Input() public download: boolean = true;
  @Input() public startDownload: boolean;
  @Input() public viewBookmark: boolean = true;
  @Input() public print: boolean = true;
  @Input() public startPrint: boolean;
  @Input() public fullScreen: boolean = true;
  //@Input() public showFullScreen: boolean;
  @Input() public find: boolean = true;
  @Input() public zoom: string;
  @Input() public nameddest: string;
  @Input() public pagemode: string;
  @Input() public lastPage: boolean;
  @Input() public rotatecw: boolean;
  @Input() public rotateccw: boolean;
  @Input() public cursor: string;
  @Input() public scroll: string;
  @Input() public spread: string;
  @Input() public locale: string;
  @Input() public useOnlyCssZoom: boolean = false;
  @Input() public errorOverride: boolean = false;
  @Input() public errorAppend: boolean = true;
  @Input() public errorMessage: string;
  @Input() public diagnosticLogs: boolean = false;

  @Input() public externalWindowOptions: string;
  public viewerTab: any;
  private _src: string | Blob | Uint8Array;
  private _page: number;

  @Input()
  public set page(_page: number) {
    this._page = _page;
    if(this.PDFViewerApplication) {
      this.PDFViewerApplication.page = this._page;
    } else {
      if(this.diagnosticLogs) console.warn("Document is not loaded yet!!!. Try to set page# after full load. Ignore this warning if you are not setting page# using '.' notation. (E.g. pdfViewer.page = 5;)");
    }
  }

  public get page() {
    if(this.PDFViewerApplication) {
      return this.PDFViewerApplication.page;
    } else {
      if(this.diagnosticLogs) console.warn("Document is not loaded yet!!!. Try to retrieve page# after full load.");
    }
  }

  @Input()
  public set pdfSrc(_src: string | Blob | Uint8Array) {
    this._src = _src;
  }

  public get pdfSrc() {
    return this._src;
  }

  public get PDFViewerApplicationOptions() {
    let pdfViewerOptions = null;
    if (this.externalWindow) {
      if (this.viewerTab) {
        pdfViewerOptions = this.viewerTab.PDFViewerApplicationOptions;
      }
    } else {
      if (this.iframe.nativeElement.contentWindow) {
        pdfViewerOptions = this.iframe.nativeElement.contentWindow.PDFViewerApplicationOptions;
      }
    }
    return pdfViewerOptions;
  }

  public get PDFViewerApplication() {
    let pdfViewer = null;
    if (this.externalWindow) {
      if (this.viewerTab) {
        pdfViewer = this.viewerTab.PDFViewerApplication;
      }
    } else {
      if (this.iframe.nativeElement.contentWindow) {
        pdfViewer = this.iframe.nativeElement.contentWindow.PDFViewerApplication;
      }
    }
    if(this.diagnosticLogs) console.debug("PdfJsViewer: Viewer ->", pdfViewer);
    return pdfViewer;
  }

ngOnInit(): void {   
  // Load PDF for embedded views.
  if (!this.externalWindow) {
    this.loadPdf();
  }

  // Bind events.
  this.bindToPdfJsEventBus();
}

  /**
   * Waits for the PDF.js viewer to be ready, and binds the the event bus.
   */
  private bindToPdfJsEventBus() {
    document.addEventListener("webviewerloaded", () => {
      if (this.diagnosticLogs) console.debug("PdfJsViewer: webviewerloaded event received");
      if (!this.PDFViewerApplication) {
        if (this.diagnosticLogs) console.debug("PdfJsViewer: Viewer not yet (or no longer) available, events can not yet be bound.");
        return;
      }

      // https://github.com/mozilla/pdf.js/issues/9527
      this.PDFViewerApplication.initializedPromise.then(() => {
        // Configure the controls.
        const app = this.configureVisibleFeatures();

        const eventBus = app.eventBus;
        // Once initialized, attach the events.
        // Document Loaded.
        eventBus.on("documentloaded", () => {
          if (this.diagnosticLogs) console.debug("PdfJsViewer: The document has now been loaded!");
          this.onDocumentLoad.emit();
        });

        // Pages init.
        eventBus.on("pagesinit", () => {
          if (this.diagnosticLogs) console.debug("PdfJsViewer: All pages have been rendered!");
        });

        // Before print.
        eventBus.on("beforeprint", () => {
          if (this.diagnosticLogs) console.debug("PdfJsViewer: The document is about to be printed!");
          this.onBeforePrint.emit();
        });

        // After print.
        eventBus.on("afterprint", () => {
          if (this.diagnosticLogs) console.debug("PdfJsViewer: The document has been printed!");
          this.onAfterPrint.emit();
        });

        // Page change.
        eventBus.on("pagechanging", (event) => {
          if (this.diagnosticLogs) console.debug("PdfJsViewer: The page has changed:", event.pageNumber);
          this.onPageChange.emit(event.pageNumber);
        });

        // Rotation change.
        eventBus.on("rotationchanging", (event) => {
          const newRotation: ChangedRotation = {
            rotation: event.pagesRotation,
            page: event.pageNumber
          }
          if (this.diagnosticLogs) console.debug("PdfJsViewer: The rotation has changed!", event);
          this.onRotationChange.emit(newRotation);
        })

        // Scale change.
        eventBus.on("scalechanging", (event) => {
          const newScale: ChangedScale = event.scale;
          if (this.diagnosticLogs) console.debug("PdfJsViewer: The document has scale has changed!", newScale);
          this.onScaleChange.emit(newScale);
        })
      });
    });
  }

  private configureVisibleFeatures() {
    const app = this.PDFViewerApplication;
    const toolbarElement = app.appConfig.secondaryToolbar.toolbar;
    // Display of "open file" button.
    app.appConfig.secondaryToolbar.openFileButton.hidden = !this.openFile;
    // Hide the horizontal separator in the menu if the control is hidden.
    toolbarElement.querySelector('.horizontalToolbarSeparator').hidden = !this.openFile;
    // Display of annotations/editor controls.
    app.appConfig.toolbar.editorFreeTextButton.hidden = !this.annotations;
    app.appConfig.toolbar.editorStampButton.hidden = !this.annotations;
    app.appConfig.toolbar.editorInkButton.hidden = !this.annotations;
    app.appConfig.toolbar.editorHighlightButton.hidden = !this.annotations;
    return app;
  }

  public refresh(): void { // Needs to be invoked for external window or when needs to reload pdf
    this.loadPdf();
  }

  private relaseUrl?: () => void; // Avoid memory leak with `URL.createObjectURL`
  private loadPdf() {
    if (!this._src) {
      return;
    }

    if (this.externalWindow && (typeof this.viewerTab === 'undefined' || this.viewerTab.closed)) {
      this.viewerTab = window.open('', this.target, this.externalWindowOptions || '');
      if (this.viewerTab == null) {
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

    this.relaseUrl?.();
    let fileUrl;
    if (this._src instanceof Blob) {
      const url = URL.createObjectURL(this._src);
      fileUrl = encodeURIComponent(url);
      this.relaseUrl = () => URL.revokeObjectURL(url);
    } else if (this._src instanceof Uint8Array) {
      let blob = new Blob([this._src], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      this.relaseUrl = () => URL.revokeObjectURL(url);
      fileUrl = encodeURIComponent(url);
    } else {
      fileUrl = this._src;
    }

    let viewerUrl;
    if (this.viewerFolder) {
      viewerUrl = `${this.viewerFolder}/web/viewer.html`;
    } else {
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
      if(!this.downloadFileName.endsWith(".pdf")) {
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

    if (this._page || this.zoom || this.nameddest || this.pagemode) viewerUrl += "#"
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
    } else {
      this.iframe.nativeElement.contentWindow.location.replace(viewerUrl);
    }
    
    if (this.diagnosticLogs) {
      console.debug(`PdfJsViewer: Viewer URL configuration:
        pdfSrc = ${this.pdfSrc}
        fileUrl = ${fileUrl}
        externalWindow = ${this.externalWindow}
        downloadFileName = ${this.downloadFileName}
        viewerFolder = ${this.viewerFolder}
        openFile = ${this.openFile}
        download = ${this.download}
        startDownload = ${this.startDownload}
        viewBookmark = ${this.viewBookmark}
        print = ${this.print}
        startPrint = ${this.startPrint}
        fullScreen = ${this.fullScreen}
        find = ${this.find}
        lastPage = ${this.lastPage}
        rotatecw = ${this.rotatecw}
        rotateccw = ${this.rotateccw}
        cursor = ${this.cursor}
        scrollMode = ${this.scroll}
        spread = ${this.spread}
        page = ${this.page}
        zoom = ${this.zoom}
        nameddest = ${this.nameddest}
        pagemode = ${this.pagemode}
        errorOverride = ${this.errorOverride}
        errorAppend = ${this.errorAppend}
        errorMessage = ${this.errorMessage}
      `);
      }
  }

  ngOnDestroy(): void {
    this.relaseUrl?.();
  }
}
