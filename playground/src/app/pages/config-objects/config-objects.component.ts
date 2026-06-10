import { Component, computed, inject, signal } from '@angular/core';
import { PdfJsViewerModule } from 'ng2-pdfjs-viewer';
import { CodeGenService } from '../../core/services/code-gen.service';
import { SamplePdfService } from '../../core/services/sample-pdf.service';
import { PlaygroundLayoutComponent } from '../../shared/playground-layout.component';

@Component({
  selector: 'pg-config-objects',
  standalone: true,
  imports: [PlaygroundLayoutComponent, PdfJsViewerModule],
  templateUrl: './config-objects.component.html',
  styles: [`.note { font-size: 11.5px; color: var(--faint); line-height: 1.5; margin: 4px 0 0; }`],
})
export class ConfigObjectsComponent {
  private readonly codegen = inject(CodeGenService);
  private readonly samples = inject(SamplePdfService);
  readonly src = computed(() => this.samples.current().src);

  // controlVisibility
  readonly download = signal(true);
  readonly print = signal(false);
  readonly find = signal(true);
  // themeConfig
  readonly theme = signal<'light' | 'dark' | 'auto'>('auto');
  // autoActions
  readonly showLastPageOnLoad = signal(false);
  // viewerConfig
  readonly diagnosticLogs = signal(false);
  readonly useOnlyCssZoom = signal(false);
  // groupVisibility
  readonly sidebar = signal(true);
  readonly toolbarRight = signal(true);

  // Convenience-setter objects (typed loosely as the component accepts partials).
  readonly controlVisibility = computed(() => ({
    download: this.download(), print: this.print(), find: this.find(),
  }));
  readonly themeConfig = computed(() => ({ theme: this.theme() }));
  readonly autoActions = computed(() => ({ showLastPageOnLoad: this.showLastPageOnLoad() }));
  readonly viewerConfig = computed(() => ({
    diagnosticLogs: this.diagnosticLogs(), useOnlyCssZoom: this.useOnlyCssZoom(),
  }));
  readonly groupVisibility = computed(() => ({
    sidebar: this.sidebar(), toolbarRight: this.toolbarRight(),
  }));

  /** Config objects are applied when the viewer loads — re-create it on any change. */
  readonly runKey = computed(() => JSON.stringify([
    this.controlVisibility(), this.themeConfig(), this.autoActions(),
    this.viewerConfig(), this.groupVisibility(),
  ]));

  readonly boolRows: { group: string; label: string; sig: ReturnType<typeof signal<boolean>> }[] = [
    { group: 'controlVisibility', label: 'download', sig: this.download },
    { group: 'controlVisibility', label: 'print', sig: this.print },
    { group: 'controlVisibility', label: 'find', sig: this.find },
    { group: 'autoActions', label: 'showLastPageOnLoad', sig: this.showLastPageOnLoad },
    { group: 'viewerConfig', label: 'diagnosticLogs', sig: this.diagnosticLogs },
    { group: 'viewerConfig', label: 'useOnlyCssZoom', sig: this.useOnlyCssZoom },
    { group: 'groupVisibility', label: 'sidebar', sig: this.sidebar },
    { group: 'groupVisibility', label: 'toolbarRight', sig: this.toolbarRight },
  ];
  readonly groups = ['controlVisibility', 'autoActions', 'viewerConfig', 'groupVisibility'];
  rowsFor(group: string): typeof this.boolRows { return this.boolRows.filter((r) => r.group === group); }

  setTheme(e: Event): void { this.theme.set((e.target as HTMLSelectElement).value as 'light' | 'dark' | 'auto'); }

  readonly code = computed(() => [
    `// One object per concern instead of many inputs:`,
    `controlVisibility = ${JSON.stringify(this.controlVisibility())};`,
    `themeConfig = { theme: '${this.theme()}' };`,
    `autoActions = ${JSON.stringify(this.autoActions())};`,
    `viewerConfig = ${JSON.stringify(this.viewerConfig())};`,
    `groupVisibility = ${JSON.stringify(this.groupVisibility())};`,
    ``,
    `<ng2-pdfjs-viewer`,
    `  [pdfSrc]="pdfSrc"`,
    `  [controlVisibility]="controlVisibility"`,
    `  [themeConfig]="themeConfig"`,
    `  [autoActions]="autoActions"`,
    `  [viewerConfig]="viewerConfig"`,
    `  [groupVisibility]="groupVisibility">`,
    `</ng2-pdfjs-viewer>`,
  ].join('\n'));
}
