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
  @Input() public externalWindow: boolean = false;
  @Input() public showSpinner: boolean = true;
  @Input() public downloadFileName: string;
  @Input() public openFile: boolean = true;
  @Input() public download: boolean = true;
  @Input() public viewBookmark: boolean = true;

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
    if (!externalWindow) { // Load pdf for embedded views
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

    if (this.externalWindow && typeof this.viewerTab === 'undefined') {
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
      viewerUrl += `&fileName=${this.downloadFileName}.pdf`;
    }
    if (typeof this.openFile !== 'undefined') {
      viewerUrl += `&openFile=${this.openFile}`;
    }
    if (typeof this.download !== 'undefined') {
      viewerUrl += `&download=${this.download}`;
    }
    if (typeof this.viewBookmark !== 'undefined') {
      viewerUrl += `&viewBookmark=${this.viewBookmark}`;
    }

    if (this.externalWindow) {
      this.viewerTab.location.href = viewerUrl;
    } else {
      this.iframe.nativeElement.src = viewerUrl;
    }
  }
}
