import { Component, computed, inject, signal } from '@angular/core';
import { PdfJsViewerModule } from 'ng2-pdfjs-viewer';
import { CodeGenService } from '../../core/services/code-gen.service';
import { SamplePdfService } from '../../core/services/sample-pdf.service';
import { ThemeService } from '../../core/services/theme.service';
import { PlaygroundLayoutComponent } from '../../shared/playground-layout.component';

interface LogEntry { t: string; name: string; detail: string; }

@Component({
  selector: 'pg-events',
  standalone: true,
  imports: [PlaygroundLayoutComponent, PdfJsViewerModule],
  templateUrl: './events.component.html',
  styleUrl: './events.component.scss',
})
export class EventsComponent {
  private readonly codegen = inject(CodeGenService);
  private readonly samples = inject(SamplePdfService);
  readonly theme = inject(ThemeService);
  readonly src = computed(() => this.samples.current().src);

  readonly log = signal<LogEntry[]>([]);
  readonly count = computed(() => this.log().length);
  private seq = 0;

  push(name: string, detail: unknown = ''): void {
    const d = typeof detail === 'object' ? JSON.stringify(detail) : String(detail ?? '');
    const t = `#${(++this.seq).toString().padStart(3, '0')}`;
    this.log.update((l) => [{ t, name, detail: d.slice(0, 80) }, ...l].slice(0, 60));
  }
  clear(): void { this.log.set([]); this.seq = 0; }

  readonly code = computed(() =>
    this.codegen.generate([
      { name: 'pdfSrc', value: 'pdfSrc', kind: 'expr' },
    ]) + '\n\n// (onDocumentLoad)="…"  (onPageChange)="…"  (onFind)="…"  + 16 more',
  );
}
