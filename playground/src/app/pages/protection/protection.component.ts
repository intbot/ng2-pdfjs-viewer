import { Component, computed, inject, signal } from '@angular/core';
import { PdfJsViewerModule, ContentProtectionConfig } from 'ng2-pdfjs-viewer';
import { SamplePdfService } from '../../core/services/sample-pdf.service';
import { ThemeService } from '../../core/services/theme.service';
import { PlaygroundLayoutComponent } from '../../shared/playground-layout.component';

@Component({
  selector: 'pg-protection',
  standalone: true,
  imports: [PlaygroundLayoutComponent, PdfJsViewerModule],
  templateUrl: './protection.component.html',
  styles: [`.note { font-size: 11.5px; color: var(--faint); line-height: 1.5; margin: 4px 0 0; }`],
})
export class ProtectionComponent {
  private readonly samples = inject(SamplePdfService);
  readonly theme = inject(ThemeService);
  readonly src = computed(() => this.samples.current().src);

  readonly blockPrint = signal(false);
  readonly blockDownload = signal(false);
  readonly noSelect = signal(false);
  readonly watermarkText = signal('CONFIDENTIAL');
  readonly watermarkOn = signal(true);
  readonly opacity = signal(0.25);

  readonly protection = computed<ContentProtectionConfig>(() => ({
    blockPrint: this.blockPrint(),
    blockDownload: this.blockDownload(),
    disableTextSelection: this.noSelect(),
    watermark: this.watermarkOn() && this.watermarkText()
      ? { text: this.watermarkText(), opacity: this.opacity() }
      : null,
  }));

  setText(e: Event): void { this.watermarkText.set((e.target as HTMLInputElement).value); }
  setOpacity(e: Event): void { this.opacity.set(Number((e.target as HTMLInputElement).value)); }

  readonly code = computed(() => [
    `<ng2-pdfjs-viewer`,
    `  [pdfSrc]="pdfSrc"`,
    `  [contentProtection]="{`,
    `    blockPrint: ${this.blockPrint()},`,
    `    blockDownload: ${this.blockDownload()},`,
    `    disableTextSelection: ${this.noSelect()},`,
    this.watermarkOn()
      ? `    watermark: { text: ${JSON.stringify(this.watermarkText())}, opacity: ${this.opacity()} },`
      : `    watermark: null,`,
    `  }">`,
    `</ng2-pdfjs-viewer>`,
    ``,
    `// Deterrence, not DRM: the toolbar buttons hide, Ctrl+P / Ctrl+S are`,
    `// blocked inside the viewer, text selection can be disabled, and every`,
    `// page gets a watermark overlay. The bytes are still on the network tab.`,
  ].join('\n'));
}
