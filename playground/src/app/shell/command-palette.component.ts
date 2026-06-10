import { Component, ElementRef, computed, effect, inject, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CommandPaletteService } from '../core/services/command-palette.service';

@Component({
  selector: 'pg-command-palette',
  standalone: true,
  template: `
    @if (palette.open()) {
      <div class="scrim" role="button" tabindex="-1" aria-label="Close command palette"
           (click)="palette.hide()" (keydown.escape)="palette.hide()"></div>
      <div class="cmdk" role="dialog" aria-label="Command palette">
        <div class="in">
          <span aria-hidden="true">⌕</span>
          <input #box
            [value]="palette.query()"
            (input)="onInput($event)"
            (keydown)="onKey($event)"
            placeholder="Jump to a feature, input, event, or sample PDF…"
            aria-label="Search features" />
          <span class="kbd">esc</span>
        </div>
        <div class="res">
          @for (r of palette.results(); track r.page.id; let i = $index) {
            <button class="item" [class.on]="i === active()" (mouseenter)="active.set(i)" (click)="go(i)">
              <span class="ic" aria-hidden="true">{{ r.page.icon }}</span>
              <span class="ttl">{{ r.page.title }}</span>
              @if (r.matchedTag) { <span class="mt">{{ r.matchedTag }}</span> }
              <span class="grp">{{ r.page.group }}</span>
            </button>
          } @empty {
            <div class="empty">No matches.</div>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .scrim { position: fixed; inset: 0; background: rgba(3,4,8,.6); backdrop-filter: blur(4px); z-index: 50; }
    .cmdk { position: fixed; top: 13vh; left: 50%; transform: translateX(-50%); width: min(640px, 92vw);
      background: var(--panel); border: 1px solid var(--border); border-radius: 16px;
      box-shadow: 0 40px 100px rgba(0,0,0,.6); z-index: 51; overflow: hidden; }
    .in { display: flex; align-items: center; gap: 10px; padding: 14px 16px; border-bottom: 1px solid var(--border); color: var(--faint); }
    .in input { flex: 1; background: transparent; border: 0; outline: 0; color: var(--ink); font-size: 15px; font-family: var(--body); }
    .res { max-height: 50vh; overflow: auto; padding: 8px; }
    .item { display: flex; align-items: center; gap: 11px; width: 100%; text-align: left;
      padding: 9px 11px; border: 0; border-radius: 9px; background: transparent; color: var(--muted);
      font-size: 13.5px; font-family: var(--body); cursor: pointer; }
    .item.on { background: color-mix(in srgb, var(--v) 16%, transparent); color: var(--ink); }
    .item .ic { width: 16px; text-align: center; }
    .item .ttl { font-weight: 500; }
    .item .mt { font-family: var(--mono); font-size: 10.5px; color: var(--c); border: 1px solid var(--border); border-radius: 6px; padding: 1px 6px; }
    .item .grp { margin-left: auto; font-size: 10.5px; color: var(--faint); }
    .empty { padding: 22px; text-align: center; color: var(--faint); font-size: 13px; }
  `],
})
export class CommandPaletteComponent {
  readonly palette = inject(CommandPaletteService);
  private readonly router = inject(Router);
  readonly active = signal(0);
  private readonly box = viewChild<ElementRef<HTMLInputElement>>('box');

  readonly count = computed(() => this.palette.results().length);

  constructor() {
    effect(() => {
      if (this.palette.open()) {
        this.active.set(0);
        queueMicrotask(() => this.box()?.nativeElement.focus());
      }
    });
  }

  onInput(e: Event): void {
    this.palette.query.set((e.target as HTMLInputElement).value);
    this.active.set(0);
  }

  onKey(e: KeyboardEvent): void {
    const n = this.count();
    if (e.key === 'ArrowDown') { e.preventDefault(); this.active.set((this.active() + 1) % Math.max(n, 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); this.active.set((this.active() - 1 + n) % Math.max(n, 1)); }
    else if (e.key === 'Enter') { e.preventDefault(); this.go(this.active()); }
    else if (e.key === 'Escape') { this.palette.hide(); }
  }

  go(i: number): void {
    const r = this.palette.results()[i];
    if (!r) return;
    this.router.navigate(['/', r.page.route]);
    this.palette.hide();
  }
}
