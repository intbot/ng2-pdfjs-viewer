import { Component, computed, inject, signal } from '@angular/core';
import { PdfJsViewerComponent, PdfJsViewerModule, SearchResult } from 'ng2-pdfjs-viewer';
import { SamplePdfService } from '../../core/services/sample-pdf.service';
import { ThemeService } from '../../core/services/theme.service';
import { PlaygroundLayoutComponent } from '../../shared/playground-layout.component';

@Component({
  selector: 'pg-search',
  standalone: true,
  imports: [PlaygroundLayoutComponent, PdfJsViewerModule],
  templateUrl: './search.component.html',
  styles: [`
    .note { font-size: 11.5px; color: var(--faint); line-height: 1.5; margin: 4px 0 0; }
    .hits { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 6px; }
    .hit { font-size: 10.5px; padding: 2px 8px; border-radius: 999px; background: var(--panel-2, #222); }
    .total { font-size: 12px; margin: 6px 0 0; }
  `],
})
export class SearchComponent {
  private readonly samples = inject(SamplePdfService);
  readonly theme = inject(ThemeService);
  readonly src = computed(() => this.samples.current().src);

  readonly query = signal('the');
  readonly caseSensitive = signal(false);
  readonly entireWord = signal(false);
  readonly highlightAll = signal(true);
  readonly result = signal<SearchResult | null>(null);
  readonly error = signal('');
  readonly busy = signal(false);

  async run(viewer: PdfJsViewerComponent): Promise<void> {
    this.busy.set(true);
    this.error.set('');
    try {
      this.result.set(
        await viewer.search(this.query(), {
          caseSensitive: this.caseSensitive(),
          entireWord: this.entireWord(),
          highlightAll: this.highlightAll(),
        })
      );
    } catch (e) {
      this.error.set(String(e));
      this.result.set(null);
    } finally {
      this.busy.set(false);
    }
  }

  async step(viewer: PdfJsViewerComponent, dir: 1 | -1): Promise<void> {
    try {
      this.result.set(dir === 1 ? await viewer.searchNext() : await viewer.searchPrevious());
    } catch (e) {
      this.error.set(String(e));
    }
  }

  async clear(viewer: PdfJsViewerComponent): Promise<void> {
    await viewer.clearSearch();
    this.result.set(null);
  }

  setQuery(e: Event): void { this.query.set((e.target as HTMLInputElement).value); }

  readonly code = computed(() => [
    `const result = await this.viewer.search(${JSON.stringify(this.query())}, {`,
    `  caseSensitive: ${this.caseSensitive()},`,
    `  entireWord: ${this.entireWord()},`,
    `  highlightAll: ${this.highlightAll()},`,
    `});`,
    `// result.total, result.current ({ page, matchIndex }),`,
    `// result.pagesWithMatches, result.matchesPerPage`,
    ``,
    `await this.viewer.searchNext();`,
    `await this.viewer.searchPrevious();`,
    `await this.viewer.clearSearch();`,
  ].join('\n'));
}
