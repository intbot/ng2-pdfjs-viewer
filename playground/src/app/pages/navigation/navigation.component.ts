import { Component, computed, inject, signal } from '@angular/core';
import { PdfJsViewerModule } from 'ng2-pdfjs-viewer';
import { CodeBinding } from '../../core/models';
import { CodeGenService } from '../../core/services/code-gen.service';
import { SamplePdfService } from '../../core/services/sample-pdf.service';
import { ThemeService } from '../../core/services/theme.service';
import { PlaygroundLayoutComponent } from '../../shared/playground-layout.component';

@Component({
  selector: 'pg-navigation',
  standalone: true,
  imports: [PlaygroundLayoutComponent, PdfJsViewerModule],
  templateUrl: './navigation.component.html',
  styles: [`.note { font-size: 11.5px; color: var(--faint); line-height: 1.5; margin: 4px 0 0; }`],
})
export class NavigationComponent {
  private readonly codegen = inject(CodeGenService);
  private readonly samples = inject(SamplePdfService);
  readonly theme = inject(ThemeService);
  readonly src = computed(() => this.samples.current().src);

  readonly zoom = signal('auto');
  readonly cursor = signal('select');
  readonly scroll = signal('vertical');
  readonly spread = signal('none');
  readonly pageMode = signal('none');
  readonly rotation = signal(0);
  readonly page = signal(1);
  readonly namedDest = signal('');

  // PDF.js scale values: keywords, or a numeric string where 1 = 100%.
  readonly zooms: { v: string; l: string }[] = [
    { v: 'auto', l: 'Auto' },
    { v: 'page-fit', l: 'Page fit' },
    { v: 'page-width', l: 'Page width' },
    { v: 'page-actual', l: 'Actual size' },
    { v: '0.5', l: '50%' },
    { v: '0.75', l: '75%' },
    { v: '1', l: '100%' },
    { v: '1.25', l: '125%' },
    { v: '1.5', l: '150%' },
    { v: '2', l: '200%' },
  ];
  readonly scrolls = ['vertical', 'horizontal', 'wrapped', 'page'];
  readonly pageModes = ['none', 'thumbs', 'bookmarks', 'attachments'];

  readonly code = computed(() => {
    const b: CodeBinding[] = [
      { name: 'pdfSrc', value: 'pdfSrc', kind: 'expr' },
      { name: 'page', value: this.page(), kind: 'number', omitWhen: 1 },
      { name: 'zoom', value: this.zoom(), kind: 'string', twoWay: true, omitWhen: 'auto' },
      { name: 'cursor', value: this.cursor(), kind: 'string', twoWay: true, omitWhen: 'select' },
      { name: 'scroll', value: this.scroll(), kind: 'string', twoWay: true, omitWhen: 'vertical' },
      { name: 'spread', value: this.spread(), kind: 'string', twoWay: true, omitWhen: 'none' },
      { name: 'pageMode', value: this.pageMode(), kind: 'string', twoWay: true, omitWhen: 'none' },
      { name: 'rotation', value: this.rotation(), kind: 'number', omitWhen: 0 },
      { name: 'namedDest', value: this.namedDest(), kind: 'string', omitWhen: '' },
    ];
    return this.codegen.generate(b);
  });

  setStr(sig: { set: (v: string) => void }, e: Event): void {
    sig.set((e.target as HTMLSelectElement).value);
  }
  /** The viewer reports user zoom as a numeric scale ("0.87…"), not a preset. */
  isNamedZoom(v: string): boolean { return this.zooms.some((z) => z.v === v); }
  fmtZoom(v: string): string {
    const n = Number(v);
    return Number.isFinite(n) ? `${Math.round(n * 100)}%` : v;
  }
  setPage(e: Event): void { this.page.set(Number((e.target as HTMLInputElement).value)); }
  rotate(delta: number): void { this.rotation.set((((this.rotation() + delta) % 360) + 360) % 360); }
}
