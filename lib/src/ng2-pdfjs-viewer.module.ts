import { ModuleWithProviders, NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { PdfJsViewerComponent } from "./ng2-pdfjs-viewer.component";

@NgModule({
  imports: [CommonModule],
  declarations: [PdfJsViewerComponent],
  exports: [PdfJsViewerComponent],
})
export class PdfJsViewerModule {
  /** @deprecated Import PdfJsViewerModule directly; forRoot() registers no providers. */
  static forRoot(): ModuleWithProviders<PdfJsViewerModule> {
    return {
      ngModule: PdfJsViewerModule,
    };
  }
}
