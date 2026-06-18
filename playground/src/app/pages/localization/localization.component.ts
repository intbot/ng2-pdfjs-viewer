import { Component, computed, inject, signal } from '@angular/core';
import { PdfJsViewerModule } from 'ng2-pdfjs-viewer';
import { CodeGenService } from '../../core/services/code-gen.service';
import { SamplePdfService } from '../../core/services/sample-pdf.service';
import { ThemeService } from '../../core/services/theme.service';
import { PlaygroundLayoutComponent } from '../../shared/playground-layout.component';

@Component({
  selector: 'pg-localization',
  standalone: true,
  imports: [PlaygroundLayoutComponent, PdfJsViewerModule],
  templateUrl: './localization.component.html',
})
export class LocalizationComponent {
  private readonly codegen = inject(CodeGenService);
  private readonly samples = inject(SamplePdfService);
  readonly theme = inject(ThemeService);
  readonly src = computed(() => this.samples.current().src);

  readonly locale = signal('en-US');
  readonly locales = [
    { code: 'en-US', label: 'English (US)' },
    { code: 'de-AT', label: 'German (Austria)' },
    { code: 'fr-FR', label: 'French' },
    { code: 'es-ES', label: 'Spanish' },
    { code: 'ja-JP', label: 'Japanese' },
    { code: 'ar-EG', label: 'Arabic' },
  ];

  setLocale(e: Event): void { this.locale.set((e.target as HTMLSelectElement).value); }

  readonly code = computed(() =>
    this.codegen.generate([
      { name: 'pdfSrc', value: 'pdfSrc', kind: 'expr' },
      { name: 'locale', value: this.locale(), kind: 'string', omitWhen: 'en-US' },
    ]),
  );
}
