import { Component, computed, inject, signal } from '@angular/core';
import { PdfJsViewerModule } from 'ng2-pdfjs-viewer';
import { CodeBinding } from '../../core/models';
import { CodeGenService } from '../../core/services/code-gen.service';
import { SamplePdfService } from '../../core/services/sample-pdf.service';
import { PlaygroundLayoutComponent } from '../../shared/playground-layout.component';

@Component({
  selector: 'pg-auto-actions',
  standalone: true,
  imports: [PlaygroundLayoutComponent, PdfJsViewerModule],
  templateUrl: './auto-actions.component.html',
  styles: [`.note { font-size: 11.5px; color: var(--faint); line-height: 1.5; margin: 4px 0 0; }`],
})
export class AutoActionsComponent {
  private readonly codegen = inject(CodeGenService);
  private readonly samples = inject(SamplePdfService);
  readonly src = computed(() => this.samples.current().src);

  readonly downloadOnLoad = signal(false);
  readonly printOnLoad = signal(false);
  readonly showLastPageOnLoad = signal(false);
  readonly rotateCW = signal(false);
  readonly rotateCCW = signal(false);
  readonly downloadFileName = signal('document.pdf');
  /** bump to force re-create so auto actions re-run */
  readonly runKey = signal(0);

  readonly toggles: { key: string; sig: ReturnType<typeof signal<boolean>>; label: string }[] = [
    { key: 'downloadOnLoad', sig: this.downloadOnLoad, label: 'Download on load' },
    { key: 'printOnLoad', sig: this.printOnLoad, label: 'Print on load' },
    { key: 'showLastPageOnLoad', sig: this.showLastPageOnLoad, label: 'Open at last page' },
    { key: 'rotateCW', sig: this.rotateCW, label: 'Rotate clockwise' },
    { key: 'rotateCCW', sig: this.rotateCCW, label: 'Rotate counter-clockwise' },
  ];

  setName(e: Event): void { this.downloadFileName.set((e.target as HTMLInputElement).value); }
  rerun(): void { this.runKey.update((k) => k + 1); }
  /** Load-time actions only fire on document load — re-create the viewer to replay it. */
  toggle(t: { sig: ReturnType<typeof signal<boolean>> }): void {
    t.sig.set(!t.sig());
    this.rerun();
  }

  readonly code = computed(() => {
    const b: CodeBinding[] = [
      { name: 'pdfSrc', value: 'pdfSrc', kind: 'expr' },
      { name: 'downloadFileName', value: this.downloadFileName(), kind: 'string', omitWhen: 'document.pdf' },
    ];
    for (const t of this.toggles) b.push({ name: t.key, value: t.sig(), kind: 'boolean', omitWhen: false });
    return this.codegen.generate(b);
  });
}
