import { Component, inject, input, signal } from '@angular/core';
import { StackblitzService } from '../core/services/stackblitz.service';

type Tab = 'preview' | 'code' | 'split';
type Width = 'mobile' | 'fluid' | 'desktop';

/**
 * Shared chrome for every feature page: header (title/lead/tags), Preview/Code/
 * Split tabs, responsive width presets, the resizable preview area (projected),
 * a controls rail (projected) and the generated code panel with copy.
 *
 * Usage:
 *   <pg-page [title]="..." [lead]="..." [tags]="..." [code]="generatedCode()">
 *     <div preview>  <ng2-pdfjs-viewer ...></ng2-pdfjs-viewer>  </div>
 *     <div controls> ...inputs... </div>
 *   </pg-page>
 */
@Component({
  selector: 'pg-page',
  standalone: true,
  templateUrl: './playground-layout.component.html',
  styleUrl: './playground-layout.component.scss',
})
export class PlaygroundLayoutComponent {
  readonly title = input.required<string>();
  readonly lead = input<string>('');
  readonly tags = input<string[]>([]);
  readonly code = input<string>('');
  readonly docHref = input<string>('');

  private readonly sb = inject(StackblitzService);
  readonly tab = signal<Tab>('preview');
  readonly width = signal<Width>('fluid');
  readonly copied = signal(false);
  readonly linked = signal(false);

  readonly widthPx: Record<Width, string> = { mobile: '375px', fluid: '100%', desktop: '1024px' };

  setTab(t: Tab): void { this.tab.set(t); }
  setWidth(w: Width): void { this.width.set(w); }

  async copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.code());
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 1400);
    } catch { /* clipboard blocked — ignore */ }
  }

  openStackblitz(): void {
    this.sb.open(this.title(), this.code());
  }

  async share(): Promise<void> {
    try {
      await navigator.clipboard.writeText(window.location.href);
      this.linked.set(true);
      setTimeout(() => this.linked.set(false), 1400);
    } catch { /* clipboard blocked — ignore */ }
  }
}
