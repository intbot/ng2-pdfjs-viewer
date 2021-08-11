# Angular PDFJS viewer with Mozilla's ViewerJS. Supports Angular 2+
<p align="center">
  <a href="https://www.npmjs.com/package/ng2-pdfjs-viewer">
    <img src="https://img.shields.io/npm/dm/ng2-pdfjs-viewer.svg?style=flat" alt="downloads">
  </a>
  <a href="https://badge.fury.io/js/ng2-pdfjs-viewer">
    <img src="https://badge.fury.io/js/ng2-pdfjs-viewer.svg" alt="npm version">
  </a>
</p>

***🎉 Thanks a ton to the community - We are talking Downloads in millions now!!!***

***This project is currently maintained by a single developer on his spare time. Inviting contributors and pull requests to pick-up momentum, and handle the expansive userbase and feature requests.***

This is a super simple angular component for displaying pdfs inline(embedded) OR in a new tab along with a feature rich viewer. It uses mozilla's pdfjs viewer(v2.2.171) behind the scenes and supports angular version above 2.0. Extremely lightweight, easiest to integrate and use, most reliable, this library has only one dependancy (@angular/core).

## What is new?
1. **Direct access to underlying viewer** - Exposed PDFViewerApplication and PDFViewerApplicationOptions objects opens a whole world of customizable PDFJS and ViewerJS properties and methods, allowing to change them programmatically; thus producing a unique viewer experience.  
2. **Dynamic page number** - Getter/Setter added for page number. Change page number after document loaded, or access current page in parent component.
3. **Support for events** - You may now register several events such as document load, page change, before print, after print etc. Please make sure to provide `viewerId` for events to work properly.  

## Tutorials, Demos & Examples
**Hosted Demo app showing unique use cases**: https://ng2-pdfjs-viewer.azurewebsites.net  
**Minimalistic angular sample app**: https://github.com/intbot/ng2-pdfjs-viewer/tree/master/SampleApp  
Source code for the demo here : https://github.com/intbot/ng2-pdfjs-viewer/tree/master/Demo  

## Features
Some of below features are unique to this component, which is unavailable in native viewer or other implementations.  
✔️ **Open pdf in new window** 🌐 - Opens pdf viewer in new window. Also, you may set all allowable external window options.  
✔️ **Direct access to underlying viewer** 👨‍💻👩‍💻- Exposed PDFViewerApplication and PDFViewerApplicationOptions objects opens a whole world of customizable PDFJS and ViewerJS properties and methods, allowing to change them programmatically; thus producing a unique viewer experience.  
✔️ **Embed pdf** 🗎 - Embeds viewer and pdf inside your web page/component.  
✔️ **Blob and byte arrays** 🔟 - Have pdf as a byte array? Still works.  
✔️ **Events** ⚡ - Catch events such as document loaded, page change, before/after print etc.Please make sure to provide `viewerId` for events to work properly.  
✔️ **Print preview** 🖨️ - You can set the pdf to open in a new tab or another browser window and provide an immediate print preview, A use case will be a 'Print' button opening pdf in new window with print dialog.  
✔️ **Defaults** - There are a ton of built in functionality Mozilla's viewer supports; such as print, download, bookmark, fullscreen, open file, zoom, search, pan, spread, navigate, attachments etc which is also available as-is in this viewer. Not mentioning them individually.  
✔️ **Auto download** 💾 - This option allows you to download the pdf file to user device automatically without manually invoking the download.  
✔️ **Auto rotate** 🔄 - Rotate the document _clockwise_ or _anti-clockwise_ 90° (+/- 90°) just before displaying. Useful if the document is misaligned.  
✔️ **Language** 🌍 - Set the language of your choice to the viewer controls.  
✔️ **Custom error** ❌ - Hate the defaults pdfjs errors, use this feature to override or append to it.  
✔️ **Side bar** 📎 - Open and show the sidebar with relevant information. E.g. Show attachments.  
✔️ **Smart device friendly zoom** 📱 - A better zooming experience on small devices.  
✔️ **Progress spinner** ⏳ - An optional spinner which displays before document renders.  
✔️ **Show/Hide controls** 👻 - Do not want users to see specific controls (E.g. download button). Use relevant features to remove controls from viewer.  
✔️ **Navigate** ⏩ - Navigate the document using page number, section, or even directly jump to last page if you are expecting a signature from user.  
✔️ **Zoom** 🔍 - Several zoom methods, auto, percentage (E.g. 150%), page-with/height, fit page etc. with ability to set offset.  
✔️ **Cursor** 👆 - Love the age old hand cursor 👆 on your pdf? You got it.  
✔️ **Change file name** - You may set the file name of download to a different one, if user chooses to download.  
✔️ **Scroll** 📜 - Changes the scroll to your choice. Even wrapped scrolling is supported.  
✔️ **Spread** - Allows you to change spread to odd or even.  


### Open in a new tab/ external window
<img src="/sampledoc/ng2pdfjsviewerExternal.JPG" alt="angular pdfjs viewer in new window"/>

### Embed pdf into any angular component/page
<img src="/sampledoc/ng2pdfjsviewerEmbedded.JPG" alt="angular pdfjs viewer embedded"/>

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
For several advanced options to work, you need a copy of pdfjs from this npm package.
Edit your project's `angular.json` file and use `ng build` as described here https://angular.io/guide/workspace-config#project-asset-configuration 
```json
"assets": [
  { "glob": "**/*", "input": "node_modules/ng2-pdfjs-viewer/pdfjs", "output": "/assets/pdfjs" },
]
```


_Please note, you may manually Copy `node_modules\ng2-pdfjs-viewer\pdfjs` to your `public` or `asset` folder or use any copy script as part of your build process. Another method could be to use `TransferWebpackPlugin` if you are using webpack(https://github.com/dkokorev90/transfer-webpack-plugin)._  
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

_Please note if you decide to put `pdfjs` folder anywhere else other than the `assets` folder, make sure you also set `[viewerFolder]` property to help locate the folder._  

### Options
| Attribute | Description | Type | Default Value
| --- | --- | --- | --- |
| `[pdfSrc]` | Fully qualified path to pdf file. (For remote pdf urls over http/https, CORS should be enabled) | `string` |  |
| `PDFViewerApplication` | This public property exposes underlying PDFViewerApplication object. Make sure to access it after document is loaded. Opens up the whole world of underlying PDFJS properties and methods. Use it to customize the viewer and document experience. | `object` |  |
| `PDFViewerApplicationOptions` | This public property exposes underlying PDFViewerApplicationOptions object. Make sure to access it after document is loaded. Opens up the whole world of underlying PDFJS options. Use it to customize the viewer and document experience. | `object` |  |
| `[viewerFolder]` | Set path to _pdfjs's_ `web` and `build` folders. | `string` | `assets` folder path |
| `[externalWindow]` | Open in new tab. Set to `true` to open document in a new tab | `boolean` | `false` |
| `externalWindowOptions` | External window options. For allowed comma separated values, refer to https://developer.mozilla.org/en-US/docs/Web/API/Window/open | `string` |  |
| `(onDocumentLoad)` | Event to be invoked once document is fully loaded(Must provide `viewerId`). Also returns number of pages in the `$event` parameter. E.g. `(onDocumentLoad)="testPagesLoaded($event)""` | `Function` |  |
| `(onPageChange)` | Event to be invoked when user scrolls through pages(Must provide `viewerId`). Also returns current page number user is at in the `$event` parameter. E.g. `(onPageChange)="testPageChange($event)""` | `Function` |  |
| `(onBeforePrint)` | Event to be invoked before document gets printed(Must provide `viewerId`). E.g. `(onBeforePrint)="testBeforePrint()"` | `Function` |  |
| `(onAfterPrint)` | Event to be invoked after document gets printed(Must provide `viewerId`). E.g. `(onAfterPrint)="testAfterPrint()"` | `Function` |  |
| `downloadFileName` | Sets/Changes the name of document to be downloaded. If the file name does not ends in `.pdf`, the component will automatically add it for you. | `string` | Actual name of the document |
| `[page]` | Show specific page. E.g _page=3_. You may also get/set the page number from your component using '.' notation explicitly, after document is loaded. E.g. `myPdfViewer.page = 3;` | `number` | `1` |
| `[lastPage]` | Show last page of the document once it is loaded(If set to `true`). If you use this option along with _`page`_ option, undesired effects might occur | `boolean` | `false` |
| `nameddest` | Go to a named destination. E.g. To go to section _5.1_ use like nameddest=5.1. Do not mix this option with _`page`_ and _`lastPage`_ options | `string` |  |
| `zoom` | Set zoom level of document. Applicable values are `auto`, `page-width`, `page-height`, `page-fit`, `200`_(As a zoom percentage)_, `left offset`_(As in "auto,18,827")_, `top offset`_(As in "auto,18,127")_  | `string` | `auto` |
| `[print]` | Show/hide print button. Set `false` to hide | `boolean` | `true` |
| `[startPrint]` | Start print preview of document. This combined with _`externalWindow`_ could mimic a print preview functionality just like the one in gmail. | `boolean` |  |
| `[download]` | Show/hide download button. Set `false` to hide | boolean | `true` |
| `[find]` | Show/hide search button. Set `false` to hide | boolean | `true` |
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
| `locale` | Set locale(language) of toolbar/buttons and other viewer elements. E.g. 'de-AT', 'en-GB' etc | string | browser's default language if present, otherwise `en-US` |
| `[useOnlyCssZoom]` | Instructs the viewer to use css based zoom. This will produce better zoom effect on mobile devices and tablets. | boolean | `false` |
| `errorMessage` | Custom error message | string |  |
| `[errorAppend]` | Appends custom error message to the end of other pdfjs error messages | `true` |
| `[errorOverride]` | Overrides all pdfjs error messages and shows only user's custom error message | boolean | `false` |
| `[diagnosticLogs]` | Turns on all diagnostic logs to the console | boolean | `true` |


**_Please note, copy step is mandatory to enjoy all of the different options listed above. You may also avoid this step and could directly use https://github.com/mozilla/pdf.js/wiki/Setup-pdf.js-in-a-website if you wish to just use the default viewer_**  

## Usage    

_For your convenience a sample app using angular is available under this repository, if you would like to see it in action (Folder SampleApp). It shows many ways to configure this component for different needs._

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

<div style="width: 800px; height: 400px">
  <ng2-pdfjs-viewer 
    #pdfViewerOnDemand
    [externalWindow]="true"
    [downloadFileName]="'mytestfile.pdf'"
    [openFile]="false"
    [viewBookmark]="false"
    [download]="false"></ng2-pdfjs-viewer>
</div>
<div>
<div style="width: 800px; height: 400px">
  <ng2-pdfjs-viewer #pdfViewerAutoLoad></ng2-pdfjs-viewer>
</div>
<div style="height: 600px">
  <ng2-pdfjs-viewer pdfSrc="gre_research_validity_data.pdf" viewerId="MyUniqueID" (onBeforePrint)="testBeforePrint()" (onAfterPrint)="testAfterPrint()" (onDocumentLoad)="testPagesLoaded($event)" (onPageChange)="testPageChange($event)">
  </ng2-pdfjs-viewer>
</div>
```

```typescript
<!-- your.component.ts-->
import { Component, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
...

export class MyComponent implements OnInit {
  @ViewChild('pdfViewerOnDemand') pdfViewerOnDemand;
  @ViewChild('pdfViewerAutoLoad') pdfViewerAutoLoad;
  ...

  constructor(private http: HttpClient) {
      let url = "api/document/getmypdf"; // Or your url
      this.downloadFile(url).subscribe(
          (res) => {
              this.pdfViewerAutoLoad.pdfSrc = res; // pdfSrc can be Blob or Uint8Array
              this.pdfViewerAutoLoad.refresh(); // Ask pdf viewer to load/refresh pdf
          }
      );
  }

  private downloadFile(url: string): any {
        return this.http.get(url, { responseType: 'blob' })
            .pipe(
                map((result: any) => {
                    return result;
                })
            );
    }

  public openPdf() {
    let url = "url to fetch pdf as byte array"; // E.g. http://localhost:3000/api/GetMyPdf
    // url can be local url or remote http request to an api/pdf file. 
    // E.g: let url = "assets/pdf-sample.pdf";
    // E.g: https://github.com/intbot/ng2-pdfjs-viewer/tree/master/sampledoc/pdf-sample.pdf
    // E.g: http://localhost:3000/api/GetMyPdf
    // Please note, for remote urls to work, CORS should be enabled at the server. Read: https://enable-cors.org/server.html

    this.downloadFile(url).subscribe(
    (res) => {
        this.pdfViewerOnDemand.pdfSrc = res; // pdfSrc can be Blob or Uint8Array
        this.pdfViewerOnDemand.refresh(); // Ask pdf viewer to load/reresh pdf
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

OR

[HttpGet]
[Route("GetMyPdf")]
public IActionResult GetMyPdf()
{
    var pdfPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/assets/pdfjs/web/gre_research_validity_data.pdf");
    byte[] bytes = System.IO.File.ReadAllBytes(pdfPath);
    return File(bytes, "application/pdf");
}
```

## Stack Overflow Support
Have a question? Ask questions and find answers on Stack overflow.

[Stack Overflow](https://stackoverflow.com/questions/tagged/ng2-pdfjs-viewer)

## Looking for old AngularJS? - The below library is quite useful
AngularJS [angular-pdfjs-viewer](https://github.com/legalthings/angular-pdfjs-viewer)

## License

MIT © [Code Hippie](mailto:codehippie1@gmail.com)
