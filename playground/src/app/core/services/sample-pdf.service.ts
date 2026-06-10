import { Injectable, signal } from '@angular/core';
import { SamplePdf } from '../models';

/**
 * The set of sample PDFs the playground showcases. The research paper ships with
 * the bundled PDF.js assets; the others are small redistributable samples added
 * under assets/samples (see P6). All entries resolve to a real, loadable file.
 */
const SAMPLES: SamplePdf[] = [
  {
    id: 'research',
    label: 'Research paper',
    src: '/assets/pdfjs/web/compressed.tracemonkey-pldi-09.pdf',
    note: 'Text-heavy academic paper — great for search, outline and text selection.',
  },
  {
    id: 'guide',
    label: 'Product guide',
    src: '/assets/samples/product-guide.pdf',
    note: 'Multi-page styled document — search, scroll modes and text selection.',
  },
  {
    id: 'invoice',
    label: 'Invoice',
    src: '/assets/samples/invoice.pdf',
    note: 'Branded table layout — good for zoom and print.',
  },
  {
    id: 'infographic',
    label: 'Infographic',
    src: '/assets/samples/infographic.pdf',
    note: 'Colorful CSS graphics — image-heavy, good for zoom and rotation.',
  },
];

@Injectable({ providedIn: 'root' })
export class SamplePdfService {
  readonly samples = SAMPLES;
  readonly current = signal<SamplePdf>(SAMPLES[0]);

  select(id: string): void {
    const found = this.samples.find((s) => s.id === id);
    if (found) this.current.set(found);
  }
}
