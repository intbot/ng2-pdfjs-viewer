import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PdfJsViewerModule } from 'ng2-pdfjs-viewer';
import { CodeBinding } from '../../core/models';
import { CodeGenService } from '../../core/services/code-gen.service';
import { SamplePdfService } from '../../core/services/sample-pdf.service';
import { ShareStateService } from '../../core/services/share-state.service';
import { PlaygroundLayoutComponent } from '../../shared/playground-layout.component';

@Component({
  selector: 'pg-theming',
  standalone: true,
  imports: [PlaygroundLayoutComponent, PdfJsViewerModule],
  templateUrl: './theming.component.html',
  styles: [`
    .swatch { display: flex; gap: 7px; }
    .swatch i { width: 22px; height: 22px; border-radius: 6px; border: 1px solid var(--border); cursor: pointer; display: block; }
    .swatch i.on { outline: 2px solid var(--ink); outline-offset: 1px; }
    .colorrow input[type='color'] {
      width: 34px; height: 24px; padding: 0; border: 1px solid var(--border); border-radius: 6px;
      background: var(--panel-2); cursor: pointer;
    }
    .css-box { width: 100%; min-height: 74px; resize: vertical; font-family: var(--mono); font-size: 11.5px; line-height: 1.6; }
  `],
})
export class ThemingComponent {
  private readonly codegen = inject(CodeGenService);
  private readonly samples = inject(SamplePdfService);
  readonly src = computed(() => this.samples.current().src);

  readonly theme = signal<'light' | 'dark' | 'auto'>('auto');
  readonly primaryColor = signal('');
  readonly borderRadius = signal('');
  readonly toolbarDensity = signal<'default' | 'compact' | 'comfortable'>('default');
  readonly toolbarPosition = signal<'top' | 'bottom'>('top');
  readonly sidebarPosition = signal<'left' | 'right'>('left');

  readonly backgroundColor = signal('');
  readonly toolbarColor = signal('');
  readonly textColor = signal('');
  readonly pageBorderColor = signal('');
  readonly sidebarWidth = signal('');
  readonly customCSS = signal('');

  readonly colors = ['', '#7c5cff', '#22d3ee', '#3ddc97', '#ff8a5c', '#fb7185'];
  readonly radii = ['', '8px', '16px'];
  readonly sidebarWidths = ['', '220px', '300px'];
  readonly colorRows: { key: string; label: string; sig: ReturnType<typeof signal<string>> }[] = [
    { key: 'backgroundColor', label: 'Background', sig: this.backgroundColor },
    { key: 'toolbarColor', label: 'Toolbar', sig: this.toolbarColor },
    { key: 'textColor', label: 'Toolbar text', sig: this.textColor },
    { key: 'pageBorderColor', label: 'Page border', sig: this.pageBorderColor },
  ];

  private readonly share = inject(ShareStateService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  constructor() {
    // restore from a shared link
    const st = this.share.decode(this.route.snapshot.queryParamMap.get('s'));
    if (st) {
      if (st['theme']) this.theme.set(st['theme'] as 'light' | 'dark' | 'auto');
      if (st['primaryColor'] !== undefined) this.primaryColor.set(String(st['primaryColor']));
      if (st['borderRadius'] !== undefined) this.borderRadius.set(String(st['borderRadius']));
      if (st['toolbarDensity']) this.toolbarDensity.set(st['toolbarDensity'] as 'default' | 'compact' | 'comfortable');
      if (st['toolbarPosition']) this.toolbarPosition.set(st['toolbarPosition'] as 'top' | 'bottom');
      if (st['sidebarPosition']) this.sidebarPosition.set(st['sidebarPosition'] as 'left' | 'right');
      if (st['backgroundColor'] !== undefined) this.backgroundColor.set(String(st['backgroundColor']));
      if (st['toolbarColor'] !== undefined) this.toolbarColor.set(String(st['toolbarColor']));
      if (st['textColor'] !== undefined) this.textColor.set(String(st['textColor']));
      if (st['pageBorderColor'] !== undefined) this.pageBorderColor.set(String(st['pageBorderColor']));
      if (st['sidebarWidth'] !== undefined) this.sidebarWidth.set(String(st['sidebarWidth']));
    }
    // persist to the URL so "Share" copies a restorable link
    effect(() => {
      const s = this.share.encode({
        theme: this.theme(), primaryColor: this.primaryColor(), borderRadius: this.borderRadius(),
        toolbarDensity: this.toolbarDensity(), toolbarPosition: this.toolbarPosition(), sidebarPosition: this.sidebarPosition(),
        backgroundColor: this.backgroundColor(), toolbarColor: this.toolbarColor(), textColor: this.textColor(),
        pageBorderColor: this.pageBorderColor(), sidebarWidth: this.sidebarWidth(),
      });
      this.router.navigate([], { relativeTo: this.route, queryParams: { s }, replaceUrl: true });
    });
  }

  private val(e: Event): string { return (e.target as HTMLSelectElement).value; }
  setTheme(e: Event): void { this.theme.set(this.val(e) as 'light' | 'dark' | 'auto'); }
  setRadius(e: Event): void { this.borderRadius.set(this.val(e)); }
  setDensity(e: Event): void { this.toolbarDensity.set(this.val(e) as 'default' | 'compact' | 'comfortable'); }
  setTPos(e: Event): void { this.toolbarPosition.set(this.val(e) as 'top' | 'bottom'); }
  setSPos(e: Event): void { this.sidebarPosition.set(this.val(e) as 'left' | 'right'); }
  setSidebarWidth(e: Event): void { this.sidebarWidth.set(this.val(e)); }
  setColor(sig: ReturnType<typeof signal<string>>, e: Event): void { sig.set((e.target as HTMLInputElement).value); }
  setCSS(e: Event): void { this.customCSS.set((e.target as HTMLTextAreaElement).value); }
  resetColors(): void {
    for (const r of this.colorRows) r.sig.set('');
    this.primaryColor.set('');
  }

  readonly code = computed(() => {
    const b: CodeBinding[] = [
      { name: 'pdfSrc', value: 'pdfSrc', kind: 'expr' },
      { name: 'theme', value: this.theme(), kind: 'string', omitWhen: 'auto' },
      { name: 'primaryColor', value: this.primaryColor(), kind: 'string', omitWhen: '' },
      { name: 'backgroundColor', value: this.backgroundColor(), kind: 'string', omitWhen: '' },
      { name: 'toolbarColor', value: this.toolbarColor(), kind: 'string', omitWhen: '' },
      { name: 'textColor', value: this.textColor(), kind: 'string', omitWhen: '' },
      { name: 'pageBorderColor', value: this.pageBorderColor(), kind: 'string', omitWhen: '' },
      { name: 'borderRadius', value: this.borderRadius(), kind: 'string', omitWhen: '' },
      { name: 'toolbarDensity', value: this.toolbarDensity(), kind: 'string', omitWhen: 'default' },
      { name: 'toolbarPosition', value: this.toolbarPosition(), kind: 'string', omitWhen: 'top' },
      { name: 'sidebarPosition', value: this.sidebarPosition(), kind: 'string', omitWhen: 'left' },
      { name: 'sidebarWidth', value: this.sidebarWidth(), kind: 'string', omitWhen: '' },
      { name: 'customCSS', value: this.customCSS() ? 'myCss' : '', kind: 'expr', omitWhen: '' },
    ];
    return this.codegen.generate(b);
  });
}
