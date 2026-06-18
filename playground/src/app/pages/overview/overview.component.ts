import { Component, computed, inject } from '@angular/core';
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

  featuresIn(g: FeatureGroup) {
    return FEATURES.filter((f) => f.group === g && f.id !== 'overview');
  }
}
