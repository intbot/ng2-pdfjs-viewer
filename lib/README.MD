# Angular PDF viewer with Mozilla's PDF.js Viewer

<div align="center">

[![NPM Version](https://img.shields.io/npm/v/ng2-pdfjs-viewer?logo=npm)](https://www.npmjs.com/package/ng2-pdfjs-viewer)
[![PDFJS Version](https://img.shields.io/badge/PDF.js%20Version-4.0.x-blue?logo=mozilla)](https://github.com/mozilla/pdf.js)
[![Static Badge](https://img.shields.io/badge/Angular%20Version-19-green?logo=angular)](https://angular.dev/overview)

</div>
<div align="center">

[![NPM Downloads](https://img.shields.io/npm/dy/ng2-pdfjs-viewer)](https://www.npmjs.com/package/ng2-pdfjs-viewer)
[![NPM Downloads](https://img.shields.io/npm/dm/ng2-pdfjs-viewer?label=last%20month)](https://www.npmjs.com/package/ng2-pdfjs-viewer)

</div>

**_🎉 Thanks a ton to the community - After 8+ years and consistant support, we are standing tall at 6 million downloads now!!!_**

**_This project is currently maintained by a single developer on his spare time. Inviting contributors and pull requests to pick-up momentum, and handle the expansive userbase and feature requests._**

This is a super simple angular component for displaying PDFs inline(embedded) OR in a new tab along with a feature rich viewer. It is based on Mozilla's PDF.js viewer v4.0 and supports angular version from 2.0. Extremely lightweight, easiest to integrate and use, most reliable, this library has only one dependancy (@angular/core).

## What's new?

1. **Updated to current version of PDF.js viewer** - Fixes a lot of rendering issues, improves eventing.
2. **New Events** - Added support for additional event bus activities (page rotation, document scale changes).
3. **Build Process Improvements** - Made it easier to modify this library and maintain changes with the examples.

## Tutorials, Demos & Examples

**Hosted Demo app showing unique use cases**: https://ng2-pdfjs-viewer.azurewebsites.net  
**Minimalistic angular sample app**: https://github.com/intbot/ng2-pdfjs-viewer/tree/master/SampleApp  

## Features

Some of below features are unique to this component, which is unavailable in native viewer or other implementations.  
✔️ **Open pdf in new window** 🌐 - Opens pdf viewer in new window. Also, you may set all allowable external window options.  
✔️ **Direct access to underlying viewer** 👨‍💻👩‍💻- Exposed PDFViewerApplication and PDFViewerApplicationOptions objects opens a whole world of customizable PDFJS and ViewerJS properties and methods, allowing to change them programmatically; thus producing a unique viewer experience.  
✔️ **Embed pdf** 🗎 - Embeds viewer and pdf inside your web page/component.  
✔️ **Blob and byte arrays** 🔟 - Have pdf as a byte array? Still works.  
✔️ **Events** ⚡ - Handle events such as document loaded, page change, page rotation, scale change, before/after print etc. Please make sure to provide `viewerId` for events to work properly.  
✔️ **Print preview** 🖨️ - You can set the pdf to open in a new tab or another browser window and provide an immediate print preview, A use case will be a 'Print' button opening pdf in new window with print dialog.  
✔️ **Defaults** - There are a ton of built in functionality Mozilla's viewer supports; such as print, download, bookmark, fullscreen, open file, zoom, search, pan, spread, navigate, attachments etc which is also available as-is in this viewer. Not mentioning them individually.  
✔️ **Auto download** 💾 - This option allows you to download the pdf file to user device automatically without manually invoking the download.  
✔️ **Auto print** 🖨️ - Automatically trigger print dialog when the document loads.  
✔️ **Auto rotate** 🔄 - Rotate the document _clockwise_ or _anti-clockwise_ 90° (+/- 90°) just before displaying. Useful if the document is misaligned.  
✔️ **Auto mode controls** 🎛️ - Automatically set cursor, scroll, and spread modes when the document loads.  
✔️ **Auto navigation** 🧭 - Automatically navigate to specific pages, zoom levels, named destinations, and page modes when the document loads.  
✔️ **Auto configuration** ⚙️ - Automatically set locale and other configuration options when the document loads.  
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

![angular pdfjs viewer in new window](./SampleImages/ng2pdfjsviewerExternal.JPG)

### Embed pdf into any angular component/page

![angular pdfjs viewer embedded](./SampleImages/ng2pdfjsviewerEmbedded.JPG)

## Installation

## Step 1: Install `ng2-pdfjs-viewer`

```bash
$ npm install ng2-pdfjs-viewer --save
```

And then configure it in your Angular `AppModule`:

```typescript
import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { AppComponent } from "./app.component";

import { PdfJsViewerModule } from "ng2-pdfjs-viewer"; // <-- Import PdfJsViewerModule module

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    PdfJsViewerModule, // <-- Add to declarations
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

## Step 2: Copy task for pdfjs

For several advanced options to work, you need a copy of pdfjs from this npm package.
Edit your project's `angular.json` file and use `ng build` as described here https://angular.io/guide/workspace-config#assets-configuration

```json
"assets": [
  { "glob": "**/*", "input": "node_modules/ng2-pdfjs-viewer/pdfjs", "output": "/assets/pdfjs" },
]
```

_Please note, you must manually Copy `node_modules\ng2-pdfjs-viewer\pdfjs` to your `public` or `asset` folder or use any copy script as part of your build process. Another method could be to use `TransferWebpackPlugin` if you are using webpack(https://github.com/dkokorev90/transfer-webpack-plugin)._  
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

| Attribute                     | Description                                                                                                                                                                                                                                        | Type             | Default Value                                            |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | -------------------------------------------------------- |
| `[pdfSrc]`                    | Fully qualified path to pdf file. (For remote pdf urls over http/https, CORS should be enabled)                                                                                                                                                    | `string`         |                                                          |
| `PDFViewerApplication`        | This public property exposes underlying PDFViewerApplication object. Make sure to access it after document is loaded. Opens up the whole world of underlying PDFJS properties and methods. Use it to customize the viewer and document experience. | `object`         |                                                          |
| `PDFViewerApplicationOptions` | This public property exposes underlying PDFViewerApplicationOptions object. Make sure to access it after document is loaded. Opens up the whole world of underlying PDFJS options. Use it to customize the viewer and document experience.         | `object`         |                                                          |
| `[viewerFolder]`              | Set path to _pdfjs's_ `web` and `build` folders.                                                                                                                                                                                                   | `string`         | `assets` folder path                                     |
| `[externalWindow]`            | Open in new tab. Set to `true` to open document in a new tab                                                                                                                                                                                       | `boolean`        | `false`                                                  |
| `externalWindowOptions`       | External window options. For allowed comma separated values, refer to https://developer.mozilla.org/en-US/docs/Web/API/Window/open                                                                                                                 | `string`         |                                                          |
| `(onDocumentLoad)`            | Event to be invoked once document is fully loaded(Must provide `viewerId`). Also returns number of pages in the `$event` parameter. E.g. `(onDocumentLoad)="testPagesLoaded($event)""`                                                             | `Function`       |                                                          |
| `(onPageChange)`              | Event to be invoked when user scrolls through pages(Must provide `viewerId`). Also returns current page number user is at in the `$event` parameter. E.g. `(onPageChange)="testPageChange($event)""`                                               | `Function`       |                                                          |
| `(onBeforePrint)`             | Event to be invoked before document gets printed(Must provide `viewerId`). E.g. `(onBeforePrint)="testBeforePrint()"`                                                                                                                              | `Function`       |                                                          |
| `(onAfterPrint)`              | Event to be invoked after document gets printed(Must provide `viewerId`). E.g. `(onAfterPrint)="testAfterPrint()"`                                                                                                                                 | `Function`       |                                                          |
| `downloadFileName`            | Sets/Changes the name of document to be downloaded. If the file name does not ends in `.pdf`, the component will automatically add it for you.                                                                                                     | `string`         | Actual name of the document                              |
| `[page]`                      | Show specific page. E.g _page=3_. You may also get/set the page number from your component using '.' notation explicitly, after document is loaded. E.g. `myPdfViewer.page = 3;`                                                                   | `number`         | `1`                                                      |
| `[namedDest]`                 | Go to a named destination. E.g. To go to section _5.1_ use like namedDest=5.1. Do not mix this option with _`page`_ option                                                                                                                          | `string`         |                                                          |
| `[(zoom)]`                    | Two-way binding for zoom level. Applicable values are `auto`, `page-width`, `page-height`, `page-fit`, `200`_(As a zoom percentage)_, `left offset`_(As in "auto,18,827")_, `top offset`_(As in "auto,18,127")_                                        | `string`         | `auto`                                                   |
| `[showPrint]`                 | Show/hide print button. Set `false` to hide                                                                                                                                                                                                        | `boolean`        | `true`                                                   |
| `[showDownload]`              | Show/hide download button. Set `false` to hide                                                                                                                                                                                                     | boolean          | `true`                                                   |
| `[showFind]`                  | Show/hide search button. Set `false` to hide                                                                                                                                                                                                       | boolean          | `true`                                                   |
| `[downloadOnLoad]`            | Download document automatically when it opens.                                                                                                                                                                                                     | `boolean`        | `false`                                                 |
| `[printOnLoad]`               | Print document automatically when it opens.                                                                                                                                                                                                        | `boolean`        | `false`                                                 |
| `[showLastPageOnLoad]`        | Go to last page automatically when document opens.                                                                                                                                                                                                 | `boolean`        | `false`                                                 |
| `[rotateCW]`                  | Rotate document clockwise 90° initially                                                                                                                                                                                                             | `boolean`        | `false`                                                 |
| `[rotateCCW]`                 | Rotate document counter-clockwise 90° initially                                                                                                                                                                                                    | `boolean`        | `false`                                                 |
| `[(cursor)]`                  | Two-way binding for cursor type. Available options are _`select`_, _`hand`_, _`zoom`_. Case is irrelevant.                                                                                                                                               | _`select`_   |                                                          |
| `[(scroll)]`                  | Two-way binding for scroll mode. Available options are _`vertical`_, _`horizontal`_, _`wrapped`_, _`page`_. Case is irrelevant.                                                                                                                           | _`vertical`_ |                                                          |
| `[(spread)]`                  | Two-way binding for spread mode. Available options are _`none`_, _`odd`_, _`even`_. Case is irrelevant.                                                                                                                                         | _`none`_     |                                                          |
| `[(pageMode)]`                | Two-way binding for page mode (sidebar). Available options are _`none`_, _`thumbs`_, _`bookmarks`_, _`attachments`_.                                                                                                                                     | _`none`_         |                                                          |
| `[(rotation)]`                | Two-way binding for document rotation. Value in degrees (0, 90, 180, 270).                                                                                                                                     | _`0`_         |                                                          |
| `[showFullScreen]`            | Show/hide presentation(full screen) button. Set `false` to hide                                                                                                                                                                                    | `boolean`        | `true`                                                   |
| `[showOpenFile]`              | Show/hide open file button. Set `false` to hide                                                                                                                                                                                                    | boolean          | `true`                                                   |
| `[showViewBookmark]`          | Show/hide bookmark button. Set `false` to hide                                                                                                                                                                                                     | boolean          | `true`                                                   |
| `[showSpinner]`               | Show a simple css based spinner/progress before the document loads                                                                                                                                                                                 | boolean          | `true`                                                   |
| `[locale]`                    | Set locale(language) of toolbar/buttons and other viewer elements. E.g. 'de-AT', 'en-GB' etc                                                                                                                                                       | string           | browser's default language if present, otherwise `en-US` |
| `[useOnlyCssZoom]`            | Instructs the viewer to use css based zoom. This will produce better zoom effect on mobile devices and tablets.                                                                                                                                    | boolean          | `false`                                                  |
| `errorMessage`                | Custom error message                                                                                                                                                                                                                               | string           |                                                          |
| `[errorAppend]`               | Appends custom error message to the end of other pdfjs error messages                                                                                                                                                                              | `true`           |
| `[errorOverride]`             | Overrides all pdfjs error messages and shows only user's custom error message                                                                                                                                                                      | boolean          | `false`                                                  |
| `[diagnosticLogs]`            | Turns on all diagnostic logs to the console                                                                                                                                                                                                        | boolean          | `true`                                                   |

**_Please note, copy step is mandatory to enjoy all of the different options listed above. You may also avoid this step and could directly use https://github.com/mozilla/pdf.js/wiki/Setup-pdf.js-in-a-website if you wish to just use the default viewer_**

## Deprecated Properties

The following properties are deprecated and will be removed in a future version. Please use the new property names instead.

| Deprecated Property | New Property | Description |
|-------------------|--------------|-------------|
| `[startDownload]` | `[downloadOnLoad]` | Download document automatically when it opens |
| `[startPrint]` | `[printOnLoad]` | Print document automatically when it opens |
| `[cursor]` | `[(cursor)]` | Type of cursor (select/hand/zoom) |
| `[scroll]` | `[(scroll)]` | Sets scroll mode (vertical/horizontal/wrapped/page) |
| `[spread]` | `[(spread)]` | Sets spread mode (none/odd/even) |
| `[zoom]` | `[(zoom)]` | Set zoom level of document |
| `[nameddest]` | `[namedDest]` | Go to a named destination |
| `[pagemode]` | `[(pageMode)]` | State of sidebar (none/thumbs/bookmarks/attachments) |
| `[locale]` | `[locale]` | Set locale of toolbar/buttons |
| `[useOnlyCssZoom]` | `[useOnlyCssZoom]` | Use CSS-based zoom for mobile devices |
| `[rotatecw]` | `[rotateCW]` | Rotate document clockwise 90° initially |
| `[rotateccw]` | `[rotateCCW]` | Rotate document counter-clockwise 90° initially |
| `[openFile]` | `[showOpenFile]` | Show/hide open file button |
| `[download]` | `[showDownload]` | Show/hide download button |
| `[print]` | `[showPrint]` | Show/hide print button |
| `[fullScreen]` | `[showFullScreen]` | Show/hide full screen button |
| `[find]` | `[showFind]` | Show/hide search button |
| `[viewBookmark]` | `[showViewBookmark]` | Show/hide bookmark button |
| `[lastPage]` | `[showLastPageOnLoad]` | Go to last page automatically when document opens |

**Note**: When using deprecated properties, a console warning will be displayed to remind you to update to the new property names.

**Important Notes:**
- **Locale changes**: Locale changes require a viewer refresh to take effect, as they affect the entire viewer interface
- **Page Mode (Bookmarks/Attachments)**: These options will only show content if the PDF document contains bookmarks or attachments
- **Scroll Mode**: The "Page" scroll mode provides page-by-page scrolling instead of continuous scrolling

## On-Demand Methods

In addition to setting properties, you can also execute actions on-demand using the following methods:

| Method | Description | Parameters | Returns |
|--------|-------------|------------|---------|
| `setCursor(cursor)` | Set cursor mode on-demand | `cursor: 'select' \| 'hand' \| 'zoom'` | `Promise<ActionExecutionResult>` |
| `setScroll(scroll)` | Set scroll mode on-demand | `scroll: 'vertical' \| 'horizontal' \| 'wrapped' \| 'page'` | `Promise<ActionExecutionResult>` |
| `setSpread(spread)` | Set spread mode on-demand | `spread: 'none' \| 'odd' \| 'even'` | `Promise<ActionExecutionResult>` |
| `setZoom(zoom)` | Set zoom level on-demand | `zoom: string` | `Promise<ActionExecutionResult>` |
| `goToPage(page)` | Navigate to specific page on-demand | `page: number` | `Promise<ActionExecutionResult>` |
| `goToNamedDestination(destination)` | Navigate to named destination on-demand | `destination: string` | `Promise<ActionExecutionResult>` |
| `setPageMode(mode)` | Set page mode on-demand | `mode: 'none' \| 'thumbs' \| 'bookmarks' \| 'attachments'` | `Promise<ActionExecutionResult>` |
| `setLocale(locale)` | Set locale on-demand | `locale: string` | `Promise<ActionExecutionResult>` |
| `triggerDownload()` | Trigger download on-demand | None | `Promise<ActionExecutionResult>` |
| `triggerPrint()` | Trigger print on-demand | None | `Promise<ActionExecutionResult>` |
| `triggerRotation(direction)` | Rotate document on-demand | `direction: 'cw' \| 'ccw'` | `Promise<ActionExecutionResult>` |

**Example:**
```typescript
// Set cursor to hand mode on-demand
await pdfViewer.setCursor('hand');

// Set scroll to horizontal mode on-demand
await pdfViewer.setScroll('horizontal');

// Set spread to odd mode on-demand
await pdfViewer.setSpread('odd');
```

## Usage

_For your convenience a sample app using angular is available under this repository, if you would like to see it in action (Folder SampleApp). It shows many ways to configure this component for different needs._

Once your PdfJsViewerComponent is imported you can use it in your Angular application like this:

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
    [showOpenFile]="false"
    [showViewBookmark]="false"
    [showDownload]="false"></ng2-pdfjs-viewer>
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

## E-Signature Support

Original issue -> PDF.JS is not able to load the signature in the pdf if that is done via the any **E-Signature** tool.

Resolution of the issue -> To support this feature need to comment/remove the below code from pdf.worker.js file and file path i.e. lib\pdfjs\build\pdf.worker.js

**Original issue code**

```javascript
if (data.fieldType === "Sig") {
  data.fieldValue = null;

  _this3.setFlags(_util.AnnotationFlag.HIDDEN);
}
```

**Resoultion code**

```javascript
if (data.fieldType === "Sig") {
  data.fieldValue = null;

  _this3.setFlags(_util.AnnotationFlag.HIDDEN); //remove or comment this line
}
```

## Stack Overflow Support

Have a question? Ask questions and find answers on Stack overflow.

[Stack Overflow](https://stackoverflow.com/questions/tagged/ng2-pdfjs-viewer)

## Looking for old AngularJS? - The below library is quite useful

AngularJS [angular-pdfjs-viewer](https://github.com/legalthings/angular-pdfjs-viewer)

## License

\*\*Apache V2 License - https://www.apache.org/licenses/LICENSE-2.0

## More reading
https://github.com/mozilla/pdf.js/wiki/Setup-pdf.js-in-a-website
https://github.com/mozilla/pdf.js/wiki/Third-party-viewer-usage
https://github.com/mozilla/pdf.js/wiki/Viewer-options


