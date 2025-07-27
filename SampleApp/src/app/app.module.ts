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
import { FeaturesComponent } from './features/features.component';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatTableModule as MatTableModule} from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';

const MATERIAL_IMPORTS = [
  BrowserAnimationsModule,
  MatToolbarModule,
  MatButtonModule,
  MatCardModule,
  MatTabsModule,
  MatSlideToggleModule,
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule,
  MatIconModule,
  MatTooltipModule,
  MatDividerModule,
  MatExpansionModule
];

@NgModule({
  declarations: [
    AppComponent,
    InlineComponent,
    BigComponent,
    DynamicComponent,
    FeaturesComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    PdfJsViewerModule,
    MatGridListModule,
    MatTableModule,
    FormsModule,
    MATERIAL_IMPORTS
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
