import { Component, TemplateRef, computed, inject, signal, viewChild } from '@angular/core';
import { PdfJsViewerModule } from 'ng2-pdfjs-viewer';
import { CodeBinding } from '../../core/models';
import { CodeGenService } from '../../core/services/code-gen.service';
import { SamplePdfService } from '../../core/services/sample-pdf.service';
import { PlaygroundLayoutComponent } from '../../shared/playground-layout.component';

type TplKind = 'none' | 'dots' | 'bar' | 'pulse';

@Component({
  selector: 'pg-loading',
  standalone: true,
  imports: [PlaygroundLayoutComponent, PdfJsViewerModule],
  templateUrl: './loading.component.html',
  // .pgt-* template styles are global (styles.scss): the templates render
  // inside the viewer component's loading overlay, outside this component.
})
export class LoadingComponent {
  private readonly codegen = inject(CodeGenService);
  private readonly samples = inject(SamplePdfService);
  readonly src = computed(() => this.samples.current().src);

  readonly showSpinner = signal(true);
  readonly spinnerClass = signal('');
  readonly spinnerClasses = ['', 'pg-spin', 'pg-dots', 'pg-bar'];

  readonly customTpl = signal<TplKind>('none');
  readonly tplKinds: TplKind[] = ['none', 'dots', 'bar', 'pulse'];
  private readonly tplDots = viewChild<TemplateRef<unknown>>('tplDots');
  private readonly tplBar = viewChild<TemplateRef<unknown>>('tplBar');
  private readonly tplPulse = viewChild<TemplateRef<unknown>>('tplPulse');
  readonly selectedTpl = computed(() => {
    switch (this.customTpl()) {
      case 'dots': return this.tplDots();
      case 'bar': return this.tplBar();
      case 'pulse': return this.tplPulse();
      default: return undefined;
    }
  });

  /** Spinners only show while a document loads — bump to replay the load. */
  readonly runKey = signal(0);
  rerun(): void { this.runKey.update((k) => k + 1); }

  setClass(e: Event): void { this.spinnerClass.set((e.target as HTMLSelectElement).value); }
  setTpl(e: Event): void { this.customTpl.set((e.target as HTMLSelectElement).value as TplKind); }

  readonly code = computed(() => {
    const b: CodeBinding[] = [
      { name: 'pdfSrc', value: 'pdfSrc', kind: 'expr' },
      { name: 'showSpinner', value: this.showSpinner(), kind: 'boolean', omitWhen: true },
      { name: 'spinnerClass', value: this.spinnerClass(), kind: 'string', omitWhen: '' },
    ];
    if (this.customTpl() !== 'none') b.push({ name: 'customSpinnerTpl', value: 'mySpinnerTpl', kind: 'expr' });
    return this.codegen.generate(b);
  });
}
