import { Component, computed, inject } from '@angular/core';
import { PdfJsViewerModule } from 'ng2-pdfjs-viewer';
import { CodeGenService } from '../../core/services/code-gen.service';
import { SamplePdfService } from '../../core/services/sample-pdf.service';
import { PlaygroundLayoutComponent } from '../../shared/playground-layout.component';

@Component({
  selector: 'pg-quickstart',
  standalone: true,
  imports: [PlaygroundLayoutComponent, PdfJsViewerModule],
  templateUrl: './quickstart.component.html',
  styles: [`
    .hint { font-size: 12px; color: var(--muted); margin: 0; line-height: 1.5; }
    .hint code, .steps code { font-family: var(--mono); font-size: 11.5px; color: var(--c); }
    .steps { margin: 0; padding-left: 18px; font-size: 12.5px; color: var(--ink); line-height: 1.7; }
  `],
})
export class QuickStartComponent {
  private readonly codegen = inject(CodeGenService);
  private readonly samples = inject(SamplePdfService);
  readonly src = computed(() => this.samples.current().src);

  readonly code = computed(() =>
    this.codegen.generate([
      { name: 'pdfSrc', value: 'pdfSrc', kind: 'expr' },
      { name: 'viewerId', value: 'quickstart', kind: 'string' },
    ]),
  );
}
