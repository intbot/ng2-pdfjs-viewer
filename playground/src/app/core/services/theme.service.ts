import { Injectable, signal } from '@angular/core';

type Mode = 'dark' | 'light';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly mode = signal<Mode>('dark');

  constructor() {
    // saved choice wins; otherwise follow the OS preference; otherwise dark.
    // An OS-derived default is applied but NOT persisted, so the playground keeps
    // tracking the OS until the user explicitly toggles.
    const initial = this.resolveInitial();
    this.mode.set(initial);
    this.apply(initial);
  }

  set(mode: Mode): void {
    this.mode.set(mode);
    this.apply(mode);
    try { localStorage.setItem('pg-theme', mode); } catch { /* ignore */ }
  }

  toggle(): void {
    this.set(this.mode() === 'dark' ? 'light' : 'dark');
  }

  private resolveInitial(): Mode {
    try {
      const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('pg-theme') : null;
      if (saved === 'light' || saved === 'dark') return saved;
      if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: light)').matches) {
        return 'light';
      }
    } catch { /* ignore */ }
    return 'dark';
  }

  private apply(mode: Mode): void {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', mode);
    }
  }
}
