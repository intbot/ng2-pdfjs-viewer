import { Component, computed, inject, signal } from '@angular/core';
import { PdfJsViewerComponent, PdfJsViewerModule, AnnotationEditorMode, AnnotationEditorState } from 'ng2-pdfjs-viewer';
import { SamplePdfService } from '../../core/services/sample-pdf.service';
import { PlaygroundLayoutComponent } from '../../shared/playground-layout.component';

@Component({
  selector: 'pg-editor',
  standalone: true,
  imports: [PlaygroundLayoutComponent, PdfJsViewerModule],
  templateUrl: './editor.component.html',
  styles: [`
    .note { font-size: 11.5px; color: var(--faint); line-height: 1.5; margin: 4px 0 0; }
    .dump { font: 11px/1.5 var(--mono, monospace); background: var(--panel-2, #111); border-radius: 6px;
            padding: 8px; max-height: 160px; overflow: auto; white-space: pre-wrap; word-break: break-all; }
    .state { display: flex; gap: 6px; flex-wrap: wrap; }
    .state b { font-weight: 600; }
    .chip { font-size: 10.5px; padding: 2px 8px; border-radius: 999px; background: var(--panel-2, #222); opacity: .55; }
    .chip.on { opacity: 1; background: var(--accent-dim, #2d4a3e); }
  `],
})
export class EditorComponent {
  private readonly samples = inject(SamplePdfService);
  readonly src = computed(() => this.samples.current().src);

  readonly mode = signal<AnnotationEditorMode>('none');
  readonly signatures = signal(false);
  readonly comments = signal(false);
  readonly editorState = signal<AnnotationEditorState | null>(null);
  readonly annotationsJson = signal('');
  readonly busy = signal(false);

  readonly modes: AnnotationEditorMode[] = ['none', 'highlight', 'freetext', 'ink', 'stamp'];

  onState(s: AnnotationEditorState): void { this.editorState.set(s); }

  async dump(viewer: PdfJsViewerComponent): Promise<void> {
    this.busy.set(true);
    try {
      const annots = await viewer.getAnnotations();
      this.annotationsJson.set(JSON.stringify(annots, null, 2) || '[]');
    } catch (e) {
      this.annotationsJson.set(String(e));
    } finally {
      this.busy.set(false);
    }
  }

  async saveWithEdits(viewer: PdfJsViewerComponent): Promise<void> {
    this.busy.set(true);
    try {
      const blob = await viewer.getDocumentAsBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'annotated.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      this.busy.set(false);
    }
  }

  readonly code = computed(() => {
    const lines = [
      `<ng2-pdfjs-viewer #viewer`,
      `  [pdfSrc]="pdfSrc"`,
      `  [(annotationEditor)]="mode"${this.signatures() ? `\n  [enableSignatureEditor]="true"` : ''}${this.comments() ? `\n  [enableCommentEditor]="true"` : ''}`,
      `  (onAnnotationEditorStateChange)="state = $event">`,
      `</ng2-pdfjs-viewer>`,
      ``,
      `// persist user annotations`,
      `const annotations = await this.viewer.getAnnotations();`,
      `await this.http.post('/api/annotations', annotations);`,
      ``,
      `// or download the edited document`,
      `const blob = await this.viewer.getDocumentAsBlob();`,
    ];
    return lines.join('\n');
  });
}
