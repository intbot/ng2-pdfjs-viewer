import { Injectable, computed, signal } from '@angular/core';
import { FEATURES } from '../feature-registry';
import { FeaturePage } from '../models';

export interface PaletteResult {
  page: FeaturePage;
  /** the matched tag, if the query hit a tag rather than the title */
  matchedTag?: string;
}

@Injectable({ providedIn: 'root' })
export class CommandPaletteService {
  readonly open = signal(false);
  readonly query = signal('');

  readonly results = computed<PaletteResult[]>(() => {
    const q = this.query().trim().toLowerCase();
    if (!q) return FEATURES.map((page) => ({ page }));

    const out: PaletteResult[] = [];
    for (const page of FEATURES) {
      if (page.title.toLowerCase().includes(q) || page.description.toLowerCase().includes(q)) {
        out.push({ page });
        continue;
      }
      const tag = page.tags.find((t) => t.toLowerCase().includes(q));
      if (tag) out.push({ page, matchedTag: tag });
    }
    return out;
  });

  show(): void {
    this.query.set('');
    this.open.set(true);
  }
  hide(): void {
    this.open.set(false);
  }
  toggle(): void {
    if (this.open()) this.hide();
    else this.show();
  }
}
