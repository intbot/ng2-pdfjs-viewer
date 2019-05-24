import { Component, Input, ViewChild, ElementRef } from '@angular/core';

//import viewerHtml from 'pdfjs/web/viewer.html';
//declare var require: any
//require('static-reference')('./pdfjs/web/viewer.html');
//declare var path: any;

@Component({
  selector: 'ng2-pdfjs-viewer',
  template: `<iframe [hidden]="externalWindow || (!externalWindow && !pdfSrc)" #iframe width="100%" height="100%"></iframe>`
})
export class PdfJsViewerComponent {
  @ViewChild('iframe') iframe: ElementRef;


//   var TransferWebpackPlugin = require('transfer-webpack-plugin');
// ...
// plugins: [
//   new TransferWebpackPlugin([
//     { from: 'node_modules/my-package/assets', to: path.join(__dirname, 'my/public') }
//   ])
// ]


  @Input() public pdfJsFolder: string;
  @Input() public externalWindow: boolean;
  @Input() public showSpinner: boolean = true;
  @Input() public downloadFileName: string;
  @Input() public openFile: boolean;
  @Input() public download: boolean;
  @Input() public startDownload: boolean;
  @Input() public viewBookmark: boolean;
  @Input() public print: boolean;
  @Input() public startPrint: boolean;
  @Input() public fullScreen: boolean;
  //@Input() public showFullScreen: boolean;
  @Input() public find: boolean;
  @Input() public page: number;
  @Input() public zoom: string;
  @Input() public nameddest: string;
  @Input() public pagemode: string;
  @Input() public lastPage: boolean;
  @Input() public rotatecw: boolean;
  @Input() public rotateccw: boolean;
  @Input() public cursor: string;
  @Input() public scroll: string;
  @Input() public spread: string;
  
  public viewerTab: any;
  private innerSrc: string | Blob | Uint8Array;

  @Input()
  public set pdfSrc(innerSrc: string | Blob | Uint8Array) {
    this.innerSrc = innerSrc;
  }
  
  public get pdfSrc() {
    return this.innerSrc;
  }

  ngOnInit(): void {
    if (!this.externalWindow) { // Load pdf for embedded views
      this.loadPdf();
    }
  }

  public refresh(): void { // Needs to be invoked for external window or when needs to reload pdf
    this.loadPdf();
  }

  private loadPdf() {
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
    if (this.innerSrc instanceof Blob) {
      fileUrl = encodeURIComponent(URL.createObjectURL(this.innerSrc));
    } else if (this.innerSrc instanceof Uint8Array) {
      let blob = new Blob([this.innerSrc], { type: "application/pdf" });
      fileUrl = encodeURIComponent(URL.createObjectURL(blob));
    } else {
      fileUrl = this.innerSrc;
    }

    let viewerUrl;
    if (this.pdfJsFolder) {
      viewerUrl = `${this.pdfJsFolder}/web/viewer.html`;
    } else {
      viewerUrl = `assets/pdfjs/web/viewer.html`;
    }

    //console.log("__dirname" + __dirname);
    //console.log("__dirname" + path.join(__dirname, 'my/public'));
    //var viewerUrl = __dirname + "/pdfjs/web/viewer.html";
    viewerUrl += `?file=${fileUrl}`;

    if (this.downloadFileName) {
      if(!this.downloadFileName.endsWith(".pdf")) {
        this.downloadFileName += ".pdf";
      }
      viewerUrl += `&fileName=${this.downloadFileName}`;
    }
    if (this.openFile) {
      viewerUrl += `&openFile=${this.openFile}`;
    }
    if (this.download) {
      viewerUrl += `&download=${this.download}`;
    }
    if (this.startDownload) {
      viewerUrl += `&startDownload=${this.startDownload}`;
    }
    if (this.viewBookmark) {
      viewerUrl += `&viewBookmark=${this.viewBookmark}`;
    }
    if (this.print) {
      viewerUrl += `&print=${this.print}`;
    }
    if (this.startPrint) {
      viewerUrl += `&startPrint=${this.startPrint}`;
    }
    if (this.fullScreen) {
      viewerUrl += `&fullScreen=${this.fullScreen}`;
    }
    // if (this.showFullScreen) {
    //   viewerUrl += `&showFullScreen=${this.showFullScreen}`;
    // }
    if (this.find) {
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
    
    if (this.page || this.zoom || this.nameddest || this.pagemode) viewerUrl += "#"
    if (this.page) {
      viewerUrl += `&page=${this.page}`;
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

    if (this.externalWindow) {
      this.viewerTab.location.href = viewerUrl;
    } else {
      this.iframe.nativeElement.src = viewerUrl;
    }

    console.log(`
      pdfSrc = ${this.pdfSrc}
      fileUrl = ${fileUrl}
      externalWindow = ${this.externalWindow}
      downloadFileName = ${this.downloadFileName}
      pdfJsFolder = ${this.pdfJsFolder}
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
    `);
  }
}