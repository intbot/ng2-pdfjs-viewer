import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PdfJsViewerComponent } from './src/ng2-pdfjs-viewer.component';

export * from './src/ng2-pdfjs-viewer.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    PdfJsViewerComponent
  ],
  exports: [
    PdfJsViewerComponent
  ]
})
export class PdfJsViewerModule {
  static forRoot(): ModuleWithProviders<PdfJsViewerModule> {
    return {
      ngModule: PdfJsViewerModule
    };
  }
}
