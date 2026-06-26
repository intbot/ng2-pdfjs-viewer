import { Component, computed, effect, inject, signal } from '@angular/core';
import { PdfJsViewerComponent, PdfJsViewerModule, PdfAiAssistant, ReadAloudState } from 'ng2-pdfjs-viewer';
import { SamplePdfService } from '../../core/services/sample-pdf.service';
import { ThemeService } from '../../core/services/theme.service';
import { PlaygroundLayoutComponent } from '../../shared/playground-layout.component';

@Component({
  selector: 'pg-ai',
  standalone: true,
  imports: [PlaygroundLayoutComponent, PdfJsViewerModule],
  templateUrl: './ai.component.html',
  styles: [`
    .note { font-size: 11.5px; color: var(--faint); line-height: 1.5; margin: 4px 0 0; }
    .dump { font: 11px/1.5 var(--mono, monospace); background: var(--panel-2, #111); border-radius: 6px;
            padding: 8px; max-height: 180px; overflow: auto; white-space: pre-wrap; }
    .answer { font-size: 12px; line-height: 1.55; background: var(--panel-2, #111); border-radius: 6px;
              padding: 10px; max-height: 220px; overflow: auto; white-space: pre-wrap; }
    .status { font-size: 11px; color: var(--faint); }
  `],
})
export class AiComponent {
  private readonly samples = inject(SamplePdfService);
  readonly theme = inject(ThemeService);
  readonly src = computed(() => this.samples.current().src);

  // BYO endpoint — nothing is called until the user clicks. Defaults target a
  // local Ollama; change to any OpenAI-compatible endpoint.
  readonly endpoint = signal('http://localhost:11434/v1/chat/completions');
  readonly model = signal('llama3.2');
  readonly apiKey = signal('');
  readonly question = signal('What is this document about?');
  readonly answer = signal('');
  readonly aiBusy = signal(false);
  readonly textPreview = signal('');
  readonly readAloud = signal<ReadAloudState | null>(null);
  // Gate extract/ask until the document has loaded, so getDocumentText() isn't
  // called against an unrendered document (which returns empty context).
  readonly docReady = signal(false);

  constructor() {
    // Switching samples reloads the viewer — re-gate until it loads again.
    effect(() => { this.src(); this.docReady.set(false); });
  }

  async extract(viewer: PdfJsViewerComponent): Promise<void> {
    const pages = await viewer.getDocumentText(1, 2);
    this.textPreview.set(
      pages.map((p) => `[page ${p.page}] ${p.text.slice(0, 400)}…`).join('\n\n')
    );
  }

  async ask(viewer: PdfJsViewerComponent): Promise<void> {
    this.aiBusy.set(true);
    this.answer.set('');
    try {
      // First few pages keep the prompt small — snappy on local models.
      const text = await viewer.getDocumentText(1, 3);
      const ai = new PdfAiAssistant({
        endpoint: this.endpoint(),
        model: this.model() || undefined,
        apiKey: this.apiKey() || undefined,
      });
      this.answer.set(await ai.ask(this.question(), text));
    } catch (e) {
      this.answer.set(`⚠ ${e instanceof Error ? e.message : e}`);
    } finally {
      this.aiBusy.set(false);
    }
  }

  onReadAloud(state: ReadAloudState): void { this.readAloud.set(state); }

  set(sig: { set: (v: string) => void }, e: Event): void {
    sig.set((e.target as HTMLInputElement).value);
  }

  readonly code = computed(() => [
    `// 1. extract the document text (stays in the browser)`,
    `const text = await this.viewer.getDocumentText(1, 3); // first pages — snappy on local models`,
    ``,
    `// 2. ask YOUR endpoint — any OpenAI-compatible API`,
    `const ai = new PdfAiAssistant({`,
    `  endpoint: ${JSON.stringify(this.endpoint())},`,
    `  model: ${JSON.stringify(this.model())},`,
    `});`,
    `const answer = await ai.ask(${JSON.stringify(this.question())}, text);`,
    ``,
    `// read-aloud (browser speech synthesis)`,
    `await this.viewer.startReadAloud();`,
    `await this.viewer.stopReadAloud();`,
  ].join('\n'));
}
