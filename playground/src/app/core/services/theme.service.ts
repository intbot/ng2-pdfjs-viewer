import { Injectable, signal } from '@angular/core';

type Mode = 'dark' | 'light';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly mode = signal<Mode>('dark');

  constructor() {
    const saved = (typeof localStorage !== 'undefined' && localStorage.getItem('pg-theme')) as Mode | null;
    if (saved === 'light' || saved === 'dark') this.set(saved);
  }

  set(mode: Mode): void {
    this.mode.set(mode);
    document.documentElement.setAttribute('data-theme', mode);
    try { localStorage.setItem('pg-theme', mode); } catch { /* ignore */ }
  }

  toggle(): void {
    this.set(this.mode() === 'dark' ? 'light' : 'dark');
  }
}
