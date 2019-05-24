# Angular 2+ PDFJS viewer with Mozilla's ViewerJS (Supports Angular 2/4/6/7)
<p align="center">
  <a href="https://www.npmjs.com/package/ng2-pdfjs-viewer">
    <img src="https://img.shields.io/npm/dm/ng2-pdfjs-viewer.svg?style=flat" alt="downloads">
  </a>
  <a href="https://badge.fury.io/js/ng2-pdfjs-viewer">
    <img src="https://badge.fury.io/js/ng2-pdfjs-viewer.svg" alt="npm version">
  </a>
</p>

This is a simple library wraps mozilla's pdfjs and viewerjs into an angular(2/4/6/7) component.

### Open in a new tab/window
<img src="/sampledoc/viewerImage.JPG" alt="angular2+ pdfjs viewer in new window"/>

### Embed pdf into any angular component/page
<img src="/sampledoc/viewerImageEmbedded2.jpg" alt="angular2+ pdfjs viewer embedded"/>

## Installation

## Step 1: Install `ng2-pdfjs-viewer`

```bash
$ npm install ng2-pdfjs-viewer --save
```

And then configure it in your Angular `AppModule`:

```typescript
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';

import { PdfJsViewerModule } from 'ng2-pdfjs-viewer'; // <-- Import PdfJsViewerModule module

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    PdfJsViewerModule // <-- Add to declarations
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

## Step 2: Copy task for pdfjs
    **asterisks and _underscores_**
    - Copy `node_modules\ng2-pdfjs-viewer\pdfjs` to your public or asset folder Or use `TransferWebpackPlugin` or something similar to make sure the static files are accessible from the public folder in your application/webserver. Please note, if you decide to put `pdfjs` folder anywhere else other than the `assets` folder, make sure you also set `[pdfJsFolder]` property to help locate the folder.  

    `TransferWebpackPlugin` Sample code  
    ```typescript
    var TransferWebpackPlugin = require('transfer-webpack-plugin');
    ...
    plugins: [
      new TransferWebpackPlugin([
        { from: 'node_modules\ng2-pdfjs-viewer\pdfjs', to: path.join(__dirname, 'assets') }
      ])
    ]
    ```
    *Options*   
    | Command | Description | Default
    | --- | --- | --- |
    | `[pdfJsFolder]` | To set the folder path under `web` and `build` resides. | |
    | `[externalWindow]` | To decide pdf should be inline or in a new tab | |
    | `[openFile]` | Show/hide open file icon | |
    | `[viewBookmark]` | Show/hide bookmark icon | |
    | `[download]` | Show/hide download icon | |
    | `[showSpinner]` | Show a simple css based spinner/progress before the pdf loads | |

## Usage    

`For your convenience a sample app using angular6 is available under this repository, if you would like to see it in action (Folder ng6SampleApp). It shows many ways to configure this component for different needs.`

Once your PdfJsViewerComponent is imported  you can use it in your Angular application like this:

```xml
<!-- You can now use your library component in app.component.html -->
<h1>
  {{title}}
</h1>
<ng2-pdfjs-viewer pdfSrc="your pdf file path"></ng2-pdfjs-viewer>
```

Here is a use case to download and open the pdf as byte array and open in new tab/window:
Please note, pdfSrc can be a Blob or Uint8Array as well
For [externalWindow]="true" to work, pop-ups needs to be enabled at browser level

```xml
<!-- your.component.html -->
<button (click)="openPdf();">Open Pdf</button>

<!-- Please note, you need a copy of https://github.com/intbot/ng2-pdfjs-viewer/tree/master/pdfjs for some of the below features to work -->
<div style="width: 800px; height: 400px">
  <ng2-pdfjs-viewer 
    #pdfViewer
    [pdfJsFolder]="'pdfjs'"
    [externalWindow]="true"
    [downloadFileName]="'mytestfile.pdf'"
    [openFile]="false"
    [viewBookmark]="false"
    [download]="false"></ng2-pdfjs-viewer>
</div>
```

```typescript
<!-- your.component.ts-->
export class RateCardComponent implements OnInit {
  @ViewChild('pdfViewer') pdfViewer
  ...

  private downloadFile(url: string): any {
    return this.http.get(url, { responseType: ResponseContentType.Blob }).map(
      (res) => {
        return new Blob([res.blob()], { type: "application/pdf" });
      });
  }

  public openPdf() {
    let url = "url to fetch pdf as byte array";
    // url can be local url or remote http request to an api/pdf file. 
    // E.g: let url = "assets/pdf-sample.pdf";
    // E.g: https://github.com/intbot/ng2-pdfjs-viewer/tree/master/sampledoc/pdf-sample.pdf
    // E.g: http://localhost:3000/api/GetMyPdf
    // Please note, for remote urls to work, CORS should be enabled at the server. Read: https://enable-cors.org/server.html

    this.downloadFile(url).subscribe(

(res) => {
        this.pdfViewer.pdfSrc = res; // pdfSrc can be Blob or Uint8Array
        this.pdfViewer.refresh(); // Ask pdf viewer to load/reresh pdf
      }
    );
  }
```

# Additional Information
Given below are examples of writing server apis(In aspnetcore c#) which returns pdfs as byte array. You can choose any server side technology as long as pdf is returned as byte array

Use case 1. As a RDLC local report viewer
```c#
[HttpGet]
[Route("MyReport")]
public IActionResult GetReport()
{
   // var reportObjectList1
   // var reportObjectList2
   var reportViewer = new ReportViewer {ProcessingMode = ProcessingMode.Local};
   reportViewer.LocalReport.ReportPath = "Reports/MyReport.rdlc";

   reportViewer.LocalReport.DataSources.Add(new ReportDataSource("NameOfDataSource1", reportObjectList1));
   reportViewer.LocalReport.DataSources.Add(new ReportDataSource("NameOfDataSource2", reportObjectList1));

   Warning[] warnings;
   string[] streamids;
   string mimeType;
   string encoding;
   string extension;

   var bytes = reportViewer.LocalReport.Render("application/pdf", null, out mimeType, out encoding, out extension, out streamids, out warnings);

   // The below content-disposition is lost when we create Blob() object in client browser. Hence commented out
   //var cd = new System.Net.Mime.ContentDisposition
   //{
   //    FileName = "somepdf.pdf",
   //    Inline = true
   //};
   //Response.Headers.Add("Content-Disposition", cd.ToString());
   
   return File(bytes, "application/pdf")
}
```

Use case 2. Return a physical pdf from server
```c#
[HttpGet]
[Route("GetMyPdf")]
public IActionResult GetMyPdf()
{
   var stream = await {{__get_stream_here__}}
   return File(stream, "application/pdf")); // FileStreamResult
   
  // OR
  // var bytes = await {{__get_bytes_here__}}
  // return File(bytes, "application/pdf")
}
```

## Questions?
There are several how to questions being posted in issues section of this repository. Questions would be better answered if posted on  www.stackoverflow.com with tag <b>ng2-pdfjs-viewer</b> (Please create this tag if not already present)

## If you are looking for a similar component in AngularJS, This library is quite useful
AngularJS [angular-pdfjs-viewer](https://github.com/legalthings/angular-pdfjs-viewer)

## License

MIT © [Code Hippie](mailto:codehippie1@gmail.com)
