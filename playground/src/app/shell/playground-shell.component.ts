import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { FEATURES } from '../core/feature-registry';
import { FEATURE_GROUPS, FeatureGroup } from '../core/models';
import { CommandPaletteService } from '../core/services/command-palette.service';
import { SamplePdfService } from '../core/services/sample-pdf.service';
import { ThemeService } from '../core/services/theme.service';
import { CommandPaletteComponent } from './command-palette.component';

@Component({
  selector: 'pg-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommandPaletteComponent],
  templateUrl: './playground-shell.component.html',
  styleUrl: './playground-shell.component.scss',
})
export class PlaygroundShellComponent {
  readonly groups = FEATURE_GROUPS;
  readonly theme = inject(ThemeService);
  readonly palette = inject(CommandPaletteService);
  readonly samples = inject(SamplePdfService);
  private readonly router = inject(Router);

  private readonly url = signal(this.router.url);
  readonly currentTitle = computed(() => {
    const route = this.url().replace(/^#?\/?/, '').split('?')[0];
    return FEATURES.find((f) => f.route === route)?.title ?? 'Overview';
  });
  readonly currentGroup = computed<FeatureGroup | ''>(() => {
    const route = this.url().replace(/^#?\/?/, '').split('?')[0];
    return FEATURES.find((f) => f.route === route)?.group ?? '';
  });

  constructor() {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => this.url.set(e.urlAfterRedirects));
  }

  featuresIn(group: FeatureGroup) {
    return FEATURES.filter((f) => f.group === group);
  }

  onSampleChange(e: Event): void {
    this.samples.select((e.target as HTMLSelectElement).value);
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(e: KeyboardEvent): void {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      this.palette.toggle();
    } else if (e.key === 'Escape' && this.palette.open()) {
      this.palette.hide();
    }
  }
}
