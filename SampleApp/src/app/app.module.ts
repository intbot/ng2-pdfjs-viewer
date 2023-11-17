import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
// ----> Import PdfJsViewerModule here
import { PdfJsViewerModule } from 'ng2-pdfjs-viewer';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatButtonModule as MatButtonModule} from '@angular/material/button';
import { InlineComponent } from './inline/inline.component';
import { BigComponent } from './big/big.component';
import { DynamicComponent } from './dynamic/dynamic.component';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatTableModule as MatTableModule} from '@angular/material/table';

const MATERIAL_IMPORTS = [
  BrowserAnimationsModule,
  MatToolbarModule,
  MatButtonModule
];

@NgModule({
  declarations: [
    AppComponent,
    InlineComponent,
    BigComponent,
    DynamicComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    PdfJsViewerModule,
    MatGridListModule,
    MatTableModule,
    MATERIAL_IMPORTS
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
