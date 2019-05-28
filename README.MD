# Angular 2+ PDFJS viewer with Mozilla's ViewerJS (Supports Angular 2/4/5/6/7)
<p align="center">
  <a href="https://www.npmjs.com/package/ng2-pdfjs-viewer">
    <img src="https://img.shields.io/npm/dm/ng2-pdfjs-viewer.svg?style=flat" alt="downloads">
  </a>
  <a href="https://badge.fury.io/js/ng2-pdfjs-viewer">
    <img src="https://badge.fury.io/js/ng2-pdfjs-viewer.svg" alt="npm version">
  </a>
</p>

This is a super simple library for displaying pdf inline/embedded or in a new tab along with a feature rich viewer. It uses mozilla's pdfjs viewer behind the scenes and supports angular(2/4/5/6/7). Extremely lightweight, easiest to integrate and use, this library has only one dependancy (@angular/core).

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
For several advanced options to work, you need a copy of pdfjs from this npm package. There are several ways to achieve it.
1. Manually Copy `node_modules\ng2-pdfjs-viewer\pdfjs` to your `public` or `asset` folder or use a script such as `copy .\node_modules\ng2-pdfjs-viewer\pdfjs\* <Myassetfolderpath> -Force -Recurse` (Give example is of powershell)
OR 
2. Add in your project's `angular.json` file and use `ng build` as described here https://angular.io/guide/workspace-config#project-asset-configuration 
```json
"assets": [
  { "glob": "**/*", "input": "node_modules/ng2-pdfjs-viewer/pdfjs", "output": "/assets/pdfjs" },
]
```
Please note if you decide to put _`pdfjs`_ folder anywhere else other than the _`assets`_ folder, make sure you also set _`[pdfJsFolder]`_ property to help locate the folder.  

**_`TransferWebpackPlugin` Sample code_**  
```typescript
var TransferWebpackPlugin = require('transfer-webpack-plugin');
...
plugins: [
  new TransferWebpackPlugin([
    { from: 'node_modules\ng2-pdfjs-viewer\pdfjs', to: path.join(__dirname, 'assets') }
  ])
]
```

### Options
| Attribute | Description | Type | Default Value
| --- | --- | --- | --- |
| `[pdfJsFolder]` | Set path to _pdfjs's_ `web` and `build` folders. | `string` | `assets` folder path |
| `[externalWindow]` | Open in new tab. Set to `true` to open document in a new tab | `boolean` | `false` |
| `downloadFileName` | Sets/Changes the name of document to be downloaded. If the file name does not ends in `.pdf`, the component will automatically add it for you. | `string` | Actual name of the document |
| `[page]` | Show specific page. E.g _page=3_ | `number` | `1` |
| `[lastPage]` | Show last page of the document once it is loaded(If set to `true`). If you use this option along with _`page`_ option, undesired effects might occur | `boolean` | `false` |
| `nameddest` | Go to a named destination. E.g. To go to section _5.1_ use like nameddest=5.1. Do not mix this option with _`page`_ and _`lastPage`_ options | `string` |  |
| `zoom` | Set zoom level of document. Applicable values are `auto`, `page-width`, `page-height`, `page-fit`, `200`_(As a zoom percentage)_, `left offset`_(As in "auto,18,827")_, `top offset`_(As in "auto,18,127")_  | `string` | `auto` |
| `[print]` | Show/hide print button. Set `false` to hide | `boolean` | `true` |
| `[startPrint]` | Start print preview of document. This combined with _`externalWindow`_ could mimic a print preview functionality just like the one in gmail. | `boolean` |  |
| `[download]` | Show/hide download button. Set `false` to hide | boolean | `true` |
| `[startDownload]` | Download document as soon as it opens. You may put this to good use. | `boolean` |  |
| `[rotatecw]` | Rotate document clock wise 90° | `boolean` |  |
| `[rotateccw]` | Rotate document anti-clock wise 90° | `boolean` |  |
| `cursor` | Type of cursor. Available options are _`HAND`/`H`_, _`SELECT`/`S`_,_`ZOOM`/`Z`_. Case is irrelevant. | _`SELECT`/`S`_ |  |
| `scroll` | Sets scroll. Available options are _`VERTICAL`/`V`_, _`HORIZONTAL`/`H`_,_`WRAPPED`/`W`_. Case is irrelevant. | _`VERTICAL`/`V`_ |  |
| `spread` | Sets Odd or Even spread. Available options are _`ODD`/`O`_, _`EVEN`/`E`_,_`NONE`/`N`_. Case is irrelevant. | _`NONE`/`N`_ |  |
| `[fullScreen]` | Show/hide presentation(full screen) button. Set `false` to hide | `boolean` | `true` |
| `cursor` | Type of cursor. Available options are _`HAND`/`H`_, _`SELECT`/`S`_,_`ZOOM`/`Z`_. Case is irrelevant. | _`SELECT`/`S`_ |  |
| `pagemode` | State of sidebar. Available options are _`none`_, _`thumbs`_,_`bookmarks`_,_`attachments`_. E.g. `pagemode=attachments`. | _`none`_ |  |
| `[openFile]` | Show/hide open file button. Set `false` to hide | boolean | `true` |
| `[viewBookmark]` | Show/hide bookmark button. Set `false` to hide | boolean | `true` |
| `[showSpinner]` | Show a simple css based spinner/progress before the document loads | boolean | `true` |

**_Please note, copy step is mandatory to enjoy all of the different options listed above. You may also avoid this step and could directly use https://github.com/mozilla/pdf.js/wiki/Setup-pdf.js-in-a-website if you wish to just use the default viewer_**  

## Usage    

_For your convenience a sample app using angular6 is available under this repository, if you would like to see it in action (Folder ng6SampleApp). It shows many ways to configure this component for different needs._

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
There are several how to questions being posted in issues section of this repository. Questions would be better answered if posted on  www.stackoverflow.com with tag **_ng2-pdfjs-viewer_** (Please create **_ng2-pdfjs-viewer_** tag if not already present on SO)

## Looking for old AngularJS? - The below library is quite useful
AngularJS [angular-pdfjs-viewer](https://github.com/legalthings/angular-pdfjs-viewer)

## License

MIT © [Code Hippie](mailto:codehippie1@gmail.com)
