import { Component, computed, inject, signal } from '@angular/core';
import { PdfJsViewerModule } from 'ng2-pdfjs-viewer';
import { CodeBinding } from '../../core/models';
import { CodeGenService } from '../../core/services/code-gen.service';
import { SamplePdfService } from '../../core/services/sample-pdf.service';
import { PlaygroundLayoutComponent } from '../../shared/playground-layout.component';

type Toggle = { key: string; sig: ReturnType<typeof signal<boolean>>; label: string };

@Component({
  selector: 'pg-toolbar',
  standalone: true,
  imports: [PlaygroundLayoutComponent, PdfJsViewerModule],
  templateUrl: './toolbar.component.html',
})
export class ToolbarComponent {
  private readonly codegen = inject(CodeGenService);
  private readonly samples = inject(SamplePdfService);
  readonly src = computed(() => this.samples.current().src);

  readonly showOpenFile = signal(true);
  readonly showDownload = signal(true);
  readonly showPrint = signal(true);
  readonly showFind = signal(true);
  readonly showFullScreen = signal(true);
  readonly showViewBookmark = signal(true);
  readonly showAnnotations = signal(false);

  readonly showToolbarLeft = signal(true);
  readonly showToolbarMiddle = signal(true);
  readonly showToolbarRight = signal(true);
  readonly showSecondaryToolbarToggle = signal(true);
  readonly showSidebar = signal(true);

  readonly toggles: Toggle[] = [
    { key: 'showOpenFile', sig: this.showOpenFile, label: 'Open file' },
    { key: 'showDownload', sig: this.showDownload, label: 'Download' },
    { key: 'showPrint', sig: this.showPrint, label: 'Print' },
    { key: 'showFind', sig: this.showFind, label: 'Find' },
    { key: 'showFullScreen', sig: this.showFullScreen, label: 'Full screen' },
    { key: 'showViewBookmark', sig: this.showViewBookmark, label: 'Bookmark' },
    { key: 'showAnnotations', sig: this.showAnnotations, label: 'Annotations' },
  ];

  readonly groupToggles: Toggle[] = [
    { key: 'showToolbarLeft', sig: this.showToolbarLeft, label: 'Toolbar left' },
    { key: 'showToolbarMiddle', sig: this.showToolbarMiddle, label: 'Toolbar middle' },
    { key: 'showToolbarRight', sig: this.showToolbarRight, label: 'Toolbar right' },
    { key: 'showSecondaryToolbarToggle', sig: this.showSecondaryToolbarToggle, label: 'Secondary toggle (»)' },
    { key: 'showSidebar', sig: this.showSidebar, label: 'Sidebar' },
  ];

  readonly code = computed(() => {
    const b: CodeBinding[] = [{ name: 'pdfSrc', value: 'pdfSrc', kind: 'expr' }];
    for (const t of this.toggles) {
      // defaults: showAnnotations=false, everything else=true — omit at default
      b.push({ name: t.key, value: t.sig(), kind: 'boolean', omitWhen: t.key !== 'showAnnotations' });
    }
    for (const t of this.groupToggles) {
      b.push({ name: t.key, value: t.sig(), kind: 'boolean', omitWhen: true });
    }
    return this.codegen.generate(b);
  });
}
