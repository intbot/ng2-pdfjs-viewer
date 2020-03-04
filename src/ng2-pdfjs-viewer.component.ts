import { Component, Input, Output, ViewChild, EventEmitter, ElementRef } from '@angular/core';

@Component({
  selector: 'ng2-pdfjs-viewer',
  template: `<iframe title="ng2-pdfjs-viewer" [hidden]="externalWindow || (!externalWindow && !pdfSrc)" #iframe width="100%" height="100%"></iframe>`
})
export class PdfJsViewerComponent {
  @ViewChild('iframe', {static: true}) iframe: ElementRef;
  @Input() public viewerId: string;
  @Output() onBeforePrint: EventEmitter<any> = new EventEmitter();
  @Output() onAfterPrint: EventEmitter<any> = new EventEmitter();
  @Output() onDocumentLoad: EventEmitter<any> = new EventEmitter();
  @Output() onPageChange: EventEmitter<any> = new EventEmitter();
  @Input() public viewerFolder: string;
  @Input() public externalWindow: boolean = false;
  @Input() public showSpinner: boolean = true;
  @Input() public downloadFileName: string;
  @Input() public openFile: boolean = true;
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
  @Input() public diagnosticLogs: boolean = true;
  
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
    return pdfViewer;
  }

  public receiveMessage(viewerEvent)  {
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

  ngOnInit(): void {
    window.addEventListener("message", this.receiveMessage.bind(this), false);
    if (!this.externalWindow) { // Load pdf for embedded views
      this.loadPdf();
    }
  }

  public refresh(): void { // Needs to be invoked for external window or when needs to reload pdf
    this.loadPdf();
  }

  private loadPdf() {
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
        if(this.diagnosticLogs) console.error("ng2-pdfjs-viewer: For 'externalWindow = true'. i.e opening in new tab to work, pop-ups should be enabled.");
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
    } else if (this._src instanceof Uint8Array) {
      let blob = new Blob([this._src], { type: "application/pdf" });
      fileUrl = encodeURIComponent(URL.createObjectURL(blob));
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