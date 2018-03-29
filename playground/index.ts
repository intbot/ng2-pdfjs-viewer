/**
 * This is only for local test
 */
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { Component } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { PdfJsViewerComponent }  from 'ng2-pdfjs-viewer';

@Component({
  selector: 'app',
  template: `<ng2-pdfjs-viewer></ng2-pdfjs-viewer>`
})
class AppComponent {}

@NgModule({
  bootstrap: [ AppComponent ],
  declarations: [ AppComponent ],
  imports: [ BrowserModule, PdfJsViewerComponent ]
})
class AppModule {}

platformBrowserDynamic().bootstrapModule(AppModule);
