import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PdfJsViewerModule } from 'ng2-pdfjs-viewer';
import { FEATURES } from '../../core/feature-registry';
import { FEATURE_GROUPS, FeatureGroup } from '../../core/models';
import { CommandPaletteService } from '../../core/services/command-palette.service';
import { SamplePdfService } from '../../core/services/sample-pdf.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'pg-overview',
  standalone: true,
  imports: [RouterLink, PdfJsViewerModule],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss',
})
export class OverviewComponent {
  private readonly samples = inject(SamplePdfService);
  readonly palette = inject(CommandPaletteService);
  readonly theme = inject(ThemeService);
  readonly src = computed(() => this.samples.current().src);
  readonly groups = FEATURE_GROUPS;
  // Live all-time npm downloads from the docs site's /api/downloads. The fallback shows offline;
  // scripts/downloads-milestone.mjs bumps it each million.
  readonly downloads = signal('9M+');

  constructor() {
    fetch('https://angularpdf.com/api/downloads')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.message && this.downloads.set(d.message))
      .catch(() => {});
  }

  featuresIn(g: FeatureGroup) {
    return FEATURES.filter((f) => f.group === g && f.id !== 'overview');
  }
}
