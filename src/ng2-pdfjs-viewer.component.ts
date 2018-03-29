import { Component, Input, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'ng2-pdfjs-viewer',
  template: `<iframe [hidden]="externalWindow || (!externalWindow && !src)" #iframe width="100%" height="100%"></iframe>`
})
export class PdfJsViewerComponent {
  @ViewChild('iframe') iframe: ElementRef;
  @Input() public externalWindow: boolean = false;
  @Input() public src: string | Blob | Uint8Array;
  @Input() public showSpinner: boolean = true;
  public viewerTab: any;

  @Input() public pdfJsFolder: string = "pdfjs";
  @Input() public downloadFileName: string;
  @Input() public openFile: boolean = true;
  @Input() public download: boolean = true;
  @Input() public viewBookmark: boolean = true;

  @Input() public set pdfSrc(src: string | Blob | Uint8Array) {
    this.src = src;
    this.loadPdf();
  }

  ngOnInit(): void {
    this.loadPdf();
  }

  public refresh(): void {
    this.loadPdf();
  }

  private loadPdf() {
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
    if (this.src instanceof Blob) {
      fileUrl = encodeURIComponent(URL.createObjectURL(this.src));
    }
    else if (this.src instanceof Uint8Array) {
      let blob = new Blob([this.src], { type: "application/pdf" });
      fileUrl = encodeURIComponent(URL.createObjectURL(blob));
    } else {
      fileUrl = this.src;
    }

    var viewerUrl = `assets/${this.pdfJsFolder}/web/viewer.html?file=${fileUrl}`;
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
