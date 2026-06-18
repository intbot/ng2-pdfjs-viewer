import { Component, computed, inject, signal } from '@angular/core';
import { PdfJsViewerModule, ExternalLinkTarget, PagesEditedEvent } from 'ng2-pdfjs-viewer';
import { SamplePdfService } from '../../core/services/sample-pdf.service';
import { ThemeService } from '../../core/services/theme.service';
import { PlaygroundLayoutComponent } from '../../shared/playground-layout.component';

@Component({
  selector: 'pg-power',
  standalone: true,
  imports: [PlaygroundLayoutComponent, PdfJsViewerModule],
  templateUrl: './power.component.html',
  styles: [`.note { font-size: 11.5px; color: var(--faint); line-height: 1.5; margin: 4px 0 0; }`],
})
export class PowerComponent {
  private readonly samples = inject(SamplePdfService);
  readonly theme = inject(ThemeService);
  readonly src = computed(() => this.samples.current().src);

  readonly pageEditing = signal(false);
  readonly darkPages = signal(false);
  readonly rememberLastView = signal(true);
  readonly linkTarget = signal<ExternalLinkTarget>('blank');
  readonly lastPagesEdit = signal<PagesEditedEvent | null>(null);

  readonly linkTargets: ExternalLinkTarget[] = ['blank', 'top', 'self', 'none'];
  readonly pageColors = computed(() =>
    this.darkPages() ? { background: '#1e1e1e', foreground: '#e8e8e8' } : null
  );

  onPagesEdited(e: PagesEditedEvent): void { this.lastPagesEdit.set(e); }
  setTarget(e: Event): void { this.linkTarget.set((e.target as HTMLSelectElement).value as ExternalLinkTarget); }

  readonly code = computed(() => [
    `<ng2-pdfjs-viewer`,
    `  [pdfSrc]="pdfSrc"`,
    `  [enablePageEditing]="${this.pageEditing()}"   // reorder/delete/extract/merge in the sidebar`,
    this.darkPages()
      ? `  [pageColors]="{ background: '#1e1e1e', foreground: '#e8e8e8' }" // true dark pages`
      : `  [pageColors]="null"`,
    `  [rememberLastView]="${this.rememberLastView()}" // false = always open at page 1`,
    `  [externalLinkTarget]="'${this.linkTarget()}'"`,
    `  (onPagesEdited)="onPagesEdited($event)">`,
    `</ng2-pdfjs-viewer>`,
    ``,
    `// also available: allowlisted PDF.js options passthrough`,
    `// [pdfJsOptions]="{ printResolution: 300, sidebarViewOnLoad: 1 }"`,
    ``,
    `// authenticated loading (JWT / signed URLs):`,
    `// [httpHeaders]="{ Authorization: 'Bearer ' + token }" (onProgress)="..."`,
  ].join('\n'));
}
