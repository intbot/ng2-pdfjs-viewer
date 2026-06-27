import { AfterViewInit, Component, Injector, ViewChild, computed, inject, signal } from '@angular/core';
import { PdfJsViewerComponent, PdfJsViewerModule } from 'ng2-pdfjs-viewer';
import { pdfViewerSignals, PdfViewerSignals } from 'ng2-pdfjs-viewer/signals';
import { SamplePdfService } from '../../core/services/sample-pdf.service';
import { ThemeService } from '../../core/services/theme.service';
import { PlaygroundLayoutComponent } from '../../shared/playground-layout.component';

const fmt = (v: unknown): string => (v === undefined || v === null ? '—' : String(v));

@Component({
  selector: 'pg-signals',
  standalone: true,
  imports: [PlaygroundLayoutComponent, PdfJsViewerModule],
  templateUrl: './signals.component.html',
  styleUrl: './signals.component.scss',
})
export class SignalsComponent implements AfterViewInit {
  private readonly samples = inject(SamplePdfService);
  readonly theme = inject(ThemeService);
  private readonly injector = inject(Injector);
  readonly src = computed(() => this.samples.current().src);

  // We drive the page imperatively; the inspector reads it back from the SIGNAL,
  // so you can see the projection update independently of the input we set.
  readonly page = signal(1);

  @ViewChild('viewer') viewer!: PdfJsViewerComponent;

  // Held in a signal (not a plain field) so the computeds below take a dependency
  // on it — otherwise `this.sig?.page()` short-circuits before reading any signal
  // and the rows never refresh once the bundle is wired up in ngAfterViewInit.
  readonly sig = signal<PdfViewerSignals | undefined>(undefined);

  ngAfterViewInit(): void {
    this.sig.set(pdfViewerSignals(this.viewer, { injector: this.injector }));
  }

  go(delta: number): void { this.page.set(Math.max(1, this.page() + delta)); }

  // Live inspector — each row reads a signal, so the table re-renders on its own
  // whenever the viewer emits (no markForCheck, no event bindings).
  readonly rows = computed(() => {
    const s = this.sig();
    if (!s) return [{ k: 'loaded()', v: 'false' }];
    const scale = s.scale();
    const m = s.findMatches();
    return [
      { k: 'loaded()', v: String(s.loaded()) },
      { k: 'page()', v: fmt(s.page()) },
      { k: 'totalPages()', v: fmt(s.totalPages()) },
      { k: 'scale()', v: scale != null ? Math.round(scale * 100) + '%' : '—' },
      { k: 'rotation()', v: fmt(s.rotation()?.rotation) },
      { k: 'findMatches()', v: m ? `${m.current} / ${m.total}` : '—' },
      { k: 'readAloud()', v: fmt(s.readAloud()?.status) },
      { k: 'sidebar()', v: fmt(s.sidebar()?.view) },
    ];
  });

  // A derived label that recomputes only when search state changes — the kind of
  // thing `computed` makes trivial on top of the raw signals.
  readonly matchSummary = computed(() => {
    const m = this.sig()?.findMatches();
    return m ? `${m.current} of ${m.total} matches` : 'No active search';
  });

  readonly code = computed(() =>
    [
      `import { pdfViewerSignals, PdfViewerSignals } from 'ng2-pdfjs-viewer/signals';`,
      ``,
      `@ViewChild('viewer') viewer!: PdfJsViewerComponent;`,
      `private injector = inject(Injector);`,
      `signals!: PdfViewerSignals;`,
      ``,
      `ngAfterViewInit() {`,
      `  // @ViewChild is set here but this isn't an injection context,`,
      `  // so hand toSignal an Injector captured earlier.`,
      `  this.signals = pdfViewerSignals(this.viewer, { injector: this.injector });`,
      `}`,
      ``,
      `// template: {{ signals.page() }} of {{ signals.totalPages() }}`,
      `//           {{ signals.scale() | percent }}`,
      ``,
      `// compose with computed — no manual change detection`,
      `readonly matchSummary = computed(() => {`,
      `  const m = this.signals.findMatches();`,
      `  return m ? \`\${m.current} of \${m.total}\` : 'No search';`,
      `});`,
    ].join('\n'),
  );
}
