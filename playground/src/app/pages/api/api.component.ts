import { Component, computed, inject, signal } from '@angular/core';
import { PdfJsViewerComponent, PdfJsViewerModule } from 'ng2-pdfjs-viewer';
import { CodeGenService } from '../../core/services/code-gen.service';
import { SamplePdfService } from '../../core/services/sample-pdf.service';
import { PlaygroundLayoutComponent } from '../../shared/playground-layout.component';

@Component({
  selector: 'pg-api',
  standalone: true,
  imports: [PlaygroundLayoutComponent, PdfJsViewerModule],
  templateUrl: './api.component.html',
  styleUrl: './api.component.scss',
})
export class ApiComponent {
  private readonly codegen = inject(CodeGenService);
  private readonly samples = inject(SamplePdfService);
  readonly src = computed(() => this.samples.current().src);

  readonly page = signal(1);
  readonly currentPage = signal(1);
  readonly scale = signal('—');
  readonly rotationDeg = signal(0);

  // live inspector rows
  readonly rows = computed(() => [
    { k: 'page', v: String(this.currentPage()) },
    { k: 'scale', v: String(this.scale()) },
    { k: 'rotation', v: this.rotationDeg() + '°' },
    { k: 'source', v: this.samples.current().label },
  ]);

  go(delta: number): void { this.page.set(Math.max(1, this.page() + delta)); }

  async call(viewer: PdfJsViewerComponent, m: 'download' | 'print' | 'rotateCW' | 'rotateCCW' | 'refresh'): Promise<void> {
    switch (m) {
      case 'download': await viewer.triggerDownload(); break;
      case 'print': await viewer.triggerPrint(); break;
      case 'rotateCW': await viewer.triggerRotation('cw'); break;
      case 'rotateCCW': await viewer.triggerRotation('ccw'); break;
      case 'refresh': viewer.refresh(); break;
    }
  }

  onPage(e: unknown): void {
    const n = typeof e === 'number' ? e : Number((e as { pageNumber?: number })?.pageNumber);
    if (!Number.isNaN(n) && n) this.currentPage.set(n);
  }
  onScale(e: unknown): void {
    const s = (e as { scale?: number | string })?.scale ?? e;
    this.scale.set(String(s));
  }
  onRotation(e: unknown): void {
    const r = (e as { rotation?: number })?.rotation ?? e;
    if (typeof r === 'number') this.rotationDeg.set(r);
  }

  readonly code = computed(() =>
    [
      `@ViewChild('viewer') viewer!: PdfJsViewerComponent;`,
      ``,
      `// drive it imperatively`,
      `this.viewer.page = ${this.page()};`,
      ``,
      this.codegen.generate([{ name: 'pdfSrc', value: 'pdfSrc', kind: 'expr' }, { name: 'page', value: this.page(), kind: 'number', omitWhen: 1 }]),
    ].join('\n'),
  );
}
