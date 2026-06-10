import { Component, TemplateRef, computed, inject, signal, viewChild } from '@angular/core';
import { PdfJsViewerModule } from 'ng2-pdfjs-viewer';
import { CodeBinding } from '../../core/models';
import { CodeGenService } from '../../core/services/code-gen.service';
import { SamplePdfService } from '../../core/services/sample-pdf.service';
import { PlaygroundLayoutComponent } from '../../shared/playground-layout.component';

type ErrTpl = 'none' | 'branded' | 'minimal';

@Component({
  selector: 'pg-errors',
  standalone: true,
  imports: [PlaygroundLayoutComponent, PdfJsViewerModule],
  templateUrl: './errors.component.html',
  // .pge-* template styles are global (styles.scss): the templates render
  // inside the viewer component's overlay, outside this component's DOM.
  styles: [`.note { font-size: 11.5px; color: var(--faint); line-height: 1.5; }`],
})
export class ErrorsComponent {
  private readonly codegen = inject(CodeGenService);
  private readonly samples = inject(SamplePdfService);

  readonly broken = signal(false);
  readonly errorOverride = signal(true);
  readonly errorAppend = signal(true);
  readonly errorMessage = signal('We couldn’t load this document. Please try again.');
  readonly urlValidation = signal(true);

  readonly errTpl = signal<ErrTpl>('none');
  readonly errTpls: ErrTpl[] = ['none', 'branded', 'minimal'];
  private readonly tplBranded = viewChild<TemplateRef<unknown>>('tplBranded');
  private readonly tplMinimal = viewChild<TemplateRef<unknown>>('tplMinimal');
  readonly selectedErrTpl = computed(() => {
    switch (this.errTpl()) {
      case 'branded': return this.tplBranded();
      case 'minimal': return this.tplMinimal();
      default: return undefined;
    }
  });

  // a same-origin path that 404s — triggers the real document-load error path
  // (a cross-origin URL would instead trip the viewer's urlValidation guard).
  readonly src = computed(() => (this.broken() ? '/assets/samples/missing-document.pdf' : this.samples.current().src));

  setMsg(e: Event): void { this.errorMessage.set((e.target as HTMLInputElement).value); }
  setTpl(e: Event): void { this.errTpl.set((e.target as HTMLSelectElement).value as ErrTpl); }

  readonly code = computed(() => {
    const b: CodeBinding[] = [
      { name: 'pdfSrc', value: 'pdfSrc', kind: 'expr' },
      { name: 'errorOverride', value: this.errorOverride(), kind: 'boolean', omitWhen: false },
      { name: 'errorAppend', value: this.errorAppend(), kind: 'boolean', omitWhen: true },
      { name: 'errorMessage', value: this.errorMessage(), kind: 'string', omitWhen: '' },
      { name: 'urlValidation', value: this.urlValidation(), kind: 'boolean', omitWhen: true },
    ];
    if (this.errTpl() !== 'none') b.push({ name: 'customErrorTpl', value: 'myErrorTpl', kind: 'expr' });
    return this.codegen.generate(b);
  });
}
