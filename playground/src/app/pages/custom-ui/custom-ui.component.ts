import { Component, computed, inject, signal } from '@angular/core';
import { PdfJsViewerModule } from 'ng2-pdfjs-viewer';
import { SamplePdfService } from '../../core/services/sample-pdf.service';
import { ThemeService } from '../../core/services/theme.service';
import { PlaygroundLayoutComponent } from '../../shared/playground-layout.component';

@Component({
  selector: 'pg-custom-ui',
  standalone: true,
  imports: [PlaygroundLayoutComponent, PdfJsViewerModule],
  templateUrl: './custom-ui.component.html',
  styles: [`
    .note { font-size: 11.5px; color: var(--faint); line-height: 1.5; margin: 4px 0 0; }
    .host-toolbar {
      display: flex; align-items: center; gap: 8px;
      padding: 6px 10px; background: var(--panel-2, #181820);
      border-bottom: 1px solid var(--border, #2a2a33);
      font-size: 12px;
    }
    .host-toolbar button {
      background: var(--panel, #222); color: inherit; border: 1px solid var(--border, #333);
      border-radius: 5px; padding: 3px 10px; cursor: pointer; font-size: 12px;
    }
    .host-toolbar .brand { font-weight: 700; letter-spacing: .04em; margin-right: auto; }
    .badge-overlay {
      position: absolute; top: 8px; right: 8px;
      background: #c2410c; color: white; font: 700 10px/1 sans-serif;
      padding: 4px 8px; border-radius: 999px; letter-spacing: .06em;
    }
  `],
})
export class CustomUiComponent {
  private readonly samples = inject(SamplePdfService);
  readonly theme = inject(ThemeService);
  readonly src = computed(() => this.samples.current().src);

  readonly useCustomToolbar = signal(true);
  readonly useOverlays = signal(true);
  readonly currentPage = signal(1);

  onPage(e: unknown): void {
    const n = typeof e === 'number' ? e : Number((e as { pageNumber?: number })?.pageNumber);
    if (!Number.isNaN(n) && n) this.currentPage.set(n);
  }

  readonly code = computed(() => [
    `<!-- your own toolbar, rendered ABOVE the viewer -->`,
    `<ng-template #toolbar let-viewer>`,
    `  <div class="my-toolbar">`,
    `    <button (click)="viewer.setPage(viewer.page - 1)">‹</button>`,
    `    <button (click)="viewer.setPage(viewer.page + 1)">›</button>`,
    `    <button (click)="viewer.setZoom('page-width')">Fit width</button>`,
    `    <button (click)="viewer.triggerDownload()">Download</button>`,
    `  </div>`,
    `</ng-template>`,
    ``,
    `<!-- a per-page overlay (badges, stamps, review UI) -->`,
    `<ng-template #overlay let-page>`,
    `  <span class="badge">PAGE {{ '{{' }} page {{ '}}' }}</span>`,
    `</ng-template>`,
    ``,
    `<ng2-pdfjs-viewer`,
    `  [pdfSrc]="pdfSrc"`,
    `  [customToolbarTpl]="toolbar"`,
    `  [showToolbar]="false"      <!-- hide the native toolbar -->`,
    `  [pageOverlayTpl]="overlay">`,
    `</ng2-pdfjs-viewer>`,
  ].join('\n'));
}
