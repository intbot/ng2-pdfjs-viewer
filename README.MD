# @angular/ng2-pdfjs-viewer

## Installation

To install this library, run:

```bash
$ npm install @angular/ng2-pdfjs-viewer --save
```

## Consuming your library

Once you have published your library to npm, you can import your library in any Angular application by running:

```bash
$ npm install @angular/ng2-pdfjs-viewer
```

and then from your Angular `AppModule`:

```typescript
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';

// Import PdfJsViewerComponent component
import { PdfJsViewerComponent } from '@angular/ng2-pdfjs-viewer';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    // Add to imports
    PdfJsViewerComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

Once your PdfJsViewerComponent is imported  you can use it in your Angular application like this:

```xml
<!-- You can now use your library component in app.component.html -->
<h1>
  {{title}}
</h1>
<ng2-pdfjs-viewer pdfSrc="your pdf file path"></ng2-pdfjs-viewer>
```

Here is a use case to open the pdf as byte array embedded in same page:

Please note, pdfSrc can be a Blob() or Uint8Array as well

```xml
<!-- your.component.html -->
<button (click)="openPdf();"></button>

<ng2-pdfjs-viewer #pdfViewer style="width: 800px; height: 400px"
                  [externalWindow]="false"
                  [openFile]="false"
                  [viewBookmark]="false"
                  [download]="false"></ng2-pdfjs-viewer>
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

    this.downloadFile(url).subscribe(
      (res) => {
        this.pdfViewer.pdfSrc = res;
      }
    );
  }
```

## License

MIT © [Code1](mailto:codehippie1@gmail.com)
