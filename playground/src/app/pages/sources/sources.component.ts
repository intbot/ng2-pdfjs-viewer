import { Component, computed, inject, signal } from '@angular/core';
import { PdfJsViewerComponent, PdfJsViewerModule } from 'ng2-pdfjs-viewer';
import { CodeGenService } from '../../core/services/code-gen.service';
import { SamplePdfService } from '../../core/services/sample-pdf.service';
import { PlaygroundLayoutComponent } from '../../shared/playground-layout.component';

@Component({
  selector: 'pg-sources',
  standalone: true,
  imports: [PlaygroundLayoutComponent, PdfJsViewerModule],
  templateUrl: './sources.component.html',
  styles: [`
    .hint { font-size: 12px; color: var(--muted); margin: 0; line-height: 1.5; }
    .hint code { font-family: var(--mono); font-size: 11.5px; color: var(--c); }
    .file { font-size: 12px; color: var(--muted); }
  `],
})
export class SourcesComponent {
  private readonly codegen = inject(CodeGenService);
  private readonly samples = inject(SamplePdfService);

  readonly kind = signal<'url' | 'blob' | 'bytes'>('url');
  readonly src = signal<string | Blob | Uint8Array>(this.samples.current().src);

  async useKind(kind: 'url' | 'blob' | 'bytes'): Promise<void> {
    this.kind.set(kind);
    const url = this.samples.current().src;
    if (kind === 'url') { this.src.set(url); return; }
    const buf = await (await fetch(url)).arrayBuffer();
    this.src.set(kind === 'blob' ? new Blob([buf], { type: 'application/pdf' }) : new Uint8Array(buf));
  }

  onFile(e: Event): void {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) { this.kind.set('blob'); this.src.set(file); }
  }

  /** Must run synchronously in the click so the browser allows the popup. */
  openExternal(viewer: PdfJsViewerComponent): void {
    viewer.pdfSrc = this.samples.current().src;
    viewer.refresh();
  }

  readonly code = computed(() => {
    const expr = this.kind() === 'url' ? 'pdfSrc' : this.kind() === 'blob' ? 'blob' : 'bytes';
    return this.codegen.generate([{ name: 'pdfSrc', value: expr, kind: 'expr' }]);
  });
}
